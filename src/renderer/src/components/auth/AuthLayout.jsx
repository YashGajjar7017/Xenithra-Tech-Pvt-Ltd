import React from 'react'

/**
 * AuthLayout - Layout wrapper for authentication pages
 * @param {ReactNode} children - Page content
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {string} backgroundImage - Background image URL
 * @param {object} style - Additional styles
 */
const AuthLayout = ({
  children,
  title = '',
  subtitle = '',
  backgroundImage = '',
  style = {}
}) => {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e0e0e0',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '20px',
    ...style
  }

  return (
    <div className="auth-layout" style={containerStyle}>
      {title && (
        <h1 style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          color: '#121212',
          margin: 0
        }}>
          {title}
        </h1>
      )}
      {children}
      {subtitle && (
        <p style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          color: '#666',
          margin: 0
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default AuthLayout

