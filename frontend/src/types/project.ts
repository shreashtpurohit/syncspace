
export interface Project {
  id: string
  workspace_id: string
  created_by: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectsResponse {
  projects: Project[]
}
