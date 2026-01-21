import { useState } from 'react'
import '../css/login/util.css'
import '../css/login/main.css'
import '../css/glassy-login.css'

const OTP = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const email = new URLSearchParams(window.location.search).get('email')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'OTP verified successfully.')
        window.location.href = '/Account/Dashboard/user'
      } else {
        setError(data.message || 'Invalid OTP.')
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
                <div className="login-icon">🔐</div>
                <h2 className="glass-title">Verify OTP</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    className="glass-input"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
                  {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                  <button className="glass-button" type="submit">
                    Verify OTP
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

export default OTP
