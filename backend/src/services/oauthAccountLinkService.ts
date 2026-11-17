
import { AppError } from "../errors/AppError.js";
import {
  findOAuthAccount,
  linkOAuthAccount,
} from "../repositories/oauthAccountRepository.js";
import { findUserById } from "../repositories/userRepository.js";
import type { OAuthProvider } from "../config/oauth.js";

interface LinkOAuthAccountInput {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
}

export const linkOAuthIdentity = async (
  input: LinkOAuthAccountInput,
) => {
  const email = input.email.trim().toLowerCase();

  if (!input.providerUserId || !email || !input.emailVerified) {
    throw new AppError(
      "A verified provider identity is required.",
      401,
    );
  }

  const user = await findUserById(input.userId);

  if (!user) {
    throw new AppError("SyncSpace account not found.", 404);
  }

  const existingAccount = await findOAuthAccount(
    input.provider,
    input.providerUserId,
  );

  if (existingAccount) {
    if (existingAccount.user_id === input.userId) {
      throw new AppError(
        "This provider is already linked to your account.",
        409,
      );
    }

    throw new AppError(
      "This provider identity is already linked to another SyncSpace account.",
      409,
    );
  }

  try {
    return await linkOAuthAccount({
      userId: input.userId,
      provider: input.provider,
      providerUserId: input.providerUserId,
      email,
      emailVerified: input.emailVerified,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError(
        "This provider is already linked to a SyncSpace account.",
        409,
      );
    }

    throw error;
  }
};

