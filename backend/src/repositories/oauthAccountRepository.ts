
import pool from "../db/pool.js";
import type { OAuthProvider } from "../config/oauth.js";

export interface OAuthAccount {
  id: string;
  user_id: string;
  provider: OAuthProvider;
  provider_user_id: string;
  email: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OAuthUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOAuthAccountInput {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
}

export interface CreateOAuthUserInput {
  name: string;
  email: string;
  provider: OAuthProvider;
  providerUserId: string;
  emailVerified: boolean;
}

export class OAuthEmailAlreadyExistsError extends Error {
  constructor() {
    super(
      "An account with this email already exists. Log in and link your provider from account settings.",
    );
    this.name = "OAuthEmailAlreadyExistsError";
  }
}

export const findOAuthAccount = async (
  provider: OAuthProvider,
  providerUserId: string,
): Promise<OAuthAccount | null> => {
  const result = await pool.query<OAuthAccount>(
    `SELECT
       id,
       user_id,
       provider,
       provider_user_id,
       email,
       email_verified,
       created_at,
       updated_at
     FROM oauth_accounts
     WHERE provider = $1
       AND provider_user_id = $2`,
    [provider, providerUserId],
  );

  return result.rows[0] ?? null;
};

export const createOAuthAccount = async (
  input: CreateOAuthAccountInput,
): Promise<OAuthAccount> => {
  const result = await pool.query<OAuthAccount>(
    `INSERT INTO oauth_accounts (
       user_id,
       provider,
       provider_user_id,
       email,
       email_verified
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       user_id,
       provider,
       provider_user_id,
       email,
       email_verified,
       created_at,
       updated_at`,
    [
      input.userId,
      input.provider,
      input.providerUserId,
      input.email,
      input.emailVerified,
    ],
  );

  const account = result.rows[0];

  if (!account) {
    throw new Error("Failed to create OAuth account.");
  }

  return account;
};

export const createOAuthUser = async (
  input: CreateOAuthUserInput,
): Promise<{ user: OAuthUser; account: OAuthAccount }> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query<{ id: string }>(
      `SELECT id
       FROM users
       WHERE email = $1`,
      [input.email],
    );

    if (existingUser.rows.length > 0) {
      throw new OAuthEmailAlreadyExistsError();
    }

    const userResult = await client.query<OAuthUser>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, NULL)
       RETURNING id, name, email, created_at, updated_at`,
      [input.name, input.email],
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new Error("Failed to create OAuth user.");
    }

    const accountResult = await client.query<OAuthAccount>(
      `INSERT INTO oauth_accounts (
         user_id,
         provider,
         provider_user_id,
         email,
         email_verified
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         user_id,
         provider,
         provider_user_id,
         email,
         email_verified,
         created_at,
         updated_at`,
      [
        user.id,
        input.provider,
        input.providerUserId,
        input.email,
        input.emailVerified,
      ],
    );

    const account = accountResult.rows[0];

    if (!account) {
      throw new Error("Failed to create OAuth account.");
    }

    await client.query("COMMIT");

    return { user, account };
    } catch (error) {
    await client.query("ROLLBACK");

    const isUniqueViolation =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505";

    if (isUniqueViolation) {
      const existingUser = await pool.query<{ id: string }>(
        `SELECT id
         FROM users
         WHERE email = $1`,
        [input.email],
      );

      if (existingUser.rows.length > 0) {
        throw new OAuthEmailAlreadyExistsError();
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

export const linkOAuthAccount = async (
  input: CreateOAuthAccountInput,
): Promise<OAuthAccount> => {
  const result = await pool.query<OAuthAccount>(
    `INSERT INTO oauth_accounts (
       user_id,
       provider,
       provider_user_id,
       email,
       email_verified
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       user_id,
       provider,
       provider_user_id,
       email,
       email_verified,
       created_at,
       updated_at`,
    [
      input.userId,
      input.provider,
      input.providerUserId,
      input.email,
      input.emailVerified,
    ],
  );

  const account = result.rows[0];

  if (!account) {
    throw new Error("Failed to link OAuth account.");
  }

  return account;
};

export interface LinkedOAuthProvider {
  provider: OAuthProvider;
  email: string | null;
  email_verified: boolean;
  created_at: Date;
}

export const findLinkedOAuthProviders = async (
  userId: string,
): Promise<LinkedOAuthProvider[]> => {
  const result = await pool.query<LinkedOAuthProvider>(
    `SELECT
       provider,
       email,
       email_verified,
       created_at
     FROM oauth_accounts
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId],
  );

  return result.rows;
};
