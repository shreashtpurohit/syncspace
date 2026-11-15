
import { apiRequest } from '../lib/api'
import type { Workspace } from '../types/workspace'
import type { WorkspacesResponse } from '../types/workspace'
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

export const getWorkspaceMembers = (
  workspaceId: string,
  token: string,
): Promise<WorkspaceMembersResponse> => {
  return apiRequest<WorkspaceMembersResponse>(
    `/workspaces/${workspaceId}/members`,
    {},
    token,
  )
}

export const addWorkspaceMember = (
  workspaceId: string,
  data: AddWorkspaceMemberRequest,
  token: string,
): Promise<WorkspaceMemberResponse> => {
  return apiRequest<WorkspaceMemberResponse>(
    `/workspaces/${workspaceId}/members`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token,
  )
}

export const updateWorkspaceMemberRole = (
  workspaceId: string,
  membershipId: string,
  data: UpdateWorkspaceMemberRoleRequest,
  token: string,
): Promise<WorkspaceMemberResponse> => {
  return apiRequest<WorkspaceMemberResponse>(
    `/workspaces/${workspaceId}/members/${membershipId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    token,
  )
}

export const removeWorkspaceMember = (
  workspaceId: string,
  membershipId: string,
  token: string,
): Promise<WorkspaceMemberActionResponse> => {
  return apiRequest<WorkspaceMemberActionResponse>(
    `/workspaces/${workspaceId}/members/${membershipId}`,
    {
      method: 'DELETE',
    },
    token,
  )
}
