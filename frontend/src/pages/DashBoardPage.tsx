
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashBoardLayout'
import { getWorkspaces } from '../services/workspaceService'
import { getProjects } from '../services/projectService'
import type { Workspace } from '../types/workspace'
import type { Project } from '../types/project'
import './dashboard.css'

export default function DashboardPage() {
  const { user, accessToken } = useAuth()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])

  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  const [workspaceError, setWorkspaceError] = useState('')
  const [projectError, setProjectError] = useState('')

  useEffect(() => {
    if (!accessToken) return

    let isActive = true

    const loadWorkspaces = async () => {
      try {
        setIsLoadingWorkspaces(true)
        setWorkspaceError('')

        const response = await getWorkspaces(accessToken)

        if (!isActive) return

        setWorkspaces(response.workspaces)
        setSelectedWorkspaceId(response.workspaces[0]?.id ?? '')
      } catch (error) {
        if (!isActive) return

        setWorkspaceError(
          error instanceof Error
            ? error.message
            : 'Unable to load your workspaces.',
        )
      } finally {
        if (isActive) {
          setIsLoadingWorkspaces(false)
        }
      }
    }

    void loadWorkspaces()

    return () => {
      isActive = false
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !selectedWorkspaceId) {
      setProjects([])
      return
    }

    let isActive = true

    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true)
        setProjectError('')
        setProjects([])

        const response = await getProjects(
          selectedWorkspaceId,
          accessToken,
        )

        if (isActive) {
          setProjects(response.projects)
        }
      } catch (error) {
        if (!isActive) return

        setProjectError(
          error instanceof Error
            ? error.message
            : 'Unable to load your projects.',
        )
      } finally {
        if (isActive) {
          setIsLoadingProjects(false)
        }
      }
    }

    void loadProjects()

    return () => {
      isActive = false
    }
  }, [accessToken, selectedWorkspaceId])

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspaceId,
  )

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <DashboardLayout>
      <div className="dashboard-overview">
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-section-label">
              {formattedDate}
            </span>

            <h1>
              Good to see you,{' '}
              <span>{user?.name?.split(' ')[0] ?? 'there'}.</span>
            </h1>

            <p>
              Here's what's happening across your workspace.
            </p>
          </div>

          <div className="dashboard-welcome-decoration" aria-hidden="true">
            <span>MAKE</span>
            <span>PROGRESS.</span>
            <div />
          </div>
        </section>

        <section className="dashboard-workspace-section">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-label">
                YOUR WORKSPACE
              </span>
              <h2>Workspace overview</h2>
            </div>

            {!isLoadingWorkspaces && workspaces.length > 0 && (
              <label className="workspace-select-wrapper">
                <span className="sr-only">Select workspace</span>
                <select
                  value={selectedWorkspaceId}
                  onChange={(event) =>
                    setSelectedWorkspaceId(event.target.value)
                  }
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {isLoadingWorkspaces && (
            <div className="dashboard-status">
              Loading your workspaces...
            </div>
          )}

          {workspaceError && (
            <div className="dashboard-status dashboard-status-error" role="alert">
              {workspaceError}
            </div>
          )}

          {!isLoadingWorkspaces && !workspaceError && workspaces.length === 0 && (
            <div className="dashboard-empty-state">
              <span className="dashboard-empty-mark">+</span>
              <h3>Your workspace starts here.</h3>
              <p>
                You don't belong to a workspace yet. Create one to start
                organizing your projects.
              </p>
            </div>
          )}

          {selectedWorkspace && (
            <>
              <div className="dashboard-stat-grid">
                <article className="dashboard-stat-card dashboard-stat-featured">
                  <span className="dashboard-stat-label">
                    TOTAL PROJECTS
                  </span>
                  <strong>
                    {isLoadingProjects ? '—' : projects.length}
                  </strong>
                  <span className="dashboard-stat-caption">
                    In {selectedWorkspace.name}
                  </span>
                  <span className="dashboard-stat-decoration">01</span>
                </article>

                <article className="dashboard-stat-card">
                  <span className="dashboard-stat-label">
                    WORKSPACE ROLE
                  </span>
                  <strong className="dashboard-role-value">
                    {selectedWorkspace.role}
                  </strong>
                  <span className="dashboard-stat-caption">
                    Your current access level
                  </span>
                </article>

                <article className="dashboard-stat-card">
                  <span className="dashboard-stat-label">
                    WORKSPACE MEMBERSHIP
                  </span>
                  <strong className="dashboard-role-value">
                    Active
                  </strong>
                  <span className="dashboard-stat-caption">
                    You're part of this workspace
                  </span>
                </article>
              </div>

              <div className="dashboard-project-section">
                <div className="dashboard-section-header">
                  <div>
                    <span className="dashboard-section-label">
                      WORK IN PROGRESS
                    </span>
                    <h2>Projects</h2>
                  </div>

                  <span className="dashboard-project-count">
                    {projects.length.toString().padStart(2, '0')} PROJECTS
                  </span>
                </div>

                {isLoadingProjects && (
                  <div className="dashboard-status">
                    Loading projects...
                  </div>
                )}

                {projectError && (
                  <div className="dashboard-status dashboard-status-error" role="alert">
                    {projectError}
                  </div>
                )}

                {!isLoadingProjects &&
                  !projectError &&
                  projects.length === 0 && (
                    <div className="dashboard-empty-state">
                      <span className="dashboard-empty-mark">↗</span>
                      <h3>Nothing on the board yet.</h3>
                      <p>
                        Create your first project to give your team a place
                        to plan and collaborate.
                      </p>
                    </div>
                  )}

                {!isLoadingProjects && projects.length > 0 && (
                  <div className="dashboard-project-grid">
                    {projects.map((project, index) => (
                      <article
                        className="dashboard-project-card"
                        key={project.id}
                      >
                        <div className="dashboard-project-card-top">
                          <span className="dashboard-project-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="dashboard-project-arrow">↗</span>
                        </div>

                        <h3>{project.name}</h3>

                        <p>
                          {project.description ||
                            'No project description provided.'}
                        </p>

                        <span className="dashboard-project-date">
                          CREATED{' '}
                          {new Intl.DateTimeFormat('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(project.created_at))}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
