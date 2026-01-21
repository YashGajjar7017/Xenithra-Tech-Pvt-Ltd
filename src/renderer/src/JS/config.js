/**
 * Frontend Configuration File
 * Centralized configuration for the application
 */

const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: window.location.origin.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://your-production-api.com',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // WebRTC Configuration
  WEBRTC: {
    ICE_SERVERS: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    CONSTRAINTS: {
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
  },

  // UI Configuration
  UI: {
    THEME: 'dark',
    LANGUAGE: 'en',
    NOTIFICATION_DURATION: 5000,
    AUTO_SAVE_INTERVAL: 30000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FILE_TYPES: ['.js', '.html', '.css', '.json', '.py', '.java', '.cpp']
  },

  // Feature Flags
  FEATURES: {
    ENABLE_WEBRTC: true,
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_AUTO_SAVE: true,
    ENABLE_DARK_MODE: true,
    ENABLE_CODE_COLLABORATION: false
  },

  // Security Configuration
  SECURITY: {
    SESSION_TIMEOUT: 3600000, // 1 hour
    TOKEN_REFRESH_INTERVAL: 300000, // 5 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000 // 15 minutes
  },

  // Performance Configuration
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 100,
    CACHE_DURATION: 3600000, // 1 hour
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100
  },

  // Environment Detection
  ENVIRONMENT: {
    IS_DEVELOPMENT: window.location.origin.includes('localhost'),
    IS_PRODUCTION: !window.location.origin.includes('localhost'),
    DEBUG: window.location.search.includes('debug=true')
  },

  // Third-party Services
  SERVICES: {
    GOOGLE_CLIENT_ID: 'your-google-client-id',
    GITHUB_CLIENT_ID: 'your-github-client-id',
    DISCORD_WEBHOOK_URL: 'your-discord-webhook-url'
  }
}

// Utility function to get config values
const getConfig = (path, defaultValue = null) => {
  return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG) || defaultValue
}

// Utility function to update config values
const updateConfig = (path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), CONFIG)
  target[lastKey] = value
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getConfig, updateConfig }
} else {
  window.CONFIG = CONFIG
  window.getConfig = getConfig
  window.updateConfig = updateConfig
}
