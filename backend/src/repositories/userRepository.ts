
import pool from "../db/pool.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<AuthUser, "password_hash">;

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export const findUserByEmail = async (
  email: string
): Promise<AuthUser | null> => {
  const result = await pool.query<AuthUser>(
    `SELECT id, name, email, password_hash, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (
  userId: string
): Promise<PublicUser | null> => {
  const result = await pool.query<PublicUser>(
    `SELECT id, name, email, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] ?? null;
};

export const createUser = async (
  input: CreateUserInput
): Promise<PublicUser> => {
  const result = await pool.query<PublicUser>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [input.name, input.email, input.passwordHash]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
};
