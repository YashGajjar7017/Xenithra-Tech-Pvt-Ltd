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
import os from 'os'
import { signUpUser, authenticateUser } from './Services/db.service.js'
import { runCode, packageCode } from './code-runner/runner.js'
import {
  compileCToDll,
  getSessionDownloadFile,
  cleanupSession
} from './Services/dllCompiler.service.js'

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
      return res
        .status(401)
        .json({ message: 'Invalid credentials. Password or email/username is wrong.' })
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

// GitHub OAuth routes
app.get('/api/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `http://localhost:${process.env.API_PORT || 8000}/api/auth/github/callback`
  if (!clientId) {
    // If not configured, return a simulated OAuth success for testing/fallback
    console.warn('[api] GITHUB_CLIENT_ID not set, redirecting to mock OAuth success callback.')
    return res.redirect(`/api/auth/github/callback?code=mock_code`)
  }
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
  res.redirect(url)
})

app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query
  if (!code) {
    return res.status(400).send('Authorization code missing')
  }

  try {
    let username = 'github_user'
    let email = 'github@domain.com'

    if (code === 'mock_code' || !process.env.GITHUB_CLIENT_ID) {
      // Mock OAuth fallback
      username = 'github_dev'
      email = 'dev@github.com'
    } else {
      // Exchange code for token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      })
      const tokenData = await tokenRes.json()
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error)
      }
      
      const token = tokenData.access_token

      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Xenithra-IDE' }
      })
      const userData = await userRes.json()
      username = userData.login

      // Fetch user email
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Xenithra-IDE' }
      })
      const emailsData = await emailsRes.json()
      const primaryEmailObj = Array.isArray(emailsData) ? emailsData.find(e => e.primary) || emailsData[0] : null
      email = primaryEmailObj ? primaryEmailObj.email : `${username}@github.com`
    }

    // Save/Authenticate in Database
    const { findUser, signUpUser } = await import('./Services/db.service.js')
    let user = await findUser(email)
    if (!user) {
      // Create user if not exists
      user = await signUpUser(username, email, '') // Null/empty password for OAuth users
    }

    // Store session
    req.session.user = user

    // Send token/deep link auth back to Electron App
    res.send(`
      <html>
        <body>
          <script>
            const user = ${JSON.stringify(user)};
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('cloud-sync-enabled', 'true');
            localStorage.setItem('cloud-provider', 'github');
            window.location.href = '/#/';
          </script>
        </body>
      </html>
    `)
  } catch (err) {
    console.error('GitHub callback error:', err)
    res.status(500).send(`Authentication failed: ${err.message}`)
  }
})

