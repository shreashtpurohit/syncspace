
import { apiRequest } from '../lib/api'
import type { WorkspacesResponse } from '../types/workspace'

export const getWorkspaces = (
  token: string,
): Promise<WorkspacesResponse> => {
  return apiRequest<WorkspacesResponse>('/workspaces', {}, token)
}
