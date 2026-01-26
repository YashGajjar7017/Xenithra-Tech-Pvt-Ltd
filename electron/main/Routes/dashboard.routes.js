const express = require('express')
const path = require('path')
const router = express.Router()

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.authenticated) {
    // Redirect to the main login page; /Account/login exists in login.routes.js
    return res.redirect('/Account/login')
  }
  next()
}

// Common Dashboard route - routes to admin or user dashboard based on role
router.get('/', requireAuth, (req, res) => {
  try {
    // Use explicit branching so unknown/missing roles are handled clearly
    const userRole = req.session.user?.role
    console.log(`Dashboard request for user: ${req.session.user?.username}, Role: ${userRole}`)

    if (userRole === 'admin') {
      console.log('Serving admin dashboard')
      return res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'))
    }

    if (userRole === 'user') {
      console.log('Serving user dashboard')
      return res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'))
    }

    // Unknown or missing role - show a helpful error page with next steps
    console.warn('Dashboard access with missing/unknown role:', userRole)
    return res.sendFile(path.join(__dirname, '../views/Dashboard_error.html'))
  } catch (error) {
    console.error('Dashboard route error:', error)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// Analytics dashboard
router.get('/analytics', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/analytics.html'))
})

// Achievements page
router.get('/achievements', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/achievements.html'))
})

// Collaboration page
router.get('/collaboration', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/collaboration.html'))
})

// API documentation page
router.get('/api-docs', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/api-docs.html'))
})

// API proxy routes for dashboard features
router.get('/api/analytics/*', requireAuth, (req, res) => {
  res.redirect('/api/analytics' + req.path.replace('/api/analytics', ''))
})

router.get('/api/achievements/*', requireAuth, (req, res) => {
  res.redirect('/api/achievements' + req.path.replace('/api/achievements', ''))
})

router.get('/api/collaboration/*', requireAuth, (req, res) => {
  res.redirect('/api/collaboration' + req.path.replace('/api/collaboration', ''))
})

router.get('/api/docs/*', requireAuth, (req, res) => {
  res.redirect('/api/docs' + req.path.replace('/api/docs', ''))
})

module.exports = router
