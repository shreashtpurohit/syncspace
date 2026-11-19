
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashBoardLayout'

import { getWorkspaces } from '../services/workspaceService'
import { getProjects } from '../services/projectService'

import type { Workspace } from '../types/workspace'
import type { Project } from '../types/project'

import './projects-page.css'

export default function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  const [workspaceError, setWorkspaceError] = useState('')
  const [projectError, setProjectError] = useState('')

  // Load available workspaces
  useEffect(() => {
    let isActive = true

    const loadWorkspaces = async () => {
      try {
        setIsLoadingWorkspaces(true)
        setWorkspaceError('')

        const response = await getWorkspaces()

        if (!isActive) return

        setWorkspaces(response.workspaces)
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
  }, [])

  // Keep the selected workspace synchronized with the URL
  useEffect(() => {
    if (isLoadingWorkspaces) return

    if (workspaces.length === 0) {
      setSelectedWorkspaceId('')
      return
    }

    const requestedWorkspaceId = searchParams.get('workspaceId')

    const requestedWorkspaceExists = workspaces.some(
      (workspace) => workspace.id === requestedWorkspaceId,
    )

    if (requestedWorkspaceExists && requestedWorkspaceId) {
      setSelectedWorkspaceId(requestedWorkspaceId)
      return
    }

    const defaultWorkspaceId = workspaces[0].id

    setSelectedWorkspaceId(defaultWorkspaceId)

    setSearchParams(
      { workspaceId: defaultWorkspaceId },
      { replace: true },
    )
  }, [
    isLoadingWorkspaces,
    workspaces,
    searchParams,
    setSearchParams,
  ])

  // Handle workspace selection from the sidebar
  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)

    setSearchParams({ workspaceId }, { replace: true })
  }

  // Load projects whenever the selected workspace changes
  useEffect(() => {
    if (!selectedWorkspaceId) {
      setProjects([])
      setIsLoadingProjects(false)
      setProjectError('')
      return
    }

    let isActive = true

    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true)
        setProjectError('')
        setProjects([])

        const response = await getProjects(selectedWorkspaceId)

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
  }, [selectedWorkspaceId])

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspaceId,
  )

  // Search projects
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return projects

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        (project.description ?? '').toLowerCase().includes(query),
    )
  }, [projects, searchQuery])

  const formattedDate = (date: string) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <DashboardLayout
      userName={user?.name ?? 'Your account'}
      userEmail={user?.email ?? ''}
      workspaceName={selectedWorkspace?.name ?? 'No workspace selected'}
      workspaceRole={selectedWorkspace?.role ?? 'Member'}
      workspaces={workspaces}
      selectedWorkspaceId={selectedWorkspaceId}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="projects-page">
        <section className="projects-page-heading">
          <div>
            <span className="dashboard-section-label">
              WORKSPACE / PROJECTS
            </span>

            <h1>
              Your projects<span>.</span>
            </h1>

            <p>
              All your workspace projects, together in one place.
            </p>
          </div>

          <div className="projects-page-total">
            <strong>
              {projects.length.toString().padStart(2, '0')}
            </strong>
            <span>TOTAL PROJECTS</span>
          </div>
        </section>

        <section className="projects-page-content">
          <div className="projects-toolbar">
            <div>
              <span className="dashboard-section-label">
                PROJECT DIRECTORY
              </span>

              <h2>All projects</h2>
            </div>

            <label className="projects-search">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search projects"
              />
            </label>
          </div>

          {isLoadingWorkspaces && (
            <div className="dashboard-status">
              Loading workspaces...
            </div>
          )}

          {workspaceError && (
            <div
              className="dashboard-status dashboard-status-error"
              role="alert"
            >
              {workspaceError}
            </div>
          )}

          {!isLoadingWorkspaces &&
            !workspaceError &&
            workspaces.length === 0 && (
              <div className="dashboard-empty-state">
                <span className="dashboard-empty-mark">+</span>
                <h3>No workspace found.</h3>
                <p>Create a workspace before adding projects.</p>
              </div>
            )}

          {selectedWorkspace && (
            <>
              {isLoadingProjects && (
                <div className="dashboard-status">
                  Loading projects...
                </div>
              )}

              {projectError && (
                <div
                  className="dashboard-status dashboard-status-error"
                  role="alert"
                >
                  {projectError}
                </div>
              )}

              {!isLoadingProjects &&
                !projectError &&
                projects.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-mark">↗</span>
                    <h3>No projects yet.</h3>
                    <p>
                      Projects created in this workspace will appear here.
                    </p>
                  </div>
                )}

              {!isLoadingProjects &&
                !projectError &&
                projects.length > 0 &&
                filteredProjects.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-mark">⌕</span>
                    <h3>No matching projects.</h3>
                    <p>
                      Try a different project name or description.
                    </p>
                  </div>
                )}

              {!isLoadingProjects &&
                !projectError &&
                filteredProjects.length > 0 && (
                  <div className="projects-directory-grid">
                    {filteredProjects.map((project, index) => (
                      <article
                        className="projects-directory-card"
                        key={project.id}
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `/workspaces/${selectedWorkspaceId}/projects/${project.id}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault()

                            navigate(
                              `/workspaces/${selectedWorkspaceId}/projects/${project.id}`,
                            )
                          }
                        }}
                      >
                        <div className="projects-directory-card-top">
                          <span>
                            PROJECT / {String(index + 1).padStart(2, '0')}
                          </span>

                          <span aria-hidden="true">↗</span>
                        </div>

                        <h3>{project.name}</h3>

                        <p>
                          {project.description ||
                            'No project description provided.'}
                        </p>

                        <div className="projects-directory-card-footer">
                          <span>
                            CREATED {formattedDate(project.created_at)}
                          </span>

                          <span className="projects-directory-status">
                            ACTIVE
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
