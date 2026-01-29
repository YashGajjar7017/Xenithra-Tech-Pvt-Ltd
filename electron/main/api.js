const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middlewares
app.use(express.json())
app.use(cookieParser())
// Enable CORS so renderer can call the API at http://localhost:PORT
app.use(cors())

// Enhanced session configuration for persistent login
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'novaglass_local_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true, // Prevent client-side JS from accessing session cookie
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    },
    name: 'xenithra.session' // Custom session cookie name
  })
)

// Serve the Public folder at root so requests to /css/* work in dev and packaged apps
app.use('/', express.static(path.join(__dirname, '../../Public')))
// Keep /static for backwards compatibility
app.use('/static', express.static(path.join(__dirname, '../../Public')))

// Log CSS/static requests for debugging
app.use((req, res, next) => {
  if (req.path && req.path.indexOf('/css/') === 0) {
    console.debug('[main/api] Static CSS request:', req.path)
  }
  next()
})

// Mount important routes (add more as needed)
try {
  const accountRoutes = require('./Routes/Account.routes')
  app.use('/api', accountRoutes)
} catch (err) {
  console.warn('Failed to load Account routes:', err.message)
}

// Attach more core routes if available
;['login.routes', 'User.routes', 'signup.routes', 'Session.routes', 'Member.routes'].forEach(
  (r) => {
    try {
      const routeModule = require(`./Routes/${r}`)
      app.use('/api', routeModule)
    } catch (err) {
      // non-critical - just warn
      console.debug(`[main/api] optional route ${r} not loaded:`, err.message)
    }
  }
)

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', pid: process.pid })
})

// Basic Login route (demo - no real auth)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  // Demo: simple validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password too short' })
  }

  // Mock user for demo
  const user = {
    id: 1,
    username: email.split('@')[0],
    email: email
  }

  req.session.user = user
  res.json({ message: 'Login successful', user })
})

// Basic Signup route (demo - no real auth)
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  // Mock user for demo
  const user = {
    id: Math.random(),
    username: username,
    email: email
  }

  req.session.user = user
  res.json({ message: 'Signup successful', user })
})

// Fallback route for CSS (explicit) to help packaged app lookups
app.get('/css/:file', (req, res, next) => {
  const fileName = req.params.file
  const filePath = path.join(__dirname, '../../Public', 'css', fileName)
  res.sendFile(filePath, (err) => {
    if (err) {
      console.warn('[main/api] CSS fallback failed:', filePath, err && err.message)
      next()
    }
  })
})

function start(port = process.env.API_PORT || 8000) {
  const bindHost = process.env.API_BIND_HOST || '0.0.0.0'
  const server = app.listen(port, bindHost, () => {
    console.log(`[main/api] Express server listening on http://${bindHost}:${port}`)
  })

  server.on('error', (err) => {
    console.error('[main/api] Server error:', err)
  })

  return server
}

module.exports = { start, app }
