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