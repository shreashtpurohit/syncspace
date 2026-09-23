import {
  createProject as createProjectRepository,
} from "../repositories/projectRepository.js";
import { AppError } from "../errors/AppError.js";

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
    throw new AppError("Project name is required", 400);
  }

  if (trimmedName.length > 100) {
    throw new AppError("Project name cannot exceed 100 characters", 400);
  }

  try {
    return await createProjectRepository({
      workspaceId,
      createdBy,
      name: trimmedName,
      ...(description !== undefined ? { description } : {}),
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" && 
      error !== null &&
      "code" in error &&
      "constraint" in error &&
      error.code === "23505" &&
      error.constraint === "unique_project_name_per_workspace"
    ) {
      throw new AppError(
        "A project with this name already exists in this workspace", 409
      );
    }
    throw error;
  }

  return createProjectRepository({
    workspaceId,
    createdBy,
    name: trimmedName,
    ...(description !== undefined ? { description } : {}),
  });
};