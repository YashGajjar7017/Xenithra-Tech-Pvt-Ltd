import { execFile, exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base directory for isolated DLL compilation sessions
const SESSIONS_BASE_DIR = path.join(__dirname, '../temp/dll_sessions')

// Map of active sessions: sessionId -> { dir, createdAt, baseName, files: { c, dll, lib }, timer }
const activeSessions = new Map()

// Ensure base temporary directory exists
const ensureBaseDir = () => {
  if (!fs.existsSync(SESSIONS_BASE_DIR)) {
    fs.mkdirSync(SESSIONS_BASE_DIR, { recursive: true })
  }
}

// Clean up orphaned session directories older than 10 minutes on startup
const cleanupStaleSessions = () => {
  try {
    ensureBaseDir()
    const entries = fs.readdirSync(SESSIONS_BASE_DIR, { withFileTypes: true })
    const now = Date.now()
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(SESSIONS_BASE_DIR, entry.name)
        try {
          const stats = fs.statSync(fullPath)
          if (now - stats.mtimeMs > 10 * 60 * 1000) {
            fs.rmSync(fullPath, { recursive: true, force: true })
          }
        } catch (e) {
          // Ignore individual folder cleanup errors
        }
      }
    }
  } catch (err) {
    console.warn('[dllCompiler] Error during stale session cleanup:', err.message)
  }
}

cleanupStaleSessions()

/**
 * Locate MinGW GCC on the Windows system or fallback to PATH gcc
 * @param {string} customPath
 * @returns {string} Path or command to gcc
 */
export const findGccExecutable = (customPath = null) => {
  if (customPath && fs.existsSync(customPath)) {
    return customPath
  }

  const commonGccPaths = [
    'C:\\MinGW\\bin\\gcc.exe',
    'C:\\msys64\\mingw64\\bin\\gcc.exe',
    'C:\\msys64\\ucrt64\\bin\\gcc.exe',
    'C:\\msys64\\usr\\bin\\gcc.exe',
    'C:\\TDM-GCC-64\\bin\\gcc.exe',
    'C:\\w64devkit\\bin\\gcc.exe',
    'C:\\Program Files\\CodeBlocks\\MinGW\\bin\\gcc.exe',
    'C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin\\gcc.exe'
  ]

  for (const p of commonGccPaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }

  return 'gcc'
}

/**
 * Parse exported functions with __declspec(dllexport) from source code
 * @param {string} code
 * @returns {Array<{name: string, returnType: string, signature: string, line: number}>}
 */
export const extractExportedSymbols = (code) => {
  if (!code) return []
  const symbols = []
  const lines = code.split('\n')

  // Regex to match __declspec(dllexport) function declarations
  // e.g. __declspec(dllexport) int Add(int a, int b)
  // or __declspec(dllexport) const char* GetVersion(void)
  const exportRegex = /__declspec\s*\(\s*dllexport\s*\)\s+([\w\s\*]+?)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/g

  lines.forEach((lineText, idx) => {
    let match
    while ((match = exportRegex.exec(lineText)) !== null) {
      const returnType = match[1].trim()
      const funcName = match[2].trim()
      const params = match[3].trim()
      symbols.push({
        name: funcName,
        returnType,
        params,
        signature: `${returnType} ${funcName}(${params})`,
        line: idx + 1
      })
    }
  })

  return symbols
}

/**
 * Compile C Code into a downloadable Windows Dynamic Link Library (.dll)
 * @param {Object} options
 * @param {string} options.code - Source C code
 * @param {string} options.filename - Desired base file name (default: library)
 * @param {string} options.flags - Extra compiler flags (e.g. -O2, -Wall, -std=c11)
 * @param {string} options.compilerPath - Optional custom MinGW gcc path
 * @returns {Promise<Object>} Compilation outcome with logs, file status, and session ID
 */
