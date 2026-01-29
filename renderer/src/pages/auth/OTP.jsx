import { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuthLayout from '../auth/AuthLayout'
import { otpAPI, sessionManager, redirect } from '../utils/api'
import { validateEmail, validateOTP } from '../utils/validators'

/**
 * OTP Verification Page Component
 * @param {string} purpose - OTP purpose (default: signup_verification)
 */
const OTP = ({ purpose = 'signup_verification' }) => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inputRefs = useRef([])
  const emailInputRef = useRef(null)

  // Focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')
    setSuccess('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle keydown for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      // If current input is empty, focus previous input
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setError('')
    setSuccess('')
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

    // Validate OTP
    const otpString = otp.join('')
    const otpError = validateOTP(otpString)
    if (otpError) {
      setError(otpError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await otpAPI.verify({
        email,
        otp: otpString,
        purpose
      })

      if (response.success) {
        setSuccess('OTP verified successfully!')

        // Store tokens if provided
        if (response.data?.accessToken) {
          sessionManager.setTokens(response.data.accessToken, response.data.refreshToken || '')
          sessionManager.setUser({
            username: response.data.username,
            email: response.data.email,
            userId: response.data.userId
          })
        }

        // Show success message and redirect
        setTimeout(() => {
          alert('Verification successful! Welcome to the platform.')
          redirect.toDashboard()
        }, 500)
      } else {
        setError(response.error || 'OTP verification failed')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(err.message || 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle resend OTP
  const handleResend = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      setError('Please enter your email first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await otpAPI.send({ email, purpose })
      setSuccess('OTP resent successfully! Please check your email.')
    } catch (err) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Combined OTP value for validation
  const otpString = otp.join('')

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    },
    title: {
      fontSize: '20px',
      color: '#121212',
      marginBottom: '20px',
      fontWeight: '600'
    },
    otpContainer: {
      display: 'flex',
      justifyContent: 'space-evenly',
      width: '100%',
      marginBottom: '20px'
    },
    otpInput: {
      width: '56px',
      height: '60px',
      textAlign: 'center',
      border: 'none',
      borderRadius: '5px',
      background: '#f0f0f0',
      fontSize: '25px',
      outline: 'none',
      transition: 'outline 0.2s ease'
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
    resendLink: {
      marginTop: '15px',
      color: '#007bff',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'underline',
      background: 'none',
      border: 'none'
    },
    emailSection: {
      width: '100%',
      marginBottom: '20px'
    }
  }

  return (
    <AuthLayout title="OTP Verification">
      <Card>
        <form onSubmit={handleSubmit} style={styles.container}>
          <h4 style={styles.title}>Enter Your 6 Digit OTP</h4>

          <div style={styles.emailSection}>
            <Input
              ref={emailInputRef}
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
              error={error.includes('email') ? error : ''}
            />
          </div>

          <div style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  ...styles.otpInput,
                  outline: otpString.length === index + 1 ? '1.5px solid #00b991' : 'none',
                  outlineOffset: otpString.length === index + 1 ? '2px' : '0'
                }}
                className="otp-input form-control text-center d-inline-block"
              />
            ))}
          </div>

          {error && !error.includes('email') && <div style={styles.error}>{error}</div>}

          {success && <div style={styles.success}>{success}</div>}

          <Button
            type="submit"
            loading={loading}
            loadingText="Verifying..."
            style={{ width: '92%', marginTop: '15px' }}
          >
            Verify OTP
          </Button>

          <button type="button" onClick={handleResend} disabled={loading} style={styles.resendLink}>
            Didn't receive OTP? Resend
          </button>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default OTP
