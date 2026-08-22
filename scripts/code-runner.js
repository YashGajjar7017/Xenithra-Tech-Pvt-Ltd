/**
 * Xenithra Standalone Code Runner CLI
 * Compiles and executes code files in supported languages directly from the command line.
 *
 * Usage:
 *   node scripts/code-runner.js --lang="Python 3" --file="test.py" --args="hello"
 *   node scripts/code-runner.js -l "C++ (G++)" -f "test.cpp"
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = {}
  const rawArgs = process.argv.slice(2)

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i]
    if (arg.startsWith('--lang=')) {
      args.lang = arg.split('=')[1]
    } else if (arg === '-l' || arg === '--lang') {
      args.lang = rawArgs[++i]
    } else if (arg.startsWith('--file=')) {
      args.file = arg.split('=')[1]
    } else if (arg === '-f' || arg === '--file') {
      args.file = rawArgs[++i]
    } else if (arg.startsWith('--args=')) {
      args.cmdArgs = arg.split('=')[1]
    } else if (arg === '-a' || arg === '--args') {
      args.cmdArgs = rawArgs[++i]
    }
  }
  return args
}

function showUsage() {
  console.log(`
Xenithra Code Runner CLI v1.0
------------------------------
Usage:
  node scripts/code-runner.js --lang="<language>" --file="<filepath>" [--args="<arguments>"]

Options:
  -l, --lang     Execution language (Node.js, Python 3, C (GCC), C++ (G++), Dot Net, Dart, PHP)
  -f, --file     Absolute or relative path to the source file
  -a, --args     Optional arguments to pass to the running code

Examples:
  node scripts/code-runner.js --lang="Node.js" --file="sample.js"
  node scripts/code-runner.js -l "Python 3" -f "scripts/test.py" -a "arg1 arg2"
`)
}

async function run() {
  const args = parseArgs()

  if (!args.lang || !args.file) {
    showUsage()
    process.exit(1)
  }

  const filePath = path.resolve(args.file)
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}`)
    process.exit(1)
  }

  const fileExt = path.extname(filePath)
  const baseName = path.basename(filePath, fileExt)
  const dirName = path.dirname(filePath)

  let runCmd = ''
  let compileCmd = ''
  let binaryFile = ''

  const escapedArgs = args.cmdArgs ? ' ' + args.cmdArgs : ''

  switch (args.lang) {
    case 'Node.js':
    case 'Next.js':
      runCmd = `node "${filePath}"${escapedArgs}`
      break
    case 'Python 3':
      runCmd = `python "${filePath}"${escapedArgs}`
      break
    case 'C (GCC)':
      binaryFile = path.join(dirName, `${baseName}_run.exe`)
      compileCmd = `gcc "${filePath}" -o "${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'C++ (G++)':
      binaryFile = path.join(dirName, `${baseName}_run.exe`)
      compileCmd = `g++ "${filePath}" -o "${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'Dot Net':
      binaryFile = path.join(dirName, `${baseName}_run.exe`)
      compileCmd = `csc "${filePath}" /out:"${binaryFile}"`
      runCmd = `"${binaryFile}"${escapedArgs}`
      break
    case 'Dart':
      runCmd = `dart "${filePath}"${escapedArgs}`
      break
    case 'PHP':
      runCmd = `php "${filePath}"${escapedArgs}`
      break
    default:
      console.error(`[ERROR] Unsupported language specified: ${args.lang}`)
      process.exit(1)
  }

  const cleanup = () => {
    try {
      if (binaryFile && fs.existsSync(binaryFile)) {
        fs.unlinkSync(binaryFile)
      }
    } catch {
      // Ignored
    }
  }

  const executeRunner = () => {
    console.log(`[RUNNER] Running command: ${runCmd}\n`)
    exec(runCmd, { timeout: 8000 }, (runErr, stdout, stderr) => {
      cleanup()
      if (runErr && runErr.killed) {
        console.error('\n[ERROR] Execution timed out (8 seconds limit).')
        process.exit(1)
      }

      if (stdout) process.stdout.write(stdout)
      if (stderr) process.stderr.write(stderr)

      if (runErr) {
        console.error(`\n[RUNNER] Process exited with error code ${runErr.code}`)
        process.exit(runErr.code || 1)
      } else {
        console.log('\n[RUNNER] Code execution finished successfully.')
        process.exit(0)
      }
    })
  }

  if (compileCmd) {
    console.log(`[COMPILER] Compiling: ${compileCmd}`)
    exec(compileCmd, { timeout: 6000 }, (compErr, stdout, stderr) => {
      if (compErr) {
        if (stdout) console.log(stdout)
        if (stderr) console.error(stderr)
        console.error(`\n[ERROR] Compilation failed: ${compErr.message}`)
        process.exit(1)
      }
      executeRunner()
    })
  } else {
    executeRunner()
  }
}

run()
