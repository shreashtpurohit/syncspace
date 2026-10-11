
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { getProjectById } from "../repositories/projectRepository.js";

export const requireProjectContext = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, projectId } = req.params;

    if (
      !workspaceId ||
      Array.isArray(workspaceId) ||
      !projectId ||
      Array.isArray(projectId)
    ) {
      throw new AppError("Invalid workspace or project ID", 400);
    }

    const project = await getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (project.workspace_id !== workspaceId) {
      throw new AppError(
        "Project does not belong to this workspace",
        403
      );
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};
