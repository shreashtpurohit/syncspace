import pool from "../db/pool.js";

export interface Workspace {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceDetails {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export const getWorkspacesByUserId = async (
  userId: string
): Promise<Workspace[]> => {
  const result = await pool.query<Workspace>(
    `
    SELECT
      w.id,
      w.name,
      m.role,
      w.created_at,
      w.updated_at
    FROM workspaces w
    INNER JOIN memberships m
      ON m.workspace_id = w.id
    WHERE m.user_id = $1
    ORDER BY w.created_at ASC
    `,
    [userId]
  );

  return result.rows;
};

export const createWorkspaceForUser = async (
  userId: string,
  name: string
): Promise<Workspace> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const workspaceResult = await client.query<{
      id: string;
      name: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
      INSERT INTO workspaces (name)
      VALUES ($1)
      RETURNING id, name, created_at, updated_at
      `,
      [name]
    );

    const workspace = workspaceResult.rows[0];
    if (!workspace) {
  throw new Error("Failed to create workspace");
}

    await client.query(
      `
      INSERT INTO memberships (user_id, workspace_id, role)
      VALUES ($1, $2, 'owner')
      `,
      [userId, workspace.id]
    );

    await client.query("COMMIT");

    return {
      ...workspace,
      role: "owner",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateWorkspaceName = async (
  workspaceId: string,
  name: string
): Promise<WorkspaceDetails | null> => {
  const result = await pool.query<WorkspaceDetails>(
    `
    UPDATE workspaces
    SET name = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, created_at, updated_at
    `,
    [workspaceId, name]
  );

  return result.rows[0] ?? null;
};
