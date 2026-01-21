import { useState } from 'react'
import '../css/login/util.css'
import '../css/login/main.css'
import '../css/glassy-login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [sideNavOpen, setSideNavOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.data.user._id || data.data.user.id,
            username: data.data.user.username,
            token: data.data.accessToken
          })
        )
        window.location.href = '/Account/Dashboard/user'
      } else {
        alert(data.message || 'Login failed')
      }
    } catch {
      alert('Network error. Please try again.')
    }
  }

  return (
    <div className="animated-gradient-bg">
      <div className="container py-5">
        {/* Side Navigation Overlay */}
        <nav className={`side-nav-overlay ${sideNavOpen ? 'active' : ''}`}>
          <button className="nav-close-btn" onClick={() => setSideNavOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ul className="nav-menu">
            <li>
              <a href="/" className="nav-link">
                ?? Home
              </a>
            </li>
            <li>
              <a href="/Account/Dashboard/user" className="nav-link">
                📊 Dashboard
              </a>
            </li>
            <li>
              <a href="/membership" className="nav-link">
                💎 Membership Plans
              </a>
            </li>
            <li>
              <a href="/Account/Signup" className="nav-link">
                📝 Sign Up
              </a>
            </li>
            <li>
              <a href="/classroom" className="nav-link">
                🎓 Classroom
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                ℹ️ About Us
              </a>
            </li>
            <li>
              <a href="/Account/logout" className="nav-link logout-link">
                🚪 Logout
              </a>
            </li>
          </ul>
        </nav>

        {/* Overlay Backdrop */}
        <div
          className={`nav-backdrop ${sideNavOpen ? 'active' : ''}`}
          onClick={() => setSideNavOpen(false)}
        ></div>

        {/* Toggle Button */}
        <button className="nav-toggle-btn" onClick={() => setSideNavOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <div className="limiter">
          <div className="container-login100">
            <div className="wrap-login100">
              <div className="login-card">
                <div className="login-icon">🔐</div>
                <h2 className="glass-title">Login</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    className="glass-input"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength="3"
                  />
                  <input
                    className="glass-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="4"
                  />
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      className="glass-checkbox"
                      type="checkbox"
                      id="ckb1"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="ckb1" className="glass-checkbox-label">
                      Remember me
                    </label>
                  </div>
                  <button className="glass-button" type="submit">
                    Login
                  </button>
                </form>
                <a href="/Account/forgotPassword" className="glass-link">
                  Forgot Password?
                </a>
                <br />
                <a href="/Account/Signup" className="glass-link">
                  Don&apos;t have an account? Signup
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
