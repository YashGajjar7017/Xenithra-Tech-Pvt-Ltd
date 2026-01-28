import React, { createContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/check-auth', {
        method: 'GET',
        credentials: 'include' // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token in localStorage as backup
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        sessionStorage.setItem('authToken', data.token)
      }

      setIsAuthenticated(true)
      setUser(data.user)
      setError(null)

      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      setIsAuthenticated(false)
      setUser(null)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/Account/Signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signup failed')
      }

      // Auto-login after signup
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        sessionStorage.setItem('authToken', data.token)
      }

      setIsAuthenticated(true)
      setUser(data.user)
      setError(null)

      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Signup failed'
      setError(errorMsg)
      setIsAuthenticated(false)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)

      await fetch('/logout', {
        method: 'GET',
        credentials: 'include'
      })

      // Clear tokens
      localStorage.removeItem('authToken')
      sessionStorage.removeItem('authToken')

      setIsAuthenticated(false)
      setUser(null)
      setError(null)

      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if server request fails
      localStorage.removeItem('authToken')
      sessionStorage.removeItem('authToken')
      setIsAuthenticated(false)
      setUser(null)
      return { success: true } // Return success since we cleared local state
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuthStatus
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
