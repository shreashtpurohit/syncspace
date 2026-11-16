
import { apiRequest } from '../lib/api'
import type { Workspace, WorkspacesResponse } from '../types/workspace'
import type {
  WorkspaceMembersResponse,
  WorkspaceMemberResponse,
  AddWorkspaceMemberRequest,
  UpdateWorkspaceMemberRoleRequest,
  WorkspaceMemberActionResponse,
} from '../types/workspaceMember'

interface CreateWorkspaceResponse {
  workspace: Workspace
}

export const getWorkspaces = (): Promise<WorkspacesResponse> => {
  return apiRequest<WorkspacesResponse>('/workspaces')
}

export const createWorkspace = (
  name: string,
): Promise<CreateWorkspaceResponse> => {
  return apiRequest<CreateWorkspaceResponse>('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export const getWorkspaceMembers = (
  workspaceId: string,
): Promise<WorkspaceMembersResponse> => {
  return apiRequest<WorkspaceMembersResponse>(
    `/workspaces/${workspaceId}/members`,
  )
}

export const addWorkspaceMember = (
  workspaceId: string,
  data: AddWorkspaceMemberRequest,
): Promise<WorkspaceMemberResponse> => {
  return apiRequest<WorkspaceMemberResponse>(
    `/workspaces/${workspaceId}/members`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

export const updateWorkspaceMemberRole = (
  workspaceId: string,
  membershipId: string,
  data: UpdateWorkspaceMemberRoleRequest,
): Promise<WorkspaceMemberResponse> => {
  return apiRequest<WorkspaceMemberResponse>(
    `/workspaces/${workspaceId}/members/${membershipId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )
}

export const removeWorkspaceMember = (
  workspaceId: string,
  membershipId: string,
): Promise<WorkspaceMemberActionResponse> => {
  return apiRequest<WorkspaceMemberActionResponse>(
    `/workspaces/${workspaceId}/members/${membershipId}`,
    {
      method: 'DELETE',
    },
  )
}
