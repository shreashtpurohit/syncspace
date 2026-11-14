
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

interface EditProjectModalProps {
  isOpen: boolean
  isSubmitting: boolean
  error: string
  initialName: string
  initialDescription: string
  onClose: () => void
  onSubmit: (name: string, description: string) => Promise<void>
}

export default function EditProjectModal({
  isOpen,
  isSubmitting,
  error,
  initialName,
  initialDescription,
  onClose,
  onSubmit,
}: EditProjectModalProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setDescription(initialDescription)
      setValidationError('')
    }
  }, [isOpen, initialName, initialDescription])

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
        aria-labelledby="edit-project-modal-title"
        aria-describedby="edit-project-modal-description"
      >
        <div className="project-modal-header">
          <div>
            <span className="project-modal-eyebrow">
              SYNCSPACE / PROJECTS
            </span>

            <h2 id="edit-project-modal-title">Edit project.</h2>

            <p
              className="project-modal-description"
              id="edit-project-modal-description"
            >
              Refine your project details and keep your workspace
              up to date.
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
          <label htmlFor="edit-project-name">PROJECT NAME</label>

          <input
            id="edit-project-name"
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

          <label htmlFor="edit-project-description">
            DESCRIPTION <span>(OPTIONAL)</span>
          </label>

          <textarea
            id="edit-project-description"
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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
