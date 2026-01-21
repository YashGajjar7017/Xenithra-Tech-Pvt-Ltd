const express = require('express')
const router = express.Router()

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/Account/Admin/login')
  }
  next()
}

// Projects dashboard
router.get('/', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/projects.html'))
})

// Create new project page
router.get('/create', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/create-project.html'))
})

// Edit project page
router.get('/:id/edit', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/edit-project.html'))
})

// Project details page
router.get('/:id', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/project-detail.html'))
})

// Public projects page
router.get('/public/browse', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/public-projects.html'))
})

// Project members page
router.get('/:id/members', requireAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/project-members.html'))
})

// API proxy routes for projects
router.get('/api/projects', requireAuth, (req, res) => {
  res.redirect(
    '/api/projects' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.get('/api/projects/public', (req, res) => {
  res.redirect(
    '/api/projects/public' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.post('/api/projects', requireAuth, (req, res) => {
  res.redirect('/api/projects')
})

router.get('/api/projects/:id', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}`)
})

router.put('/api/projects/:id', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}`)
})

router.delete('/api/projects/:id', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}`)
})

router.post('/api/projects/:id/members', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}/members`)
})

router.delete('/api/projects/:id/members/:memberId', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}/members/${req.params.memberId}`)
})

router.post('/api/projects/:id/fork', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}/fork`)
})

router.post('/api/projects/:id/star', requireAuth, (req, res) => {
  res.redirect(`/api/projects/${req.params.id}/star`)
})

router.get('/api/projects/stats/overview', requireAuth, (req, res) => {
  res.redirect('/api/projects/stats/overview')
})

router.get('/api/projects/languages', requireAuth, (req, res) => {
  res.redirect('/api/projects/languages')
})

module.exports = router
