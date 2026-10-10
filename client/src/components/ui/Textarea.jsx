/**
 * Textarea Component
 * Multi-line text input with consistent styling
 */

export const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  label,
  rows = 4,
  ...props
}) => {
  const textareaStyles = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    color: 'var(--color-gray-900)',
    backgroundColor: disabled ? 'var(--color-gray-100)' : 'white',
    border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--color-gray-300)'}`,
    borderRadius: 'var(--radius-md)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--color-gray-700)',
    marginBottom: 'var(--spacing-2)',
  };

  const errorStyles = {
    fontSize: '0.75rem',
    color: 'var(--color-error-500)',
    marginTop: 'var(--spacing-1)',
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={name} style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--color-error-500)' }}> *</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        style={textareaStyles}
        onFocus={(e) => {
          e.target.style.borderColor = error
            ? 'var(--color-error-500)'
            : 'var(--color-primary-500)';
          e.target.style.boxShadow = error
            ? '0 0 0 3px var(--color-error-50)'
            : '0 0 0 3px var(--color-primary-50)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? 'var(--color-error-500)'
            : 'var(--color-gray-300)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};
