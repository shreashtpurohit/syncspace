
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { Workspace } from '../../types/workspace'
import './dashboard.css'

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
  const userInitials = getInitials(userName)
  const workspaceInitial =
    workspaceName.trim().charAt(0).toUpperCase() || 'W'

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">S</span>
          <span>syncspace</span>
        </div>

        <div className="dashboard-workspace">
          <div className="workspace-avatar">{workspaceInitial}</div>

          <div className="workspace-details">
            <span className="workspace-label">WORKSPACE</span>

            {workspaces.length > 0 ? (
              <select
                className="workspace-sidebar-select"
                aria-label="Switch workspace"
                value={selectedWorkspaceId}
                onChange={(event) =>
                  onWorkspaceChange(event.target.value)
                }
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="workspace-name">{workspaceName}</span>
            )}
          </div>

          {workspaces.length > 1 && (
            <span className="workspace-chevron" aria-hidden="true">
              ⌄
            </span>
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
