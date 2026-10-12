import type { Request, Response, NextFunction } from "express";
import { getUserWorkspaces, createWorkspace } from "../services/workspaceService.js";

export const getUserWorkspacesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaces = await getUserWorkspaces(req.user.id);

    res.status(200).json({
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const workspace = await createWorkspace(req.user.id, name);

    res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
};