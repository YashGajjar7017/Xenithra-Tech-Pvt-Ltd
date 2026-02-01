import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'boxicons/css/boxicons.min.css'
import '../css/UserDashboard.css'

const UserDashboard = () => {
  const [userData, setUserData] = useState({
    username: 'User',
    email: 'user@example.com',
    membershipTier: 'Free',
    joinDate: 'January 2024',
    totalProjects: 12,
    completedProjects: 8,
    inProgressProjects: 4,
    totalCompilations: 342,
    monthlyCompilations: 45,
    compilationQuota: 100,
    successRate: 94,
    courseProgress: 65,
    currentCourse: 'Advanced JavaScript',
    lessonsCompleted: 18,
    storageUsed: 2.5,
    storageQuota: 10,
    activeSessions: 1,
    totalTimeSpent: '156h',
    reputation: 2450,
    forumPosts: 23,
    badgesEarned: 8,
    lastActivity: 'Just now'
  })

  const [currentMode, setCurrentMode] = useState('web')
  const [progressAnimations, setProgressAnimations] = useState({
    compilation: 0,
    storage: 25,
    projects: 40
  })

  const benefitsByTier = {
    Free: { compilations: 100, storage: '10 GB', avatar: '👤' },
    Pro: { compilations: 1000, storage: '100 GB', avatar: '⭐' },
    Enterprise: { compilations: 'Unlimited', storage: '1 TB', avatar: '👑' }
  }

  const benefits = benefitsByTier[userData.membershipTier] || benefitsByTier.Free

  // Animate progress bars
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressAnimations({
        compilation: 45,
        storage: 25,
        projects: 40
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleModeSwitch = async (mode) => {
    setCurrentMode(mode)
    // Simulate API call
    console.log(`Switched to ${mode} mode`)
  }

  const handleLogout = () => {
    // Simulate logout
    window.location.href = '/Account/login'
  }

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`)
    // Navigate or trigger action
  }

  return (
    <>
      {/* Header */}
      <header>
        <h1 className="header-title">Dashboard</h1>
        <div className="header-actions">
          <div className="user-badge">
            <i className="bx bxs-user-circle"></i>
            <span>{userData.username}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
            <div id="modeLabel" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Mode: <strong id="currentMode">{currentMode}</strong>
            </div>
            <button
              className={`btn ghost ${currentMode === 'web' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('web')}
              style={{ padding: '6px 10px' }}
            >
              Web
            </button>
            <button
              className={`btn ghost ${currentMode === 'electron' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('electron')}
              style={{ padding: '6px 10px' }}
            >
              Electron
            </button>
            <button className="btn primary" id="openAppBtn" style={{ padding: '6px 10px' }}>
              Open
            </button>
          </div>
          <button className="btn ghost" id="logout-btn" onClick={handleLogout}>
            <i className="bx bxs-log-out"></i> Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        <h5>Navigation</h5>
        <ul>
          <li>
            <a href="/" className="active">
              <i className="bx bxs-home"></i> Home
            </a>
          </li>
          <li>
            <a href="#" id="profile-link">
              <i className="bx bxs-user"></i> Profile
            </a>
          </li>
          <li>
            <a href="/classroom">
              <i className="bx bxs-book"></i> Classroom
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bxs-info-circle"></i> About
            </a>
          </li>
        </ul>
        <h5>Tools</h5>
        <ul>
          <li>
            <a href="/Account/Complier/Beta/true">
              <i className="bx bxs-code-alt"></i> Compiler
            </a>
          </li>
          <li>
            <a href="#" id="settings-link">
              <i className="bx bxs-cog"></i> Settings
            </a>
          </li>
        </ul>
        <h5>Community</h5>
        <ul>
          <li>
            <a href="#">
              <i className="bxl-discord"></i> Discord
            </a>
          </li>
          <li>
            <a href="#">📄 Docs</a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Plan & Status Card */}
        <div className="plan-status-card">
          <div className="plan-header">
            <div className="plan-item">
              <div className="plan-icon">
                <i className="bx bxs-crown"></i>
              </div>
              <div className="plan-info">
                <h3>Current Plan</h3>
                <p>{userData.membershipTier} Tier</p>
              </div>
            </div>
            <div className="plan-item">
              <div
                className="plan-icon"
                style={{ background: 'linear-gradient(135deg, #50d1ff 0%, #7c5cff 100%)' }}
              >
                <i className="bx bxs-flag"></i>
              </div>
              <div className="plan-info">
                <h3>Status</h3>
                <p>
                  <span className="status-badge status-active">Active</span>
                </p>
              </div>
            </div>
            <div className="plan-item">
              <div
                className="plan-icon"
                style={{ background: 'linear-gradient(135deg, #ffd89b 0%, #ff9a8b 100%)' }}
              >
                <i className="bx bxs-bolt"></i>
              </div>
              <div className="plan-info">
                <h3>Compilations Used</h3>
                <p>
                  {userData.monthlyCompilations}/{userData.compilationQuota}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            <h4>Monthly Usage Quota</h4>
            <div className="progress-item">
              <div className="progress-label">
                <span>Compilations</span>
                <span>{progressAnimations.compilation}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressAnimations.compilation}%` }}
                />
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Storage</span>
                <span>{progressAnimations.storage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressAnimations.storage}%` }}
                />
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Classroom Projects</span>
                <span>{progressAnimations.projects}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressAnimations.projects}%` }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button className="btn primary" id="upgrade-btn">
              <i className="bx bxs-star"></i> Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="cards-grid">
          {/* Profile Card */}
          <div className="card">
            <div className="card-header">
              <i className="bx bxs-user-circle" style={{ fontSize: '2rem', color: '#50d1ff' }}></i>
              <div>
                <div className="card-title">Profile</div>
                <div className="card-subtitle">Your Account Info</div>
              </div>
            </div>
            <div className="card-value">{userData.username}</div>
            <div className="card-stat">
              <span>Email:</span>
              <span className="stat-value">{userData.email}</span>
            </div>
            <div className="card-stat">
              <span>Member Since:</span>
              <span className="stat-value">{userData.joinDate}</span>
            </div>
            <button className="btn primary" style={{ width: '100%', marginTop: '10px' }}>
              <i className="bx bxs-edit"></i> Edit Profile
            </button>
          </div>

          {/* Add other stat cards following the same pattern */}
          {/* Projects, Compilations, Learning, Activity, Community cards */}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>
            <i className="bx bxs-magic-wand"></i> Quick Actions
          </h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => handleQuickAction('new-project')}>
              <i className="bx bxs-plus"></i> New Project
            </button>
            <button className="action-btn" onClick={() => handleQuickAction('import-code')}>
              <i className="bx bxs-download"></i> Import Code
            </button>
            <button className="action-btn" onClick={() => handleQuickAction('compiler')}>
              <i className="bx bxs-play"></i> Open Compiler
            </button>
            <button className="action-btn" onClick={() => handleQuickAction('support')}>
              <i className="bx bxs-help-circle"></i> Get Support
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard
