import { useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuthLayout from '../auth/AuthLayout'
import { passwordAPI, redirect } from '../utils/api'

/**
 * Reset Password Page Component
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetToken, setResetToken] = useState('')

  // Password validation state
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  })
  const [strength, setStrength] = useState({ score: 0, label: '' })

  // Get token from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    setResetToken(token)
  }, [])

  // Validate password requirements
  const validatePassword = useCallback((pwd, confirmPwd) => {
    const reqs = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd),
      match: pwd === confirmPwd && pwd.length > 0
    }

    setRequirements(reqs)

    const score = Object.values(reqs).filter(Boolean).length
    const labels = ['Very Weak', 'Weak', 'Fair', 'Medium', 'Strong', 'Excellent']
    setStrength({ score, label: labels[Math.min(score, 5)] })

    return reqs
  }, [])

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    setError('')
    setSuccess('')
    validatePassword(value, confirmPassword)
  }

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    setError('')
    setSuccess('')
    validatePassword(password, value)
  }

  // Check if all requirements are met
  const isFormValid = Object.values(requirements).every(Boolean)

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!resetToken) {
      setError('Invalid reset link. Please request a new password reset.')
      setTimeout(() => {
        redirect.toForgotPassword()
      }, 2000)
      return
    }

    if (!isFormValid) {
      setError('Please ensure all password requirements are met.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await passwordAPI.reset({
        resetToken,
        newPassword: password,
        confirmPassword: confirmPassword
      })

      if (response.success) {
        setSuccess('Password reset successfully!')

        // Redirect to login after success
        setTimeout(() => {
          alert('Password reset successfully! You can now log in with your new password.')
          redirect.toLogin()
        }, 1000)
      } else {
        setError(response.error || 'Password reset failed. Please try again.')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.message || 'Password reset failed. Please try again.')
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
    passwordSection: {
      width: '100%',
      marginBottom: '15px'
    },
    requirements: {
      fontSize: '12px',
      color: '#666',
      marginTop: '10px',
      width: '100%'
    },
    requirementList: {
      listStyle: 'none',
      padding: 0,
      margin: '5px 0 0 0'
    },
    requirementItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '2px'
    },
    requirementIcon: {
      marginRight: '8px',
      fontSize: '14px'
    },
    strengthIndicator: {
      marginTop: '10px',
      fontSize: '14px',
      fontWeight: '500'
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
      marginTop: '20px',
      color: '#007bff',
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer'
    }
  }

  const getRequirementColor = (met) => (met ? '#28a745' : '#dc3545')

  return (
    <AuthLayout title="Reset Password">
      <Card>
        <form onSubmit={handleSubmit} style={styles.container}>
          <h2 style={styles.title}>Reset Password</h2>

          <div style={styles.passwordSection}>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="New Password"
              value={password}
              onChange={handlePasswordChange}
              required
              error={error.includes('requirements') ? error : ''}
            />
          </div>

          <div style={styles.passwordSection}>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              error={error.includes('match') ? error : ''}
            />
          </div>

          {/* Password Requirements */}
          <div style={styles.requirements}>
            <strong>Password Requirements:</strong>
            <ul style={styles.requirementList}>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.length)
                  }}
                >
                  {requirements.length ? '✓' : '✗'}
                </span>
                At least 8 characters
              </li>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.uppercase)
                  }}
                >
                  {requirements.uppercase ? '✓' : '✗'}
                </span>
                At least one uppercase letter
              </li>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.lowercase)
                  }}
                >
                  {requirements.lowercase ? '✓' : '✗'}
                </span>
                At least one lowercase letter
              </li>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.number)
                  }}
                >
                  {requirements.number ? '✓' : '✗'}
                </span>
                At least one number
              </li>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.special)
                  }}
                >
                  {requirements.special ? '✓' : '✗'}
                </span>
                At least one special character (!@#$%^&*)
              </li>
              <li style={styles.requirementItem}>
                <span
                  style={{
                    ...styles.requirementIcon,
                    color: getRequirementColor(requirements.match)
                  }}
                >
                  {requirements.match ? '✓' : '✗'}
                </span>
                Passwords match
              </li>
            </ul>
          </div>

          {/* Password Strength */}
          {password && (
            <div
              style={{
                ...styles.strengthIndicator,
                color: strength.score <= 2 ? '#dc3545' : strength.score <= 4 ? '#ffc107' : '#28a745'
              }}
            >
              Password Strength: {strength.label}
            </div>
          )}

          {error && !error.includes('requirements') && !error.includes('match') && (
            <div style={styles.error}>{error}</div>
          )}

          {success && <div style={styles.success}>{success}</div>}

          <Button
            type="submit"
            loading={loading}
            loadingText="Resetting..."
            disabled={!isFormValid || !resetToken}
            style={{ width: '100%', marginTop: '20px' }}
          >
            Reset Password
          </Button>

          <span style={styles.link} onClick={() => redirect.toLogin()}>
            Back to Login
          </span>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default ResetPassword

// Render the app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<ResetPassword />)
