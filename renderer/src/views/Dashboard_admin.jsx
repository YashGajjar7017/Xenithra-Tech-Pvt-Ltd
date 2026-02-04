import { useState, useEffect, useCallback } from 'react'
import '../css/bootstrap/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../css/AdminPanel.css'

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    maintenanceStatus: 'Off'
  })
  const [users, setUsers] = useState([])
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: '',
    allowedIPs: [],
    scheduled: false
  })
  const [analytics, setAnalytics] = useState({})
  const [logs, setLogs] = useState('Loading logs...')
  const [settings, setSettings] = useState({
    systemName: 'Node Compiler',
    maxUsers: 1000,
    sessionTimeout: 60,
    debugMode: false
  })

  const sections = [
    { id: 'dashboard', title: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'users', title: 'User Management', icon: 'fas fa-users' },
    { id: 'maintenance', title: 'Maintenance', icon: 'fas fa-tools' },
    { id: 'analytics', title: 'Analytics', icon: 'fas fa-chart-bar' },
    { id: 'logs', title: 'System Logs', icon: 'fas fa-list-alt' },
    { id: 'settings', title: 'Settings', icon: 'fas fa-cog' }
  ]

  // Mock API calls
  const fetchDashboardStats = useCallback(async () => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 89,
        maintenanceStatus: 'Off'
      })
    }, 500)
  }, [])

  const loadUsers = useCallback(async () => {
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          status: 'active',
          lastLogin: '2025-12-25'
        },
        {
          id: '2',
          username: 'alice_smith',
          email: 'alice@example.com',
          status: 'active',
          lastLogin: '2025-12-26'
        },
        {
          id: '3',
          username: 'bob_johnson',
          email: 'bob@example.com',
          status: 'inactive',
          lastLogin: '2025-12-20'
        }
      ])
    }, 800)
  }, [])

  const toggleMaintenanceMode = async (enabled) => {
    setMaintenance((prev) => ({ ...prev, enabled }))
    // Simulate API call
    setTimeout(() => {
      alert(`Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`)
    }, 300)
  }

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      alert('User deleted successfully')
    }
  }

  const loadAnalytics = useCallback(() => {
    setTimeout(() => {
      setAnalytics({
        today: { newUsers: 15, activeSessions: 42, apiCalls: 1234 },
        week: { newUsers: 89, compilations: 567, errorRate: '2.3%' },
        trends: { userGrowth: '+5%', performance: 'Good', issues: 0 }
      })
    }, 600)
  }, [])

  const loadLogs = useCallback(() => {
    setTimeout(() => {
      setLogs(`[2025-12-26 18:00:15] INFO: Server started successfully
[2025-12-26 18:00:16] INFO: Database connected
[2025-12-26 18:05:22] INFO: User login: admin@nodecompiler.com
[2025-12-26 18:15:33] WARN: High memory usage detected (78%)
[2025-12-26 18:30:00] INFO: Maintenance mode enabled by admin
[2025-12-26 19:00:00] INFO: 45 new compilations processed
[2025-12-26 19:15:45] ERROR: Failed login attempt for user@example.com`)
    }, 1000)
  }, [])

  // Effects
  useEffect(() => {
    fetchDashboardStats()
    loadAnalytics()
  }, [fetchDashboardStats, loadAnalytics])

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // Simulate API save
    setTimeout(() => {
      alert('Settings saved successfully!')
    }, 500)
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>System Overview</h3>
              <button className="btn btn-primary" onClick={fetchDashboardStats}>
                Refresh
              </button>
            </div>
            <div className="maintenance-controls">
              <div className="control-card">
                <h4>
                  <i className="fas fa-server"></i> Server Status
                </h4>
                <p>
                  System Health: <span className="status active">Healthy</span>
                </p>
                <p>
                  Uptime: <span>99.92%</span>
                </p>
              </div>
              <div className="control-card">
                <h4>
                  <i className="fas fa-database"></i> Database
                </h4>
                <p>
                  Status: <span className="status active">Connected</span>
                </p>
                <p>
                  Active Connections: <span>23</span>
                </p>
              </div>
              <div className="control-card">
                <h4>
                  <i className="fas fa-memory"></i> Memory Usage
                </h4>
                <p>
                  RAM: <span>2.4GB / 8GB</span>
                </p>
                <p>
                  CPU: <span>24%</span>
                </p>
              </div>
            </div>
          </section>
        )

      case 'users':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>User Management</h3>
              <button className="btn btn-primary" onClick={loadUsers}>
                Load Users
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status ${user.status}`}>{user.status}</span>
                      </td>
                      <td>{user.lastLogin}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm me-1"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                        <button className="btn btn-outline-primary btn-sm">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Loading users...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )

      case 'maintenance':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>Maintenance Controls</h3>
            </div>
            <div className="maintenance-controls">
              <div className="control-card">
                <h4>
                  <i className="fas fa-toggle-on"></i> Maintenance Mode
                </h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={maintenance.enabled}
                    onChange={(e) => toggleMaintenanceMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <p>Currently: {maintenance.enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              {/* Additional maintenance controls */}
            </div>
          </section>
        )

      case 'analytics':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>Analytics Dashboard</h3>
              <button className="btn btn-primary" onClick={loadAnalytics}>
                Load Analytics
              </button>
            </div>
            <div className="maintenance-controls">
              <div className="control-card">
                <h4>
                  <i className="fas fa-calendar-day"></i> Today's Stats
                </h4>
                <p>
                  New Users: <span>{analytics.today?.newUsers || 0}</span>
                </p>
                <p>
                  Active Sessions: <span>{analytics.today?.activeSessions || 0}</span>
                </p>
                <p>
                  API Calls: <span>{analytics.today?.apiCalls || 0}</span>
                </p>
              </div>
              {/* More analytics cards */}
            </div>
          </section>
        )

      case 'logs':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>System Logs</h3>
              <button className="btn btn-primary" onClick={loadLogs}>
                Load Logs
              </button>
            </div>
            <div
              className="logs-container"
              style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '500px',
                overflowY: 'auto'
              }}
            >
              {logs}
            </div>
          </section>
        )

      case 'settings':
        return (
          <section className="content-section active">
            <div className="section-header">
              <h3>System Settings</h3>
              <button className="btn btn-success" onClick={saveSettings}>
                Save Settings
              </button>
            </div>
            <div className="form-group">
              <label>System Name:</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleSettingsChange('systemName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Max Users:</label>
              <input
                type="number"
                value={settings.maxUsers}
                onChange={(e) => handleSettingsChange('maxUsers', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Session Timeout (minutes):</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingsChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => handleSettingsChange('debugMode', e.target.checked)}
                />
                Enable Debug Mode
              </label>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>Node Compiler Management</p>
        </div>
        <ul className="sidebar-menu">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={activeSection === section.id ? 'active' : ''}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={section.icon}></i> {section.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="header">
          <h1>{sections.find((s) => s.id === activeSection)?.title}</h1>
          <div className="stats">
            <div className="stat-card">
              <span className="number">{stats.totalUsers}</span>
              <span className="label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="number">{stats.activeUsers}</span>
              <span className="label">Active Users</span>
            </div>
            <div className="stat-card">
              <span className="number">{stats.maintenanceStatus}</span>
              <span className="label">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderSectionContent()}
      </main>
    </div>
  )
}

export default AdminPanel
