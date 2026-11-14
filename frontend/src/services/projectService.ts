
import { apiRequest } from '../lib/api'
import type { Project, ProjectsResponse } from '../types/project'

interface CreateProjectInput {
  name: string
  description?: string
}

interface UpdateProjectInput {
  name: string
  description?: string
}

interface ProjectResponse {
  project: Project
}

interface DeleteProjectResponse {
  message: string
}

export const getProjects = (
  workspaceId: string,
  token: string,
): Promise<ProjectsResponse> => {
  return apiRequest<ProjectsResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects`,
    {},
    token,
  )
}

export const getProject = (
  workspaceId: string,
  projectId: string,
  token: string,
): Promise<ProjectResponse> => {
  return apiRequest<ProjectResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects/${encodeURIComponent(projectId)}`,
    {},
    token,
  )
}

export const createProject = (
  workspaceId: string,
  input: CreateProjectInput,
  token: string,
): Promise<ProjectResponse> => {
  return apiRequest<ProjectResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  )
}

export const updateProject = (
  workspaceId: string,
  projectId: string,
  input: UpdateProjectInput,
  token: string,
): Promise<ProjectResponse> => {
  return apiRequest<ProjectResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects/${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    token,
  )
}

export const deleteProject = (
  workspaceId: string,
  projectId: string,
  token: string,
): Promise<DeleteProjectResponse> => {
  return apiRequest<DeleteProjectResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects/${encodeURIComponent(projectId)}`,
    {
      method: 'DELETE',
    },
    token,
  )
}
