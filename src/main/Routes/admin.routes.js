const express = require('express')
const path = require('path')
const AdminController = require('../controller/admin.controller')

const router = express.Router()

// Serve admin panel
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'))
})

// Admin panel route - Protected for admin users only
router.get('/admin-panel', (req, res) => {
  if (req.session.authenticated && req.session.user && req.session.user.role === 'admin') {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'))
  } else {
    res.redirect('/Account/Admin/login')
  }
})

// API routes for admin functionality
router.get('/dashboard', AdminController.dashboard)
router.get('/users', AdminController.getUsers)
router.post('/users', AdminController.createUser)
router.put('/users/:id', AdminController.updateUser)
router.delete('/users/:id', AdminController.deleteUser)
router.get('/services', AdminController.getServices)
router.put('/services/:id/status', AdminController.updateServiceStatus)
router.get('/logs', AdminController.getSystemLogs)
router.put('/settings', AdminController.updateSettings)
router.post('/backup', AdminController.createBackup)
router.get('/analytics', AdminController.getAnalytics)
router.post('/login', AdminController.adminLogin)
router.post('/logout', AdminController.adminLogout)

module.exports = router
