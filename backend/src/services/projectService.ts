import {
  createProject as createProjectRepository,
} from "../repositories/projectRepository.js";

interface CreateProjectInput {
  workspaceId: string;
  createdBy: string;
  name: string;
  description?: string;
}

export const createProject = async ({
  workspaceId,
  createdBy,
  name,
  description,
}: CreateProjectInput) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Project name is required");
  }

  if (trimmedName.length > 100) {
    throw new Error("Project name cannot exceed 100 characters");
  }

  return createProjectRepository({
    workspaceId,
    createdBy,
    name: trimmedName,
    ...(description !== undefined ? { description } : {}),
  });
};