// AI Assistant & Troubleshooting Endpoint
app.post('/api/ai/chat', (req, res) => {
  const { prompt, code, lang, filename } = req.body
  const promptLower = (prompt || '').toLowerCase()
  let responseText = ''

  // 1. Language-Specific Troubleshooting Checks
  let troubleshootingNotes = []

  if (code && code.trim()) {
    if (lang === 'C (GCC)' || lang === 'C++ (G++)') {
      if (lang === 'C (GCC)' && !code.includes('#include')) {
        troubleshootingNotes.push(
          '- **Missing Header Warning**: Your C file does not contain any `#include` directives. Consider adding `#include <stdio.h>` to enable standard input/output operations like `printf`.'
        )
      }
      if (lang === 'C++ (G++)' && !code.includes('#include')) {
        troubleshootingNotes.push(
          '- **Missing Header Warning**: Your C++ file does not contain any `#include` directives. Consider adding `#include <iostream>` to use standard streams like `std::cout`.'
        )
      }
      // Check for missing semicolons (basic check on non-empty non-preprocessor/brace/comment lines)
      const lines = code.split('\n')
      let missingSemicolonLines = []
      lines.forEach((line, idx) => {
        const trimmed = line.trim()
        if (
          trimmed &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('//') &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          !trimmed.startsWith('if') &&
          !trimmed.startsWith('for') &&
          !trimmed.startsWith('while') &&
          !trimmed.startsWith('else') &&
          !trimmed.includes('main')
        ) {
          missingSemicolonLines.push(idx + 1)
        }
      })
      if (missingSemicolonLines.length > 0) {
        troubleshootingNotes.push(
          `- **Potential Missing Semicolon**: Lines ${missingSemicolonLines.slice(0, 3).join(', ')}${missingSemicolonLines.length > 3 ? '...' : ''} seem to be missing a terminal semicolon (\`;\`).`
        )
      }
      if (!code.includes('main')) {
        troubleshootingNotes.push(
          '- **Entrypoint Missing**: Could not find a `main` function. C/C++ runtimes require `int main()` as their starting execution point.'
        )
      }
    } else if (lang === 'Python 3') {
      // Check colon after def/if/for/while/class
      const lines = code.split('\n')
      let missingColonLines = []
      lines.forEach((line, idx) => {
        const trimmed = line.trim()
        if (
          (trimmed.startsWith('def ') ||
            trimmed.startsWith('if ') ||
            trimmed.startsWith('elif ') ||
            trimmed.startsWith('else:') ||
            trimmed.startsWith('for ') ||
            trimmed.startsWith('while ') ||
            trimmed.startsWith('class ')) &&
          !trimmed.endsWith(':')
        ) {
          missingColonLines.push(idx + 1)
        }
      })
      if (missingColonLines.length > 0) {
        troubleshootingNotes.push(
          `- **Python Syntax Check**: Lines ${missingColonLines.join(', ')} start a block statement but do not end with a colon (\`:\`).`
        )
      }
      // Check tabs vs spaces
      if (code.includes('\t') && code.includes('    ')) {
        troubleshootingNotes.push(
          '- **Mixed Indentation warning**: Your Python script contains both literal Tab characters and space blocks. This commonly causes `TabError` or `IndentationError` when executed.'
        )
      }
    } else if (lang === 'Node.js' || lang === 'Next.js') {
      // Match braces count
      const openBraces = (code.match(/\{/g) || []).length
      const closeBraces = (code.match(/\}/g) || []).length
      if (openBraces !== closeBraces) {
        troubleshootingNotes.push(
          `- **Mismatched Braces**: Found ${openBraces} opening curly braces \`{\` but ${closeBraces} closing curly braces \`}\`. This will throw a syntax error.`
        )
      }
      const openParen = (code.match(/\(/g) || []).length
      const closeParen = (code.match(/\)/g) || []).length
      if (openParen !== closeParen) {
        troubleshootingNotes.push(
          `- **Mismatched Parentheses**: Found ${openParen} opening parentheses \`(\` but ${closeParen} closing parentheses \`)\`.`
        )
      }
    }
  }

  // 2. Keyword Responses
  if (
    promptLower.includes('help') ||
    promptLower.includes('troubleshoot') ||
    promptLower.includes('debug') ||
    promptLower.includes('error')
  ) {
    if (troubleshootingNotes.length > 0) {
      responseText = `### 🔍 Code Diagnostics & Troubleshooting for \`${filename || 'Active File'}\`\n\nI inspected your code and found the following items that might be causing compiler errors:\n\n${troubleshootingNotes.join('\n')}\n\n**Troubleshooting Checklist:**\n1. Ensure the required compiler/runtime (e.g. GCC for C, Python 3 for Python, Node for JS) is installed on your machine and added to your environment **PATH**.\n2. Verify the selected Environment in the toolbar matches the active file type.\n3. Make sure all imports and dependencies are locally installed in the workspace.`
    } else {
      responseText = `### 🛠️ Workspace Troubleshooter & Diagnostics\n\nNo immediate syntax warnings were identified in the active \`${lang}\` file. \n\n**Here are standard checks to resolve execution issues:**\n- Check if the terminal reports a specific file path or exit code.\n- If using **C/C++**, verify that \`gcc\` or \`g++\` is working by typing \`gcc --version\` in your local command prompt.\n- If using **Python**, make sure you selected \`Python 3\` from the environment selection dropdown in the navbar.\n- Check if your code relies on npm dependencies that need to be installed in the project root.`
    }
  } else if (
    promptLower.includes('extension') ||
    promptLower.includes('plugin') ||
    promptLower.includes('store') ||
    promptLower.includes('xml')
  ) {
    responseText = `### 🧩 Extension Manager & XML Store Helper\n\nYou can click on the puzzle-like **Extension** tab in the activity bar on the far-left to access the Store.\n\n- **Multiple Extensions**: You can install packages like *GitHub Theme Pack*, *Python Linting*, and *DevTools Helper*.\n- **XML Persistence**: The installed profile list is loaded from and stored into a temporary XML configuration file (\`temp_extensions.xml\`). \n- Under the hood, this XML file stores each extension's identifier, name, and active status, which makes it easy to track without setting up full database layers.`
  } else if (promptLower.includes('theme') || promptLower.includes('github')) {
    responseText = `### 🎨 Workspace Themes & GitHub Aesthetic\n\nTo change themes, select the **Theme** option from the main menu bar at the top of the IDE.\n- **GitHub Dark**: We have loaded a theme styled specifically after the official GitHub Dark layout (\`#0d1117\` background, \`#30363d\` borders, and high contrast syntax lighting).\n- **Other Themes**: VS Code Dark, Light Frosted, Neon Violet, Emerald Matrix, and Cyber Amber are also fully supported!`
  } else if (
    promptLower.includes('run') ||
    promptLower.includes('compile') ||
    promptLower.includes('package')
  ) {
    responseText = `### 🚀 Compiling, Running & Packaging Code\n\n- **Run Code**: Click the green Run button (▶) or select **Run -> Run Code** in the menu.\n- **Debug Code**: Click the blue Debug button (🐞) to run with debugger logs.\n- **Stop**: Click the red Stop button (■) to terminate execution.\n- **Package Binary**: Click the package box button (📦) to compile C, C++, or .NET scripts into a standalone executable (\`.exe\`) binary that automatically downloads to your downloads folder.`
  } else if (
    promptLower.includes('hello') ||
    promptLower.includes('hi') ||
    promptLower.includes('hey')
  ) {
    responseText = `### 👋 Welcome to Xenithra AI Assistant!\n\nI am your virtual troubleshooting and code helper. Here is how I can assist you:\n- **Diagnose Errors**: Type "troubleshoot" or "check bugs" to run syntax analysis on your active code.\n- **Extension Store**: Type "extensions" to learn how to add packages from the store.\n- **How to Compile**: Ask about running or packaging standalone binaries.\n\nLet me know if you would like me to explain any part of your code in \`${filename || 'untitled.js'}\`!`
  } else {
    responseText = `### 🤖 Xenithra AI Code Assistant\n\nI analyzed your query: *"${prompt}"*\n\n**Active Environment details:**\n- **Current File**: \`${filename || 'None'}\`\n- **Environment Selected**: \`${lang || 'Node.js'}\`\n\nIf you are having compilation issues, type **troubleshoot** or **help** to run the static syntax validation check on your current editor content. I can also help explain code segments or outline API paths.`
  }

  res.json({ output: responseText })
})

