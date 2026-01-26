/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string} Error message or empty string
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }

  return ''
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {string} Error message or empty string
 */
export const validateUsername = (username) => {
  if (!username) {
    return 'Username is required'
  }

  if (username.length < 3) {
    return 'Username must be at least 3 characters long'
  }

  if (username.length > 20) {
    return 'Username must be less than 20 characters'
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return 'Username can only contain letters, numbers, and underscores'
  }

  return ''
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string} Error message or empty string
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long'
  }

  if (password.length > 50) {
    return 'Password must be less than 50 characters'
  }

  return ''
}

/**
 * Validate password with requirements
 * @param {string} password - Password to validate
 * @returns {object} Validation result with requirements
 */
export const validatePasswordRequirements = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  }

  const allMet = Object.values(requirements).every(Boolean)

  return {
    isValid: allMet,
    requirements,
    score: Object.values(requirements).filter(Boolean).length
  }
}

/**
 * Validate OTP code
 * @param {string} otp - OTP code to validate
 * @param {number} length - Expected OTP length (default 6)
 * @returns {string} Error message or empty string
 */
export const validateOTP = (otp, length = 6) => {
  if (!otp) {
    return 'OTP is required'
  }

  if (otp.length !== length) {
    return `Please enter the complete ${length}-digit OTP`
  }

  if (!/^\d+$/.test(otp)) {
    return 'OTP must contain only numbers'
  }

  return ''
}

/**
 * Validate password match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirm password
 * @returns {string} Error message or empty string
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }

  return ''
}

/**
 * Validate role selection
 * @param {string} role - Selected role
 * @returns {string} Error message or empty string
 */
export const validateRole = (role) => {
  const validRoles = ['user', 'admin', 'moderator']

  if (!role) {
    return 'Please select a role'
  }

  if (!validRoles.includes(role)) {
    return 'Invalid role selected'
  }

  return ''
}

/**
 * Validate URL parameter
 * @param {string} value - URL parameter value
 * @param {string} paramName - Parameter name for error message
 * @returns {string} Error message or empty string
 */
export const validateUrlParam = (value, paramName = 'parameter') => {
  if (!value) {
    return `Missing ${paramName}`
  }

  return ''
}

/**
 * Validate form object against rules
 * @param {object} formData - Form data object
 * @param {object} rules - Validation rules
 * @returns {object} Errors object
 */
export const validateForm = (formData, rules) => {
  const errors = {}

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field]
    const value = formData[field]

    if (typeof fieldRules === 'function') {
      errors[field] = fieldRules(value, formData)
    } else if (Array.isArray(fieldRules)) {
      for (const rule of fieldRules) {
        const error = rule(value, formData)
        if (error) {
          errors[field] = error
          break
        }
      }
    }
  })

  return errors
}
