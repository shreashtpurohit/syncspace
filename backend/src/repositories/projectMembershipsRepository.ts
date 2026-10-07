import pool from "../db/pool.js";

export interface CreateProjectMembershipsData {
    projectId : string;
    membershipId : String;
    role : "viewer" | "editor";
}

export const createProjectMembership = async ({
    projectId,
    membershipId,
    role,
}: CreateProjectMembershipsData) => {
    const result = await pool.query(

        `INSERT INTO project_memberships(
            project_id,
            membership_id,
            role
    )
            VALUES ($1, $2, $3)
            RETURNING
            id,
            project_id,
            membership_id,
            role,
            created_at,
            updated_at
        `,
        [projectId, membershipId, role]
    );

    return result.rows[0];

};

export interface ProjectMember {
    id: string;
    projectId: string;
    membership_id: string;
    role: "viewer" | "editor";
    user_id: string;
    user_name: string;
    user_email: string;
    created_at: Date;
    updated_at: Date;
}

export const getProjectMembers = async (
    projectId: string
): Promise<ProjectMember[]> => {
    const result = await pool.query<ProjectMember>(
        `
        SELECT
        pm.id,
        pm.project_id,
        pm.membership_id,
        pm.role,
        m.user_id,
        u.name AS user_name,
        pm.created_at,
        pm.updated_at
        FROM project_memberships pm
        JOIN memberships m
        ON m.id = pm.membership_id
        JOIN users u
        ON u.id = m.user_id
        WHERE pm.project_id = $1
        ORDER BY pm.created_at ASC
        `,
        [projectId]
        
    );

    return result.rows;
}

export const updateProjectMembershipRole = async (
    projectMembershipId: string,
    role: "viewer" | "editor"
) => {
    const result = await pool.query(
        `
        UPDATE project_memberships
        SET role = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING
            id,
            project_id,
            membership_id,
            role,
            created_at,
            updated_at
        `,
        [role, projectMembershipId]
    );

    return result.rows[0] ?? null;
};

export const deleteProjectMembership = async (
    projectMembershipId: string
) => {
    const result = await pool.query(
        `
        DELETE FROM project_memberships
        WHERE id = $1
        RETURNING
            id,
            project_id,
            membership_id,
            role
        `,
        [projectMembershipId]
    );

    return result.rows[0] ?? null;
};