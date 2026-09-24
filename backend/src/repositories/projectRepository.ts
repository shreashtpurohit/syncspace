import { describe } from "node:test";
import pool from "../db/pool.js";


export interface Project {
  id: string;
  workspace_id: string;
  created_by: string;
  name: string;
  description: string | null;
  created_at : Date;
  updated_at: Date;
}
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

export const getProjectsByWorkspace = async (workspaceId: string): Promise<Project[]> => {
  
  const result = await pool.query(
    `
    SELECT 
    id,
    workspace_id,
    created_by,
    name,
    description,
    created_at,
    updated_at
    FROM projects
    WHERE workspace_id = $1
    ORDER BY created_at ASC
    `,
    [workspaceId]
  );

return result.rows;
}