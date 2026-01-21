const express = require('express')
const router = express.Router()

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/Account/Admin/login')
  }
  next()
}

// Get notifications page
router.get('/', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/notifications.html'))
})

// Get notification details page
router.get('/:id', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/notification-detail.html'))
})

// API proxy routes for notifications (these will be proxied to backend)
router.get('/api/notifications', requireAuth, (req, res) => {
  // This will be handled by the proxy middleware in index.js
  res.redirect(
    '/api/notifications' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.post('/api/notifications', requireAuth, (req, res) => {
  res.redirect('/api/notifications')
})

router.put('/api/notifications/:id/read', requireAuth, (req, res) => {
  res.redirect(`/api/notifications/${req.params.id}/read`)
})

router.put('/api/notifications/read-all', requireAuth, (req, res) => {
  res.redirect('/api/notifications/read-all')
})

router.delete('/api/notifications/:id', requireAuth, (req, res) => {
  res.redirect(`/api/notifications/${req.params.id}`)
})

module.exports = router
