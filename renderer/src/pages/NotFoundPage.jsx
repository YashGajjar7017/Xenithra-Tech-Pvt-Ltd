import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Pages.css'

function NotFoundPage() {
  return (
    <div className="page-container">
      <div className="error-container">
        <h1>404</h1>
        <p>Page Not Found</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
