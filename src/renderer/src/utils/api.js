/**
 * API utility functions
 */

const API_BASE_URL = '/api'

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error || data.message || 'Request failed',
        data
      }
    }

    return data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Authentication API endpoints
 */
export const authAPI = {
  login: (credentials) => apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  signup: (userData) => apiRequest('/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  logout: () => apiRequest('/logout', {
    method: 'POST'
  })
}

/**
 * OTP API endpoints
 */
export const otpAPI = {
  send: (data) => apiRequest('/otp/send', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  verify: (data) => apiRequest('/otp/verify', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  resend: (email) => apiRequest('/otp/resend', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

/**
 * Password API endpoints
 */
export const passwordAPI = {
  forgot: (email) => apiRequest('/password-reset/forgot', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  reset: (data) => apiRequest('/password-reset/reset', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * User API endpoints
 */
export const userAPI = {
  profile: () => apiRequest('/user/profile'),
  
  update: (userData) => apiRequest('/user/update', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  delete: () => apiRequest('/user/delete', {
    method: 'DELETE'
  })
}

/**
 * Session management utilities
 */
export const sessionManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  clearSession: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    // Clear auth cookies
    document.cookie = 'token=; path=/; max-age=0'
    document.cookie = 'username=; path=/; max-age=0'
    document.cookie = 'role=; path=/; max-age=0'
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken') || !!localStorage.getItem('user')
  }
}

/**
 * Redirect utilities
 */
export const redirect = {
  toDashboard: () => {
    window.location.href = '/index.html'
  },

  toLogin: () => {
    window.location.href = '/Account/login'
  },

  toSignup: () => {
    window.location.href = '/Account/Signup'
  },

  toOTP: (email) => {
    const params = email ? `?email=${encodeURIComponent(email)}` : ''
    window.location.href = `/Account/otp${params}`
  },

  toForgotPassword: () => {
    window.location.href = '/Account/forgotPassword'
  },

  toResetPassword: (token) => {
    window.location.href = `/Account/resetPassword?token=${encodeURIComponent(token)}`
  },

  toHome: () => {
    window.location.href = '/'
  }
}

export default {
  auth: authAPI,
  otp: otpAPI,
  password: passwordAPI,
  user: userAPI,
  session: sessionManager,
  redirect,
  request: apiRequest
}

