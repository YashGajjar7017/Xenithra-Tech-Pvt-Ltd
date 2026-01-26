/**
 * Admin Middleware - Authentication and authorization middleware for admin routes
 */

const jwt = require('jsonwebtoken')
const path = require('path')
const rootDir = require('../util/path')

class AdminMiddleware {
  /**
   * Check if user is authenticated and has admin role
   */
  static isAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' })
      }

      // Check if token has expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ error: 'Token has expired.' })
      }

      req.user = decoded
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired.' })
      }
      res.status(401).json({ error: 'Invalid token' })
    }
  }

  /**
   * Check if user is logged in (for login page access)
   */
  static isLoggedIn(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

        // Check if token has expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          // Token expired, continue to login page
          next()
          return
        }

        if (decoded.role === 'admin') {
          return res.redirect('/admin')
        }
      } catch (error) {
        // Token is invalid, continue to login page
      }
    }
    next()
  }

  /**
   * Rate limiting for admin endpoints
   */
  static rateLimit(req, res, next) {
    // Simple in-memory rate limiting (not suitable for production with multiple instances)
    const LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
    const MAX_REQUESTS = 100 // Max requests per window

    // Initialize rate limiting store if not exists
    if (!global.adminRateLimits) {
      global.adminRateLimits = {}
    }

    const ip = req.ip
    const now = Date.now()
    const windowStart = now - LIMIT_WINDOW

    // Initialize or clean up rate limit data for this IP
    if (!global.adminRateLimits[ip]) {
      global.adminRateLimits[ip] = []
    }

    // Remove old requests outside the window
    global.adminRateLimits[ip] = global.adminRateLimits[ip].filter(
      (timestamp) => timestamp > windowStart
    )

    // Check if limit exceeded
    if (global.adminRateLimits[ip].length >= MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.'
      })
    }

    // Add current request
    global.adminRateLimits[ip].push(now)

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': MAX_REQUESTS,
      'X-RateLimit-Remaining': MAX_REQUESTS - global.adminRateLimits[ip].length,
      'X-RateLimit-Reset': new Date(now + (LIMIT_WINDOW - (now % LIMIT_WINDOW))).toISOString()
    })

    next()
  }

  /**
   * Log admin actions
   */
  static logAdminAction(req, res, next) {
    const log = {
      timestamp: new Date(),
      user: req.user?.email || 'anonymous',
      action: `${req.method} ${req.originalUrl}`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }

    // Log to console
    console.log('Admin Action:', JSON.stringify(log, null, 2))

    // In production, you would save to a database or log file
    // Example implementation for file logging:
    /*
        const fs = require('fs');
        const path = require('path');
        const logFilePath = path.join(__dirname, '..', 'logs', 'admin-actions.log');
        
        // Ensure logs directory exists
        const logDir = path.dirname(logFilePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Append log to file
        fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');
        */

    // Example implementation for database logging:
    /*
        const LogModel = require('../models/AdminLog.model'); // You would need to create this model
        LogModel.create(log).catch(err => {
            console.error('Failed to save admin action log to database:', err);
        });
        */

    next()
  }

  /**
   * Validate admin input data
   */
  static validateAdminInput(req, res, next) {
    const { username, email, password, role } = req.body

    // Basic validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    if (role && !['admin', 'moderator', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' })
    }

    next()
  }

  /**
   * Validate user ID parameter
   */
  static validateUserId(req, res, next) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if ID is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    next()
  }

  /**
   * Validate service ID parameter
   */
  static validateServiceId(req, res, next) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Service ID is required' })
    }

    // Check if ID is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid service ID format' })
    }

    next()
  }

  /**
   * Validate request body for user creation
   */
  static validateUserCreation(req, res, next) {
    const { username, email, password } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    next()
  }

  /**
   * Validate request body for service status update
   */
  static validateServiceStatusUpdate(req, res, next) {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['active', 'inactive', 'pending', 'suspended']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` })
    }

    next()
  }
}

module.exports = AdminMiddleware