// Code Compilation & Execution Engine
app.post('/api/run', async (req, res) => {
  const { lang, code, args, compilerPaths } = req.body
  try {
    const result = await runCode(lang, code, args, compilerPaths)
    res.json(result)
  } catch (err) {
    console.error('Run route error:', err)
    res
      .status(500)
      .json({ success: false, output: `Internal execution engine error: ${err.message}` })
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
    res
      .status(500)
      .json({ success: false, output: `Internal packaging engine error: ${err.message}` })
  }
})

// MinGW C to DLL Compilation Endpoint
app.post('/api/dll/compile', async (req, res) => {
  const { code, filename, flags, compilerPath } = req.body
  try {
    const result = await compileCToDll({ code, filename, flags, compilerPath })
    res.json(result)
  } catch (err) {
    console.error('[main/api] DLL compilation error:', err)
    res.status(500).json({
      success: false,
      stderr: `Internal DLL compilation error: ${err.message}`,
      stdout: '',
      symbols: []
    })
  }
})

// Download Generated DLL / LIB file
app.get('/api/dll/download/:sessionId/:fileType', (req, res) => {
  const { sessionId, fileType } = req.params
  const fileInfo = getSessionDownloadFile(sessionId, fileType)
  if (!fileInfo) {
    return res.status(404).json({ error: 'Requested binary file not found or expired.' })
  }

  res.download(fileInfo.filePath, fileInfo.filename, (err) => {
    if (err) {
      console.error('[main/api] DLL download error:', err.message)
    }
  })
})

// Clean up session files manually
app.post('/api/dll/cleanup/:sessionId', (req, res) => {
  const { sessionId } = req.params
  cleanupSession(sessionId)
  res.json({ success: true, message: 'Session workspace cleaned up.' })
})

// WebRTC Signaling Session Map
const webrtcSessions = new Map() // roomCode -> { signals: [], hostIps: [], port: number, createdAt: number }

