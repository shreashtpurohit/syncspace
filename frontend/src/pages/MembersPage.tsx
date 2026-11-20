
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashBoardLayout'
import {
  getWorkspaces,
  getWorkspaceMembers,
} from '../services/workspaceService'
import type { Workspace } from '../types/workspace'
import type { WorkspaceMember } from '../types/workspaceMember'
import './members-page.css'

export default function MembersPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [members, setMembers] = useState<WorkspaceMember[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  const [workspaceError, setWorkspaceError] = useState('')
  const [memberError, setMemberError] = useState('')

  const requestedWorkspaceId = searchParams.get('workspaceId')

  // Use the requested workspace if accessible; otherwise fall back
  // to the first workspace the user has access to.
  const selectedWorkspace =
    workspaces.find(
      (workspace) => workspace.id === requestedWorkspaceId,
    ) ?? workspaces[0]

  const selectedWorkspaceId = selectedWorkspace?.id ?? ''

  // Load accessible workspaces.
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
        if (isActive) setIsLoadingWorkspaces(false)
      }
    }

    void loadWorkspaces()

    return () => {
      isActive = false
    }
  }, [])

  // Keep the URL synchronized with the selected accessible workspace.
  useEffect(() => {
    if (isLoadingWorkspaces) return

    if (!selectedWorkspaceId) {
      if (requestedWorkspaceId) {
        setSearchParams(
          (current) => {
            const next = new URLSearchParams(current)
            next.delete('workspaceId')
            return next
          },
          { replace: true },
        )
      }

      return
    }

    if (requestedWorkspaceId !== selectedWorkspaceId) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('workspaceId', selectedWorkspaceId)
          return next
        },
        { replace: true },
      )
    }
  }, [
    isLoadingWorkspaces,
    requestedWorkspaceId,
    selectedWorkspaceId,
    setSearchParams,
  ])

  // Load members whenever the URL-selected workspace changes.
  useEffect(() => {
    if (!selectedWorkspaceId) {
      setMembers([])
      setMemberError('')
      setIsLoadingMembers(false)
      return
    }

    let isActive = true

    const loadMembers = async () => {
      try {
        setIsLoadingMembers(true)
        setMemberError('')
        setMembers([])

        const response = await getWorkspaceMembers(
          selectedWorkspaceId,
        )

        if (isActive) {
          setMembers(response.members)
        }
      } catch (error) {
        if (!isActive) return

        setMemberError(
          error instanceof Error
            ? error.message
            : 'Unable to load workspace members.',
        )
      } finally {
        if (isActive) setIsLoadingMembers(false)
      }
    }

    void loadMembers()

    return () => {
      isActive = false
    }
  }, [selectedWorkspaceId])

  const handleWorkspaceChange = (workspaceId: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('workspaceId', workspaceId)
      return next
    })
  }

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return members

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query),
    )
  }, [members, searchQuery])

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
      <div className="members-page">
        <section className="members-page-heading">
          <div>
            <span className="dashboard-section-label">
              WORKSPACE / MEMBERS
            </span>
            <h1>
              Your people<span>.</span>
            </h1>
            <p>
              Everyone collaborating in your workspace, together in one place.
            </p>
          </div>

          <div className="members-page-total">
            <strong>
              {members.length.toString().padStart(2, '0')}
            </strong>
            <span>WORKSPACE MEMBERS</span>
          </div>
        </section>

        <section className="members-page-content">
          <div className="members-toolbar">
            <div>
              <span className="dashboard-section-label">
                PEOPLE DIRECTORY
              </span>
              <h2>All members</h2>
            </div>

            <label className="members-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search workspace members"
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
                <p>Create a workspace before managing members.</p>
              </div>
            )}

          {selectedWorkspace && (
            <>
              {isLoadingMembers && (
                <div className="dashboard-status">
                  Loading workspace members...
                </div>
              )}

              {memberError && (
                <div
                  className="dashboard-status dashboard-status-error"
                  role="alert"
                >
                  {memberError}
                </div>
              )}

              {!isLoadingMembers &&
                !memberError &&
                members.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-mark">◎</span>
                    <h3>No members found.</h3>
                    <p>
                      Workspace members will appear here when they join.
                    </p>
                  </div>
                )}

              {!isLoadingMembers &&
                !memberError &&
                members.length > 0 &&
                filteredMembers.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-mark">⌕</span>
                    <h3>No matching members.</h3>
                    <p>Try searching by name, email or role.</p>
                  </div>
                )}

              {!isLoadingMembers &&
                !memberError &&
                filteredMembers.length > 0 && (
                  <div className="members-directory">
                    <div className="members-directory-header">
                      <span>MEMBER</span>
                      <span>ROLE</span>
                      <span>JOINED</span>
                    </div>

                    {filteredMembers.map((member) => (
                      <article
                        className="members-directory-row"
                        key={member.id}
                      >
                        <div className="members-directory-person">
                          <span className="members-avatar">
                            {member.name.trim().charAt(0).toUpperCase()}
                          </span>

                          <div>
                            <h3>{member.name}</h3>
                            <p>{member.email}</p>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`members-role members-role-${member.role}`}
                          >
                            {member.role}
                          </span>
                        </div>

                        <time
                          dateTime={member.created_at}
                          className="members-joined-date"
                        >
                          {formattedDate(member.created_at)}
                        </time>
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
