import React, { useState } from 'react'
import Header from '../components/ui/Topbar'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Login failed')
      }

      const data = await response.json()
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/#/'
    } catch (err) {
      setError(err.message || 'Network error. Make sure API is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h1 style={styles.title}>Login</h1>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.links}>
          <a href="#/Account/signup" style={styles.link}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
    </>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, #ff00c8 0, transparent 55%), radial-gradient(circle at bottom right, #00e5ff 0, #02030a 60%)',
    padding: '20px'
  },
  card: {
    background: 'linear-gradient(135deg, rgba(11, 26, 56, 0.96), rgba(2, 6, 20, 0.96))',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 22px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 229, 255, 0.3)',
    backdropFilter: 'blur(22px)'
  },
  icon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    color: '#e8f5ff',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '28px'
  },
  error: {
    background: 'rgba(255, 107, 107, 0.2)',
    color: '#ff6b6b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid rgba(255, 107, 107, 0.4)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#e0f7fa',
    fontSize: '14px',
    fontWeight: '600'
  },
  input: {
    background: 'rgba(6, 9, 28, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#e8f5ff',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none'
  },
  button: {
    background: 'linear-gradient(120deg, #00e676, #00b0ff)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '8px',
    boxShadow: '0 0 22px rgba(0, 230, 118, 0.9)',
    transition: 'transform 0.2s'
  },
  links: {
    textAlign: 'center',
    marginTop: '20px'
  },
  link: {
    color: '#00e5ff',
    textDecoration: 'none',
    fontSize: '14px'
  }
}

export default LoginPage
