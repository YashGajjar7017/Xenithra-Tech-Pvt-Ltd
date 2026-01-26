const rootDir = require('../util/path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')

const users = [
  {
    id: 1,
    username: 'user1',
    password: '$2a$10$I1k7ygOd1pv3zQy3Bz9mO0R6qAZ8Vs35Irm6mkvq2NesocTBqzL6C' // hashed 'password123'
  }
]

// Dashboard
exports.Dashboard = (req, res, next) => {
  if (req.session.authenticated && req.session.user) {
    // Get user role with fallback to 'user' if not set
    const userRole = req.session.user.role || 'user'

    console.log(`User Dashboard accessed by: ${req.session.user.username}, Role: ${userRole}`)

    // Redirect admins and users to explicit role-based endpoints under /Account/Dashboard
    if (userRole === 'admin') {
      console.log('Admin detected, redirecting to /Account/Dashboard/admin')
      res.redirect('/Account/Dashboard/admin')
      return
    }

    if (userRole === 'user') {
      console.log('Regular user detected, redirecting to /Account/Dashboard/user')
      res.redirect('/Account/Dashboard/user')
      return
    }

    // Unknown role: show error guidance
    console.warn('Regular Dashboard access with unknown role:', userRole)
    res.sendFile(path.join(rootDir, 'views', 'Dashboard_error.html'))
  } else {
    // Redirect to login if not authenticated
    res.redirect('/Account/login/')
  }
}

// regeister user
exports.registerUser = async (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', '/Services/UserProfile.ejs'))
}
