import React from 'react'

/**
 * Reusable Button Component
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} variant - Button variant (primary, secondary, danger)
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text to show when loading
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {ReactNode} children - Button content
 */
const Button = ({
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  onClick,
  className = '',
  style = {},
  children,
  ...props
}) => {
  const baseStyles = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.7 : 1,
    pointerEvents: disabled || loading ? 'none' : 'auto',
    ...style
  }

  const variantStyles = {
    primary: {
      background: '#f5c504',
      color: '#525252'
    },
    secondary: {
      background: '#6c757d',
      color: '#ffffff'
    },
    danger: {
      background: '#dc3545',
      color: '#ffffff'
    },
    success: {
      background: '#28a745',
      color: '#ffffff'
    },
    warning: {
      background: '#ffc107',
      color: '#212529'
    }
  }

  const buttonStyle = {
    ...baseStyles,
    ...variantStyles[variant]
  }

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button

