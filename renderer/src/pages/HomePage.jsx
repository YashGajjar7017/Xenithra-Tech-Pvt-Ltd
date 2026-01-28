import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'

function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="page-container">
      <div className="hero">
        <h1>Welcome to Xenithra Technologies</h1>
        {user && <p>Hello, {user.username}!</p>}
        <p>Build, Learn, and Innovate with Our Platform</p>
        <div className="cta-buttons">
          <button onClick={handleLogout} className="btn btn-primary">
            Sign Out
          </button>
          <Link to="/dashboard" className="btn btn-secondary">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
