import type { Request, Response, NextFunction } from "express";
import { getUserWorkspaces } from "../services/workspaceService.js";

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