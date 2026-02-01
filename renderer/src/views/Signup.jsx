import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/authAPI'

const signupStyles = {
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
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    maxHeight: '90vh',
    overflowY: 'auto'
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
  select: {
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
    fontFamily: 'inherit'
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
  error: {
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid rgba(255, 107, 107, 0.5)',
    borderRadius: '8px',
    color: '#ff6b6b',
    fontSize: '13px',
    textAlign: 'center'
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
  }
}

const Signup = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const data = await authAPI.signup({
        username,
        email,
        password,
        confirmPassword,
        fullName
      })

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
        setErrorMessage(data.message || 'Signup failed.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={signupStyles.container}>
      <div style={signupStyles.card}>
        <div style={signupStyles.icon}>📝</div>
        <h2 style={signupStyles.title}>Create Account</h2>

        {errorMessage && <div style={signupStyles.error}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} style={signupStyles.form}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength="2"
            style={signupStyles.input}
          />

          <input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
            style={signupStyles.input}
          />

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={signupStyles.input}
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            style={signupStyles.input}
          />

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            style={signupStyles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...signupStyles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div style={signupStyles.links}>
          <Link to="/login" style={signupStyles.link}>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
