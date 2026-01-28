import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')
  const { signup, loading } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formError) setFormError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setFormError('Username is required')
      return false
    }
    if (!formData.email.trim()) {
      setFormError('Email is required')
      return false
    }
    if (!formData.password) {
      setFormError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError('Invalid email format')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) {
      return
    }

    const result = await signup(formData)

    if (result.success) {
      // Redirect to dashboard on successful signup
      navigate('/dashboard')
    } else {
      setFormError(result.error || 'Signup failed. Please try again.')
    }
  }

  return (
    <div className="page-container">
      <div className="login-form-container">
        <h2>Create Account</h2>
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
