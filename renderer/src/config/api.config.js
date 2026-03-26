/**
 * API Configuration - Centralized application configuration
 * This file consolidates all API endpoints, settings, and configurations
 */

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// API Base URLs
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api' 
  : process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

const API_PREFIX = `${API_BASE_URL}/api`

/**
 * Main API Configuration Object
 */
const API_CONFIG = {
  // Environment
  environment: process.env.NODE_ENV || 'development',
  isDevelopment,
  isProduction,

  // Base URLs
  baseURL: API_BASE_URL,
  apiPrefix: API_PREFIX,

  // Request Configuration
  request: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  },

  // Authentication Endpoints
  auth: {
    login: `${API_PREFIX}/login`,
    signup: `${API_PREFIX}/signup`,
    logout: `${API_PREFIX}/logout`,
    refresh: `${API_PREFIX}/refresh-token`,
    verify: `${API_PREFIX}/verify-token`,
    currentUser: `${API_PREFIX}/me`,
    forgotPassword: `${API_PREFIX}/forgot-password`,
    resetPassword: `${API_PREFIX}/reset-password`,
    verifyOTP: `${API_PREFIX}/verify-otp`,
    sendOTP: `${API_PREFIX}/send-otp`,
    enable2FA: `${API_PREFIX}/2fa/enable`,
    disable2FA: `${API_PREFIX}/2fa/disable`,
    verify2FA: `${API_PREFIX}/2fa/verify`,
  },

  // User Management Endpoints
  users: {
    getAll: `${API_PREFIX}/users`,
    getById: (id) => `${API_PREFIX}/users/${id}`,
    update: (id) => `${API_PREFIX}/users/${id}`,
    delete: (id) => `${API_PREFIX}/users/${id}`,
    getProfile: `${API_PREFIX}/users/profile`,
    updateProfile: `${API_PREFIX}/users/profile`,
    getSettings: `${API_PREFIX}/users/settings`,
    updateSettings: `${API_PREFIX}/users/settings`,
    uploadAvatar: `${API_PREFIX}/users/avatar`,
    search: `${API_PREFIX}/users/search`,
    ban: (id) => `${API_PREFIX}/users/${id}/ban`,
    unban: (id) => `${API_PREFIX}/users/${id}/unban`,
  },

  // Code Compilation Endpoints
  compiler: {
    compile: `${API_PREFIX}/compiler/compile`,
    execute: `${API_PREFIX}/compiler/execute`,
    format: `${API_PREFIX}/compiler/format`,
    analyze: `${API_PREFIX}/compiler/analyze`,
    lint: `${API_PREFIX}/compiler/lint`,
    getLanguages: `${API_PREFIX}/compiler/languages`,
    getVersions: (language) => `${API_PREFIX}/compiler/languages/${language}/versions`,
  },

  // File Management Endpoints
  files: {
    list: `${API_PREFIX}/files`,
    create: `${API_PREFIX}/files`,
    getById: (id) => `${API_PREFIX}/files/${id}`,
    update: (id) => `${API_PREFIX}/files/${id}`,
    delete: (id) => `${API_PREFIX}/files/${id}`,
    upload: `${API_PREFIX}/files/upload`,
    download: (id) => `${API_PREFIX}/files/${id}/download`,
    share: (id) => `${API_PREFIX}/files/${id}/share`,
    getShared: `${API_PREFIX}/files/shared`,
    rename: (id) => `${API_PREFIX}/files/${id}/rename`,
    move: (id) => `${API_PREFIX}/files/${id}/move`,
    copy: (id) => `${API_PREFIX}/files/${id}/copy`,
    trash: (id) => `${API_PREFIX}/files/${id}/trash`,
    restore: (id) => `${API_PREFIX}/files/${id}/restore`,
    permanentDelete: (id) => `${API_PREFIX}/files/${id}/delete-permanent`,
  },

  // Session Management Endpoints
  sessions: {
    create: `${API_PREFIX}/sessions`,
    getById: (id) => `${API_PREFIX}/sessions/${id}`,
    join: (id) => `${API_PREFIX}/sessions/${id}/join`,
    leave: (id) => `${API_PREFIX}/sessions/${id}/leave`,
    list: `${API_PREFIX}/sessions`,
    update: (id) => `${API_PREFIX}/sessions/${id}`,
    delete: (id) => `${API_PREFIX}/sessions/${id}`,
    listParticipants: (id) => `${API_PREFIX}/sessions/${id}/participants`,
    getHistory: (id) => `${API_PREFIX}/sessions/${id}/history`,
    exportCode: (id) => `${API_PREFIX}/sessions/${id}/export`,
  },

  // Collaboration Endpoints
  collaboration: {
    invite: `${API_PREFIX}/collaboration/invite`,
    acceptInvite: `${API_PREFIX}/collaboration/invite/accept`,
    declineInvite: `${API_PREFIX}/collaboration/invite/decline`,
    getInvites: `${API_PREFIX}/collaboration/invites`,
    listCollaborators: `${API_PREFIX}/collaboration/collaborators`,
    removeCollaborator: (id) => `${API_PREFIX}/collaboration/collaborators/${id}`,
    createTeam: `${API_PREFIX}/collaboration/teams`,
    getTeams: `${API_PREFIX}/collaboration/teams`,
    updateTeam: (id) => `${API_PREFIX}/collaboration/teams/${id}`,
    deleteTeam: (id) => `${API_PREFIX}/collaboration/teams/${id}`,
  },

  // Classroom Endpoints
  classroom: {
    createClass: `${API_PREFIX}/classroom/create`,
    getClasses: `${API_PREFIX}/classroom`,
    getClassById: (id) => `${API_PREFIX}/classroom/${id}`,
    updateClass: (id) => `${API_PREFIX}/classroom/${id}`,
    deleteClass: (id) => `${API_PREFIX}/classroom/${id}`,
    joinClass: `${API_PREFIX}/classroom/join`,
    leaveClass: (id) => `${API_PREFIX}/classroom/${id}/leave`,
    getMembers: (id) => `${API_PREFIX}/classroom/${id}/members`,
    addMember: (id) => `${API_PREFIX}/classroom/${id}/members`,
    removeMember: (id, memberId) => `${API_PREFIX}/classroom/${id}/members/${memberId}`,
    getAssignments: (id) => `${API_PREFIX}/classroom/${id}/assignments`,
    createAssignment: (id) => `${API_PREFIX}/classroom/${id}/assignments`,
    submitAssignment: (id, assignmentId) => `${API_PREFIX}/classroom/${id}/assignments/${assignmentId}/submit`,
  },

  // Achievements Endpoints
  achievements: {
    getAll: `${API_PREFIX}/achievements`,
    getById: (id) => `${API_PREFIX}/achievements/${id}`,
    getUserAchievements: `${API_PREFIX}/achievements/user`,
    unlockAchievement: (id) => `${API_PREFIX}/achievements/${id}/unlock`,
    getProgress: `${API_PREFIX}/achievements/progress`,
    getLeaderboard: `${API_PREFIX}/achievements/leaderboard`,
    getLeaderboardPeriod: (period) => `${API_PREFIX}/achievements/leaderboard/${period}`,
  },

  // Analytics Endpoints
  analytics: {
    getDashboard: `${API_PREFIX}/analytics/dashboard`,
    getStats: `${API_PREFIX}/analytics/stats`,
    getCodeStats: `${API_PREFIX}/analytics/code-stats`,
    getCompilationHistory: `${API_PREFIX}/analytics/compilation-history`,
    getUserAnalytics: `${API_PREFIX}/analytics/user`,
    getSystemAnalytics: `${API_PREFIX}/analytics/system`,
    exportAnalytics: (format = 'json') => `${API_PREFIX}/analytics/export?format=${format}`,
  },

  // Admin Endpoints
  admin: {
    getDashboard: `${API_PREFIX}/admin/dashboard`,
    getUsers: `${API_PREFIX}/admin/users`,
    deleteUser: (id) => `${API_PREFIX}/admin/users/${id}`,
    banUser: (id) => `${API_PREFIX}/admin/users/${id}/ban`,
    unbanUser: (id) => `${API_PREFIX}/admin/users/${id}/unban`,
    getReports: `${API_PREFIX}/admin/reports`,
    getSystemHealth: `${API_PREFIX}/admin/health`,
    getServerStats: `${API_PREFIX}/admin/server-stats`,
    getLogs: `${API_PREFIX}/admin/logs`,
    clearCache: `${API_PREFIX}/admin/cache/clear`,
    maintenance: `${API_PREFIX}/admin/maintenance`,
  },

  // Payment/Billing Endpoints
  billing: {
    getPlans: `${API_PREFIX}/billing/plans`,
    subscribe: `${API_PREFIX}/billing/subscribe`,
    cancelSubscription: `${API_PREFIX}/billing/subscription/cancel`,
    updatePaymentMethod: `${API_PREFIX}/billing/payment-method`,
    getInvoices: `${API_PREFIX}/billing/invoices`,
    downloadInvoice: (id) => `${API_PREFIX}/billing/invoices/${id}/download`,
  },

  // Notification Endpoints
  notifications: {
    getAll: `${API_PREFIX}/notifications`,
    getUnread: `${API_PREFIX}/notifications/unread`,
    markAsRead: (id) => `${API_PREFIX}/notifications/${id}/read`,
    markAllAsRead: `${API_PREFIX}/notifications/read-all`,
    delete: (id) => `${API_PREFIX}/notifications/${id}`,
    deleteAll: `${API_PREFIX}/notifications/delete-all`,
  },

  // Search Endpoints
  search: {
    global: `${API_PREFIX}/search`,
    users: `${API_PREFIX}/search/users`,
    files: `${API_PREFIX}/search/files`,
    code: `${API_PREFIX}/search/code`,
  },

  // Health Check
  health: {
    status: `${API_PREFIX}/health`,
    ping: `${API_BASE_URL}/ping`,
  }
}

