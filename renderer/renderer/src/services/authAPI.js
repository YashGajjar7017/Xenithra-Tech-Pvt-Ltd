// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // Get token from localStorage if available
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      if (userData.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${userData.token}`
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }

  const finalOptions = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, finalOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'API Error')
    }

    return data
  } catch (error) {
    throw error
  }
}

// Auth API calls
export const authAPI = {
  login: (credentials) => apiCall('/login', { method: 'POST', body: JSON.stringify(credentials) }),

  signup: (userData) => apiCall('/signup', { method: 'POST', body: JSON.stringify(userData) }),

  logout: () => apiCall('/logout', { method: 'POST' }),

  refreshToken: (refreshToken) =>
    apiCall('/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),

  getCurrentUser: () => apiCall('/me', { method: 'GET' })
}

export default authAPI
