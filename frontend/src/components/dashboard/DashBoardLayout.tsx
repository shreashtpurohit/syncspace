import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import './dashboard.css'
interface DashboardLayoutProps {
  children: ReactNode
}

const navigationItems = [
  { label: 'Projects', icon: '▦' },
  { label: 'My Tasks', icon: '☷' },
  { label: 'Members', icon: '♙' },
]

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">S</span>
          <span>syncspace</span>
        </div>

        <div className="dashboard-workspace">
          <div className="workspace-avatar">S</div>
          <div className="workspace-details">
            <span className="workspace-label">WORKSPACE</span>
            <span className="workspace-name">My Workspace</span>
          </div>
          <span className="workspace-chevron">⌄</span>
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
            <div className="user-avatar">U</div>
            <div className="user-details">
              <span className="user-name">Your account</span>
              <span className="user-role">Workspace member</span>
            </div>
            <span className="user-menu-icon">···</span>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Overview</strong>
          </div>

          <div className="dashboard-topbar-actions">
            <span className="dashboard-date-label">
              YOUR SHARED WORKSPACE
            </span>
            <div className="topbar-avatar">U</div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
