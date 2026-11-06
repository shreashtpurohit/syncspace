import { getWorkspacesByUserId } from "../repositories/workspaceRepository.js";
import type { Workspace } from "../repositories/workspaceRepository.js";
import { createWorkspaceForUser } from "../repositories/workspaceRepository.js";
import { AppError } from "../errors/AppError.js";
import { updateWorkspaceName } from "../repositories/workspaceRepository.js";
import { deleteWorkspaceById } from "../repositories/workspaceRepository.js";
import {
  getWorkspaceMembers,
  createMembership,
  updateMembershipRole,
  deleteMembership,
} from "../repositories/membershipRepository.js";

import type { Membership } from "../repositories/membershipRepository.js";
import { getMembershipById } from "../repositories/membershipRepository.js";
import pool from "../db/pool.js";
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
export const listWorkspaceMembers = async (
  workspaceId: string
): Promise<Membership[]> => {
  return getWorkspaceMembers(workspaceId);
};
export const addWorkspaceMember = async (
  userId: string,
  workspaceId: string
): Promise<Membership> => {
  const userResult = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  try {
    return await createMembership(userId, workspaceId, "member");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError("User is already a workspace member", 409);
    }

    throw error;
  }
};
export const changeWorkspaceMemberRole = async (
  workspaceId: string,
  membershipId: string,
  role: "admin" | "member",
  actorRole: "owner" | "admin"
): Promise<Membership> => {
  const membership = await getMembershipById(membershipId);

  if (!membership || membership.workspace_id !== workspaceId) {
    throw new AppError("Workspace member not found", 404);
  }

  if (membership.role === "owner") {
    throw new AppError("Workspace owner role cannot be changed", 400);
  }

  if (actorRole === "admin" && membership.role === "admin") {
    throw new AppError(
      "Admins cannot modify other admins",
      403
    );
  }

  if (actorRole === "admin" && role === "admin") {
    throw new AppError(
      "Only workspace owners can promote members to admin",
      403
    );
  }

  const updatedMembership = await updateMembershipRole(
    membershipId,
    role
  );

  if (!updatedMembership) {
    throw new AppError("Workspace member not found", 404);
  }

  return updatedMembership;
};

export const removeWorkspaceMember = async (
  workspaceId: string,
  membershipId: string,
  actorRole: "owner" | "admin"
): Promise<void> => {
  const membership = await getMembershipById(membershipId);

  if (!membership || membership.workspace_id !== workspaceId) {
    throw new AppError("Workspace member not found", 404);
  }

  if (membership.role === "owner") {
    throw new AppError("Workspace owner cannot be removed", 400);
  }

  if (actorRole === "admin" && membership.role === "admin") {
    throw new AppError(
      "Admins cannot remove other admins",
      403
    );
  }

  const deletedMembership = await deleteMembership(membershipId);

  if (!deletedMembership) {
    throw new AppError("Workspace member not found", 404);
  }
};