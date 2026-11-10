
export type WorkspaceRole = 'owner' | 'admin' | 'member'

export interface Workspace {
  id: string
  name: string
  role: WorkspaceRole
  created_at: string
  updated_at: string
}

export interface WorkspacesResponse {
  workspaces: Workspace[]
}
