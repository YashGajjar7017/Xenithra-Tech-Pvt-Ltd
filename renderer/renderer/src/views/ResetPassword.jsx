import { useState } from 'react'
import '../css/login/util.css'
import '../css/login/main.css'
import '../css/glassy-login.css'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const token = new URLSearchParams(window.location.search).get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'Password reset successfully.')
        window.location.href = '/Account/login'
      } else {
        setError(data.message || 'Failed to reset password.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="animated-gradient-bg">
      <div className="container py-5">
        <div className="limiter">
          <div className="container-login100">
            <div className="wrap-login100">
              <div className="login-card">
                <div className="login-icon">🔑</div>
                <h2 className="glass-title">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    className="glass-input"
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <input
                    className="glass-input"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
                  {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                  <button className="glass-button" type="submit">
                    Reset Password
                  </button>
                </form>
                <a href="/Account/login" className="glass-link">
                  Back to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
