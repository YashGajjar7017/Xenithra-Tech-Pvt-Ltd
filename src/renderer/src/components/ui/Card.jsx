import React from 'react'

/**
 * Reusable Card Component - Glassmorphism style
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {function} onClick - Click handler
 */
const Card = ({
  children,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...style
  }

  return (
    <div
      className={`card glass-card ${className}`}
      style={cardStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

