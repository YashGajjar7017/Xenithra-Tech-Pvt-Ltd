const axios = require('axios')

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

// Session management using API calls
class SessionManager {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/sessions`
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async createSession(settings = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/create`,
        { settings },
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success ? response.data.data : null
    } catch (error) {
      console.error('Error creating session:', error.response?.data || error.message)
      throw error
    }
  }

  async getSession(sessionId) {
    try {
      const response = await axios.get(`${this.baseURL}/${sessionId}`)
      return response.data.success ? response.data.data : null
    } catch (error) {
      console.error('Error getting session:', error.response?.data || error.message)
      return null
    }
  }

  async joinSession(sessionId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${sessionId}/join`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success ? response.data.data : null
    } catch (error) {
      console.error('Error joining session:', error.response?.data || error.message)
      return null
    }
  }

  getShareableLink(sessionId) {
    return `/session/${sessionId}`
  }

  async getActiveSessions() {
    try {
      const response = await axios.get(`${this.baseURL}/active`)
      return response.data.success ? response.data.data : []
    } catch (error) {
      console.error('Error getting active sessions:', error.response?.data || error.message)
      return []
    }
  }

  async leaveSession(sessionId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${sessionId}/leave`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success
    } catch (error) {
      console.error('Error leaving session:', error.response?.data || error.message)
      return false
    }
  }

  async updateSessionCode(sessionId, code) {
    try {
      const response = await axios.put(
        `${this.baseURL}/${sessionId}/update`,
        { code },
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success
    } catch (error) {
      console.error('Error updating session code:', error.response?.data || error.message)
      return false
    }
  }

  async getSessionCode(sessionId) {
    try {
      const response = await axios.get(`${this.baseURL}/${sessionId}/code/get`)
      return response.data.success ? response.data.data.code : ''
    } catch (error) {
      console.error('Error getting session code:', error.response?.data || error.message)
      return ''
    }
  }

  async saveSessionCode(sessionId, code) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${sessionId}/code/save`,
        { code },
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success
    } catch (error) {
      console.error('Error saving session code:', error.response?.data || error.message)
      return false
    }
  }

  async getParticipants(sessionId) {
    try {
      const response = await axios.get(`${this.baseURL}/${sessionId}/participants`)
      return response.data.success ? response.data.data : []
    } catch (error) {
      console.error('Error getting participants:', error.response?.data || error.message)
      return []
    }
  }

  async sendChatMessage(sessionId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${sessionId}/chat/message`,
        { message },
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success ? response.data.data : null
    } catch (error) {
      console.error('Error sending chat message:', error.response?.data || error.message)
      return null
    }
  }

  async getChatMessages(sessionId) {
    try {
      const response = await axios.get(`${this.baseURL}/${sessionId}/chat/messages`)
      return response.data.success ? response.data.data : []
    } catch (error) {
      console.error('Error getting chat messages:', error.response?.data || error.message)
      return []
    }
  }

  async updateCursor(sessionId, cursorData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${sessionId}/cursor/update`,
        { cursorData },
        {
          headers: this.getAuthHeaders()
        }
      )
      return response.data.success ? response.data.data : {}
    } catch (error) {
      console.error('Error updating cursor:', error.response?.data || error.message)
      return {}
    }
  }

  async endSession(sessionId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${sessionId}/end`, {
        headers: this.getAuthHeaders()
      })
      return response.data.success
    } catch (error) {
      console.error('Error ending session:', error.response?.data || error.message)
      return false
    }
  }
}

const sessionManager = new SessionManager()

// Controller functions
exports.createSession = (req, res) => {
  const { creatorId, settings } = req.body

  if (!creatorId) {
    return res.status(400).json({
      success: false,
      error: 'Creator ID is required'
    })
  }

  const session = sessionManager.createSession(creatorId, settings)

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      shareableLink: sessionManager.getShareableLink(session.id),
      session
    }
  })
}

exports.getSession = (req, res) => {
  const { sessionId } = req.params
  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    })
  }

  res.json({
    success: true,
    data: session
  })
}

exports.getShareableLink = (req, res) => {
  const { sessionId } = req.params
  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    })
  }

  res.json({
    success: true,
    data: {
      shareableLink: sessionManager.getShareableLink(sessionId),
      session
    }
  })
}

exports.joinSession = (req, res) => {
  const { sessionId, userId } = req.body
  const session = sessionManager.joinSession(sessionId, userId)

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or inactive'
    })
  }

  res.json({
    success: true,
    data: session
  })
}

exports.leaveSession = (req, res) => {
  const { sessionId, userId } = req.body
  const success = sessionManager.leaveSession(sessionId, userId)

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or user not in session'
    })
  }

  res.json({
    success: true,
    message: 'Successfully left the session'
  })
}

exports.updateSessionCode = (req, res) => {
  const { sessionId, code, userId } = req.body
  const success = sessionManager.updateSessionCode(sessionId, code, userId)

  if (!success) {
    return res.status(403).json({
      success: false,
      error: 'Failed to update session code'
    })
  }

  res.json({
    success: true,
    message: 'Session code updated successfully'
  })
}

exports.getActiveSessions = (req, res) => {
  const sessions = sessionManager.getActiveSessions()
  res.json({
    success: true,
    data: sessions
  })
}