app.post('/api/webrtc/create-room', (req, res) => {
  const roomCode = `RTC-${Math.floor(100000 + Math.random() * 900000)}`
  const port = process.env.API_PORT || 8000

  // Get host IP addresses
  const interfaces = os.networkInterfaces()
  const ips = []
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2]
      if (address.family === 'IPv4' && !address.internal) {
        ips.push(address.address)
      }
    }
  }

  // Create shareable invite token
  const tokenPayload = {
    roomCode,
    ips,
    port: parseInt(port),
    created: Date.now()
  }
  const shareToken = `P2P-TOKEN:${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}`

  webrtcSessions.set(roomCode, {
    signals: [],
    hostIps: ips,
    port: parseInt(port),
    createdAt: Date.now(),
    shareToken
  })

  res.json({
    success: true,
    roomCode,
    ips,
    port: parseInt(port),
    shareToken,
    shareUrl: `http://${ips[0] || 'localhost'}:${port}/#/webrtc?room=${roomCode}`
  })
})

app.post('/api/webrtc/join-token', (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ success: false, error: 'Token is required' })

  try {
    let cleanToken = token.trim()
    if (cleanToken.startsWith('P2P-TOKEN:')) {
      cleanToken = cleanToken.replace('P2P-TOKEN:', '')
    }
    const decoded = JSON.parse(Buffer.from(cleanToken, 'base64').toString('utf-8'))
    return res.json({
      success: true,
      roomCode: decoded.roomCode,
      ips: decoded.ips || [],
      port: decoded.port || 8000
    })
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid or corrupted P2P token' })
  }
})

app.post('/api/webrtc/post-signal', (req, res) => {
  const { roomCode, signal } = req.body
  const session = webrtcSessions.get(roomCode)
  if (!session) return res.status(404).json({ success: false, error: 'Room not found' })
  session.signals.push(signal)
  res.json({ success: true })
})

app.get('/api/webrtc/get-signals', (req, res) => {
  const { roomCode } = req.query
  const session = webrtcSessions.get(roomCode)
  if (!session) return res.status(404).json({ success: false, error: 'Room not found' })
  res.json({ success: true, signals: session.signals })
})

app.post('/api/webrtc/clear-signals', (req, res) => {
  const { roomCode } = req.body
  const session = webrtcSessions.get(roomCode)
  if (session) session.signals = []
  res.json({ success: true })
})

// Multi-Session Handover & Local Network Map
const collaborationSessions = new Map() // token -> { token, id, code, filename, lang, path, ips, createdAt }

// Generate token & start/create session endpoint
app.post('/api/collaborate/start', (req, res) => {
  const { code, filename, lang, path: filePath, sessionId } = req.body
  const token = 'HANDOVER-' + Math.floor(100000 + Math.random() * 900000)
  const id = sessionId || `session_${Date.now()}`

  // Get local IP addresses
  const interfaces = os.networkInterfaces()
  const ips = []
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2]
      if (address.family === 'IPv4' && !address.internal) {
        ips.push(address.address)
      }
    }
  }

  const port = process.env.API_PORT || 8000
  const sessionData = {
    id,
    token,
    code: code || '',
    filename: filename || 'untitled.js',
    lang: lang || 'Node.js',
    path: filePath || '',
    ips,
    port: parseInt(port),
    createdAt: Date.now()
  }

  collaborationSessions.set(token, sessionData)

  res.json({
    success: true,
    token,
    sessionId: id,
    ips,
    filename: sessionData.filename,
    url: `http://${ips[0] || 'localhost'}:${port}/collaborate?token=${token}`
  })
})

app.post('/api/collaborate/create-session', (req, res) => {
  const { code, filename, lang, path: filePath, name } = req.body
  const token = 'LOCAL-' + Math.floor(100000 + Math.random() * 900000)
  const id = `local_${Date.now()}`

  const interfaces = os.networkInterfaces()
  const ips = []
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2]
      if (address.family === 'IPv4' && !address.internal) {
        ips.push(address.address)
      }
    }
  }

  const port = process.env.API_PORT || 8000
  const sessionData = {
    id,
    token,
    name: name || `Session ${collaborationSessions.size + 1}`,
    code: code || '',
    filename: filename || 'index.js',
    lang: lang || 'Node.js',
    path: filePath || '',
    ips,
    port: parseInt(port),
    createdAt: Date.now()
  }

  collaborationSessions.set(token, sessionData)

  res.json({
    success: true,
    session: sessionData
  })
})

// List all active local network sessions
app.get('/api/collaborate/sessions', (req, res) => {
  const list = Array.from(collaborationSessions.values()).map((s) => ({
    id: s.id,
    token: s.token,
    name: s.name || s.filename,
    filename: s.filename,
    lang: s.lang,
    ips: s.ips,
    port: s.port,
    createdAt: s.createdAt
  }))
  res.json({ success: true, sessions: list })
})

