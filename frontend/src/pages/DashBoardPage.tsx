
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashBoardLayout'
import CreateWorkspaceModal from '../components/dashboard/CreateWorkSpaceModal'
import CreateProjectModal from '../components/dashboard/CreateProjectModal'
import {
  getWorkspaces,
  createWorkspace,
} from '../services/workspaceService'
import {
  getProjects,
  createProject,
} from '../services/projectService'
import type { Workspace } from '../types/workspace'
import type { Project } from '../types/project'
import './dashboard-pages.css'

export default function DashboardPage() {
  const { user, accessToken } = useAuth()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])

  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  const [workspaceError, setWorkspaceError] = useState('')
  const [projectError, setProjectError] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
  const [createWorkspaceError, setCreateWorkspaceError] = useState('')

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [createProjectError, setCreateProjectError] = useState('')

  // Load workspaces
  useEffect(() => {
    if (!accessToken) {
      setIsLoadingWorkspaces(false)
      return
    }

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

  // Load projects whenever the selected workspace changes
  useEffect(() => {
    if (!accessToken || !selectedWorkspaceId) {
      setProjects([])
      setIsLoadingProjects(false)
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

  // Create workspace
  const handleCreateWorkspace = async (name: string) => {
    if (!accessToken) {
      setCreateWorkspaceError(
        'Your session has expired. Please log in again.',
      )
      return
    }

    try {
      setIsCreatingWorkspace(true)
      setCreateWorkspaceError('')

      const response = await createWorkspace(name, accessToken)

      setWorkspaces((currentWorkspaces) => [
        ...currentWorkspaces,
        response.workspace,
      ])

      setSelectedWorkspaceId(response.workspace.id)
      setIsCreateModalOpen(false)
    } catch (error) {
      setCreateWorkspaceError(
        error instanceof Error
          ? error.message
          : 'Unable to create workspace. Please try again.',
      )
    } finally {
      setIsCreatingWorkspace(false)
    }
  }

  const openCreateWorkspaceModal = () => {
    setCreateWorkspaceError('')
    setIsCreateModalOpen(true)
  }

  const closeCreateWorkspaceModal = () => {
    if (isCreatingWorkspace) return

    setIsCreateModalOpen(false)
    setCreateWorkspaceError('')
  }

  // Create project
  const handleCreateProject = async (
    name: string,
    description: string,
  ) => {
    if (!accessToken || !selectedWorkspaceId) {
      setCreateProjectError(
        'Select a workspace before creating a project.',
      )
      return
    }

    try {
      setIsCreatingProject(true)
      setCreateProjectError('')

      const response = await createProject(
        selectedWorkspaceId,
        {
          name,
          ...(description ? { description } : {}),
        },
        accessToken,
      )

      setProjects((currentProjects) => [
        ...currentProjects,
        response.project,
      ])

      setIsCreateProjectModalOpen(false)
    } catch (error) {
      setCreateProjectError(
        error instanceof Error
          ? error.message
          : 'Unable to create project. Please try again.',
      )
    } finally {
      setIsCreatingProject(false)
    }
  }

  const openCreateProjectModal = () => {
    setCreateProjectError('')
    setIsCreateProjectModalOpen(true)
  }

  const closeCreateProjectModal = () => {
    if (isCreatingProject) return

    setIsCreateProjectModalOpen(false)
    setCreateProjectError('')
  }

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspaceId,
  )

  const canCreateProject =
    selectedWorkspace?.role === 'owner' ||
    selectedWorkspace?.role === 'admin'

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <DashboardLayout
      userName={user?.name ?? 'Your account'}
      userEmail={user?.email ?? ''}
      workspaceName={selectedWorkspace?.name ?? 'No workspace selected'}
      workspaceRole={selectedWorkspace?.role ?? 'Member'}
      workspaces={workspaces}
      selectedWorkspaceId={selectedWorkspaceId}
      onWorkspaceChange={setSelectedWorkspaceId}
    >
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

          <div
            className="dashboard-welcome-decoration"
            aria-hidden="true"
          >
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

            <button
              type="button"
              className="workspace-create-trigger"
              onClick={openCreateWorkspaceModal}
            >
              + New workspace
            </button>
          </div>

          {isLoadingWorkspaces && (
            <div className="dashboard-status">
              Loading your workspaces...
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
                <h3>Your workspace starts here.</h3>
                <p>
                  You don't belong to a workspace yet. Create one to
                  start organizing your projects.
                </p>

                <button
                  type="button"
                  className="workspace-create-trigger"
                  onClick={openCreateWorkspaceModal}
                >
                  Create your first workspace
                </button>
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

                  <div className="dashboard-project-actions">
                    <span className="dashboard-project-count">
                      {projects.length.toString().padStart(2, '0')} PROJECTS
                    </span>

                    {canCreateProject && (
                      <button
                        type="button"
                        className="workspace-create-trigger"
                        onClick={openCreateProjectModal}
                        disabled={isCreatingProject}
                      >
                        + New project
                      </button>
                    )}
                  </div>
                </div>

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
                      <h3>Nothing on the board yet.</h3>
                      <p>
                        Create your first project to give your team a
                        place to plan and collaborate.
                      </p>

                      {canCreateProject ? (
                        <button
                          type="button"
                          className="workspace-create-trigger"
                          onClick={openCreateProjectModal}
                        >
                          Create your first project
                        </button>
                      ) : (
                        <p>
                          Only workspace admins and owners can create
                          projects.
                        </p>
                      )}
                    </div>
                  )}

                {!isLoadingProjects &&
                  !projectError &&
                  projects.length > 0 && (
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
                            <span className="dashboard-project-arrow">
                              ↗
                            </span>
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

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreatingWorkspace}
        error={createWorkspaceError}
        onClose={closeCreateWorkspaceModal}
        onSubmit={handleCreateWorkspace}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        isSubmitting={isCreatingProject}
        error={createProjectError}
        onClose={closeCreateProjectModal}
        onSubmit={handleCreateProject}
      />
    </DashboardLayout>
  )
}
