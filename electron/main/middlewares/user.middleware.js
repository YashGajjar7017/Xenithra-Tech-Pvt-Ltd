const express = require('express')

const app = express.Router()

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization === 'Bearer mysecrettoken') {
    next() // Continue to the next middleware/route if authenticated
  } else {
    res.status(401).json({ message: 'Unauthorized' }) // Send an error if not authenticated
  }
}

// Protecting a route with authentication middleware
app.get('/secure-data', isAuthenticated, (req, res) => {
  res.json({ message: 'This is protected data.' })
})

module.exports = app
