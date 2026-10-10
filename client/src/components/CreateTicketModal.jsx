
import { useState } from 'react';
import { ticketAPI } from '../services/api';

export const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
    setError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }

    if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (formData.description.trim().length > 5000) {
      errors.description = 'Description must not exceed 5000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await ticketAPI.createTicket(
        formData.title.trim(),
        formData.description.trim(),
        formData.priority
      );
      // Reset form
      setFormData({ title: '', description: '', priority: 'MEDIUM' });
      setValidationErrors({});
      // Call success callback
      if (onSuccess) onSuccess();
      // Close modal
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', description: '', priority: 'MEDIUM' });
      setValidationErrors({});
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={handleClose} />

      {/* Modal */}
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Create New Ticket</h2>
            <p style={styles.subtitle}>
              Describe your issue and we'll get back to you as soon as possible
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={styles.closeButton}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
              <button
                onClick={() => setError(null)}
                style={styles.errorClose}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Title Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="title" style={styles.label}>
                Ticket Title <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of your issue"
                required
                style={{
                  ...styles.input,
                  ...(validationErrors.title && styles.inputError),
                }}
              />
              {validationErrors.title && (
                <span style={styles.fieldError}>{validationErrors.title}</span>
              )}
              <span style={styles.fieldHint}>
                A clear, concise title helps us route your ticket faster
              </span>
            </div>

            {/* Description Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="description" style={styles.label}>
                Description <span style={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about your issue..."
                required
                rows={6}
                style={{
                  ...styles.textarea,
                  ...(validationErrors.description && styles.inputError),
                }}
              />
              {validationErrors.description && (
                <span style={styles.fieldError}>
                  {validationErrors.description}
                </span>
              )}
            </div>

            {/* Priority Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="priority" style={styles.label}>
                Priority <span style={styles.required}>*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                style={styles.select}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },

  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    zIndex: 1001,
    animation: 'slideUp 0.3s ease',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid #E5E7EB',
  },

  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.25rem',
  },

  subtitle: {
    fontSize: '0.875rem',
    color: '#6B7280',
  },

  closeButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.375rem',
    color: '#6B7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },

  content: {
    padding: '1.5rem',
    maxHeight: 'calc(90vh - 120px)',
    overflowY: 'auto',
  },

  errorAlert: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: '0.5rem',
    padding: '0.875rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  errorIcon: {
    fontSize: '1.125rem',
    flexShrink: 0,
  },

  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: '0.875rem',
  },

  errorClose: {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
    opacity: '0.7',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },

  required: {
    color: '#EF4444',
  },

  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },

  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },

  inputError: {
    borderColor: '#DC2626',
  },

  fieldError: {
    fontSize: '0.75rem',
    color: '#DC2626',
  },

  fieldHint: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },

  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    paddingTop: '0.5rem',
  },

  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },

  submitButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('#create-ticket-modal-styles')) {
    styleSheet.id = 'create-ticket-modal-styles';
    document.head.appendChild(styleSheet);
  }
}
