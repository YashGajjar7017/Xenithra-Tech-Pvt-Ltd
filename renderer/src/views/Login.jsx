import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from './services/authAPI'
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import Bottom from './components/Bottom';

const loginStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, #ff00c8 0, transparent 55%), radial-gradient(circle at bottom right, #00e5ff 0, #02030a 60%)',
    padding: '20px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdrop: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  form: {
    width: '100%'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: '30px',
    letterSpacing: '1px',
    textShadow: '0 2px 8px rgba(102, 126, 234, 0.8)'
  },
  icon: {
    fontSize: '3rem',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#667eea',
    filter: 'drop-shadow(0 0 2px #8a6ff7cc)'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    marginBottom: '20px',
    border: 'none',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.25)',
    color: '#ffffffdd',
    fontSize: '15px',
    boxShadow: 'inset 2px 2px 6px rgba(255, 255, 255, 0.15), inset -2px -2px 6px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    '::placeholder': {
      color: '#ffffffaa'
    }
  },
  button: {
    width: '100%',
    padding: '14px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
    }
  },
  checkboxGroup: {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  checkboxLabel: {
    color: '#f0f0f5cc',
    userSelect: 'none',
    fontWeight: '500',
    cursor: 'pointer'
  },
  links: {
    textAlign: 'center',
    marginTop: '20px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.3s ease',
    display: 'block',
    marginTop: '8px'
  },
  errorBox: {
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid rgba(255, 107, 107, 0.5)',
    borderRadius: '8px',
    color: '#ff6b6b',
    fontSize: '13px',
    textAlign: 'center'
  }
}

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login({ username, password, rememberMe })
      if (data.success) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.data.user._id || data.data.user.id,
            username: data.data.user.username,
            email: data.data.user.email,
            token: data.data.accessToken
          })
        )
        navigate('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.icon}>🔐</div>
        <h2 style={loginStyles.title}>Login</h2>
        
        {error && (
          <div style={loginStyles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={loginStyles.form}>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
            style={loginStyles.input}
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="4"
            style={loginStyles.input}
          />

          <div style={loginStyles.checkboxGroup}>
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={loginStyles.checkbox}
            />
            <label htmlFor="rememberMe" style={loginStyles.checkboxLabel}>
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...loginStyles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={loginStyles.links}>
          <Link to="/reset-password" style={loginStyles.link}>
            Forgot Password?
          </Link>
          <Link to="/signup" style={loginStyles.link}>
            Don&apos;t have an account? Signup
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
