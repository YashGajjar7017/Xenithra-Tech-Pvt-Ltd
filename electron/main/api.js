import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { exec } from 'child_process'
import fs from 'fs'
import { signUpUser, authenticateUser } from './Services/db.service.js'
import { runCode, packageCode } from './compiler-engine/compiler.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const app = express()

// Middlewares
app.use(express.json())
app.use(cookieParser())
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
app.use('/static', express.static(path.join(__dirname, '../../Public')))

// Log CSS/static requests for debugging
app.use((req, res, next) => {
  if (req.path && req.path.indexOf('/css/') === 0) {
    console.debug('[main/api] Static CSS request:', req.path)
  }
  next()
})

// Legacy express view routes are bypassed in the React SPA build

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', pid: process.pid })
})

// Basic Login route with local DB fallback
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Username and password required' })
  }

  try {
    const user = await authenticateUser(email, password)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Password or email/username is wrong.' })
    }

    req.session.user = user
    res.json({ message: 'Login successful', user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: err.message || 'Internal server error during login' })
  }
})

// Basic Signup route with local DB fallback
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    const user = await signUpUser(username, email, password)
    req.session.user = user
    res.json({ message: 'Signup successful', user })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(400).json({ message: err.message || 'Error occurred during signup' })
  }
})

// Code Compilation & Execution Engine
app.post('/api/run', async (req, res) => {
  const { lang, code, args } = req.body
  try {
    const result = await runCode(lang, code, args)
    res.json(result)
  } catch (err) {
    console.error('Run route error:', err)
    res.status(500).json({ success: false, output: `Internal execution engine error: ${err.message}` })
  }
})

// Compile & package binary file download endpoint
app.post('/api/package', async (req, res) => {
  const { lang, code, filename } = req.body
  try {
    const result = await packageCode(lang, code, filename)
    if (!result.success) {
      return res.status(400).json(result)
    }
    
    // Download the compiled executable
    res.download(result.binaryFile, `${result.baseName}.exe`, (err) => {
      try {
        if (fs.existsSync(result.binaryFile)) {
          fs.unlinkSync(result.binaryFile)
        }
      } catch (e) {
        // Ignored
      }
      if (err) {
        console.error('[main/api] Package download failed:', err.message)
      }
    })
  } catch (err) {
    console.error('Package route error:', err)
    res.status(500).json({ success: false, output: `Internal packaging engine error: ${err.message}` })
  }
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

export function start(port = process.env.API_PORT || 8000) {
  return new Promise((resolve) => {
    const bindHost = process.env.API_BIND_HOST || '0.0.0.0'
    const server = app.listen(port, bindHost, () => {
      console.log(`[main/api] Express server listening on http://${bindHost}:${port}`)
      process.env.API_PORT = port // Save successfully bound port
      resolve(server)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[main/api] Port ${port} in use, trying next port...`)
        const nextPort = parseInt(port) + 1
        resolve(start(nextPort))
      } else {
        console.error('[main/api] Server error:', err)
        resolve(server)
      }
    })
  })
}
