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
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'novaglass_local_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
