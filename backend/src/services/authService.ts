
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/userRepository.js";
import type { PublicUser } from "../repositories/userRepository.js";
import { generateAccessToken } from "../utils/jwt.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: PublicUser;
  accessToken: string;
}

const SALT_ROUNDS = 12;

export const registerUser = async (
  input: RegisterInput
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

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  try {
    const user = await createUser({
      name,
      email,
      passwordHash,
    });

    const accessToken = generateAccessToken(user.id);

    return { user, accessToken };
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
};

export const loginUser = async (
  input: LoginInput
): Promise<AuthResult> => {
  const email = input.email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password_hash: _passwordHash, ...publicUser } = user;

  const accessToken = generateAccessToken(user.id);

  return {
    user: publicUser,
    accessToken,
  };
};
