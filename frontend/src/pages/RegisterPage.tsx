
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Name must contain at least 2 characters.')
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError('Password must not exceed 72 bytes.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Make room for better work."
      description="Create your account and bring your projects into one shared space."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
          {!isSubmitting && <span aria-hidden="true">↗</span>}
        </button>
      </form>
    </AuthLayout>
  )
}
