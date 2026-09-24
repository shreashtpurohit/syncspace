import type { Request, Response, NextFunction } from "express";
import { createProject, getProjectsByWorkspace } from "../services/projectService.js";


export const createProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({
        message: "Invalid workspace ID",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await createProject({
      workspaceId,
      createdBy: req.user.id,
      name,
      description,
    });

    return res.status(201).json({
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectsByWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  
  try {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({
        message: "Invalid workspace ID",
      });
    }
    const projects = await getProjectsByWorkspace(workspaceId);

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    next(error);
  }
};