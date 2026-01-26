const express = require('express')
const router = express.Router()

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/Account/Admin/login')
  }
  next()
}

// Snippets dashboard
router.get('/', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/snippets.html'))
})

// Create new snippet page
router.get('/create', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/create-snippet.html'))
})

// Edit snippet page
router.get('/:id/edit', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/edit-snippet.html'))
})

// View snippet page
router.get('/:id', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/snippet-detail.html'))
})

// Public snippets page
router.get('/public/browse', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/public-snippets.html'))
})

// API proxy routes for snippets
router.get('/api/snippets', requireAuth, (req, res) => {
  res.redirect(
    '/api/snippets' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.get('/api/snippets/public', (req, res) => {
  res.redirect(
    '/api/snippets/public' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.post('/api/snippets', requireAuth, (req, res) => {
  res.redirect('/api/snippets')
})

router.get('/api/snippets/:id', requireAuth, (req, res) => {
  res.redirect(`/api/snippets/${req.params.id}`)
})

router.put('/api/snippets/:id', requireAuth, (req, res) => {
  res.redirect(`/api/snippets/${req.params.id}`)
})

router.delete('/api/snippets/:id', requireAuth, (req, res) => {
  res.redirect(`/api/snippets/${req.params.id}`)
})

router.post('/api/snippets/:id/fork', requireAuth, (req, res) => {
  res.redirect(`/api/snippets/${req.params.id}/fork`)
})

router.post('/api/snippets/:id/like', requireAuth, (req, res) => {
  res.redirect(`/api/snippets/${req.params.id}/like`)
})

router.get('/api/snippets/stats/overview', requireAuth, (req, res) => {
  res.redirect('/api/snippets/stats/overview')
})

router.get('/api/snippets/tags/popular', requireAuth, (req, res) => {
  res.redirect('/api/snippets/tags/popular')
})

router.get('/api/snippets/languages', requireAuth, (req, res) => {
  res.redirect('/api/snippets/languages')
})

module.exports = router
