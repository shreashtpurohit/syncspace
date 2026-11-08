import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from =
    (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <section>
        <h1>Welcome back</h1>
        <p>Sign in to continue to SyncSpace.</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}