import React, { useState } from 'react'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      setError('Access keys do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Access key must be at least 6 characters')
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
      setSuccess('Access authorization registered successfully!')
      localStorage.setItem('user', JSON.stringify(data.user))

      setTimeout(() => {
        window.location.href = '/#/'
      }, 1000)
    } catch (err) {
      setError(err.message || 'Error connecting to local backend. Ensure Electron is running.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes cyberPulse {
          0% { box-shadow: 0 0 15px rgba(255, 0, 200, 0.15), inset 0 0 15px rgba(255, 0, 200, 0.08); }
          50% { box-shadow: 0 0 30px rgba(255, 0, 200, 0.35), inset 0 0 30px rgba(255, 0, 200, 0.18); }
          100% { box-shadow: 0 0 15px rgba(255, 0, 200, 0.15), inset 0 0 15px rgba(255, 0, 200, 0.08); }
        }
        @keyframes gridFlow {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(255, 0, 200, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 200, 0.015) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: gridFlow 10s linear infinite;
        }
      `}</style>

      {/* Cyber Grid Background */}
      <div className="cyber-grid" style={styles.gridLayer} />

      <div style={styles.cardContainer}>
        {/* Glow Border layer */}
        <div style={styles.cardHeaderGlow} />

        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logoWrapper}>
              <span style={{ fontSize: '32px' }}>🛰️</span>
            </div>
            <h1 style={styles.title}>REGISTER ACCESS NODE</h1>
            <p style={styles.subtitle}>Configure operator credentials to join network</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>OPERATOR USERNAME</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="operator_name"
                disabled={loading || !!success}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="operator@domain.com"
                disabled={loading || !!success}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ACCESS KEY PASSWORD</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingRight: '40px', width: '100%' }}
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleBtn}
                  tabIndex="-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>CONFIRM ACCESS KEY</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingRight: '40px', width: '100%' }}
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleBtn}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              style={styles.button}
            >
              {loading ? 'REGISTERING ACCESS NODE...' : success ? 'NODE REGISTERED' : 'REGISTER ACCESS NODE'}
            </button>
          </form>

          <div style={styles.links}>
            <a href="#/Account/login" style={styles.link}>
              [ Already have credentials? Authorize secure session ]
            </a>
          </div>
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
    background: '#04020a',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif"
  },
  gridLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none'
  },
  cardContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '380px'
  },
  cardHeaderGlow: {
    position: 'absolute',
    inset: '-1px',
    background: 'linear-gradient(135deg, #ff00c8 0%, #a78bfa 100%)',
    borderRadius: '16px',
    filter: 'blur(6px)',
    opacity: 0.35,
    zIndex: -1
  },
  card: {
    background: 'rgba(18, 8, 20, 0.85)',
    border: '1px solid rgba(255, 0, 200, 0.25)',
    borderRadius: '16px',
    padding: '30px 24px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'cyberPulse 5s infinite ease-in-out'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  logoWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    background: 'rgba(255, 0, 200, 0.08)',
    border: '1px solid rgba(255, 0, 200, 0.25)',
    borderRadius: '12px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#ff00c8',
    margin: 0,
    letterSpacing: '0.08em'
  },
  subtitle: {
    fontSize: '10px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    fontSize: '11px',
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '14px',
    textAlign: 'center'
  },
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399',
    fontSize: '11px',
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '14px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#8b949e',
    letterSpacing: '0.04em'
  },
  input: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 0, 200, 0.25)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  toggleBtn: {
    position: 'absolute',
    right: '10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px'
  },
  button: {
    background: 'linear-gradient(135deg, #ff00c8 0%, #a78bfa 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: '700',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '11px',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(255, 0, 200, 0.3)'
  },
  links: {
    textAlign: 'center',
    marginTop: '16px'
  },
  link: {
    fontSize: '11px',
    color: '#a78bfa',
    textDecoration: 'none'
  }
}

export default SignupPage
