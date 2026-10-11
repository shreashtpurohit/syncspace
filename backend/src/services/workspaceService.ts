import { getWorkspacesByUserId } from "../repositories/workspaceRepository.js";
import type { Workspace } from "../repositories/workspaceRepository.js";

export const getUserWorkspaces = async (
  userId: string
): Promise<Workspace[]> => {
  return getWorkspacesByUserId(userId);
};