
import { useEffect, useState } from 'react'
import './create-workspace-modal.css'

interface CreateWorkspaceModalProps {
  isOpen: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export default function CreateWorkspaceModal({
  isOpen,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setValidationError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setValidationError('Workspace name is required.')
      return
    }

    if (trimmedName.length > 80) {
      setValidationError('Workspace name cannot exceed 80 characters.')
      return
    }

    setValidationError('')
    await onSubmit(trimmedName)
  }

  return (
    <div
      className="workspace-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <section
        className="workspace-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-modal-title"
        aria-describedby="workspace-modal-description"
      >
        <div className="workspace-modal-header">
          <div>
            <span className="workspace-modal-eyebrow">
              SYNCSPACE / WORKSPACES
            </span>

            <h2 id="workspace-modal-title">
              Create workspace.
            </h2>

            <p
              className="workspace-modal-description"
              id="workspace-modal-description"
            >
              Give your team a shared space to organize projects and
              collaborate.
            </p>
          </div>

          <button
            type="button"
            className="workspace-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form className="workspace-modal-form" onSubmit={handleSubmit}>
          <label htmlFor="workspace-name">
            WORKSPACE NAME
          </label>

          <input
            id="workspace-name"
            className="workspace-modal-input"
            type="text"
            placeholder="e.g. Design Team"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setValidationError('')
            }}
            maxLength={80}
            autoFocus
            disabled={isSubmitting}
          />

          {validationError && (
            <p className="workspace-modal-error" role="alert">
              {validationError}
            </p>
          )}

          {error && (
            <p className="workspace-modal-error" role="alert">
              {error}
            </p>
          )}

          <div className="workspace-modal-actions">
            <button
              type="button"
              className="workspace-modal-button workspace-modal-button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="workspace-modal-button workspace-modal-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
