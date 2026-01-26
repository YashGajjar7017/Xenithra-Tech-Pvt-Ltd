import { useState, useCallback, useMemo } from 'react'

/**
 * Custom hook for password validation
 * @param {string} password - Password to validate
 * @param {string} confirmPassword - Confirm password
 * @returns {object} Validation results and helpers
 */
const usePasswordValidation = (password = '', confirmPassword = '') => {
  const [passwordValue, setPasswordValue] = useState(password)
  const [confirmPasswordValue, setConfirmPasswordValue] = useState(confirmPassword)

  const requirements = useMemo(
    () => ({
      length: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      lowercase: /[a-z]/.test(passwordValue),
      number: /[0-9]/.test(passwordValue),
      special: /[!@#$%^&*]/.test(passwordValue),
      match: passwordValue === confirmPasswordValue && passwordValue.length > 0
    }),
    [passwordValue, confirmPasswordValue]
  )

  const score = useMemo(() => {
    return Object.values(requirements).filter(Boolean).length
  }, [requirements])

  const strength = useMemo(() => {
    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    return 'strong'
  }, [score])

  const isValid = useMemo(() => {
    return Object.values(requirements).every(Boolean)
  }, [requirements])

  const getStrengthColor = useCallback(() => {
    switch (strength) {
      case 'weak':
        return '#dc3545'
      case 'medium':
        return '#ffc107'
      case 'strong':
        return '#28a745'
      default:
        return '#6c757d'
    }
  }, [strength])

  const getStrengthLabel = useCallback(() => {
    return strength.charAt(0).toUpperCase() + strength.slice(1)
  }, [strength])

  const validatePassword = useCallback((pwd) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd)
    }
  }, [])

  const reset = useCallback(() => {
    setPasswordValue('')
    setConfirmPasswordValue('')
  }, [])

  return {
    password: passwordValue,
    confirmPassword: confirmPasswordValue,
    setPassword: setPasswordValue,
    setConfirmPassword: setConfirmPasswordValue,
    requirements,
    score,
    strength,
    isValid,
    getStrengthColor,
    getStrengthLabel,
    validatePassword,
    reset
  }
}

export default usePasswordValidation
