import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import '../css/bootstrap/css/bootstrap.min.css'
import '../css/boxicons/boxicons.min.css'
import '../css/dashboard.css'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
)

const DashboardPage = () => {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [username, setUsername] = useState('Loading...')
  const [stats, setStats] = useState({
    totalCompilations: 342,
    totalAchievements: 8,
    activeSessions: 2,
    codingStreak: 5
  })
  const [recentActivity, setRecentActivity] = useState([
    { icon: 'bx bx-code-alt', text: 'Completed JavaScript compilation', time: '2 mins ago' },
    { icon: 'bx bx-trophy', text: 'Unlocked "First Compile" achievement', time: '5 mins ago' },
    { icon: 'bx bx-group', text: 'Joined collaboration session', time: '10 mins ago' }
  ])

  // Mock data
  const achievements = [
    { id: 1, name: 'First Compile', icon: 'bx bx-code-alt', unlocked: true },
    { id: 2, name: '5 Day Streak', icon: 'bx bx-calendar', unlocked: true },
    { id: 3, name: '10 Compilations', icon: 'bx bx-trophy', unlocked: false }
  ]

  const sessions = [
    { id: 1, name: 'Team Sprint Review', members: 4, status: 'active' },
    { id: 2, name: 'Algorithm Challenge', members: 2, status: 'completed' }
  ]

  // Chart data
  const compilationChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Compilations',
        data: [12, 19, 15, 22, 18, 14, 25],
        backgroundColor: 'rgba(124, 92, 255, 0.6)',
        borderColor: 'rgba(124, 92, 255, 1)',
        borderWidth: 2
      }
    ]
  }

  const languageChartData = {
    labels: ['JavaScript', 'Python', 'Java', 'C++', 'Others'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgba(124, 92, 255, 0.8)',
          'rgba(80, 209, 255, 0.8)',
          'rgba(255, 154, 139, 0.8)',
          'rgba(255, 216, 155, 0.8)',
          'rgba(104, 224, 207, 0.8)'
        ]
      }
    ]
  }

  const handleMenuClick = (page) => {
    setActivePage(page)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUsername('john_doe')
    }, 500)
  }, [])

  const renderPageContent = () => {
    switch (activePage) {
      case 'overview':
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bx bx-code-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalCompilations}</h3>
                  <p>Total Compilations</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bx bx-trophy"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalAchievements}</h3>
                  <p>Achievements Unlocked</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bx bx-group"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.activeSessions}</h3>
                  <p>Active Sessions</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bx bx-time-five"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.codingStreak}</h3>
                  <p>Day Streak</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={activity.icon}></i>
                    </div>
                    <div className="activity-content">
                      <p>{activity.text}</p>
                      <small>{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )

      case 'analytics':
        return (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Compilation Statistics</h3>
              <Bar
                data={compilationChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="analytics-card">
              <h3>Language Usage</h3>
              <Doughnut
                data={languageChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="analytics-card">
              <h3>Success Rate</h3>
              <div className="success-rate">
                <div className="rate-circle">
                  <span>85%</span>
                </div>
                <p>Compilation Success Rate</p>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Recent Sessions</h3>
              <div className="session-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-item">
                    <span>{session.name}</span>
                    <span>{session.members} members</span>
                    <span className={`status ${session.status}`}>{session.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'achievements':
        return (
          <>
            <div className="achievements-header">
              <h2>Your Achievements</h2>
              <div className="achievement-stats">
                <span>{stats.totalAchievements} / 10</span> Unlocked
              </div>
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''}`}
                >
                  <i className={achievement.icon}></i>
                  <h4>{achievement.name}</h4>
                  <span>{achievement.unlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              ))}
            </div>
            <div className="leaderboard-section">
              <h3>Leaderboard</h3>
              <div className="leaderboard">
                <div className="leaderboard-item">
                  <span className="rank">#1</span>
                  <span className="user">john_doe</span>
                  <span className="score">2450 pts</span>
                </div>
                <div className="leaderboard-item">
                  <span className="rank">#2</span>
                  <span className="user">alice_smith</span>
                  <span className="score">1987 pts</span>
                </div>
              </div>
            </div>
          </>
        )

      case 'collaboration':
        return (
          <>
            <div className="collaboration-header">
              <h2>Code Collaboration</h2>
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#createSessionModal"
              >
                <i className="bx bx-plus"></i> Create Session
              </button>
            </div>
            <div className="collaboration-content">
              <div className="sessions-section">
                <h3>Your Sessions</h3>
                <div className="sessions-list">
                  {sessions.map((session) => (
                    <div key={session.id} className="session-card">
                      <h5>{session.name}</h5>
                      <div className="session-meta">
                        <span>{session.members} members</span>
                        <span className={`status ${session.status}`}>{session.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="comments-section">
                <h3>Recent Comments</h3>
                <div className="comments-list">
                  <div className="comment-item">
                    <strong>john_doe:</strong> Great progress on auth module!
                  </div>
                </div>
              </div>
            </div>
          </>
        )

      case 'api-docs':
        return (
          <>
            <div className="api-docs-header">
              <h2>API Documentation</h2>
              <div className="api-stats">
                <span>24</span> Endpoints
              </div>
            </div>
            <div className="api-docs-content">
              <div className="api-categories">
                <div className="category-item">Compiler</div>
                <div className="category-item">Users</div>
                <div className="category-item">Analytics</div>
              </div>
              <div className="api-endpoints">
                <div className="endpoint-item">
                  <div className="method">POST</div>
                  <div className="path">/api/compiler/run</div>
                  <div className="description">Compile and execute code</div>
                </div>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboard</h3>
        </div>
        <ul className="sidebar-menu">
          <li
            className={`menu-item ${activePage === 'overview' ? 'active' : ''}`}
            onClick={() => handleMenuClick('overview')}
          >
            <i className="bx bx-home"></i>
            <span>Overview</span>
          </li>
          <li
            className={`menu-item ${activePage === 'analytics' ? 'active' : ''}`}
            onClick={() => handleMenuClick('analytics')}
          >
            <i className="bx bx-bar-chart"></i>
            <span>Analytics</span>
          </li>
          <li
            className={`menu-item ${activePage === 'achievements' ? 'active' : ''}`}
            onClick={() => handleMenuClick('achievements')}
          >
            <i className="bx bx-trophy"></i>
            <span>Achievements</span>
          </li>
          <li
            className={`menu-item ${activePage === 'collaboration' ? 'active' : ''}`}
            onClick={() => handleMenuClick('collaboration')}
          >
            <i className="bx bx-group"></i>
            <span>Collaboration</span>
          </li>
          <li
            className={`menu-item ${activePage === 'api-docs' ? 'active' : ''}`}
            onClick={() => handleMenuClick('api-docs')}
          >
            <i className="bx bx-book"></i>
            <span>API Docs</span>
          </li>
          <li className="menu-item">
            <a href="/" className="text-decoration-none text-white">
              <i className="bx bx-code-alt"></i>
              <span>Back to Compiler</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="sidebar-toggle" id="sidebarToggle" onClick={toggleSidebar}>
              <i className="bx bx-menu"></i>
            </button>
            <h1>
              {activePage === 'overview'
                ? 'Dashboard Overview'
                : activePage === 'analytics'
                  ? 'Analytics'
                  : activePage === 'achievements'
                    ? 'Achievements'
                    : activePage === 'collaboration'
                      ? 'Collaboration'
                      : 'API Documentation'}
            </h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src="/images/User_icon.png" alt="User" className="user-avatar" />
              <span>{username}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="dashboard-content">{renderPageContent()}</div>
      </main>

      {/* Create Session Modal */}
      <div className="modal fade" id="createSessionModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Collaboration Session</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form id="createSessionForm">
                <div className="mb-3">
                  <label htmlFor="sessionTitle" className="form-label">
                    Session Title
                  </label>
                  <input type="text" className="form-control" id="sessionTitle" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="sessionDescription" className="form-label">
                    Description
                  </label>
                  <textarea className="form-control" id="sessionDescription" rows="3"></textarea>
                </div>
                {/* Additional form fields */}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Create Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