// Poll code changes for specific session
app.get('/api/collaborate/poll', (req, res) => {
  const { token } = req.query
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token required' })
  }
  const sessionData = collaborationSessions.get(token)
  if (!sessionData) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token' })
  }
  res.json({
    success: true,
    code: sessionData.code,
    filename: sessionData.filename,
    lang: sessionData.lang
  })
})

// Update code from browser / peer
app.post('/api/collaborate/update', (req, res) => {
  const { token, code } = req.body
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token required' })
  }
  const sessionData = collaborationSessions.get(token)
  if (!sessionData) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token' })
  }

  sessionData.code = code

  // Push changes directly to Electron's main window editor
  try {
    const { BrowserWindow } = require('electron')
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows[0].webContents.send('open-files', [
        {
          path: sessionData.path,
          content: code,
          name: sessionData.filename
        }
      ])
    }
  } catch (e) {}

  res.json({ success: true })
})

// Authentication & Browser Access Verification Endpoints
app.post('/api/auth/verify', (req, res) => {
  const { email, password, token, fromBrowser } = req.body

  if (token) {
    return res.json({
      success: true,
      authenticated: true,
      user: {
        email: email || 'operator@xenithra.tech',
        username: 'Operator',
        token,
        loginTime: new Date().toISOString()
      },
      closeWindow: !!fromBrowser
    })
  }

  if (email && password) {
    const authToken = 'AUTH-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    return res.json({
      success: true,
      authenticated: true,
      user: {
        email,
        username: email.split('@')[0] || 'Operator',
        token: authToken,
        loginTime: new Date().toISOString()
      },
      closeWindow: !!fromBrowser
    })
  }

  res.status(400).json({ success: false, message: 'Invalid authentication parameters' })
})

app.get('/api/auth/session', (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    activePort: process.env.API_PORT || 8000,
    timestamp: Date.now()
  })
})

// Extensions Store XML Server Endpoints
app.get('/api/extensions/xml', async (req, res) => {
  try {
    const tempDir = os.tmpdir()
    const storeXmlPath = path.join(tempDir, 'store_extensions.xml')
    let xmlContent = ''
    if (fs.existsSync(storeXmlPath)) {
      xmlContent = await fs.promises.readFile(storeXmlPath, 'utf-8')
    } else {
      xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<extensions>
  <extension id="firebase-extension" name="Firebase Console Extension" version="1.0.0" description="Firebase hosting deployment, auth database viewer, and firestore client." />
  <extension id="github-theme" name="GitHub Theme Pack" version="1.2.0" description="Clean GitHub dark and light themes." />
  <extension id="python-diagnostics" name="Python Diagnostics" version="2.1.0" description="Real-time linting, formatting and troubleshooting." />
  <extension id="cpp-toolchain" name="C++ Compiler Suite" version="1.0.5" description="Enables C++ execution environment and flags." />
  <extension id="markdown-preview" name="Markdown Previewer" version="1.5.0" description="Renders Markdown documentation in side panel." />
  <extension id="vim-keybindings" name="Vim Keybindings" version="0.9.0" description="Vim style inputs and movements in editor." />
  <extension id="devtools-helper" name="DevTools Helper" version="1.1.0" description="Extra debugging utilities and log consoles." />
</extensions>`
      await fs.promises.writeFile(storeXmlPath, xmlContent, 'utf-8')
    }
    res.type('application/xml').send(xmlContent)
  } catch (err) {
    res.status(500).type('application/xml').send(`<error>${err.message}</error>`)
  }
})

app.post('/api/extensions/allocate', async (req, res) => {
  try {
    const { extensionId, extension } = req.body
    const tempDir = os.tmpdir()
    const userXmlPath = path.join(tempDir, 'temp_extensions.xml')

    let currentExts = []
    if (fs.existsSync(userXmlPath)) {
      const content = await fs.promises.readFile(userXmlPath, 'utf-8')
      const regex = /<extension\s+([^>]+)\s*\/>/g
      let match
      while ((match = regex.exec(content)) !== null) {
        const attrsStr = match[1]
        const attrs = {}
        const attrRegex = /(\w+)="([^"]*)"/g
        let attrMatch
        while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
          attrs[attrMatch[1]] = attrMatch[2]
        }
        if (attrs.id) currentExts.push(attrs)
      }
    }

    const targetExt = extension || {
      id: extensionId,
      name: extensionId,
      version: '1.0.0',
      description: 'Allocated from XML Server'
    }

    if (!currentExts.some((e) => e.id === targetExt.id)) {
      currentExts.push(targetExt)
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<extensions>\n'
    currentExts.forEach((ext) => {
      xml += `  <extension id="${ext.id}" name="${ext.name}" version="${ext.version || '1.0.0'}" description="${ext.description || ''}" />\n`
    })
    xml += '</extensions>\n'

    await fs.promises.writeFile(userXmlPath, xml, 'utf-8')

    res.json({
      success: true,
      message: `Package "${targetExt.name}" successfully allocated and installed onto user.`,
      installedExtensions: currentExts
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

app.get('/api/extensions/package/:id', (req, res) => {
  const { id } = req.params
  res.json({
    success: true,
    package: {
      id,
      name: id.replace(/-/g, ' ').toUpperCase(),
      version: '1.0.0',
      allocatedAt: new Date().toISOString(),
      xmlServerUrl: `http://localhost:${process.env.API_PORT || 8000}/api/extensions/xml`
    }
  })
})

