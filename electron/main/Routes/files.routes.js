const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')

// Configure multer for file uploads (frontend proxy)
const storage = multer.memoryStorage() // Store in memory for proxying
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
})

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/Account/Admin/login')
  }
  next()
}

// File manager page
router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/files.html'))
})

// Upload page
router.get('/upload', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/upload.html'))
})

// File details page
router.get('/:filename', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/file-detail.html'))
})

// API proxy routes for file operations
router.get('/api/files', requireAuth, (req, res) => {
  // This will be handled by the proxy middleware in index.js
  res.redirect(
    '/api/files' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  )
})

router.post('/api/files/upload', requireAuth, upload.single('file'), (req, res) => {
  // Forward to backend API
  res.redirect('/api/files/upload')
})

router.post('/api/files/upload-multiple', requireAuth, upload.array('files', 5), (req, res) => {
  res.redirect('/api/files/upload-multiple')
})

router.get('/api/files/download/:filename', requireAuth, (req, res) => {
  res.redirect(`/api/files/download/${req.params.filename}`)
})

router.delete('/api/files/:filename', requireAuth, (req, res) => {
  res.redirect(`/api/files/${req.params.filename}`)
})

router.post('/api/files/:filename/duplicate', requireAuth, (req, res) => {
  res.redirect(`/api/files/${req.params.filename}/duplicate`)
})

router.get('/api/files/stats/overview', requireAuth, (req, res) => {
  res.redirect('/api/files/stats/overview')
})

module.exports = router
