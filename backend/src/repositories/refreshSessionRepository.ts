
import type { PoolClient } from "pg";
import pool from "../db/pool.js";

export interface RefreshSession {
  id: string;
  user_id: string;
  family_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
  replaced_by_session_id: string | null;
}

interface CreateRefreshSessionInput {
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
}

type RotateRefreshSessionResult =
  | { status: "rotated"; session: RefreshSession }
  | { status: "invalid" }
  | { status: "reused" };

export const createRefreshSession = async (
  input: CreateRefreshSessionInput,
): Promise<RefreshSession> => {
  const result = await pool.query<RefreshSession>(
    `INSERT INTO refresh_sessions (user_id, family_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.userId, input.familyId, input.tokenHash, input.expiresAt],
  );

  const session = result.rows[0];

  if (!session) {
    throw new Error("Failed to create refresh session");
  }

  return session;
};

export const findRefreshSessionByTokenHash = async (
  tokenHash: string,
): Promise<RefreshSession | null> => {
  const result = await pool.query<RefreshSession>(
    `SELECT *
     FROM refresh_sessions
     WHERE token_hash = $1`,
    [tokenHash],
  );

  return result.rows[0] ?? null;
};

export const rotateRefreshSession = async (
  sessionId: string,
  newTokenHash: string,
  newExpiresAt: Date,
): Promise<RotateRefreshSessionResult> => {
  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query<RefreshSession>(
      `SELECT *
       FROM refresh_sessions
       WHERE id = $1
       FOR UPDATE`,
      [sessionId],
    );

    const currentSession = currentResult.rows[0];

    if (!currentSession) {
      await client.query("ROLLBACK");
      return { status: "invalid" };
    }

    if (currentSession.revoked_at || currentSession.expires_at <= new Date()) {
      const wasReused = currentSession.revoked_at !== null;

      await client.query(
        `UPDATE refresh_sessions
         SET revoked_at = COALESCE(revoked_at, NOW())
         WHERE family_id = $1`,
        [currentSession.family_id],
      );

      await client.query("COMMIT");

      return wasReused
        ? { status: "reused" }
        : { status: "invalid" };
    }

    const newResult = await client.query<RefreshSession>(
      `INSERT INTO refresh_sessions (user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        currentSession.user_id,
        currentSession.family_id,
        newTokenHash,
        newExpiresAt,
      ],
    );

    const newSession = newResult.rows[0];

    if (!newSession) {
      throw new Error("Failed to create rotated refresh session");
    }

    await client.query(
      `UPDATE refresh_sessions
       SET revoked_at = NOW(),
           replaced_by_session_id = $2
       WHERE id = $1`,
      [currentSession.id, newSession.id],
    );

    await client.query("COMMIT");

    return { status: "rotated", session: newSession };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const revokeRefreshSession = async (
  sessionId: string,
): Promise<void> => {
  await pool.query(
    `UPDATE refresh_sessions
     SET revoked_at = COALESCE(revoked_at, NOW())
     WHERE id = $1`,
    [sessionId],
  );
};

export const revokeRefreshSessionFamily = async (
  familyId: string,
): Promise<void> => {
  await pool.query(
    `UPDATE refresh_sessions
     SET revoked_at = COALESCE(revoked_at, NOW())
     WHERE family_id = $1`,
    [familyId],
  );
};
