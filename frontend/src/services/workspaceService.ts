
import { apiRequest } from '../lib/api'
import type { Workspace } from '../types/workspace'
import type { WorkspacesResponse } from '../types/workspace'

interface CreateWorkspaceResponse {
  workspace: Workspace
}

export const getWorkspaces = (
  token: string,
): Promise<WorkspacesResponse> => {
  return apiRequest<WorkspacesResponse>(
    '/workspaces',
    {},
    token,
  )
}

export const createWorkspace = (
  name: string,
  token: string,
): Promise<CreateWorkspaceResponse> => {
  return apiRequest<CreateWorkspaceResponse>(
    '/workspaces',
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    },
    token,
  )
}
