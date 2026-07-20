import { spawn, exec } from 'child_process'
import os from 'os'
import path from 'path'
import fs from 'fs'

let activeShellProcess = null
let terminalOutputCallback = null
let currentCwd = process.cwd()

/**
 * Initializes a persistent backend terminal shell session connected to native shell / DLL runner
 * @param {string} initialCwd 
 * @param {function} onDataCallback 
 */
export function initTerminalSession(initialCwd, onDataCallback) {
  if (initialCwd && fs.existsSync(initialCwd)) {
    currentCwd = initialCwd
  }

  terminalOutputCallback = onDataCallback

  if (activeShellProcess) {
    try { activeShellProcess.kill() } catch (e) {}
    activeShellProcess = null
  }

  const isWin = os.platform() === 'win32'
  const shellCmd = isWin ? 'cmd.exe' : (process.env.SHELL || '/bin/bash')
  const shellArgs = isWin ? ['/K'] : []

  try {
    activeShellProcess = spawn(shellCmd, shellArgs, {
      cwd: currentCwd,
      env: { ...process.env, TERM: 'xterm-256color' },
      shell: true
    })

    activeShellProcess.stdout.on('data', (data) => {
      const text = data.toString('utf-8')
      if (terminalOutputCallback) terminalOutputCallback({ type: 'stdout', text })
    })

    activeShellProcess.stderr.on('data', (data) => {
      const text = data.toString('utf-8')
      if (terminalOutputCallback) terminalOutputCallback({ type: 'stderr', text })
    })

    activeShellProcess.on('exit', (code) => {
      if (terminalOutputCallback) terminalOutputCallback({ type: 'sys', text: `\n[Process exited with code ${code}]\n` })
    })

    // Initial banner
    if (terminalOutputCallback) {
      terminalOutputCallback({ 
        type: 'sys', 
        text: `Xenithra Backend Shell Engine v2.0 connected via ${isWin ? 'kernel32.dll / cmd.exe' : 'native pty'}\nWorking Directory: ${currentCwd}\nType commands below...\n\n` 
      })
    }

    return { success: true, cwd: currentCwd }
  } catch (err) {
    console.error('[terminalService] Spawn error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Writes command or stdin input to the active shell session
 * @param {string} input 
 */
export function writeToTerminal(input) {
  if (!activeShellProcess || !activeShellProcess.stdin) {
    // If process fell over, re-initialize
    initTerminalSession(currentCwd, terminalOutputCallback)
  }

  if (activeShellProcess && activeShellProcess.stdin.writable) {
    // Send input with newline if needed
    const commandText = input.endsWith('\n') ? input : input + '\r\n'
    activeShellProcess.stdin.write(commandText)
    return true
  }
  return false
}

/**
 * Executes a single command on backend and returns full output
 * @param {string} command 
 * @param {string} cwd 
 * @returns {Promise<{success: boolean, output: string}>}
 */
export function executeTerminalCommand(command, cwd) {
  return new Promise((resolve) => {
    const targetDir = cwd && fs.existsSync(cwd) ? cwd : currentCwd
    exec(command, { cwd: targetDir, timeout: 15000, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
      const output = (stdout || '') + (stderr || '')
      resolve({
        success: !err,
        output: output || (err ? err.message : 'Done.')
      })
    })
  })
}

/**
 * Terminate current shell session
 */
export function killTerminalSession() {
  if (activeShellProcess) {
    try { activeShellProcess.kill() } catch (e) {}
    activeShellProcess = null
    return { success: true }
  }
  return { success: false, message: 'No active terminal session' }
}
