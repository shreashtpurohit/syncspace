import pool from "../db/pool.js";

export interface Workspace {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
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
