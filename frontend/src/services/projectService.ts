
import { apiRequest } from '../lib/api'
import type { Project, ProjectsResponse } from '../types/project'

interface CreateProjectInput {
  name: string
  description?: string
}

interface CreateProjectResponse {
  project: Project
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

export const createProject = (
  workspaceId: string,
  input: CreateProjectInput,
  token: string,
): Promise<CreateProjectResponse> => {
  return apiRequest<CreateProjectResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/projects`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  )
}
