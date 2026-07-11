import React, { useState } from 'react'

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
      const port = localStorage.getItem('api-port') || '8000'
      const response = await fetch(`http://localhost:${port}/api/login`, {
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
      setError(err.message || 'Error connecting to local backend. Ensure Electron is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Moving Background Prism Orbs */}
      <div className="prism-bg">
        <div className="prism-orb prism-orb-1" style={{ opacity: 0.35 }}></div>
        <div className="prism-orb prism-orb-2" style={{ opacity: 0.35 }}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>X</div>
          <h1 style={styles.title}>Xenithra Code Studio</h1>
          <p style={styles.subtitle}>Log in to access your futuristic workspace</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your email or username"
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
            style={{ 
              ...styles.button, 
              opacity: loading ? 0.6 : 1, 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Decrypting Access...' : 'Authenticate Access'}
          </button>
        </form>

        <div style={styles.links}>
          <a href="#/Account/signup" style={styles.link}>
            Need an authorization account? Register
          </a>
          <br />
          <a href="#/" style={{ ...styles.link, fontSize: '12px', marginTop: '12px', display: 'inline-block', opacity: 0.8 }}>
            ← Back to Terminal IDE
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: 'transparent',
    padding: '20px',
    position: 'relative'
  },
  card: {
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '40px 35px',
    width: '100%',
    maxWidth: '430px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(30px) saturate(180%)',
    zIndex: 1,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px'
  },
  logoCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #00e5ff, #ff00c8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '15px',
    boxShadow: '0 0 25px rgba(0, 229, 255, 0.5)'
  },
  title: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: '0.05em',
    marginBottom: '5px'
  },
  subtitle: {
    color: '#8fa0b5',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0
  },
  error: {
    background: 'rgba(255, 107, 107, 0.15)',
    color: '#ff7676',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid rgba(255, 107, 107, 0.25)',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#8fa0b5',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  input: {
    background: 'rgba(5, 8, 22, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
  },
  button: {
    background: 'linear-gradient(135deg, #00e5ff 0%, #7c5cff 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '10px',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
    transition: 'all 0.3s ease'
  },
  links: {
    textAlign: 'center',
    marginTop: '25px'
  },
  link: {
    color: '#00e5ff',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s ease'
  }
}

export default LoginPage
