import React, { useState } from 'react'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const port = localStorage.getItem('api-port') || '8000'
      const response = await fetch(`http://localhost:${port}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Signup failed')
      }

      const data = await response.json()
      setSuccess('Account generated successfully!')
      localStorage.setItem('user', JSON.stringify(data.user))
      setTimeout(() => {
        window.location.href = '/#/'
      }, 1000)
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
        <div className="prism-orb prism-orb-3" style={{ opacity: 0.25 }}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>X</div>
          <h1 style={styles.title}>Register Account</h1>
          <p style={styles.subtitle}>Generate authorization credentials to log in</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Choose a username"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="yourname@domain.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Re-enter password"
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
            {loading ? 'Generating Node...' : 'Register Access Node'}
          </button>
        </form>

        <div style={styles.links}>
          <a href="#/Account/login" style={styles.link}>
            Already authorized? Access Login
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
    marginBottom: '25px'
  },
  logoCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #ff00c8, #00e5ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '15px',
    boxShadow: '0 0 25px rgba(255, 0, 200, 0.5)'
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
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid rgba(255, 107, 107, 0.25)',
    textAlign: 'center'
  },
  success: {
    background: 'rgba(0, 230, 118, 0.15)',
    color: '#00e676',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid rgba(0, 230, 118, 0.25)',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
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
    padding: '11px 15px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
  },
  button: {
    background: 'linear-gradient(135deg, #ff00c8 0%, #00e5ff 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '13px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '10px',
    boxShadow: '0 0 20px rgba(255, 0, 200, 0.35)',
    transition: 'all 0.3s ease'
  },
  links: {
    textAlign: 'center',
    marginTop: '20px'
  },
  link: {
    color: '#00e5ff',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s ease'
  }
}

export default SignupPage
