
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <aside className="auth-brand-panel">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <span>syncspace</span>
        </div>

        <div className="auth-brand-content">
          <span className="auth-kicker">THINK CLEAR. WORK TOGETHER.</span>

          <h2>
            YOUR WORK.
            <br />
            YOUR <span>SPACE.</span>
          </h2>

          <p>
            A calmer space for ambitious teams to plan, build, and make
            meaningful progress together.
          </p>
        </div>

        <div className="auth-brand-bottom">
          <span className="auth-grid-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>BUILT FOR BETTER WORK.</span>
          <span>© 2026 SYNСSPACE</span>
        </div>
      </aside>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-heading">
            <span className="auth-kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {children}

          <div className="auth-form-footer">{footer}</div>
        </div>
      </section>
    </main>
  )
}
