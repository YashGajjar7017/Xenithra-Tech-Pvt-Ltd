import { useState } from 'react'
import '../css/login/util.css'
import '../css/login/main.css'
import '../css/glassy-login.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'Password reset email sent.')
      } else {
        setError(data.message || 'Failed to send reset email.')
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
                <h2 className="glass-title">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
                  {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                  <button className="glass-button" type="submit">
                    Send Reset Link
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

export default ForgotPassword
