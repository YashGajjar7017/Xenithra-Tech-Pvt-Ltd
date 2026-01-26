import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Pages.css'

function HomePage() {
  return (
    <div className="page-container">
      <div className="hero">
        <h1>Welcome to Xenithra Technologies</h1>
        <p>Build, Learn, and Innovate with Our Platform</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
