/**
 * Comprehensive API Utility
 * Provides reusable functions for making API calls with retry logic, error handling, and token management
 */

import { API_CONFIG, API_BASE_URL, API_PREFIX } from '../config/api.config'

/**
 * API Request Handler with retry logic and error handling
 */
class APIClient {
  constructor(config = API_CONFIG) {
    this.config = config
    this.baseURL = config.baseURL || API_BASE_URL
    this.apiPrefix = config.apiPrefix || API_PREFIX
    this.timeout = config.request?.timeout || 30000
    this.retryAttempts = config.request?.retryAttempts || 3
    this.retryDelay = config.request?.retryDelay || 1000
  }

  /**
   * Get auth token from storage
   */
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  /**
   * Get default headers
   */
  getHeaders(customHeaders = {}) {
    const token = this.getToken()
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.request?.headers,
      ...customHeaders
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(method, url, data = null, options = {}) {
    let lastError
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method,
            headers: this.getHeaders(options.headers),
            body: data ? JSON.stringify(data) : undefined,
            ...options
          },
          this.timeout
        )

        const responseData = await this.parseResponse(response)

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            // Token expired or invalid
            this.handleUnauthorized()
            throw new UnauthorizedError('Unauthorized - token expired or invalid')
          }
          if (response.status === 403) {
            throw new ForbiddenError('Access forbidden')
          }
          if (response.status === 404) {
            throw new NotFoundError('Resource not found')
          }
          if (response.status === 429) {
            throw new RateLimitError('Rate limit exceeded')
          }

          throw new APIError(
            responseData.message || `HTTP ${response.status}`,
            response.status,
            responseData
          )
        }

        return responseData
      } catch (error) {
        lastError = error

        // Don't retry on client errors (4xx) except for specific cases
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          if (error.status !== 429) {
            throw error
          }
        }

        // Wait before retry
        if (attempt < this.retryAttempts) {
          console.warn(
            `Request failed (attempt ${attempt}/${this.retryAttempts}), retrying in ${this.retryDelay}ms...`,
            error.message
          )
          await this.delay(this.retryDelay)
        }
      }
    }

    throw lastError
  }

  /**
   * Fetch with timeout
   */
  fetchWithTimeout(url, options, timeout) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new TimeoutError('Request timeout')), timeout)
      )
    ])
  }

  /**
   * Parse response
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      try {
        return await response.json()
      } catch (error) {
        console.error('Error parsing JSON response:', error)
        return { message: 'Invalid JSON response' }
      }
    }

    if (contentType?.includes('text')) {
      return { message: await response.text() }
    }

    return { message: 'Response processed' }
  }

  /**
   * Handle unauthorized (token expired)
   */
  handleUnauthorized() {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('user')
    document.dispatchEvent(new CustomEvent('token-expired'))
    // Optionally redirect to login
    // window.location.href = '/login'
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * GET request
   */
  get(url, options = {}) {
    return this.request('GET', url, null, options)
  }

  /**
   * POST request
   */
  post(url, data = null, options = {}) {
    return this.request('POST', url, data, options)
  }

  /**
   * PUT request
   */
  put(url, data = null, options = {}) {
    return this.request('PUT', url, data, options)
  }

  /**
   * PATCH request
   */
  patch(url, data = null, options = {}) {
    return this.request('PATCH', url, data, options)
  }

  /**
   * DELETE request
   */
  delete(url, options = {}) {
    return this.request('DELETE', url, null, options)
  }
}

/**
 * API Error Classes
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

class UnauthorizedError extends APIError {
  constructor(message) {
    super(message, 401, {})
    this.name = 'UnauthorizedError'
  }
}

class ForbiddenError extends APIError {
  constructor(message) {
    super(message, 403, {})
    this.name = 'ForbiddenError'
  }
}

class NotFoundError extends APIError {
  constructor(message) {
    super(message, 404, {})
    this.name = 'NotFoundError'
  }
}

class RateLimitError extends APIError {
  constructor(message) {
    super(message, 429, {})
    this.name = 'RateLimitError'
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Create default API client instance
 */
const api = new APIClient(API_CONFIG)

/**
 * API Service Functions - Organized by category
 */

// ==========================================
// Authentication APIs
// ==========================================
export const authAPI = {
  login: (credentials) => api.post(API_CONFIG.auth.login, credentials),
  signup: (credentials) => api.post(API_CONFIG.auth.signup, credentials),
  logout: () => api.post(API_CONFIG.auth.logout),
  refreshToken: () => api.post(API_CONFIG.auth.refresh),
  getCurrentUser: () => api.get(API_CONFIG.auth.currentUser),
  forgotPassword: (email) => api.post(API_CONFIG.auth.forgotPassword, { email }),
  resetPassword: (token, password) => api.post(API_CONFIG.auth.resetPassword, { token, password }),
  verifyOTP: (email, otp) => api.post(API_CONFIG.auth.verifyOTP, { email, otp }),
  sendOTP: (email) => api.post(API_CONFIG.auth.sendOTP, { email }),
  enable2FA: () => api.post(API_CONFIG.auth.enable2FA),
  disable2FA: (code) => api.post(API_CONFIG.auth.disable2FA, { code }),
  verify2FA: (code) => api.post(API_CONFIG.auth.verify2FA, { code })
}

