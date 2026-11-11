
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { Workspace } from '../../types/workspace'
import './dashboard-layout.css'

interface DashboardLayoutProps {
  children: ReactNode
  userName: string
  userEmail: string
  workspaceName: string
  workspaceRole: string
  workspaces: Workspace[]
  selectedWorkspaceId: string
  onWorkspaceChange: (workspaceId: string) => void
}

const navigationItems = [
  { label: 'Projects', icon: '▦' },
  { label: 'My Tasks', icon: '☷' },
  { label: 'Members', icon: '♙' },
]

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

export default function DashboardLayout({
  children,
  userName,
  userEmail,
  workspaceName,
  workspaceRole,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
}: DashboardLayoutProps) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const workspaceMenuRef = useRef<HTMLDivElement>(null)

  const userInitials = getInitials(userName)
  const workspaceInitial =
    workspaceName.trim().charAt(0).toUpperCase() || 'W'

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(event.target as Node)
      ) {
        setIsWorkspaceMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWorkspaceMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleWorkspaceSelect = (workspaceId: string) => {
    onWorkspaceChange(workspaceId)
    setIsWorkspaceMenuOpen(false)
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">S</span>
          <span>syncspace</span>
        </div>

        <div className="dashboard-workspace" ref={workspaceMenuRef}>
          <div className="workspace-avatar">{workspaceInitial}</div>

          <div className="workspace-details">
            <span className="workspace-label">WORKSPACE</span>

            {workspaces.length > 0 ? (
              <button
                type="button"
                className="workspace-sidebar-trigger"
                aria-haspopup="listbox"
                aria-expanded={isWorkspaceMenuOpen}
                aria-label={`Current workspace: ${workspaceName}. Switch workspace`}
                onClick={() =>
                  setIsWorkspaceMenuOpen((current) => !current)
                }
              >
                <span className="workspace-name">{workspaceName}</span>

                <span
                  className={`workspace-chevron ${
                    isWorkspaceMenuOpen ? 'is-open' : ''
                  }`}
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </button>
            ) : (
              <span className="workspace-name">{workspaceName}</span>
            )}
          </div>

          {isWorkspaceMenuOpen && (
            <div
              className="workspace-dropdown"
              role="listbox"
              aria-label="Select workspace"
            >
              <div className="workspace-dropdown-heading">
                SWITCH WORKSPACE
              </div>

              <div className="workspace-dropdown-list">
                {workspaces.map((workspace) => {
                  const isSelected =
                    workspace.id === selectedWorkspaceId

                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`workspace-dropdown-item ${
                        isSelected ? 'is-selected' : ''
                      }`}
                      onClick={() =>
                        handleWorkspaceSelect(workspace.id)
                      }
                    >
                      <span className="workspace-dropdown-avatar">
                        {workspace.name.trim().charAt(0).toUpperCase() || 'W'}
                      </span>

                      <span className="workspace-dropdown-item-details">
                        <span className="workspace-dropdown-item-name">
                          {workspace.name}
                        </span>

                        <span className="workspace-dropdown-item-role">
                          {workspace.role}
                        </span>
                      </span>

                      {isSelected && (
                        <span
                          className="workspace-dropdown-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <nav className="dashboard-navigation" aria-label="Main navigation">
          <span className="navigation-heading">WORKSPACE</span>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `navigation-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="navigation-icon">⌂</span>
            <span>Overview</span>
          </NavLink>

          {navigationItems.map((item) => (
            <div
              key={item.label}
              className="navigation-item navigation-item-disabled"
              aria-disabled="true"
              title="Coming soon"
            >
              <span className="navigation-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="dashboard-user">
            <div className="user-avatar">{userInitials}</div>

            <div className="user-details">
              <span className="user-name">{userName}</span>
              <span className="user-role">{workspaceRole}</span>
            </div>

            <span className="user-menu-icon">···</span>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <span>{workspaceName}</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Overview</strong>
          </div>

          <div className="dashboard-topbar-actions">
            <span className="dashboard-date-label">{userEmail}</span>
            <div className="topbar-avatar">{userInitials}</div>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
