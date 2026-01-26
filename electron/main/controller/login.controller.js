const path = require('path')
const bcrypt = require('bcryptjs')
const rootDir = require('../util/path')
const axios = require('axios')
const session = require('express-session')

// API configuration - use absolute URL for server-side axios requests
const API_BASE_URL = 'http://localhost:8000/api'
const BACKEND_PORT = process.env.BACKEND_PORT || 8000

// token class
function AlphaNumericGenerator(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let TokenPass = ''
  for (let i = 0; i < length; i++) {
    TokenPass += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return TokenPass
}

// Save token to MongoDB with timeout handling
async function saveTokenToDB(token, userId = null, sessionId = null, purpose = 'temp_session') {
  try {
    const Token = require('../../Backend/models/Token.model')

    // Set a timeout for the save operation
    const savePromise = new Token({
      token,
      userId,
      sessionId,
      purpose,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }).save()

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token save timeout')), 10000) // 10 second timeout
    })

    const newToken = await Promise.race([savePromise, timeoutPromise])
    console.log(`Token saved to DB: ${token.substring(0, 10)}...`)
    return newToken
  } catch (error) {
    console.error('Error saving token to DB:', error)
    // Don't throw error, just log it to prevent blocking the login flow
    return null
  }
}

// Fetch_Function: Updated to use proper API endpoints
async function FetchData(endpoint, data, headers = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
    const url = `${API_BASE_URL}/${endpoint}`
    console.log(`FetchData: Making request to ${url}`)
    console.log(`FetchData: Request data:`, data)

    const response = await axios.post(url, data, config)

    console.log(`FetchData: Response status:`, response.status)
    console.log(`FetchData: Response data:`, response.data)

    return response.data
  } catch (error) {
    console.error('API Error - Status:', error.response?.status)
    console.error('API Error - Data:', error.response?.data)
    console.error('API Error - Message:', error.message)
    throw error
  }
}

// Fetching Userdata from files:
exports.userIDGenerator = async (req, res, next) => {
  try {
    const token = AlphaNumericGenerator(15)
    // Save token to session only (skip DB save to avoid timeout issues)
    req.session.tempToken = token
    // await saveTokenToDB(token, null, null, 'temp_session'); // Temporarily disabled
    console.log(`Generated temp token: ${token}`)
    res.redirect(`/Account/login/${token}`)
  } catch (error) {
    console.error('Error generating user ID:', error)
    res.status(500).json({ success: false, message: 'Failed to generate user ID' })
  }
}

// Login - Serve login page
exports.Getlogin = async (req, res, next) => {
  const token = req.params.usrID
  res.status(200)
  res.cookie('session_id', token)
  res.setHeader('Content-Type', 'text/html')

  if (token.length === 15) {
    res.sendFile(path.join(__dirname, '../views', 'login.html'))
  } else {
    res.redirect('/404')
  }
}

// Serve the overlay variant of the login page
exports.GetLoginOverlay = (req, res, next) => {
  try {
    res.status(200)
    res.setHeader('Content-Type', 'text/html')
    res.sendFile(path.join(__dirname, '../views', 'login_overlay.html'))
  } catch (err) {
    console.error('Error serving login overlay:', err)
    res.redirect('/404')
  }
}

// Login Post - Use backend API for proper authentication
exports.Postlogin = async (req, res) => {
  const { username, password } = req.body

  console.log('=== FRONTEND LOGIN REQUEST ===')
  console.log('Username:', username)
  console.log('Timestamp:', new Date().toISOString())

  if (!username || !password) {
    console.log('Missing username or password')
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    })
  }

  try {
    console.log('Calling backend API for authentication...')
    // Call backend login API
    const response = await FetchData('login', { username, password })

    console.log('Backend response received:', response)

    if (response.success) {
      // Set session data
      req.session.authenticated = true
      req.session.user = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        token: response.token
      }

      console.log('Session set for user:', username)

      // Save auth token to MongoDB (with timeout handling)
      try {
        await saveTokenToDB(response.token, response.user.id, null, 'auth_token')
      } catch (tokenError) {
        console.warn('Token save failed, continuing with login:', tokenError.message)
      }

      // Set token in cookie for client-side access
      res.cookie('auth_token', response.token, {
        httpOnly: false, // Allow client-side access
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })

      const responseData = {
        success: true,
        message: 'Login successful',
        user: req.session.user,
        token: response.token
      }

      console.log('=== SENDING LOGIN RESPONSE ===')
      console.log('Response:', responseData)
      res.json(responseData)
    } else {
      console.log('Backend authentication failed:', response.message)
      res.status(401).json({
        success: false,
        message: response.message || 'Login failed'
      })
    }
  } catch (error) {
    console.error('Login error:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    })
  }
}

