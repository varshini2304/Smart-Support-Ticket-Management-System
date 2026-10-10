/**
 * Badge Component
 * For status and priority indicators
 */

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    // Status badges
    open: {
      backgroundColor: 'var(--color-warning-100)',
      color: 'var(--color-warning-700)',
    },
    in_progress: {
      backgroundColor: 'var(--color-primary-100)',
      color: 'var(--color-primary-700)',
    },
    resolved: {
      backgroundColor: 'var(--color-success-100)',
      color: 'var(--color-success-700)',
    },
    closed: {
      backgroundColor: 'var(--color-gray-200)',
      color: 'var(--color-gray-700)',
    },
    // Priority badges
    low: {
      backgroundColor: 'var(--color-gray-100)',
      color: 'var(--color-gray-700)',
    },
    medium: {
      backgroundColor: 'var(--color-warning-100)',
      color: 'var(--color-warning-700)',
    },
    high: {
      backgroundColor: 'var(--color-error-100)',
      color: 'var(--color-error-700)',
    },
    // Default
    default: {
      backgroundColor: 'var(--color-gray-100)',
      color: 'var(--color-gray-700)',
    },
  };

  const sizes = {
    sm: {
      fontSize: '0.75rem',
      padding: '0.125rem 0.5rem',
    },
    md: {
      fontSize: '0.875rem',
      padding: '0.25rem 0.75rem',
    },
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
    borderRadius: 'var(--radius-md)',
    whiteSpace: 'nowrap',
    ...variants[variant.toLowerCase()] || variants.default,
    ...sizes[size],
  };

  return <span style={badgeStyles}>{children}</span>;
};
