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
app.post('/api/run', (req, res) => {
  const { lang, code, args } = req.body

  if (!code) {
    return res.status(400).json({ success: false, output: 'No code provided.' })
  }

  const tempDir = path.join(__dirname, 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const fileId = Date.now() + '_' + Math.floor(Math.random() * 1000)
  
  let ext = 'txt'
  let runCmd = ''
  let compileCmd = ''
  let sourceFile = ''
  let binaryFile = ''

  const escapedArgs = args ? ' ' + args : ''

  switch (lang) {
    case 'Node.js':
      ext = 'js'
      sourceFile = path.join(tempDir, `run_${fileId}.js`)
      runCmd = `node "${sourceFile}"${escapedArgs}`
      break
    case 'Python 3':
      ext = 'py'
      sourceFile = path.join(tempDir, `run_${fileId}.py`)
      runCmd = `python "${sourceFile}"${escapedArgs}`
      break
    case 'C (GCC)':
      ext = 'c'
      sourceFile = path.join(tempDir, `run_${fileId}.c`)
      binaryFile = path.join(tempDir, `run_${fileId}.exe`)
      compileCmd = `gcc "${sourceFile}" -o "${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'C++ (G++)':
      ext = 'cpp'
      sourceFile = path.join(tempDir, `run_${fileId}.cpp`)
      binaryFile = path.join(tempDir, `run_${fileId}.exe`)
      compileCmd = `g++ "${sourceFile}" -o "${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'Dot Net':
      ext = 'cs'
      sourceFile = path.join(tempDir, `run_${fileId}.cs`)
      binaryFile = path.join(tempDir, `run_${fileId}.exe`)
      compileCmd = `csc "${sourceFile}" /out:"${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'Dart':
      ext = 'dart'
      sourceFile = path.join(tempDir, `run_${fileId}.dart`)
      runCmd = `dart "${sourceFile}"${escapedArgs}`
      break
    case 'XML':
      return res.json({
        success: true,
        output: 'XML syntax validated successfully!\n(No execution environment needed for static XML)'
      })
    case 'Next.js':
      ext = 'js'
      sourceFile = path.join(tempDir, `run_${fileId}.js`)
      runCmd = `node "${sourceFile}"${escapedArgs}`
      break
    default:
      return res.status(400).json({ success: false, output: `Unsupported language: ${lang}` })
  }

  // Write source code
  try {
    fs.writeFileSync(sourceFile, code, 'utf8')
  } catch (err) {
    return res.status(500).json({ success: false, output: `Failed to create source file: ${err.message}` })
  }

  const cleanup = () => {
    try {
      if (sourceFile && fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile)
      if (binaryFile && fs.existsSync(binaryFile)) fs.unlinkSync(binaryFile)
    } catch (err) {
      // Ignored
    }
  }

  const executeCode = () => {
    exec(runCmd, { timeout: 8000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
      cleanup()
      if (runErr && runErr.killed) {
        return res.json({ success: false, output: '[ERROR] Process execution timed out (8 seconds limit).' })
      }
      const output = runStdout + runStderr
      res.json({
        success: !runErr,
        output: output || 'Process finished with no output.'
      })
    })
  }

  if (compileCmd) {
    // Compile first
    exec(compileCmd, { timeout: 5000 }, (compErr, compStdout, compStderr) => {
      if (compErr) {
        cleanup()
        const compileOutput = compStdout + compStderr
        return res.json({
          success: false,
          output: `[COMPILATION ERROR]\n${compileOutput || compErr.message}\nMake sure compilers (gcc/g++/csc) are installed and added to PATH.`
        })
      }
      executeCode()
    })
  } else {
    executeCode()
  }
})

// Compile & package binary file download endpoint
app.post('/api/package', (req, res) => {
  const { lang, code, filename } = req.body
  if (!code) {
    return res.status(400).json({ success: false, output: 'No code provided.' })
  }

  const fileId = uuidv4()
  const baseName = filename ? path.basename(filename, path.extname(filename)) : 'compiled_pkg'
  let compileCmd = ''
  let sourceFile = ''
  let binaryFile = ''

  switch (lang) {
    case 'C (GCC)':
      sourceFile = path.join(tempDir, `${baseName}_${fileId}.c`)
      binaryFile = path.join(tempDir, `${baseName}.exe`)
      compileCmd = `gcc "${sourceFile}" -o "${binaryFile}"`
      break
    case 'C++ (G++)':
      sourceFile = path.join(tempDir, `${baseName}_${fileId}.cpp`)
      binaryFile = path.join(tempDir, `${baseName}.exe`)
      compileCmd = `g++ "${sourceFile}" -o "${binaryFile}"`
      break
    case 'Dot Net':
      sourceFile = path.join(tempDir, `${baseName}_${fileId}.cs`)
      binaryFile = path.join(tempDir, `${baseName}.exe`)
      compileCmd = `csc "${sourceFile}" /out:"${binaryFile}"`
      break
    default:
      return res.status(400).json({ success: false, output: 'Packaging is only supported for C, C++, and .NET/C#.' })
  }

  try {
    fs.writeFileSync(sourceFile, code, 'utf8')
  } catch (err) {
    return res.status(500).json({ success: false, output: `Failed to create source file: ${err.message}` })
  }

  const cleanup = () => {
    try {
      if (sourceFile && fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile)
    } catch (e) {}
  }

  exec(compileCmd, { timeout: 8000 }, (compErr, compStdout, compStderr) => {
    cleanup()
    if (compErr) {
      const compileOutput = compStdout + compStderr
      return res.json({
        success: false,
        output: `[COMPILATION ERROR]\n${compileOutput || compErr.message}\nMake sure compilers (gcc/g++/csc) are installed.`
      })
    }

    if (fs.existsSync(binaryFile)) {
      res.download(binaryFile, `${baseName}.exe`, (err) => {
        try {
          if (fs.existsSync(binaryFile)) fs.unlinkSync(binaryFile)
        } catch (e) {}
        if (err) {
          console.error('[main/api] Package download failed:', err.message)
        }
      })
    } else {
      res.status(500).json({ success: false, output: 'Compiled binary not found.' })
    }
  })
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
  const bindHost = process.env.API_BIND_HOST || '0.0.0.0'
  const server = app.listen(port, bindHost, () => {
    console.log(`[main/api] Express server listening on http://${bindHost}:${port}`)
    process.env.API_PORT = port // Save successfully bound port
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[main/api] Port ${port} in use, trying next port...`)
      const nextPort = parseInt(port) + 1
      start(nextPort)
    } else {
      console.error('[main/api] Server error:', err)
    }
  })

  return server
}
