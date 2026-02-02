import { useState, useEffect } from 'react'
import './HeaderStyles.css'

const Header = ({ onToggleSidebar, title = 'Xenithra Technologies', showSidebarToggle = true }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('User')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('Select')

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setIsLoggedIn(true)
        setUsername(user.username || 'User')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('user')
    }
  }

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    setLangDropdownOpen(false)
  }

  const handleLogin = () => {
    try {
      window.location.href = '/#/Account/login'
    } catch (error) {
      console.error('Error navigating to login:', error)
    }
  }

  const handleSignup = () => {
    try {
      window.location.href = '/#/Account/signup'
    } catch (error) {
      console.error('Error navigating to signup:', error)
    }
  }

  const handleLogout = () => {
    try {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        setUsername('User')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const navigateToDashboard = () => {
    try {
      window.location.href = '/#/Dashboard'
    } catch (error) {
      console.error('Error navigating to dashboard:', error)
    }
  }

  const navigateToClassroom = () => {
    try {
      window.location.href = '/classroom'
    } catch (error) {
      console.error('Error navigating to classroom:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          {showSidebarToggle && (
            <button 
              className="sidebar-toggle-btn" 
              title="Toggle Sidebar"
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
          )}
          <div className="header-title">
            <span className="title-icon">⚡</span>
            <h1>{title}</h1>
          </div>
        </div>

        <div className="header-center">
          <nav className="header-nav">
            <button className="nav-item" title="Dashboard" onClick={navigateToDashboard}>📊 Dashboard</button>
            <button className="nav-item" title="Projects">📁 Projects</button>
            <button className="nav-item" title="Snippets">📝 Snippets</button>
            <button className="nav-item" title="Playground">🎮 Playground</button>
            <button className="nav-item" title="Classroom" onClick={navigateToClassroom}>🏫 Classroom</button>
          </nav>
        </div>

        <div className="header-right">
          <div className="lang-selector">
            <span className="lang-label">Language:</span>
            <div className={`dropdown ${langDropdownOpen ? 'open' : ''}`}>
              <button 
                className="dropdown-toggle" 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              >
                <span>{selectedLang}</span>
                <span className="arrow">▾</span>
              </button>
              {langDropdownOpen && (
                <div className="dropdown-menu">
                  {languages.map((lang) => (
                    <button 
                      key={lang}
                      className="dropdown-item"
                      onClick={() => handleLanguageSelect(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="auth-buttons">
              <button className="btn-login" onClick={handleLogin}>Login</button>
              <button className="btn-signup" onClick={handleSignup}>Signup</button>
            </div>
          ) : (
            <div className="user-section">
              <div className="user-dropdown">
                <button 
                  className="user-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{username}</span>
                </button>
                {dropdownOpen && (
                  <div className="user-menu">
                    <button className="user-menu-item">Profile</button>
                    <button className="user-menu-item">Settings</button>
                    <button className="user-menu-item">Help</button>
                    <hr className="user-menu-divider" />
                    <button className="user-menu-item logout" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