/**
 * WebRTC Configuration
 */
const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  constraints: {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  }
}

/**
 * UI Configuration
 */
const UI_CONFIG = {
  theme: 'dark',
  language: 'en',
  notificationDuration: 5000,
  autoSaveInterval: 30000,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.js', '.html', '.css', '.json', '.py', '.java', '.cpp', '.c', '.ts', '.jsx', '.tsx'],
  codeEditorTheme: 'dracula',
  codeEditorFontSize: 14,
  codeEditorFontFamily: '"Fira Code", "Courier New", monospace'
}

/**
 * Feature Flags
 */
const FEATURE_FLAGS = {
  enableWebRTC: process.env.REACT_APP_ENABLE_WEBRTC !== 'false',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
  enableCollaboration: process.env.REACT_APP_ENABLE_COLLABORATION !== 'false',
  enableClassroom: process.env.REACT_APP_ENABLE_CLASSROOM !== 'false',
  enableAchievements: process.env.REACT_APP_ENABLE_ACHIEVEMENTS !== 'false',
  enable2FA: process.env.REACT_APP_ENABLE_2FA !== 'false',
  enableMaintenance: process.env.REACT_APP_MAINTENANCE === 'true'
}

/**
 * Export configuration
 */
export default {
  API_CONFIG,
  WEBRTC_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  API_BASE_URL,
  API_PREFIX
}

// Also export individual configs
export { API_CONFIG, WEBRTC_CONFIG, UI_CONFIG, FEATURE_FLAGS, API_BASE_URL, API_PREFIX }
