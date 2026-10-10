/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.15s ease',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? '0.6' : '1',
    border: 'none',
    fontFamily: 'inherit',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary-600)',
      color: 'white',
      hover: { backgroundColor: 'var(--color-primary-700)' },
    },
    secondary: {
      backgroundColor: 'var(--color-gray-200)',
      color: 'var(--color-gray-900)',
      hover: { backgroundColor: 'var(--color-gray-300)' },
    },
    danger: {
      backgroundColor: 'var(--color-error-500)',
      color: 'white',
      hover: { backgroundColor: 'var(--color-error-700)' },
    },
    success: {
      backgroundColor: 'var(--color-success-500)',
      color: 'white',
      hover: { backgroundColor: 'var(--color-success-700)' },
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary-600)',
      border: '1px solid var(--color-primary-600)',
      hover: {
        backgroundColor: 'var(--color-primary-50)',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-gray-700)',
      hover: { backgroundColor: 'var(--color-gray-100)' },
    },
  };

  const sizes = {
    sm: {
      fontSize: '0.875rem',
      padding: '0.375rem 0.75rem',
      height: '2rem',
    },
    md: {
      fontSize: '0.875rem',
      padding: '0.5rem 1rem',
      height: '2.5rem',
    },
    lg: {
      fontSize: '1rem',
      padding: '0.625rem 1.25rem',
      height: '3rem',
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  const buttonStyles = {
    ...baseStyles,
    ...variantStyle,
    ...sizeStyle,
    width: fullWidth ? '100%' : 'auto',
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading && variantStyle.hover) {
      Object.assign(e.target.style, variantStyle.hover);
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      e.target.style.backgroundColor = variantStyle.backgroundColor;
    }
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      style={buttonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <span
            style={{
              marginRight: '0.5rem',
              animation: 'spin 1s linear infinite',
            }}
          >
            ⟳
          </span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
