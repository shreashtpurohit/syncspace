
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member'

export interface WorkspaceMember {
  id: string
  user_id: string
  workspace_id: string
  name: string
  email: string
  role: WorkspaceMemberRole
  created_at: string
}

export interface WorkspaceMembersResponse {
  members: WorkspaceMember[]
}

export interface WorkspaceMemberResponse {
  membership: {
    id: string
    user_id: string
    workspace_id: string
    role: WorkspaceMemberRole
    created_at: string
  }
}

export interface AddWorkspaceMemberRequest {
  userId: string
}

export interface UpdateWorkspaceMemberRoleRequest {
  role: Exclude<WorkspaceMemberRole, 'owner'>
}

export interface WorkspaceMemberActionResponse {
  message: string
}
