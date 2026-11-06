import type { Request, Response, NextFunction } from "express";
import { getUserWorkspaces, createWorkspace, renameWorkspace, deleteWorkspace } from "../services/workspaceService.js";
import {
  listWorkspaceMembers,
  addWorkspaceMember,
  changeWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../services/workspaceService.js";
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

export const renameWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const { name } = req.body;

    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({
        message: "Invalid workspace ID",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const workspace = await renameWorkspace(workspaceId, name);

    res.status(200).json({ workspace });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspaceController = async (
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

    await deleteWorkspace(workspaceId);

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getWorkspaceMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    const members = await listWorkspaceMembers(workspaceId);

    res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
};
export const addWorkspaceMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const { userId } = req.body;

    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    if (typeof userId !== "string") {
      return res.status(400).json({ message: "User ID is required" });
    }

    const membership = await addWorkspaceMember(userId, workspaceId);

    res.status(201).json({ membership });
  } catch (error) {
    next(error);
  }
};
export const updateWorkspaceMemberRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, membershipId } = req.params;
    const { role } = req.body;

    if (
      !workspaceId ||
      Array.isArray(workspaceId) ||
      !membershipId ||
      Array.isArray(membershipId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or membership ID",
      });
    }

    if (role !== "admin" && role !== "member") {
      return res.status(400).json({
        message: "Invalid workspace role",
      });
    }

    const membership = await changeWorkspaceMemberRole(
      workspaceId,
      membershipId,
      role,
      req.workspaceMembership!.role as "owner" | "admin"
    );

    res.status(200).json({ membership });
  } catch (error) {
    next(error);
  }
};
export const removeWorkspaceMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, membershipId } = req.params;

    if (
      !workspaceId ||
      Array.isArray(workspaceId) ||
      !membershipId ||
      Array.isArray(membershipId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or membership ID",
      });
    }

    await removeWorkspaceMember(workspaceId, membershipId,req.workspaceMembership!.role as "owner" | "admin"
    );

    res.status(200).json({
      message: "Workspace member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};