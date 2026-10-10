import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { getProjectById } from "../repositories/projectRepository.js";
import { getMembershipById } from "../repositories/membershipRepository.js";
import { getProjectMembershipByProjectAndMembership } from "../repositories/projectMembershipsRepository.js";

export const requireProjectRole = (
    ...allowedRoles: ("viewer" | "editor")[]
) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        try {
            const { projectId } = req.params;

            if (!projectId || Array.isArray(projectId)) {
                throw new AppError("Invalid project ID", 400);
            }

            if (!req.user) {
                throw new AppError("Authentication required", 401);
            }

            if (!req.workspaceMembership) {
                throw new AppError(
                    "Workspace membership required",
                    403
                );
            }

            const project = await getProjectById(projectId);

            if (!project) {
                throw new AppError("Project not found", 404);
            }

            if (
                project.workspace_id !==
                req.workspaceMembership.workspaceId
            ) {
                throw new AppError(
                    "Project does not belong to this workspace",
                    403
                );
            }

            const membership = await getMembershipById(
                req.workspaceMembership.id
            );

            if (!membership) {
                throw new AppError(
                    "Workspace membership not found",
                    403
                );
            }

            const projectMembership =
                await getProjectMembershipByProjectAndMembership(
                    projectId,
                    membership.id
                );

            if (
                membership.role === "owner" ||
                membership.role === "admin"
            ) {
                req.project = project;
                req.projectMembership =
                    projectMembership ?? undefined;

                return next();
            }

            if (!projectMembership) {
                throw new AppError(
                    "You do not have access to this project",
                    403
                );
            }

            if (!allowedRoles.includes(projectMembership.role)) {
                throw new AppError(
                    "Insufficient project permissions",
                    403
                );
            }

            req.project = project;
            req.projectMembership = projectMembership;

            next();
        } catch (error) {
            next(error);
        }
    };
};