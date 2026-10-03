import pool from "../db/pool.js";

export interface Membership {
    id: string,
    user_id: string,
    workspace_id: string,
    role: "owner" | "admin" | "member";
    created_at: Date;
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