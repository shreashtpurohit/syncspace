import { getWorkspacesByUserId } from "../repositories/workspaceRepository.js";
import type { Workspace } from "../repositories/workspaceRepository.js";
import { createWorkspaceForUser } from "../repositories/workspaceRepository.js";
import { AppError } from "../errors/AppError.js";

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