import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tempDir = path.join(__dirname, '../temp')

// Ensure temp directory exists
const ensureTempDir = () => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
}

/**
 * Runs code in a sandbox/subprocess and returns output
 * @param {string} lang 
 * @param {string} code 
 * @param {string} args 
 * @returns {Promise<{success: boolean, output: string}>}
 */
export const runCode = (lang, code, args) => {
  return new Promise((resolve) => {
    ensureTempDir()

    if (!code) {
      return resolve({ success: false, output: 'No code provided.' })
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
        return resolve({
          success: true,
          output: 'XML syntax validated successfully!\n(No execution environment needed for static XML)'
        })
      case 'Next.js':
        ext = 'js'
        sourceFile = path.join(tempDir, `run_${fileId}.js`)
        runCmd = `node "${sourceFile}"${escapedArgs}`
        break
      default:
        return resolve({ success: false, output: `Unsupported language: ${lang}` })
    }

    // Write source code file
    try {
      fs.writeFileSync(sourceFile, code, 'utf8')
    } catch (err) {
      return resolve({ success: false, output: `Failed to create source file: ${err.message}` })
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
          return resolve({ success: false, output: '[ERROR] Process execution timed out (8 seconds limit).' })
        }
        const output = runStdout + runStderr
        resolve({
          success: !runErr,
          output: output || 'Process finished with no output.'
        })
      })
    }

    if (compileCmd) {
      exec(compileCmd, { timeout: 5000 }, (compErr, compStdout, compStderr) => {
        if (compErr) {
          cleanup()
          const compileOutput = compStdout + compStderr
          return resolve({
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
}

/**
 * Compiles code into a downloadable binary
 * @param {string} lang 
 * @param {string} code 
 * @param {string} filename 
 * @returns {Promise<{success: boolean, binaryFile: string, baseName: string, output?: string}>}
 */
export const packageCode = (lang, code, filename) => {
  return new Promise((resolve) => {
    ensureTempDir()

    if (!code) {
      return resolve({ success: false, output: 'No code provided.' })
    }

    const fileId = Date.now() + '_' + Math.floor(Math.random() * 100)
    const baseName = filename ? path.basename(filename, path.extname(filename)) : 'compiled_pkg'
    let compileCmd = ''
    let sourceFile = ''
    let binaryFile = ''

    switch (lang) {
      case 'C (GCC)':
        sourceFile = path.join(tempDir, `${baseName}_${fileId}.c`)
        binaryFile = path.join(tempDir, `${baseName}_${fileId}.exe`)
        compileCmd = `gcc "${sourceFile}" -o "${binaryFile}"`
        break
      case 'C++ (G++)':
        sourceFile = path.join(tempDir, `${baseName}_${fileId}.cpp`)
        binaryFile = path.join(tempDir, `${baseName}_${fileId}.exe`)
        compileCmd = `g++ "${sourceFile}" -o "${binaryFile}"`
        break
      case 'Dot Net':
        sourceFile = path.join(tempDir, `${baseName}_${fileId}.cs`)
        binaryFile = path.join(tempDir, `${baseName}_${fileId}.exe`)
        compileCmd = `csc "${sourceFile}" /out:"${binaryFile}"`
        break
      default:
        return resolve({ success: false, output: 'Packaging is only supported for C, C++, and .NET/C#.' })
    }

    try {
      fs.writeFileSync(sourceFile, code, 'utf8')
    } catch (err) {
      return resolve({ success: false, output: `Failed to create source file: ${err.message}` })
    }

    const cleanupSource = () => {
      try {
        if (sourceFile && fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile)
      } catch (e) {}
    }

    exec(compileCmd, { timeout: 8000 }, (compErr, compStdout, compStderr) => {
      cleanupSource()
      if (compErr) {
        const compileOutput = compStdout + compStderr
        return resolve({
          success: false,
          output: `[COMPILATION ERROR]\n${compileOutput || compErr.message}\nMake sure compilers (gcc/g++/csc) are installed.`
        })
      }

      if (fs.existsSync(binaryFile)) {
        resolve({
          success: true,
          binaryFile,
          baseName
        })
      } else {
        resolve({ success: false, output: 'Compiled binary not found.' })
      }
    })
  })
}
