import express from 'express'

const router = express.Router()

// Import controllers dynamically to handle missing dependencies
let signup, login, logout, refreshAccessToken, getCurrentUser, initDependencies

const initializeControllers = async () => {
  try {
    const authModule = await import('../controller/auth.controller.js')
    signup = authModule.signup
    login = authModule.login
    logout = authModule.logout
    refreshAccessToken = authModule.refreshAccessToken
    getCurrentUser = authModule.getCurrentUser
    initDependencies = authModule.initDependencies
    
    // Initialize dependencies
    if (initDependencies) {
      await initDependencies()
    }
  } catch (error) {
    console.warn('⚠️  Auth controllers not available:', (error).message)
    // Provide fallback error responses
    const errorHandler = (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Authentication service not available. Please install dependencies: npm install mongoose bcryptjs jsonwebtoken'
      })
    }
    signup = errorHandler
    login = errorHandler
    logout = errorHandler
    refreshAccessToken = errorHandler
    getCurrentUser = errorHandler
  }
}

// Initialize immediately but don't await at module level
initializeControllers()

// Public routes
router.post('/signup', (req, res) => signup(req, res))
router.post('/login', (req, res) => login(req, res))
router.post('/refresh-token', (req, res) => refreshAccessToken(req, res))

// Protected routes (would need auth middleware)
router.post('/logout', (req, res) => logout(req, res))
router.get('/me', (req, res) => getCurrentUser(req, res))

export default router
