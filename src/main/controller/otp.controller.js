// OTP Controller for Frontend
const otpController = {
  // Send OTP to email
  async sendOTP(email, purpose = 'verification') {
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          purpose: purpose
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          data: data.data
        }
      } else {
        return {
          success: false,
          error: data.error || 'Failed to send OTP'
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return {
        success: false,
        error: 'Failed to send OTP. Please try again.'
      }
    }
  },

  // Verify OTP
  async verifyOTP(email, otp, purpose = 'verification') {
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          purpose: purpose
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          data: data.data
        }
      } else {
        return {
          success: false,
          error: data.error || 'OTP verification failed'
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return {
        success: false,
        error: 'OTP verification failed. Please try again.'
      }
    }
  },

  // Resend OTP
  async resendOTP(email, purpose = 'verification') {
    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          purpose: purpose
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          data: data.data
        }
      } else {
        return {
          success: false,
          error: data.error || 'Failed to resend OTP'
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      return {
        success: false,
        error: 'Failed to resend OTP. Please try again.'
      }
    }
  },

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate OTP format (6 digits)
  validateOTP(otp) {
    const otpRegex = /^\d{6}$/
    return otpRegex.test(otp)
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = otpController
}
