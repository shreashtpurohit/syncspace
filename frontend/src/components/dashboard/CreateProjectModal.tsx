
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './create-project-modal.css'

interface CreateProjectModalProps {
  isOpen: boolean
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (name: string, description: string) => Promise<void>
}

export default function CreateProjectModal({
  isOpen,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setDescription('')
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      setValidationError('Project name is required.')
      return
    }

    if (trimmedName.length > 100) {
      setValidationError('Project name cannot exceed 100 characters.')
      return
    }

    if (trimmedDescription.length > 500) {
      setValidationError('Description cannot exceed 500 characters.')
      return
    }

    setValidationError('')

    await onSubmit(trimmedName, trimmedDescription)
  }

  return (
    <div
      className="project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        aria-describedby="project-modal-description"
      >
        <div className="project-modal-header">
          <div>
            <span className="project-modal-eyebrow">
              SYNCSPACE / PROJECTS
            </span>

            <h2 id="project-modal-title">Create project.</h2>

            <p
              className="project-modal-description"
              id="project-modal-description"
            >
              Start something meaningful. Give your team a project to
              collaborate on.
            </p>
          </div>

          <button
            type="button"
            className="project-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form className="project-modal-form" onSubmit={handleSubmit}>
          <label htmlFor="project-name">PROJECT NAME</label>

          <input
            id="project-name"
            className="project-modal-input"
            type="text"
            placeholder="e.g. Website Redesign"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setValidationError('')
            }}
            maxLength={100}
            autoFocus
            disabled={isSubmitting}
          />

          <label htmlFor="project-description">
            DESCRIPTION <span>(OPTIONAL)</span>
          </label>

          <textarea
            id="project-description"
            className="project-modal-textarea"
            placeholder="What is this project about?"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setValidationError('')
            }}
            maxLength={500}
            disabled={isSubmitting}
          />

          {validationError && (
            <p className="project-modal-error" role="alert">
              {validationError}
            </p>
          )}

          {error && (
            <p className="project-modal-error" role="alert">
              {error}
            </p>
          )}

          <div className="project-modal-actions">
            <button
              type="button"
              className="project-modal-button project-modal-button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="project-modal-button project-modal-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
