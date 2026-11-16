
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/userRepository.js";
import type { PublicUser } from "../repositories/userRepository.js";
import { createRefreshSession } from "../repositories/refreshSessionRepository.js";
import {
  generateRefreshToken,
  generateSessionFamilyId,
  hashRefreshToken,
} from "../utils/refreshToken.js";
import { REFRESH_TOKEN_MAX_AGE } from "../utils/authCookies.js";
import { generateAccessToken } from "../utils/jwt.js";
import {
  findRefreshSessionByTokenHash,
  rotateRefreshSession,
  revokeRefreshSessionFamily,
} from "../repositories/refreshSessionRepository.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

const SALT_ROUNDS = 12;

const createAuthSession = async (userId: string) => {
  const refreshToken = generateRefreshToken();
  const familyId = generateSessionFamilyId();

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

  await createRefreshSession({
    userId,
    familyId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  return refreshToken;
};

export const createOAuthAuthResult = async (
  user: PublicUser,
): Promise<AuthResult> => {
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createAuthSession(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email) {
    throw new AppError("Name and email are required", 400);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  let user: PublicUser;

  try {
    user = await createUser({
      name,
      email,
      passwordHash,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError("Email is already registered", 409);
    }

    throw error;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createAuthSession(user.id);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (
  input: LoginInput,
): Promise<AuthResult> => {
  const email = input.email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches =
  user.password_hash !== null &&
  (await bcrypt.compare(input.password, user.password_hash));

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password_hash: _passwordHash, ...publicUser } = user;

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createAuthSession(user.id);

  return {
    user: publicUser,
    accessToken,
    refreshToken,
  };
};
export const refreshAuthSession = async (
  refreshToken: string,
): Promise<AuthResult> => {
  const tokenHash = hashRefreshToken(refreshToken);

  const currentSession = await findRefreshSessionByTokenHash(tokenHash);

  if (!currentSession) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newRefreshToken = generateRefreshToken();

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

  const rotation = await rotateRefreshSession(
    currentSession.id,
    hashRefreshToken(newRefreshToken),
    expiresAt,
  );

  if (rotation.status !== "rotated") {
    throw new AppError("Refresh session is invalid or expired", 401);
  }


  const publicUser = await findUserById(currentSession.user_id);

  if (!publicUser) {
    await revokeRefreshSessionFamily(currentSession.family_id);
    throw new AppError("User not found", 404);
  }

  return {
    user: publicUser,
    accessToken: generateAccessToken(publicUser.id),
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (
  refreshToken: string | undefined,
): Promise<void> => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const session = await findRefreshSessionByTokenHash(tokenHash);

  if (!session) {
    return;
  }

  await revokeRefreshSessionFamily(session.family_id);
};