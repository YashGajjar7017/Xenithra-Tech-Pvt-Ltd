import React from 'react'
import '../styles/Pages.css'

function DashboardPage() {
  return (
    <div className="page-container">
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Users</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Projects</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Classes</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Sessions</h3>
            <p className="stat">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
