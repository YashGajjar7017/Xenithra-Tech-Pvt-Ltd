import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuthLayout from '../auth/AuthLayout'
import { authAPI, sessionManager, redirect } from '../utils/api'
import { validateUsername, validatePassword } from '../utils/validators'

/**
 * Login Page Component
 */
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
    setSuccess('')
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const usernameError = validateUsername(formData.username)
    if (usernameError) {
      setError(usernameError)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password
      })

      if (response.success) {
        setSuccess('Login successful!')

        // Store tokens and user data
        if (response.token) {
          // Set cookies
          document.cookie = `token=${response.token}; path=/; max-age=${24 * 60 * 60}`
          document.cookie = `username=${response.user.username}; path=/; max-age=${24 * 60 * 60}`
          document.cookie = `role=${response.user.role}; path=/; max-age=${24 * 60 * 60}`

          // Also set localStorage
          sessionManager.setTokens(response.token, response.refreshToken || '')
          sessionManager.setUser({
            id: response.user._id || response.user.id,
            username: response.user.username,
            role: response.user.role,
            token: response.token
          })
        }

        // Redirect based on role
        setTimeout(() => {
          if (response.user.role === 'admin') {
            window.location.href = '/Account/Dashboard/admin'
          } else {
            redirect.toDashboard()
          }
        }, 500)
      } else {
        // Handle specific error cases
        const errorMessage = response.message || 'Login failed'

        if (
          errorMessage.toLowerCase().includes('user not found') ||
          errorMessage.toLowerCase().includes('invalid credentials')
        ) {
          // Redirect to signup with pre-filled username/email
          const signupUrl = `/Account/Signup?email=${encodeURIComponent(formData.username)}`
          setTimeout(() => {
            window.location.href = signupUrl
          }, 1000)
        } else {
          setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '30px',
      color: '#121212'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
      width: '100%'
    },
    checkboxInput: {
      marginRight: '8px',
      width: '18px',
      height: '18px'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#525252'
    },
    error: {
      color: '#dc3545',
      fontSize: '14px',
      marginTop: '10px',
      textAlign: 'center'
    },
    link: {
      marginTop: '15px',
      color: '#007bff',
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer'
    },
    linkContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '20px'
    }
  }

  return (
    <AuthLayout title="Login">
      <Card>
        <form onSubmit={handleSubmit} style={styles.container}>
          <h2 style={styles.title}>Login</h2>

          <Input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            error={error.includes('Username') ? error : ''}
          />

          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            error={error.includes('Password') ? error : ''}
          />

          <div style={styles.checkbox}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={styles.checkboxInput}
            />
            <label htmlFor="rememberMe" style={styles.checkboxLabel}>
              Remember me
            </label>
          </div>

          {error && !error.includes('Username') && !error.includes('Password') && (
            <div style={styles.error}>{error}</div>
          )}

          {success && (
            <div style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}>{success}</div>
          )}

          <Button
            type="submit"
            loading={loading}
            loadingText="Logging in..."
            style={{ width: '100%', marginTop: '10px' }}
          >
            Login
          </Button>

          <div style={styles.linkContainer}>
            <span style={styles.link} onClick={() => redirect.toForgotPassword()}>
              Forgot Password?
            </span>
            <span style={styles.link} onClick={() => redirect.toSignup()}>
              Don't have an account? Signup
            </span>
          </div>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default Login

// Render the app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<Login />)
