import pool from "../db/pool.js";

export interface Membership {
  id: string
  user_id: string
  workspace_id: string
  role: "owner" | "admin" | "member"
  created_at: Date
}

export interface WorkspaceMember extends Membership {
  name: string
  email: string
}

export const getMembershipById = async (
    membershipId: string
): Promise<Membership | null> => {
    const result = await pool.query<Membership>(
        `
        SELECT
        id,
        user_id,
        workspace_id,
        role,
        created_at
        FROM memberships
        WHERE id = $1
        `,
        [membershipId]
    );

    return result.rows[0] ?? null;
};

export const getWorkspaceMembers = async (
  workspaceId: string
): Promise<WorkspaceMember[]> => {
  const result = await pool.query<WorkspaceMember>(
    `
    SELECT
      m.id,
      m.user_id,
      m.workspace_id,
      m.role,
      m.created_at,
      u.name,
      u.email
    FROM memberships m
    INNER JOIN users u ON u.id = m.user_id
    WHERE m.workspace_id = $1
    ORDER BY m.created_at ASC
    `,
    [workspaceId]
  )

  return result.rows
}

export const createMembership = async (
  userId: string,
  workspaceId: string,
  role: Membership["role"]
): Promise<Membership> => {
  const result = await pool.query<Membership>(
    `
    INSERT INTO memberships (user_id, workspace_id, role)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, workspace_id, role, created_at
    `,
    [userId, workspaceId, role]
  );

  return result.rows[0]!;
};

export const updateMembershipRole = async (
  membershipId: string,
  role: Membership["role"]
): Promise<Membership | null> => {
  const result = await pool.query<Membership>(
    `
    UPDATE memberships
    SET role = $2
    WHERE id = $1
    RETURNING id, user_id, workspace_id, role, created_at
    `,
    [membershipId, role]
  );

  return result.rows[0] ?? null;
};

export const deleteMembership = async (
  membershipId: string
): Promise<Membership | null> => {
  const result = await pool.query<Membership>(
    `
    DELETE FROM memberships
    WHERE id = $1
    RETURNING id, user_id, workspace_id, role, created_at
    `,
    [membershipId]
  );

  return result.rows[0] ?? null;
};
