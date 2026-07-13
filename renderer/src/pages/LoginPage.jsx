import React, { useState } from 'react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
      
      // Delay transition for success animation satisfaction
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
      {/* Custom Styles for Keyframes & Animations */}
      <style>{`
        @keyframes cyberPulse {
          0% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(0, 229, 255, 0.4), inset 0 0 30px rgba(0, 229, 255, 0.2); }
          100% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes floatLogo {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes gridFlow {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: gridFlow 10s linear infinite;
        }
        .scan-overlay::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }
      `}</style>

      {/* Cyber Grid Background layer */}
      <div className="cyber-grid" style={styles.gridLayer} />
      
      {/* Animated Orbs */}
      <div className="prism-bg">
        <div className="prism-orb prism-orb-1" style={{ opacity: 0.25, width: '600px', height: '600px' }}></div>
        <div className="prism-orb prism-orb-2" style={{ opacity: 0.25, width: '500px', height: '500px' }}></div>
      </div>

      <div className="scan-overlay" style={styles.cardContainer}>
        {/* Glow Border panel */}
        <div style={styles.cardHeaderGlow} />
        
        <div style={styles.card}>
          {/* Scanline beam animation */}
          <div style={styles.scannerBeam} />

          <div style={styles.header}>
            <div style={styles.logoWrapper}>
              <img 
                src="Images/compiler_logo.png" 
                alt="Xenithra Logo" 
                style={styles.logoImg}
              />
            </div>
            <h1 style={styles.title}>XENITHRA CODE STUDIO</h1>
            <p style={styles.subtitle}>Enter credentials to authorize secure session</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>Authentication Success! Mounting workspace...</div>}
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>OPERATOR USERNAME / EMAIL</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="operator_name@domain.com"
                disabled={loading || success}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>AUTHORIZATION ACCESS KEY</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: '45px', width: '100%' }}
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
              style={{ 
                ...styles.button, 
                ...(loading ? styles.buttonLoading : {}),
                ...(success ? styles.buttonSuccess : {})
              }}
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
              onClick={() => alert('Redirecting to Google Secure Authentication...')}
              style={{ ...styles.socialBtn, background: '#db4437', color: '#fff', border: '1px solid #c53c2f' }}
            >
              <i className="bx bxl-google" style={{ marginRight: '8px', fontSize: '15px' }}></i>
              Continue with Google
            </button>
            <button 
              type="button" 
              onClick={() => alert('Redirecting to GitHub Secure Authentication...')}
              style={{ ...styles.socialBtn, background: '#24292e', color: '#fff', border: '1px solid #1c2125' }}
            >
              <i className="bx bxl-github" style={{ marginRight: '8px', fontSize: '15px' }}></i>
              Continue with GitHub
            </button>
          </div>

          <div style={styles.links}>
            <a href="#/Account/signup" style={styles.link}>
              [ Need credentials? Register a new access node ]
            </a>
            <br />
            <a href="#/" style={styles.backLink}>
              ← Return to Terminal IDE
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
    background: '#020308',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
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
    maxWidth: '450px'
  },
  cardHeaderGlow: {
    position: 'absolute',
    inset: '-2px',
    background: 'linear-gradient(135deg, #00e5ff 0%, #ff00c8 100%)',
    borderRadius: '24px',
    filter: 'blur(8px)',
    opacity: 0.45,
    zIndex: -1
  },
  card: {
    background: 'rgba(10, 16, 38, 0.72)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    borderRadius: '22px',
    padding: '45px 40px 35px 40px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0, 229, 255, 0.05)',
    backdropFilter: 'blur(35px) saturate(180%)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'cyberPulse 6s infinite ease-in-out'
  },
  scannerBeam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.7), transparent)',
    boxShadow: '0 0 15px #00e5ff',
    opacity: 0.3,
    pointerEvents: 'none',
    animation: 'scanline 4.5s linear infinite'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px'
  },
  logoWrapper: {
    width: '82px',
    height: '82px',
    borderRadius: '20px',
    background: 'rgba(3, 5, 12, 0.65)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 0 25px rgba(0, 229, 255, 0.25)',
    animation: 'floatLogo 4s infinite alternate ease-in-out',
    overflow: 'hidden'
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  title: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '0.12em',
    marginBottom: '8px',
    background: 'linear-gradient(to right, #ffffff, #00e5ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    color: '#8fa6c2',
    fontSize: '12px',
    textAlign: 'center',
    margin: 0,
    opacity: 0.8,
    letterSpacing: '0.04em'
  },
  error: {
    background: 'rgba(255, 75, 75, 0.12)',
    color: '#ff6b6b',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '13px',
    border: '1px solid rgba(255, 75, 75, 0.3)',
    textAlign: 'center',
    letterSpacing: '0.02em'
  },
  success: {
    background: 'rgba(0, 230, 118, 0.12)',
    color: '#00ff88',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '13px',
    border: '1px solid rgba(0, 230, 118, 0.3)',
    textAlign: 'center',
    letterSpacing: '0.02em'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: 'rgba(0, 229, 255, 0.75)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.1em'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    background: 'rgba(3, 5, 12, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    padding: '13px 18px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
  },
  toggleBtn: {
    position: 'absolute',
    right: '15px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    fontSize: '16px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
    padding: '4px'
  },
  button: {
    background: 'linear-gradient(135deg, #00e5ff 0%, #7c5cff 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    padding: '15px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    marginTop: '12px',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  buttonLoading: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    borderColor: 'rgba(0, 230, 118, 0.4)',
    boxShadow: '0 0 25px rgba(0, 230, 118, 0.4)'
  },
  links: {
    textAlign: 'center',
    marginTop: '28px'
  },
  link: {
    color: '#00e5ff',
    textDecoration: 'none',
    fontSize: '12px',
    letterSpacing: '0.02em',
    transition: 'color 0.2s ease',
    opacity: 0.85
  },
  backLink: {
    color: '#8fa6c2',
    textDecoration: 'none',
    fontSize: '11px',
    marginTop: '16px',
    display: 'inline-block',
    opacity: 0.65,
    transition: 'all 0.2s ease'
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0 15px 0',
    gap: '10px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)'
  },
  dividerText: {
    fontSize: '9px',
    color: '#8fa6c2',
    opacity: 0.5,
    letterSpacing: '0.08em',
    fontWeight: 'bold'
  },
  socialGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginBottom: '15px'
  },
  socialBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
  }
}

// Active styling states (hover/focus emulation inside React)
if (typeof document !== 'undefined') {
  const css = `
    input:focus {
      border-color: #00e5ff !important;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.35) !important;
    }
    a:hover {
      color: #fff !important;
      opacity: 1 !important;
      text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.1);
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default LoginPage
