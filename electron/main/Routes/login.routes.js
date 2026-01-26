const express = require('express')
const loginRoute = require('../controller/login.controller')
const bodyParser = require('body-parser')

const app = express.Router()
app.use(bodyParser.json())

// Login routes - aligned with backend API
app.get('/login', loginRoute.userIDGenerator)
app.get('/Account/login', (req, res) => {
  // Redirect to login page generation
  res.redirect('/login')
})
// Serve a lightweight overlay-login page (no generated token required)
app.get('/login-overlay', loginRoute.GetLoginOverlay)
app.get('/login/:usrID', loginRoute.Getlogin)
app.post('/login', loginRoute.Postlogin)
app.post('/auth/:usr/:pass/:auth', loginRoute.AuthUser)
app.get('/loginID/:loginID', loginRoute.loginID)
app.get('/logout', loginRoute.logout)
app.get('/Account/logout', loginRoute.logout) // Alternative logout path
app.get('/check-auth', loginRoute.checkAuth)
app.post('/refresh-token', loginRoute.refreshToken)

// Quick sign-in for local testing
app.get('/quick-signin', loginRoute.quickSignin)

// Forgot password
app.get('/forgotPassword', loginRoute.forgotPass)

module.exports = app
