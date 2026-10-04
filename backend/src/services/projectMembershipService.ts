import { AppError } from "../errors/AppError.js";
import { getProjectById } from "../repositories/projectRepository.js";
import { getMembershipById } from "../repositories/membershipRepository.js";
import {
  createProjectMembership as createProjectMembershipRepository,
} from "../repositories/projectMembershipsRepository.js";

export const createProjectMembership = async (
  projectId: string,
  membershipId: string,
  role: "viewer" | "editor"
) => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const membership = await getMembershipById(membershipId);

  if (!membership) {
    throw new AppError("Workspace membership not found", 404);
  }

  if (project.workspace_id !== membership.workspace_id) {
    throw new AppError(
      "Project and membership must belong to the same workspace",
      400
    );
  }

  try {
    return await createProjectMembershipRepository({
      projectId,
      membershipId,
      role,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError(
        "User is already a member of this project", 409
      );
    }

    throw error;
  }

  return createProjectMembershipRepository({
    projectId,
    membershipId,
    role,
  });
};