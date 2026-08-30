import React, { useState } from 'react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // OAuth Simulated States
  const [oauthProvider, setOauthProvider] = useState(null) // 'google' | 'github' | 'discord'
  const [oauthEmail, setOauthEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

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
      setSuccess(true)

      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(data.user))
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
          0% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(0, 229, 255, 0.4), inset 0 0 30px rgba(0, 229, 255, 0.2); }
          100% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.1); }
        }
        @keyframes gridFlow {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: gridFlow 10s linear infinite;
        }
        .social-btn:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
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
              <span style={{ fontSize: '32px' }}>⚡</span>
            </div>
            <h1 style={styles.title}>XENITHRA CORE</h1>
            <p style={styles.subtitle}>Enter key credentials to access terminal</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && (
            <div style={styles.success}>Authentication Success! Loading modules...</div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>OPERATOR EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="operator@xenithra.tech"
                disabled={loading || success}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SECURITY KEY</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: '40px', width: '100%' }}
                  placeholder="••••••••"
                  disabled={loading || success}
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

            <button
              type="submit"
              disabled={loading || success}
              style={styles.button}
            >
              {loading ? 'DECRYPTING CORE MODULES...' : success ? 'ACCESS GRANTED' : 'INITIALIZE ACCESS'}
            </button>
          </form>

          {/* Social Sign-in Options */}
          <div style={styles.dividerContainer}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>SECURE SOCIAL FEDERATION</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.socialGroup}>
            <button
              type="button"
              className="social-btn"
              onClick={() => {
                setOauthProvider('google')
                setOauthEmail('yash@xenithra.tech')
              }}
              style={{ ...styles.socialBtn, background: '#db4437', border: '1px solid #c53c2f' }}
            >
              <i className="bx bxl-google" style={{ fontSize: '14px' }}></i>
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => {
                setOauthProvider('github')
                setOauthEmail('yash_gajjar')
              }}
              style={{ ...styles.socialBtn, background: '#24292e', border: '1px solid #1c2125' }}
            >
              <i className="bx bxl-github" style={{ fontSize: '14px' }}></i>
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => {
                setOauthProvider('discord')
                setOauthEmail('yash_discord')
              }}
              style={{ ...styles.socialBtn, background: '#5865F2', border: '1px solid #4752c4' }}
            >
              <i className="bx bxl-discord" style={{ fontSize: '14px' }}></i>
            </button>
          </div>

          <div style={styles.links}>
            <a href="#/Account/signup" style={styles.link}>
              [ Register a new access node ]
            </a>
          </div>
        </div>
      </div>

      {/* Simulated OAuth Modal Overlay */}
      {oauthProvider && (
        <div style={styles.oauthOverlay}>
          <div style={styles.oauthModal}>
            <div style={styles.oauthHeader}>
              <i
                className={oauthProvider === 'google' ? 'bx bxl-google' : oauthProvider === 'github' ? 'bx bxl-github' : 'bx bxl-discord'}
                style={{
                  fontSize: '22px',
                  color: oauthProvider === 'google' ? '#db4437' : oauthProvider === 'github' ? '#58a6ff' : '#5865F2',
                  marginRight: '10px'
                }}
              ></i>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                Sign in with {oauthProvider === 'google' ? 'Google' : oauthProvider === 'github' ? 'GitHub' : 'Discord'}
              </h3>
            </div>
            <div style={styles.oauthBody}>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.4' }}>
                Xenithra IDE requesting authorization to store settings in cloud database.
              </p>

              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                <label style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  SELECT ACCOUNT TO AUTHORIZE
                </label>
                <select
                  value={oauthEmail}
                  onChange={(e) => setOauthEmail(e.target.value)}
                  style={styles.oauthSelect}
                >
                  {oauthProvider === 'google' ? (
                    <>
                      <option value="dev@gmail.com">dev@gmail.com (Google Developer)</option>
                      <option value="yash@xenithra.tech">yash@xenithra.tech (Lead dev)</option>
                    </>
                  ) : oauthProvider === 'github' ? (
                    <>
                      <option value="dev@github.com">dev@github.com (GitHub Developer)</option>
                      <option value="yash_gajjar">yash_gajjar (yash@xenithra.tech)</option>
                    </>
                  ) : (
                    <>
                      <option value="dev@discord.gg">dev@discord.gg (Discord Developer)</option>
                      <option value="yash_discord">yash_discord (yash@xenithra.tech)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div style={styles.oauthFooter}>
              <button onClick={() => setOauthProvider(null)} style={styles.oauthCancelBtn}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  const user = {
                    username: oauthEmail.split('@')[0],
                    name: oauthProvider === 'google' ? 'Google Developer' : oauthProvider === 'github' ? 'GitHub Developer' : 'Discord Developer',
                    email: oauthEmail,
                    token: `${oauthProvider}_oauth_token_${Date.now()}`
                  }
                  localStorage.setItem('user', JSON.stringify(user))
                  localStorage.setItem('cloud-sync-enabled', 'true')
                  localStorage.setItem('cloud-provider', oauthProvider)

                  setSuccess(true)
                  setOauthProvider(null)
                  setTimeout(() => {
                    window.location.href = '/#/'
                  }, 1000)
                }}
                style={styles.oauthAuthBtn}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}
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
    background: 'linear-gradient(135deg, #00e5ff 0%, #a78bfa 100%)',
    borderRadius: '16px',
    filter: 'blur(6px)',
    opacity: 0.35,
    zIndex: -1
  },
  card: {
    background: 'rgba(12, 8, 24, 0.85)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
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
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '12px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#a78bfa',
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
    border: '1px solid rgba(139, 92, 246, 0.25)',
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
    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
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
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '18px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)'
  },
  dividerText: {
    fontSize: '8px',
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: '0.06em'
  },
  socialGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '14px'
  },
  socialBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    transition: 'all 0.2s'
  },
  links: {
    textAlign: 'center',
    marginTop: '10px'
  },
  link: {
    fontSize: '11px',
    color: '#a78bfa',
    textDecoration: 'none'
  },
  oauthOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 3, 10, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  oauthModal: {
    background: '#0d0b14',
    border: '1px solid rgba(139, 92, 246, 0.45)',
    borderRadius: '12px',
    padding: '24px',
    width: '320px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.85)'
  },
  oauthHeader: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '10px',
    marginBottom: '12px'
  },
  oauthBody: {
    marginBottom: '16px'
  },
  oauthSelect: {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: '#fff',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '11px',
    outline: 'none'
  },
  oauthFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  oauthCancelBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#94a3b8',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  oauthAuthBtn: {
    background: '#7c3aed',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    padding: '4px 16px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  }
}

export default LoginPage
