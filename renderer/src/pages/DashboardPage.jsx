import React, { useState } from 'react'
import '../styles/Pages.css'

function DashboardPage() {
  const [username, setUsername] = useState('User')
  const [email, setEmail] = useState('user@example.com')
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState(true)
  const [fontSize, setFontSize] = useState('14')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate saving
    setTimeout(() => {
      alert('Settings saved successfully!')
      localStorage.setItem('userSettings', JSON.stringify({
        username,
        email,
        theme,
        language,
        notifications,
        fontSize
      }))
      setIsSaving(false)
    }, 500)
  }

  return (
    <div className="page-container">
      <div className="dashboard">
        <h1>Dashboard</h1>
        
        {/* Statistics Cards */}
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

        {/* Settings Section */}
        <div className="settings-section" style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#333' }}>Settings</h2>
          
          <div className="settings-grid">
            {/* Account Settings */}
            <div className="settings-group">
              <h3>Account Settings</h3>
              
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="settings-group">
              <h3>Appearance</h3>
              
              <div className="form-group">
                <label>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="form-group">
                <label>Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="settings-group">
              <h3>Preferences</h3>
              
              <div className="form-group">
                <label>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  Enable Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              style={{
                padding: '10px 30px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .settings-group {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .settings-group h3 {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
          font-size: 13px;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="email"]:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        button:hover:not(:disabled) {
          background: #0056b3 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .settings-section {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage
