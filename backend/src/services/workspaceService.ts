import { getWorkspacesByUserId } from "../repositories/workspaceRepository.js";
import type { Workspace } from "../repositories/workspaceRepository.js";
import { createWorkspaceForUser } from "../repositories/workspaceRepository.js";
import { AppError } from "../errors/AppError.js";
import { updateWorkspaceName } from "../repositories/workspaceRepository.js";
import { deleteWorkspaceById } from "../repositories/workspaceRepository.js";

export const getUserWorkspaces = async (
  userId: string
): Promise<Workspace[]> => {
  return getWorkspacesByUserId(userId);
};

export const createWorkspace = async (
  userId: string,
  name: string
): Promise<Workspace> => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new AppError("Workspace name is required", 400);
  }

  if (normalizedName.length > 100) {
    throw new AppError(
      "Workspace name must not exceed 100 characters",
      400
    );
  }

  return createWorkspaceForUser(userId, normalizedName);
};

export const renameWorkspace = async (
  workspaceId: string,
  name: string
) => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new AppError("Workspace name is required", 400);
  }

  if (normalizedName.length > 100) {
    throw new AppError(
      "Workspace name must not exceed 100 characters",
      400
    );
  }

  const workspace = await updateWorkspaceName(
    workspaceId,
    normalizedName
  );

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  return workspace;
};

export const deleteWorkspace = async (
  workspaceId: string
): Promise<void> => {
  const deletedWorkspaceId = await deleteWorkspaceById(workspaceId);

  if (!deletedWorkspaceId) {
    throw new AppError("Workspace not found", 404);
  }
};