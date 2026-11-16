
import { AppError } from "../errors/AppError.js";
import {
  createOAuthUser,
  findOAuthAccount,
} from "../repositories/oauthAccountRepository.js";
import { findUserById } from "../repositories/userRepository.js";
import type { OAuthProvider } from "../config/oauth.js";

interface OAuthIdentityInput {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

export const resolveOAuthIdentity = async (
  identity: OAuthIdentityInput,
) => {
  const email = identity.email.trim().toLowerCase();
  const name = identity.name.trim();

  if (!identity.providerUserId || !email || !identity.emailVerified) {
    throw new AppError("The provider did not return a verified identity.", 401);
  }

  if (!name) {
    throw new AppError("The provider did not return a valid name.", 400);
  }

  const existingAccount = await findOAuthAccount(
    identity.provider,
    identity.providerUserId,
  );

  if (existingAccount) {
    const user = await findUserById(existingAccount.user_id);

    if (!user) {
      throw new AppError("The account associated with this identity was not found.", 404);
    }

    return user;
  }

  try {
    const result = await createOAuthUser({
      name,
      email,
      provider: identity.provider,
      providerUserId: identity.providerUserId,
      emailVerified: identity.emailVerified,
    });

    return result.user;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "OAuthEmailAlreadyExistsError"
    ) {
      throw new AppError(
        "An account with this email already exists. Log in to SyncSpace first, then link your provider from account settings.",
        409,
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError(
        "This identity or email is already associated with another account.",
        409,
      );
    }

    throw error;
  }
};
