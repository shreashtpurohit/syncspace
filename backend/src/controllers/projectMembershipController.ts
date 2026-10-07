import type { Request, Response, NextFunction } from "express";
import { createProjectMembership, getProjectMembers, updateProjectMembershipRole, } from "../services/projectMembershipService.js";

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

export const getProjectMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const members = await getProjectMembers(projectId);

    return res.status(200).json({
      members,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMembershipRoleController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { projectMembershipId } = req.params;
        const { role } = req.body;

        if (
            !projectMembershipId ||
            Array.isArray(projectMembershipId)
        ) {
            return res.status(400).json({
                message: "Invalid project membership ID",
            });
        }

        if (role !== "viewer" && role !== "editor") {
            return res.status(400).json({
                message: "Role must be either viewer or editor",
            });
        }

        const updatedMembership =
            await updateProjectMembershipRole(
                projectMembershipId,
                role
            );

        return res.status(200).json({
            membership: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};