const express = require('express')
const path = require('path')
const userController = require('../controller/user.controller')

const app = express.Router()

// Primary Dashboard entry (keeps backward compatibility)
app.get('/Dashboard', userController.Dashboard)

// Explicit role-based dashboard endpoints
app.get('/Dashboard/user', (req, res) => {
  try {
    if (!req.session?.authenticated) return res.redirect('/Account/login')
    const role = req.session.user?.role
    if (role === 'user') {
      return res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'))
    }
    if (role === 'admin') {
      // Admin accidentally hit user endpoint - redirect to admin dashboard
      return res.redirect('/Account/Dashboard/admin')
    }
    return res.sendFile(path.join(__dirname, '../views/Dashboard_error.html'))
  } catch (err) {
    console.error('Error serving /Account/Dashboard/user', err)
    res.status(500).send('Internal server error')
  }
})

app.get('/Dashboard/admin', (req, res) => {
  try {
    if (!req.session?.authenticated) return res.redirect('/Account/login')
    const role = req.session.user?.role
    if (role === 'admin') {
      return res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'))
    }
    if (role === 'user') {
      // User accidentally hit admin endpoint - redirect to user dashboard
      return res.redirect('/Account/Dashboard/user')
    }
    return res.sendFile(path.join(__dirname, '../views/Dashboard_error.html'))
  } catch (err) {
    console.error('Error serving /Account/Dashboard/admin', err)
    res.status(500).send('Internal server error')
  }
})

app.get('/UserProfile', userController.registerUser)

module.exports = app

// Membership page route
app.get('/membership', (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, '../views/membership.html'))
  } catch (err) {
    console.error('Error serving /membership', err)
    res.status(500).send('Internal server error')
  }
})
