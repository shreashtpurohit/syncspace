import pool from "../db/pool.js";

export interface CreateProjectData {
  workspaceId: string;
  createdBy: string;
  name: string;
  description?: string;
}

export const createProject = async ({
  workspaceId,
  createdBy,
  name,
  description,
}: CreateProjectData) => {
  const result = await pool.query(
    `
    INSERT INTO projects (
      workspace_id,
      created_by,
      name,
      description
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      workspace_id,
      created_by,
      name,
      description,
      created_at,
      updated_at
    `,
    [workspaceId, createdBy, name, description ?? null]
  );

  return result.rows[0];
};