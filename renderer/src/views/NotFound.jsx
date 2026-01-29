import { useState } from 'react'

const NotFound = () => {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          Go back to Home
        </a>
      </div>
    </div>
  )
}

export default NotFound