// ==========================================
// User APIs
// ==========================================
export const userAPI = {
  getAll: (page = 1, limit = 10) => api.get(`${API_CONFIG.users.getAll}?page=${page}&limit=${limit}`),
  getById: (id) => api.get(API_CONFIG.users.getById(id)),
  update: (id, data) => api.put(API_CONFIG.users.update(id), data),
  delete: (id) => api.delete(API_CONFIG.users.delete(id)),
  getProfile: () => api.get(API_CONFIG.users.getProfile),
  updateProfile: (data) => api.put(API_CONFIG.users.updateProfile, data),
  getSettings: () => api.get(API_CONFIG.users.getSettings),
  updateSettings: (data) => api.put(API_CONFIG.users.updateSettings, data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post(API_CONFIG.users.uploadAvatar, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  search: (query) => api.get(`${API_CONFIG.users.search}?q=${encodeURIComponent(query)}`),
  ban: (id) => api.post(API_CONFIG.users.ban(id)),
  unban: (id) => api.post(API_CONFIG.users.unban(id))
}

// ==========================================
// Compiler APIs
// ==========================================
export const compilerAPI = {
  compile: (code, language, version = 'latest') => 
    api.post(API_CONFIG.compiler.compile, { code, language, version }),
  execute: (code, language) => 
    api.post(API_CONFIG.compiler.execute, { code, language }),
  format: (code, language) => 
    api.post(API_CONFIG.compiler.format, { code, language }),
  analyze: (code, language) => 
    api.post(API_CONFIG.compiler.analyze, { code, language }),
  lint: (code, language) => 
    api.post(API_CONFIG.compiler.lint, { code, language }),
  getLanguages: () => api.get(API_CONFIG.compiler.getLanguages),
  getVersions: (language) => api.get(API_CONFIG.compiler.getVersions(language))
}

// ==========================================
// File APIs
// ==========================================
export const fileAPI = {
  list: (page = 1) => api.get(`${API_CONFIG.files.list}?page=${page}`),
  create: (data) => api.post(API_CONFIG.files.create, data),
  getById: (id) => api.get(API_CONFIG.files.getById(id)),
  update: (id, data) => api.put(API_CONFIG.files.update(id), data),
  delete: (id) => api.delete(API_CONFIG.files.delete(id)),
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(API_CONFIG.files.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  download: (id) => api.get(API_CONFIG.files.download(id)),
  share: (id, email) => api.post(API_CONFIG.files.share(id), { email }),
  getShared: () => api.get(API_CONFIG.files.getShared),
  rename: (id, newName) => api.patch(API_CONFIG.files.rename(id), { name: newName }),
  move: (id, newPath) => api.patch(API_CONFIG.files.move(id), { path: newPath }),
  copy: (id) => api.post(API_CONFIG.files.copy(id)),
  trash: (id) => api.patch(API_CONFIG.files.trash(id)),
  restore: (id) => api.patch(API_CONFIG.files.restore(id)),
  permanentDelete: (id) => api.delete(API_CONFIG.files.permanentDelete(id))
}

// ==========================================
// Session APIs
// ==========================================
export const sessionAPI = {
  create: (data) => api.post(API_CONFIG.sessions.create, data),
  getById: (id) => api.get(API_CONFIG.sessions.getById(id)),
  join: (id) => api.post(API_CONFIG.sessions.join(id)),
  leave: (id) => api.post(API_CONFIG.sessions.leave(id)),
  list: () => api.get(API_CONFIG.sessions.list),
  update: (id, data) => api.put(API_CONFIG.sessions.update(id), data),
  delete: (id) => api.delete(API_CONFIG.sessions.delete(id)),
  listParticipants: (id) => api.get(API_CONFIG.sessions.listParticipants(id)),
  getHistory: (id) => api.get(API_CONFIG.sessions.getHistory(id)),
  exportCode: (id) => api.get(API_CONFIG.sessions.exportCode(id))
}

// ==========================================
// Collaboration APIs
// ==========================================
export const collaborationAPI = {
  invite: (data) => api.post(API_CONFIG.collaboration.invite, data),
  acceptInvite: (inviteId) => api.post(API_CONFIG.collaboration.acceptInvite, { inviteId }),
  declineInvite: (inviteId) => api.post(API_CONFIG.collaboration.declineInvite, { inviteId }),
  getInvites: () => api.get(API_CONFIG.collaboration.getInvites),
  listCollaborators: () => api.get(API_CONFIG.collaboration.listCollaborators),
  removeCollaborator: (id) => api.delete(API_CONFIG.collaboration.removeCollaborator(id)),
  createTeam: (data) => api.post(API_CONFIG.collaboration.createTeam, data),
  getTeams: () => api.get(API_CONFIG.collaboration.getTeams),
  updateTeam: (id, data) => api.put(API_CONFIG.collaboration.updateTeam(id), data),
  deleteTeam: (id) => api.delete(API_CONFIG.collaboration.deleteTeam(id))
}

// ==========================================
// Classroom APIs
// ==========================================
export const classroomAPI = {
  createClass: (data) => api.post(API_CONFIG.classroom.createClass, data),
  getClasses: () => api.get(API_CONFIG.classroom.getClasses),
  getClassById: (id) => api.get(API_CONFIG.classroom.getClassById(id)),
  updateClass: (id, data) => api.put(API_CONFIG.classroom.updateClass(id), data),
  deleteClass: (id) => api.delete(API_CONFIG.classroom.deleteClass(id)),
  joinClass: (code) => api.post(API_CONFIG.classroom.joinClass, { code }),
  leaveClass: (id) => api.post(API_CONFIG.classroom.leaveClass(id)),
  getMembers: (id) => api.get(API_CONFIG.classroom.getMembers(id)),
  addMember: (id, memberId) => api.post(API_CONFIG.classroom.addMember(id), { memberId }),
  removeMember: (id, memberId) => api.delete(API_CONFIG.classroom.removeMember(id, memberId)),
  getAssignments: (id) => api.get(API_CONFIG.classroom.getAssignments(id)),
  createAssignment: (id, data) => api.post(API_CONFIG.classroom.createAssignment(id), data),
  submitAssignment: (id, assignmentId, data) => 
    api.post(API_CONFIG.classroom.submitAssignment(id, assignmentId), data)
}

// ==========================================
// Achievement APIs
// ==========================================
export const achievementAPI = {
  getAll: () => api.get(API_CONFIG.achievements.getAll),
  getById: (id) => api.get(API_CONFIG.achievements.getById(id)),
  getUserAchievements: () => api.get(API_CONFIG.achievements.getUserAchievements),
  unlockAchievement: (id) => api.post(API_CONFIG.achievements.unlockAchievement(id)),
  getProgress: () => api.get(API_CONFIG.achievements.getProgress),
  getLeaderboard: () => api.get(API_CONFIG.achievements.getLeaderboard),
  getLeaderboardPeriod: (period) => api.get(API_CONFIG.achievements.getLeaderboardPeriod(period))
}

// ==========================================
// Analytics APIs
// ==========================================
export const analyticsAPI = {
  getDashboard: () => api.get(API_CONFIG.analytics.getDashboard),
  getStats: () => api.get(API_CONFIG.analytics.getStats),
  getCodeStats: () => api.get(API_CONFIG.analytics.getCodeStats),
  getCompilationHistory: () => api.get(API_CONFIG.analytics.getCompilationHistory),
  getUserAnalytics: () => api.get(API_CONFIG.analytics.getUserAnalytics),
  getSystemAnalytics: () => api.get(API_CONFIG.analytics.getSystemAnalytics),
  exportAnalytics: (format = 'json') => api.get(API_CONFIG.analytics.exportAnalytics(format))
}

// ==========================================
// Admin APIs
// ==========================================
export const adminAPI = {
  getDashboard: () => api.get(API_CONFIG.admin.getDashboard),
  getUsers: (page = 1) => api.get(`${API_CONFIG.admin.getUsers}?page=${page}`),
  deleteUser: (id) => api.delete(API_CONFIG.admin.deleteUser(id)),
  banUser: (id) => api.post(API_CONFIG.admin.banUser(id)),
  unbanUser: (id) => api.post(API_CONFIG.admin.unbanUser(id)),
  getReports: () => api.get(API_CONFIG.admin.getReports),
  getSystemHealth: () => api.get(API_CONFIG.admin.getSystemHealth),
  getServerStats: () => api.get(API_CONFIG.admin.getServerStats),
  getLogs: (page = 1) => api.get(`${API_CONFIG.admin.getLogs}?page=${page}`),
  clearCache: () => api.post(API_CONFIG.admin.clearCache),
  setMaintenance: (enabled) => api.post(API_CONFIG.admin.maintenance, { enabled })
}

// ==========================================
// Notification APIs
// ==========================================
export const notificationAPI = {
  getAll: () => api.get(API_CONFIG.notifications.getAll),
  getUnread: () => api.get(API_CONFIG.notifications.getUnread),
  markAsRead: (id) => api.patch(API_CONFIG.notifications.markAsRead(id)),
  markAllAsRead: () => api.patch(API_CONFIG.notifications.markAllAsRead),
  delete: (id) => api.delete(API_CONFIG.notifications.delete(id)),
  deleteAll: () => api.delete(API_CONFIG.notifications.deleteAll)
}

// ==========================================
// Health Check APIs
// ==========================================
export const healthAPI = {
  getStatus: () => api.get(API_CONFIG.health.status),
  ping: () => api.get(API_CONFIG.health.ping)
}

/**
 * Export API client and utilities
 */
export { api, APIClient, APIError, UnauthorizedError, ForbiddenError, NotFoundError, RateLimitError, TimeoutError }

export default {
  api,
  authAPI,
  userAPI,
  compilerAPI,
  fileAPI,
  sessionAPI,
  collaborationAPI,
  classroomAPI,
  achievementAPI,
  analyticsAPI,
  adminAPI,
  notificationAPI,
  healthAPI
}
