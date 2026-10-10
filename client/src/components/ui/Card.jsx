/**
 * Card Component
 * Container with consistent styling
 */

export const Card = ({ children, className = '', padding = true, hover = false }) => {
  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'box-shadow 0.2s ease',
    ...(padding && { padding: 'var(--spacing-6)' }),
  };

  const hoverStyles = hover
    ? {
        ':hover': {
          boxShadow: 'var(--shadow-md)',
        },
      }
    : {};

  return (
    <div
      style={cardStyles}
      className={className}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {children}
    </div>
  );
};
