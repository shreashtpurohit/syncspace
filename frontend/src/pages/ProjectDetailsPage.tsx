
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashBoardLayout'
import { getWorkspaces } from '../services/workspaceService'
import { getProject } from '../services/projectService'
import type { Workspace } from '../types/workspace'
import type { Project } from '../types/project'
import './project-details-page.css'

export default function ProjectDetailsPage() {
  const { workspaceId, projectId } = useParams()
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken || !workspaceId || !projectId) {
      setError('Invalid project URL or authentication session.')
      setIsLoading(false)
      return
    }

    let isActive = true

    const loadProjectDetails = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [workspaceResponse, projectResponse] = await Promise.all([
          getWorkspaces(accessToken),
          getProject(workspaceId, projectId, accessToken),
        ])

        if (!isActive) return

        setWorkspaces(workspaceResponse.workspaces)
        setProject(projectResponse.project)
      } catch (error) {
        if (!isActive) return

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load project details.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadProjectDetails()

    return () => {
      isActive = false
    }
  }, [accessToken, workspaceId, projectId])

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  )

  const formattedDate = (date: string) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <DashboardLayout
      userName={user?.name ?? 'Your account'}
      userEmail={user?.email ?? ''}
      workspaceName={selectedWorkspace?.name ?? 'Workspace'}
      workspaceRole={selectedWorkspace?.role ?? 'Member'}
      workspaces={workspaces}
      selectedWorkspaceId={workspaceId ?? ''}
      onWorkspaceChange={() => navigate('/projects')}
    >
      <main className="project-details-page">
        <Link to="/projects" className="project-details-back">
          ← Back to projects
        </Link>

        {isLoading && (
          <div className="dashboard-status">
            Loading project details...
          </div>
        )}

        {!isLoading && error && (
          <div
            className="dashboard-status dashboard-status-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!isLoading && !error && project && (
          <>
            <header className="project-details-header">
              <div>
                <span className="dashboard-section-label">
                  WORKSPACE / PROJECT DETAILS
                </span>

                <h1>{project.name}<span>.</span></h1>

                <p>
                  {project.description ||
                    'No project description provided.'}
                </p>
              </div>

              <span className="projects-directory-status">
                ACTIVE
              </span>
            </header>

            <section className="project-details-information">
              <article>
                <span>CREATED ON</span>
                <strong>{formattedDate(project.created_at)}</strong>
              </article>

              <article>
                <span>LAST UPDATED</span>
                <strong>{formattedDate(project.updated_at)}</strong>
              </article>

              <article>
                <span>PROJECT ID</span>
                <strong className="project-details-id">
                  {project.id}
                </strong>
              </article>
            </section>

            <section className="project-details-placeholder">
              <span className="dashboard-section-label">
                PROJECT WORKSPACE
              </span>
              <h2>Something big starts here.</h2>
              <p>
                Tasks, team collaboration and project activity
                will live here as we build the next features.
              </p>
            </section>
          </>
        )}
      </main>
    </DashboardLayout>
  )
}
