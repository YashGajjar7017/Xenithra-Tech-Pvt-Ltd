import React, { useState, useEffect } from 'react'

function DashboardPage() {
  const [username, setUsername] = useState('Yash Gajjar')
  const [email, setEmail] = useState('yash@xenithra.com')
  const [theme, setTheme] = useState('glass-dark')
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState(true)
  const [fontSize, setFontSize] = useState('14')
  const [isSaving, setIsSaving] = useState(false)

  // Load initial settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'glass-dark'
    setTheme(savedTheme)

    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        setUsername(u.username || 'User')
        setEmail(u.email || 'user@example.com')
      } catch (e) {
        // Ignored
      }
    }
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    // Dispatch custom event to notify layout/topbar
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      alert('Settings synced successfully!')
      setIsSaving(false)
    }, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/#/Account/login'
  }

  return (
    <div className="page-container" style={styles.container}>
      <div className="dashboard" style={styles.dashboard}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>System Control Center</h1>
          <button onClick={handleLogout} style={styles.btnLogout}>Disconnect Session (Logout)</button>
        </div>
        
        {/* Statistics Cards */}
        <div className="dashboard-grid" style={styles.grid}>
          <div className="dashboard-card" style={styles.card}>
            <h3 style={styles.cardTitle}>Environment Status</h3>
            <p className="stat" style={styles.statActive}>ONLINE</p>
          </div>
          <div className="dashboard-card" style={styles.card}>
            <h3 style={styles.cardTitle}>Project Repositories</h3>
            <p className="stat" style={styles.stat}>4 Active</p>
          </div>
          <div className="dashboard-card" style={styles.card}>
            <h3 style={styles.cardTitle}>Active Terminals</h3>
            <p className="stat" style={styles.stat}>2 Shells</p>
          </div>
          <div className="dashboard-card" style={styles.card}>
            <h3 style={styles.cardTitle}>Memory Usage</h3>
            <p className="stat" style={styles.stat}>68 MB</p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="settings-section" style={styles.settingsSection}>
          <h2 style={styles.sectionTitle}>System Settings</h2>
          
          <div className="settings-grid" style={styles.settingsGrid}>
            {/* Account Settings */}
            <div className="settings-group" style={styles.group}>
              <h3 style={styles.groupTitle}>User Profile</h3>
              
              <div className="form-group" style={styles.formGroup}>
                <label style={styles.label}>Profile Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={styles.input}
                />
              </div>

              <div className="form-group" style={styles.formGroup}>
                <label style={styles.label}>Profile Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="settings-group" style={styles.group}>
              <h3 style={styles.groupTitle}>Visual Interface</h3>
              
              <div className="form-group" style={styles.formGroup}>
                <label style={styles.label}>Prism Theming</label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  style={styles.select}
                >
                  <option value="glass-dark">Glassy Dark (Neon Cyan)</option>
                  <option value="glass-light">Light Frosted (Teal)</option>
                  <option value="neon-purple">Neon Violet (Magenta)</option>
                  <option value="emerald">Emerald Matrix (Teal/Green)</option>
                  <option value="cyber-amber">Cyber Amber (Yellow/Red)</option>
                </select>
              </div>

              <div className="form-group" style={styles.formGroup}>
                <label style={styles.label}>Console Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="settings-group" style={styles.group}>
              <h3 style={styles.groupTitle}>System Directives</h3>
              
              <div className="form-group" style={styles.formGroup}>
                <label style={styles.label}>Default Dialect</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={styles.select}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="form-group" style={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Enable Diagnostic Alerts
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              style={styles.btnSave}
            >
              {isSaving ? 'Syncing...' : 'Sync System Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
    overflowY: 'auto',
    background: 'transparent'
  },
  dashboard: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.04em',
    margin: 0
  },
  btnLogout: {
    padding: '8px 16px',
    background: 'rgba(255, 107, 107, 0.15)',
    border: '1px solid rgba(255, 107, 107, 0.35)',
    color: '#ff6b6b',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  card: {
    background: 'rgba(10, 15, 30, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '20px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  stat: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },
  statActive: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#00e676',
    textShadow: '0 0 10px rgba(0,230,118,0.3)',
    margin: 0
  },
  settingsSection: {
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '30px',
    borderRadius: '16px',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '25px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '12px'
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '20px'
  },
  group: {
    background: 'rgba(5, 8, 22, 0.35)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  groupTitle: {
    margin: '0 0 18px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent-color)'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#8fa0b5',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(5, 8, 22, 0.55)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(5, 8, 22, 0.55)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  btnSave: {
    padding: '12px 35px',
    background: 'linear-gradient(135deg, var(--accent-color) 0%, #7c5cff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
    transition: 'all 0.3s ease'
  }
}

export default DashboardPage
