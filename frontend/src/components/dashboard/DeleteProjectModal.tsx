
import { useEffect } from 'react'

interface DeleteProjectModalProps {
  isOpen: boolean
  projectName: string
  isDeleting: boolean
  error: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeleteProjectModal({
  isOpen,
  projectName,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isDeleting, onClose])

  if (!isOpen) return null

  return (
    <div
      className="project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose()
        }
      }}
    >
      <section
        className="project-modal delete-project-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-modal-title"
        aria-describedby="delete-project-modal-description"
      >
        <div className="project-modal-header">
          <div>
            <span className="project-modal-eyebrow">
              SYNCSPACE / PROJECTS
            </span>

            <h2 id="delete-project-modal-title">
              Delete project?
            </h2>

            <p
              className="project-modal-description"
              id="delete-project-modal-description"
            >
              You're about to permanently delete{' '}
              <strong>{projectName}</strong>. This action cannot
              be undone.
            </p>
          </div>

          <button
            type="button"
            className="project-modal-close"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

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
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="project-modal-button delete-project-confirm-button"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete project'}
          </button>
        </div>
      </section>
    </div>
  )
}
