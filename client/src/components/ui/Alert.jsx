/**
 * Alert Component
 * For success, error, warning, and info messages
 */

export const Alert = ({ children, variant = 'info', onClose }) => {
  const variants = {
    success: {
      backgroundColor: 'var(--color-success-50)',
      color: 'var(--color-success-700)',
      borderColor: 'var(--color-success-200)',
    },
    error: {
      backgroundColor: 'var(--color-error-50)',
      color: 'var(--color-error-700)',
      borderColor: 'var(--color-error-200)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-50)',
      color: 'var(--color-warning-700)',
      borderColor: 'var(--color-warning-200)',
    },
    info: {
      backgroundColor: 'var(--color-primary-50)',
      color: 'var(--color-primary-700)',
      borderColor: 'var(--color-primary-200)',
    },
  };

  const alertStyles = {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-4)',
    ...variants[variant],
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0',
    marginLeft: 'var(--spacing-4)',
    color: 'inherit',
    opacity: '0.7',
    transition: 'opacity 0.15s ease',
  };

  return (
    <div style={alertStyles} role="alert">
      <div style={{ flex: 1 }}>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={closeButtonStyles}
          onMouseEnter={(e) => (e.target.style.opacity = '1')}
          onMouseLeave={(e) => (e.target.style.opacity = '0.7')}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};
