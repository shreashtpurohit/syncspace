
import {
  createProject as createProjectRepository,
  getProjectsByWorkspace as getProjectsByWorkspaceRepository,
  getProjectById as getProjectByIdRepository,
  updateProject as updateProjectRepository,
  deleteProject as deleteProjectRepository,
} from "../repositories/projectRepository.js";

import type { Project } from "../repositories/projectRepository.js";
import { AppError } from "../errors/AppError.js";

interface CreateProjectInput {
  workspaceId: string;
  createdBy: string;
  name: string;
  description?: string;
}

interface UpdateProjectInput {
  projectId: string;
  name: string;
  description?: string;
}

export const createProject = async ({
  workspaceId,
  createdBy,
  name,
  description,
}: CreateProjectInput): Promise<Project> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError("Project name is required", 400);
  }

  if (trimmedName.length > 100) {
    throw new AppError(
      "Project name cannot exceed 100 characters",
      400
    );
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
        "A project with this name already exists in this workspace",
        409
      );
    }

    throw error;
  }
};

export const getProjectsByWorkspace = async (
  workspaceId: string
): Promise<Project[]> => {
  return getProjectsByWorkspaceRepository(workspaceId);
};

export const getProjectById = async (
  projectId: string
): Promise<Project | null> => {
  return getProjectByIdRepository(projectId);
};

export const updateProject = async ({
  projectId,
  name,
  description,
}: UpdateProjectInput): Promise<Project> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError("Project name is required", 400);
  }

  if (trimmedName.length > 100) {
    throw new AppError(
      "Project name cannot exceed 100 characters",
      400
    );
  }

  try {
    const project = await updateProjectRepository({
      projectId,
      name: trimmedName,
      ...(description !== undefined ? { description } : {}),
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    return project;
  } catch (error: unknown) {
    if (
      error instanceof AppError
    ) {
      throw error;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "constraint" in error &&
      error.code === "23505" &&
      error.constraint === "unique_project_name_per_workspace"
    ) {
      throw new AppError(
        "A project with this name already exists in this workspace",
        409
      );
    }

    throw error;
  }
};
export const deleteProject = async (
  projectId: string
): Promise<Project> => {
  const project = await deleteProjectRepository(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};