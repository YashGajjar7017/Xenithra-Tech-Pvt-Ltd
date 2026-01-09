import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuthLayout from '../auth/AuthLayout'
import { otpAPI, redirect } from '../utils/api'
import { validateEmail } from '../utils/validators'

/**
 * Forgot Password Page Component
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [robotCheck, setRobotCheck] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setError('')
    setSuccess('')
  }

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setRobotCheck(e.target.checked)
    setError('')
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    // Validate robot check
    if (!robotCheck) {
      setError('Please confirm you are not a robot')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await otpAPI.send({
        email,
        purpose: 'password_reset'
      })

      if (response.success) {
        setSuccess('Password reset OTP sent successfully! Please check your email.')
        
        // Redirect to OTP page after a short delay
        setTimeout(() => {
          redirect.toOTP()
        }, 1500)
      } else {
        setError(response.error || 'Failed to send reset OTP')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(err.message || 'Failed to send reset OTP. Please try again.')
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
      marginBottom: '20px',
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

  return (
    <AuthLayout title="Forgot Password">
      <Card>
        <form onSubmit={handleSubmit} style={styles.container}>
          <h2 style={styles.title}>Forgot Password</h2>
          
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={handleEmailChange}
            required
            error={error.includes('email') || error.includes('Email') ? error : ''}
          />

          <div style={styles.checkbox}>
            <input
              type="checkbox"
              id="robotCheck"
              checked={robotCheck}
              onChange={handleCheckboxChange}
              style={styles.checkboxInput}
            />
            <label htmlFor="robotCheck" style={styles.checkboxLabel}>
              I am not a robot
            </label>
          </div>

          {error && !error.includes('email') && !error.includes('Email') && (
            <div style={styles.error}>{error}</div>
          )}
          
          {success && (
            <div style={styles.success}>{success}</div>
          )}

          <Button
            type="submit"
            loading={loading}
            loadingText="Sending..."
            style={{ width: '100%', marginTop: '10px' }}
          >
            Send Reset OTP
          </Button>

          <span 
            style={styles.link} 
            onClick={() => redirect.toLogin()}
          >
            Back to Login
          </span>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default ForgotPassword

// Render the app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<ForgotPassword />)

