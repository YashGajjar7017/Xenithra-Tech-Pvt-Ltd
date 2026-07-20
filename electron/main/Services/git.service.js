import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * Runs a git command in target directory
 * @param {string} command 
 * @param {string} cwd 
 * @returns {Promise<string>}
 */
function runGitCmd(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd, timeout: 20000, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || stdout || err.message))
      }
      resolve(stdout.trim())
    })
  })
}

/**
 * Parses and returns all Git metadata for a given workspace path
 * @param {string} workspacePath 
 */
export async function getGitInfo(workspacePath) {
  const targetDir = workspacePath && fs.existsSync(workspacePath) ? workspacePath : process.cwd()
  const gitDir = path.join(targetDir, '.git')

  if (!fs.existsSync(gitDir)) {
    return {
      isGitRepo: false,
      message: 'Workspace is not a Git repository.',
      path: targetDir
    }
  }

  try {
    // Current branch
    let currentBranch = 'main'
    try {
      currentBranch = await runGitCmd('git branch --show-current', targetDir)
      if (!currentBranch) {
        currentBranch = await runGitCmd('git rev-parse --abbrev-ref HEAD', targetDir)
      }
    } catch (e) {
      currentBranch = 'HEAD'
    }

    // All branches
    let branches = []
    try {
      const branchesRaw = await runGitCmd('git branch -a', targetDir)
      branches = branchesRaw.split('\n').map(b => b.trim().replace('* ', ''))
    } catch (e) {}

    // Git Status (changed/untracked files)
    let statusFiles = []
    try {
      const statusRaw = await runGitCmd('git status --porcelain', targetDir)
      if (statusRaw) {
        statusFiles = statusRaw.split('\n').map(line => {
          const code = line.substring(0, 2).trim()
          const file = line.substring(3).trim()
          let statusText = 'Modified'
          if (code === '??') statusText = 'Untracked'
          else if (code === 'A') statusText = 'Added'
          else if (code === 'D') statusText = 'Deleted'
          else if (code === 'R') statusText = 'Renamed'
          return { file, code, status: statusText }
        })
      }
    } catch (e) {}

    // Recent Commit Logs
    let commitLogs = []
    try {
      const logsRaw = await runGitCmd('git log -n 15 --pretty=format:"%h|%an|%ar|%s"', targetDir)
      if (logsRaw) {
        commitLogs = logsRaw.split('\n').map(line => {
          const [hash, author, date, message] = line.split('|')
          return { hash, author, date, message }
        })
      }
    } catch (e) {}

    // Remote origin URL
    let remoteUrl = ''
    try {
      remoteUrl = await runGitCmd('git config --get remote.origin.url', targetDir)
    } catch (e) {}

    return {
      isGitRepo: true,
      currentBranch,
      branches,
      statusFiles,
      commitLogs,
      remoteUrl,
      path: targetDir
    }
  } catch (err) {
    console.error('[gitService] Error reading git info:', err)
    return {
      isGitRepo: true,
      error: err.message,
      path: targetDir
    }
  }
}

/**
 * Clones a Git repository into a destination path
 * @param {string} repoUrl 
 * @param {string} targetDirectory 
 */
export async function cloneGitRepo(repoUrl, targetDirectory) {
  if (!repoUrl) return { success: false, error: 'Repository URL is required.' }
  const destDir = targetDirectory || process.cwd()

  try {
    const output = await runGitCmd(`git clone "${repoUrl}"`, destDir)
    return { success: true, output }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Stage all and commit changes
 * @param {string} workspacePath 
 * @param {string} message 
 */
export async function commitGitChanges(workspacePath, message) {
  const targetDir = workspacePath || process.cwd()
  const commitMsg = message ? message.replace(/"/g, '\\"') : 'Update workspace files'

  try {
    await runGitCmd('git add .', targetDir)
    const output = await runGitCmd(`git commit -m "${commitMsg}"`, targetDir)
    return { success: true, output }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Push to remote
 * @param {string} workspacePath 
 */
export async function pushGitChanges(workspacePath) {
  const targetDir = workspacePath || process.cwd()
  try {
    const output = await runGitCmd('git push', targetDir)
    return { success: true, output }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Pull from remote
 * @param {string} workspacePath 
 */
export async function pullGitChanges(workspacePath) {
  const targetDir = workspacePath || process.cwd()
  try {
    const output = await runGitCmd('git pull', targetDir)
    return { success: true, output }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Get diff of a specific file
 * @param {string} workspacePath 
 * @param {string} filePath 
 */
export async function getGitFileDiff(workspacePath, filePath) {
  const targetDir = workspacePath || process.cwd()
  try {
    const diff = await runGitCmd(`git diff "${filePath}"`, targetDir)
    return { success: true, diff }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
