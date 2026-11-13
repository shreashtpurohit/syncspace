
import type { Request, Response, NextFunction } from "express";

import {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
} from "../services/projectService.js";

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

export const getProjectByIdController = async (
  req: Request,
  res: Response,
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
      return res.status(400).json({
        message: "Invalid workspace or project ID",
      });
    }

    const project = await getProjectById(projectId);

    if (!project || project.workspace_id !== workspaceId) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, projectId } = req.params;
    const { name, description } = req.body;

    if (
      !workspaceId ||
      Array.isArray(workspaceId) ||
      !projectId ||
      Array.isArray(projectId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or project ID",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const existingProject = await getProjectById(projectId);

    if (!existingProject || existingProject.workspace_id !== workspaceId) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const project = await updateProject({
      projectId,
      name,
      ...(description !== undefined ? { description } : {}),
    });

    return res.status(200).json({
      project,
    });
  } catch (error) {
    next(error);
  }
};