app.get('/collaborate/:token', (req, res) => {
  const { token } = req.params
  const session = collaborationSessions.get(token) || { filename: 'untitled.js', lang: 'javascript', code: '// Live collaboration\n' }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Xenithra Browser Handover Portal</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        :root {
          --bg: #0d1117;
          --panel: #161b22;
          --border: #30363d;
          --accent: #00ffaa;
          --text: #c9d1d9;
          --text-muted: #8b949e;
        }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(22, 27, 34, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          z-index: 10;
        }
        h1 {
          font-size: 14px;
          margin: 0;
          color: var(--accent);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .file-info {
          font-size: 12px;
          color: var(--text-muted);
        }
        .main-editor-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #0d1117;
        }
        textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #e6edf3;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 14px;
          line-height: 1.6;
          padding: 20px;
          resize: none;
          outline: none;
          box-sizing: border-box;
          tab-size: 4;
        }
        .status-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 20px;
          background: var(--panel);
          border-top: 1px solid var(--border);
          font-size: 11px;
          color: var(--text-muted);
        }
        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }
      </style>
    </head>
    <body>
      <header>
        <div style="display: flex; align-items: center; gap: 14px;">
          <h1>🌐 Xenithra Browser Handover Session</h1>
          <button id="open-local-btn" style="
            background: linear-gradient(135deg, #58a6ff 0%, #1f242c 100%);
            border: 1px solid var(--border);
            color: #fff;
            padding: 5px 12px;
            font-size: 11px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
          ">
            <span>🚀 Open in Local IDE</span>
          </button>
        </div>
        <div class="file-info">Editing: <b id="filename-label">${session.filename}</b> (<span id="lang-label">${session.lang}</span>)</div>
      </header>

      <div class="main-editor-container">
        <textarea id="editor" placeholder="Start typing code here...">${session.code}</textarea>
      </div>

      <div class="status-footer">
        <div class="connection-indicator">
          <div class="dot"></div>
          <span>Collaborating Live on Host Device</span>
        </div>
        <div>
          <span>Token: <b>${token}</b></span>
        </div>
      </div>

      <script>
        const token = "${token}";
        const editor = document.getElementById("editor");
        const filenameLabel = document.getElementById("filename-label");
        const langLabel = document.getElementById("lang-label");
        let remoteUpdating = false;

        document.getElementById("open-local-btn").addEventListener("click", () => {
          window.location.href = "xenithra://token=" + token;
        });

        // Poll for updates from the host
        async function poll() {
          try {
            const res = await fetch("/api/collaborate/poll?token=" + token);
            if (res.ok) {
              const data = await res.json();
              filenameLabel.innerText = data.filename;
              langLabel.innerText = data.lang;

              // Only update text if the user isn't actively focusing/typing
              if (document.activeElement !== editor && editor.value !== data.code) {
                editor.value = data.code;
              }
            }
          } catch(e) {
            console.error("Polling error:", e);
          }
        }
        setInterval(poll, 1500);

        // Push updates to the host
        let debounceTimer;
        editor.addEventListener("input", () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            try {
              await fetch("/api/collaborate/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, code: editor.value })
              });
            } catch(e) {
              console.error("Push error:", e);
            }
          }, 350);
        });
      </script>
    </body>
    </html>
  `)
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
