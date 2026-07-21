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
import { runCode, packageCode } from './code-runner/runner.js'

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
        troubleshootingNotes.push('- **Missing Header Warning**: Your C file does not contain any `#include` directives. Consider adding `#include <stdio.h>` to enable standard input/output operations like `printf`.')
      }
      if (lang === 'C++ (G++)' && !code.includes('#include')) {
        troubleshootingNotes.push('- **Missing Header Warning**: Your C++ file does not contain any `#include` directives. Consider adding `#include <iostream>` to use standard streams like `std::cout`.')
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
        troubleshootingNotes.push(`- **Potential Missing Semicolon**: Lines ${missingSemicolonLines.slice(0, 3).join(', ')}${missingSemicolonLines.length > 3 ? '...' : ''} seem to be missing a terminal semicolon (\`;\`).`)
      }
      if (!code.includes('main')) {
        troubleshootingNotes.push('- **Entrypoint Missing**: Could not find a `main` function. C/C++ runtimes require `int main()` as their starting execution point.')
      }
    } else if (lang === 'Python 3') {
      // Check colon after def/if/for/while/class
      const lines = code.split('\n')
      let missingColonLines = []
      lines.forEach((line, idx) => {
        const trimmed = line.trim()
        if (
          (trimmed.startsWith('def ') || trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('else:') || trimmed.startsWith('for ') || trimmed.startsWith('while ') || trimmed.startsWith('class ')) &&
          !trimmed.endsWith(':')
        ) {
          missingColonLines.push(idx + 1)
        }
      })
      if (missingColonLines.length > 0) {
        troubleshootingNotes.push(`- **Python Syntax Check**: Lines ${missingColonLines.join(', ')} start a block statement but do not end with a colon (\`:\`).`)
      }
      // Check tabs vs spaces
      if (code.includes('\t') && code.includes('    ')) {
        troubleshootingNotes.push('- **Mixed Indentation warning**: Your Python script contains both literal Tab characters and space blocks. This commonly causes `TabError` or `IndentationError` when executed.')
      }
    } else if (lang === 'Node.js' || lang === 'Next.js') {
      // Match braces count
      const openBraces = (code.match(/\{/g) || []).length
      const closeBraces = (code.match(/\}/g) || []).length
      if (openBraces !== closeBraces) {
        troubleshootingNotes.push(`- **Mismatched Braces**: Found ${openBraces} opening curly braces \`{\` but ${closeBraces} closing curly braces \`}\`. This will throw a syntax error.`)
      }
      const openParen = (code.match(/\(/g) || []).length
      const closeParen = (code.match(/\)/g) || []).length
      if (openParen !== closeParen) {
        troubleshootingNotes.push(`- **Mismatched Parentheses**: Found ${openParen} opening parentheses \`(\` but ${closeParen} closing parentheses \`)\`.`)
      }
    }
  }

  // 2. Keyword Responses
  if (promptLower.includes('help') || promptLower.includes('troubleshoot') || promptLower.includes('debug') || promptLower.includes('error')) {
    if (troubleshootingNotes.length > 0) {
      responseText = `### 🔍 Code Diagnostics & Troubleshooting for \`${filename || 'Active File'}\`\n\nI inspected your code and found the following items that might be causing compiler errors:\n\n${troubleshootingNotes.join('\n')}\n\n**Troubleshooting Checklist:**\n1. Ensure the required compiler/runtime (e.g. GCC for C, Python 3 for Python, Node for JS) is installed on your machine and added to your environment **PATH**.\n2. Verify the selected Environment in the toolbar matches the active file type.\n3. Make sure all imports and dependencies are locally installed in the workspace.`
    } else {
      responseText = `### 🛠️ Workspace Troubleshooter & Diagnostics\n\nNo immediate syntax warnings were identified in the active \`${lang}\` file. \n\n**Here are standard checks to resolve execution issues:**\n- Check if the terminal reports a specific file path or exit code.\n- If using **C/C++**, verify that \`gcc\` or \`g++\` is working by typing \`gcc --version\` in your local command prompt.\n- If using **Python**, make sure you selected \`Python 3\` from the environment selection dropdown in the navbar.\n- Check if your code relies on npm dependencies that need to be installed in the project root.`
    }
  } else if (promptLower.includes('extension') || promptLower.includes('plugin') || promptLower.includes('store') || promptLower.includes('xml')) {
    responseText = `### 🧩 Extension Manager & XML Store Helper\n\nYou can click on the puzzle-like **Extension** tab in the activity bar on the far-left to access the Store.\n\n- **Multiple Extensions**: You can install packages like *GitHub Theme Pack*, *Python Linting*, and *DevTools Helper*.\n- **XML Persistence**: The installed profile list is loaded from and stored into a temporary XML configuration file (\`temp_extensions.xml\`). \n- Under the hood, this XML file stores each extension's identifier, name, and active status, which makes it easy to track without setting up full database layers.`
  } else if (promptLower.includes('theme') || promptLower.includes('github')) {
    responseText = `### 🎨 Workspace Themes & GitHub Aesthetic\n\nTo change themes, select the **Theme** option from the main menu bar at the top of the IDE.\n- **GitHub Dark**: We have loaded a theme styled specifically after the official GitHub Dark layout (\`#0d1117\` background, \`#30363d\` borders, and high contrast syntax lighting).\n- **Other Themes**: VS Code Dark, Light Frosted, Neon Violet, Emerald Matrix, and Cyber Amber are also fully supported!`
  } else if (promptLower.includes('run') || promptLower.includes('compile') || promptLower.includes('package')) {
    responseText = `### 🚀 Compiling, Running & Packaging Code\n\n- **Run Code**: Click the green Run button (▶) or select **Run -> Run Code** in the menu.\n- **Debug Code**: Click the blue Debug button (🐞) to run with debugger logs.\n- **Stop**: Click the red Stop button (■) to terminate execution.\n- **Package Binary**: Click the package box button (📦) to compile C, C++, or .NET scripts into a standalone executable (\`.exe\`) binary that automatically downloads to your downloads folder.`
  } else if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey')) {
    responseText = `### 👋 Welcome to Xenithra AI Assistant!\n\nI am your virtual troubleshooting and code helper. Here is how I can assist you:\n- **Diagnose Errors**: Type "troubleshoot" or "check bugs" to run syntax analysis on your active code.\n- **Extension Store**: Type "extensions" to learn how to add packages from the store.\n- **How to Compile**: Ask about running or packaging standalone binaries.\n\nLet me know if you would like me to explain any part of your code in \`${filename || 'untitled.js'}\`!`
  } else {
    responseText = `### 🤖 Xenithra AI Code Assistant\n\nI analyzed your query: *"${prompt}"*\n\n**Active Environment details:**\n- **Current File**: \`${filename || 'None'}\`\n- **Environment Selected**: \`${lang || 'Node.js'}\`\n\nIf you are having compilation issues, type **troubleshoot** or **help** to run the static syntax validation check on your current editor content. I can also help explain code segments or outline API paths.`
  }

  res.json({ output: responseText })
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
