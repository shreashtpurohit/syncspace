
import { apiRequest } from '../lib/api'
import type { ProjectsResponse } from '../types/project'

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