// user Content - Updated authentication flow
exports.AuthUser = (req, res, next) => {
  const { usr, pass, auth } = req.params

  if (auth === 'true') {
    res.redirect('/loginID=True')
    console.log('Login successful for user:', usr)
  } else {
    res.redirect('/loginID=False')
    console.log('Login failed for user:', usr)
  }
}

// loginID - Updated response
exports.loginID = (req, res, next) => {
  const { loginID } = req.params
  console.log('Login attempt with ID:', loginID)
  res.json({
    success: true,
    loginID: loginID,
    message: 'Login ID processed'
  })
}

// logout - Updated to use backend API
exports.logout = async (req, res, next) => {
  try {
    const token = req.session?.user?.token

    if (token) {
      // Deactivate token in MongoDB
      const Token = require('../../Backend/models/Token.model')
      await Token.findOneAndUpdate({ token }, { isActive: false }, { new: true })

      await FetchData(
        'auth/logout',
        {},
        {
          Authorization: `Bearer ${token}`
        }
      )
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err)
      }
      res.clearCookie('auth_token')
      res.redirect('/')
    })
  } catch (e) {
    console.log(`Logout error: ${e}`)
    req.session.destroy(() => {
      res.clearCookie('auth_token')
      res.redirect('/')
    })
  }
}

// Forgot password - Updated flow
exports.forgotPass = (req, res, next) => {
  const OTP = req.params.OTP
  res.sendFile(path.join(rootDir, 'views', '/forgotPassword.html'))

  if (OTP) {
    setTimeout(() => {
      res.redirect(`/otp`)
    }, 10000)
  } else {
    console.error('OTP not provided')
  }
}

// Utility functions
exports.checkAuth = (req, res) => {
  if (req.session.authenticated && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    })
  } else {
    res.json({
      authenticated: false
    })
  }
}

exports.refreshToken = async (req, res) => {
  const { token } = req.body

  try {
    const response = await FetchData('auth/refresh-token', { token })
    res.json(response)
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalid or expired'
    })
  }
}

// Quick sign-in helper for local testing only
// Usage: GET /Account/quick-signin?role=admin OR ?role=user
exports.quickSignin = (req, res) => {
  try {
    const role = req.query.role === 'admin' ? 'admin' : 'user'
    // Create a minimal demo user session
    req.session.authenticated = true
    req.session.user = {
      id: role === 'admin' ? 'demo-admin' : 'demo-user',
      username: role === 'admin' ? 'admin_demo' : 'user_demo',
      email: role === 'admin' ? 'admin@example.local' : 'user@example.local',
      role: role,
      token: 'demo-token-12345'
    }

    // Set cookies so frontend JS sees username/role
    res.cookie('username', req.session.user.username, { path: '/', maxAge: 24 * 60 * 60 * 1000 })
    res.cookie('role', role, { path: '/', maxAge: 24 * 60 * 60 * 1000 })
    res.cookie('auth_token', req.session.user.token, { path: '/', maxAge: 24 * 60 * 60 * 1000 })

    console.log('Quick sign-in created for role:', role)
    return res.redirect('/Account/Dashboard')
  } catch (err) {
    console.error('Quick signin error:', err)
    return res.status(500).send('Quick signin failed')
  }
}
