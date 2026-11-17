
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
  { label: 'Projects', icon: '▦', path: '/projects' },
  { label: 'My Tasks', icon: '☷' },
  { label: 'Members', icon: '♙', path: '/members' },
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const workspaceMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const userInitials = getInitials(userName)

  const workspaceInitial =
    workspaceName.trim().charAt(0).toUpperCase() || 'W'

  const currentPage =
  location.pathname === '/projects'
    ? 'Projects'
    : location.pathname === '/members'
      ? 'Members'
      : location.pathname === '/settings'
        ? 'Account Settings'
        : location.pathname.startsWith('/workspaces/')
          ? 'Project Details'
          : 'Overview'

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(target)
      ) {
        setIsWorkspaceMenuOpen(false)
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWorkspaceMenuOpen(false)
        setIsUserMenuOpen(false)
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

  const handleLogout = async () => {
    setIsUserMenuOpen(false)

    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
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

          {navigationItems.map((item) =>
            item.path ? (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `navigation-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="navigation-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <div
                key={item.label}
                className="navigation-item navigation-item-disabled"
                aria-disabled="true"
                title="Coming soon"
              >
                <span className="navigation-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ),
          )}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="dashboard-user-menu" ref={userMenuRef}>
            <div className="dashboard-user">
              <div className="user-avatar">{userInitials}</div>

              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">{workspaceRole}</span>
              </div>

              <button
                type="button"
                className="user-menu-trigger"
                aria-label="Open account menu"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                onClick={() =>
                  setIsUserMenuOpen((current) => !current)
                }
              >
                ···
              </button>
            </div>

            {isUserMenuOpen && (
              <div className="user-dropdown" role="menu">
                <div className="user-dropdown-account">
                  <span className="user-dropdown-name">
                    {userName}
                  </span>

                  <span className="user-dropdown-email">
                    {userEmail}
                  </span>

                  <span className="user-dropdown-role">
                    {workspaceRole}
                  </span>
                </div>

                <div className="user-dropdown-divider" />

                <button
  type="button"
  className="user-dropdown-settings"
  role="menuitem"
  onClick={() => {
    setIsUserMenuOpen(false);
    navigate("/settings");
  }}
>
  <span aria-hidden="true">⚙</span>
  Account settings
</button>

                <button
                  type="button"
                  className="user-dropdown-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <span aria-hidden="true">↗</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <span>{workspaceName}</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{currentPage}</strong>
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
