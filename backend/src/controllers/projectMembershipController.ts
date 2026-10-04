import type { Request, Response, NextFunction } from "express";
import { createProjectMembership } from "../services/projectMembershipService.js";

export const createProjectMembershipController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { projectId } = req.params;
        const { membershipId, role } = req.body;

        if(!projectId || Array.isArray(projectId)) {
            return res.status(400).json({
        message: "Invalid project ID",
    });
        }
            
    if (typeof membershipId !== "string" || !membershipId) {
        return res.status(400).json({
            message: "Membership ID is required",
        });
    }

    if (role!== "viewer" && role !=="editor"){
        return res.status(400).json({
            message: "Role must be viewer or editor",
        });
    }

    const projectMembership = await createProjectMembership(
        projectId,
        membershipId,
        role
    );

    return res.status(201).json({
        projectMembership,
    });
} catch (error) {
        next(error);
    }
};