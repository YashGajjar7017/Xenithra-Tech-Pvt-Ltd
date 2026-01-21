import { useState } from 'react'
import '../css/login/util.css'
import '../css/login/main.css'
import '../css/glassy-login.css'

const Signup = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('user')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword, role })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        if (data.data && data.data.accessToken) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: data.data.user._id || data.data.user.id,
              username: data.data.user.username,
              token: data.data.accessToken
            })
          )
          window.location.href = '/index.html'
          return
        }

        alert(data.message || 'Signup initiated. Please check your email for OTP.')
        window.location.href = '/Account/SignupOTP?email=' + encodeURIComponent(email)
      } else {
        setErrorMessage(data.message || data.error || 'Signup failed.')
      }
    } catch {
      setErrorMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="animated-gradient-bg">
      <div className="signup-container">
        <div className="glass-container">
          <h2 className="glass-title">Create Account</h2>
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="glass-input"
              type="password"
              placeholder="Password"
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
            <select
              className="glass-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errorMessage && <div className="glass-error">{errorMessage}</div>}
            <button type="submit" className="glass-button">
              Sign Up
            </button>
            <a href="/Account/login" className="glass-link">
              Already have an account? Login
            </a>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