export const compileCToDll = async ({
  code,
  filename = 'library',
  flags = '-O2 -Wall -std=c11',
  compilerPath = null
}) => {
  const startTime = Date.now()
  ensureBaseDir()

  if (!code || !code.trim()) {
    return {
      success: false,
      stdout: '',
      stderr: 'Error: No C source code provided for compilation.',
      compileTimeMs: 0,
      symbols: []
    }
  }

  // 1. Sanitize base filename to avoid path traversal or command injection
  const rawClean = filename.replace(/\.c$/i, '').replace(/\.dll$/i, '').trim()
  const safeBaseName = rawClean.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64) || 'library'

  // 2. Create isolated session folder
  const sessionId = 'dll_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex')
  const sessionDir = path.join(SESSIONS_BASE_DIR, sessionId)
  fs.mkdirSync(sessionDir, { recursive: true })

  const cFilePath = path.join(sessionDir, `${safeBaseName}.c`)
  const dllFilePath = path.join(sessionDir, `${safeBaseName}.dll`)
  const libFilePath = path.join(sessionDir, `${safeBaseName}.lib`)

  // 3. Write source code file
  fs.writeFileSync(cFilePath, code, 'utf-8')

  // 4. Resolve GCC executable
  const gccExe = findGccExecutable(compilerPath)

  // 5. Build arguments safely
  // Expected command: gcc -shared -o <output.dll> <input.c> -Wl,--out-implib,<output.lib> [flags]
  const parsedFlags = (flags || '')
    .split(/\s+/)
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => /^[a-zA-Z0-9_=\-,.]+$/.test(f)) // Sanitize flags

  const args = [
    '-shared',
    '-o',
    `${safeBaseName}.dll`,
    `${safeBaseName}.c`,
    `-Wl,--out-implib,${safeBaseName}.lib`,
    ...parsedFlags
  ]

  // 6. Resolve binary directory for PATH inclusion
  const gccBinDir = path.isAbsolute(gccExe) ? path.dirname(gccExe) : 'C:\\MinGW\\bin'
  const customPathEnv = `${gccBinDir};C:\\MinGW\\bin;${process.env.PATH || ''}`

  // 7. Execute MinGW with strict 10-second timeout
  return new Promise((resolve) => {
    let isTimedOut = false

    const proc = execFile(
      gccExe,
      args,
      {
        cwd: sessionDir,
        env: { ...process.env, PATH: customPathEnv },
        timeout: 10000, // 10-second strict timeout
        maxBuffer: 1024 * 1024 * 5 // 5MB buffer
      },
      (error, stdout, stderr) => {
        const compileTimeMs = Date.now() - startTime

        // Check timeout
        if (error && (error.killed || error.signal === 'SIGTERM' || isTimedOut)) {
          scheduleSessionCleanup(sessionId, 60000)
          return resolve({
            success: false,
            sessionId,
            stdout: stdout || '',
            stderr: (stderr || '') + '\n[TIMEOUT] Compilation exceeded the strict 10-second execution limit and was terminated.',
            compileTimeMs,
            symbols: extractExportedSymbols(code),
            baseName: safeBaseName
          })
        }

        const dllExists = fs.existsSync(dllFilePath)
        const libExists = fs.existsSync(libFilePath)
        const dllSize = dllExists ? fs.statSync(dllFilePath).size : 0
        const libSize = libExists ? fs.statSync(libFilePath).size : 0

        const isSuccess = !error && dllExists

        // Parse symbols
        const symbols = extractExportedSymbols(code)

        // Store session record
        const sessionRecord = {
          sessionId,
          dir: sessionDir,
          createdAt: Date.now(),
          baseName: safeBaseName,
          files: {
            c: cFilePath,
            dll: dllExists ? dllFilePath : null,
            lib: libExists ? libFilePath : null
          },
          timer: null
        }
        activeSessions.set(sessionId, sessionRecord)

        // Auto-cleanup session workspace after 5 minutes (300,000 ms)
        scheduleSessionCleanup(sessionId, 5 * 60 * 1000)

        resolve({
          success: isSuccess,
          sessionId,
          baseName: safeBaseName,
          stdout: stdout || '',
          stderr: stderr || (isSuccess ? '' : error ? error.message : 'Unknown compilation failure'),
          compileTimeMs,
          dllCreated: dllExists,
          libCreated: libExists,
          dllSize,
          libSize,
          symbols,
          compilerUsed: gccExe
        })
      }
    )

    // Fallback timeout guard
    const timeoutGuard = setTimeout(() => {
      isTimedOut = true
      try {
        proc.kill('SIGKILL')
      } catch (e) {
        // Process might have exited already
      }
    }, 10500)

    proc.on('close', () => {
      clearTimeout(timeoutGuard)
    })
  })
}

/**
 * Schedule session workspace cleanup
 * @param {string} sessionId
 * @param {number} delayMs
 */
export const scheduleSessionCleanup = (sessionId, delayMs = 300000) => {
  const session = activeSessions.get(sessionId)
  if (session) {
    if (session.timer) clearTimeout(session.timer)
    session.timer = setTimeout(() => {
      cleanupSession(sessionId)
    }, delayMs)
  }
}

/**
 * Immediately delete temporary files for a session
 * @param {string} sessionId
 */
export const cleanupSession = (sessionId) => {
  const session = activeSessions.get(sessionId)
  if (session) {
    if (session.timer) clearTimeout(session.timer)
    try {
      if (fs.existsSync(session.dir)) {
        fs.rmSync(session.dir, { recursive: true, force: true })
      }
    } catch (err) {
      console.warn(`[dllCompiler] Failed to delete session dir ${sessionId}:`, err.message)
    }
    activeSessions.delete(sessionId)
  }
}

/**
 * Retrieve session file info for downloading
 * @param {string} sessionId
 * @param {string} fileType - 'dll' | 'lib' | 'c'
 * @returns {{filePath: string, filename: string, mime: string}|null}
 */
export const getSessionDownloadFile = (sessionId, fileType) => {
  const session = activeSessions.get(sessionId)
  if (!session) return null

  const base = session.baseName || 'library'

  if (fileType === 'dll' && session.files.dll && fs.existsSync(session.files.dll)) {
    return {
      filePath: session.files.dll,
      filename: `${base}.dll`,
      mime: 'application/x-msdownload'
    }
  }

  if (fileType === 'lib' && session.files.lib && fs.existsSync(session.files.lib)) {
    return {
      filePath: session.files.lib,
      filename: `${base}.lib`,
      mime: 'application/octet-stream'
    }
  }

  if (fileType === 'c' && session.files.c && fs.existsSync(session.files.c)) {
    return {
      filePath: session.files.c,
      filename: `${base}.c`,
      mime: 'text/x-c'
    }
  }

  return null
}

export default {
  compileCToDll,
  findGccExecutable,
  extractExportedSymbols,
  getSessionDownloadFile,
  cleanupSession,
  scheduleSessionCleanup
}
