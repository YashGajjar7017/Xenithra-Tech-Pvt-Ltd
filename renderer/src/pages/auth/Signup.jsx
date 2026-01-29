import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuthLayout from '../auth/AuthLayout'
import { authAPI, redirect } from '../utils/api'
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRole
} from '../utils/validators'

/**
 * Signup Page Component
 */
const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

    const emailError = validateEmail(formData.email)
    if (emailError) {
      setError(emailError)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    const matchError = validatePasswordMatch(formData.password, formData.confirmPassword)
    if (matchError) {
      setError(matchError)
      return
    }

    const roleError = validateRole(formData.role)
    if (roleError) {
      setError(roleError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      })

      if (response.success) {
        // Check if tokens are returned (OTP disabled)
        if (response.data?.accessToken) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: response.data.user._id || response.data.user.id,
              username: response.data.user.username,
              token: response.data.accessToken
            })
          )

          setSuccess('Account created successfully!')
          setTimeout(() => {
            redirect.toDashboard()
          }, 1000)
        } else {
          // OTP is required, redirect to OTP page
          setSuccess(response.message || 'Signup initiated. Please check your email for OTP.')
          setTimeout(() => {
            redirect.toOTP(formData.email)
          }, 1500)
        }
      } else {
        setError(response.message || response.error || 'Signup failed')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Network error. Please try again.')
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
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px',
      marginBottom: '20px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    error: {
      color: '#dc3545',
      fontSize: '14px',
      marginTop: '10px',
      textAlign: 'center'
    },
    success: {
      color: '#28a745',
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
    }
  }

  return (
    <AuthLayout title="Create Account">
      <Card>
        <form onSubmit={handleSubmit} style={styles.container}>
          <h2 style={styles.title}>Create Account</h2>

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
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            error={error.includes('Email') ? error : ''}
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
            error={error.includes('Password') && !error.includes('match') ? error : ''}
          />

          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            error={error.includes('match') ? error : ''}
          />

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>

          {error &&
            !error.includes('Username') &&
            !error.includes('Email') &&
            !error.includes('Password') &&
            !error.includes('match') && <div style={styles.error}>{error}</div>}

          {success && <div style={styles.success}>{success}</div>}

          <Button
            type="submit"
            loading={loading}
            loadingText="Signing up..."
            style={{ width: '100%', marginTop: '10px' }}
          >
            Sign Up
          </Button>

          <span style={styles.link} onClick={() => redirect.toLogin()}>
            Already have an account? Login
          </span>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default Signup
