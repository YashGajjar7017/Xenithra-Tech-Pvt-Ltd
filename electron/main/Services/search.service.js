import fs from 'fs'
import path from 'path'

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'out', 'build', '.vscode', '.idea'])
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', 
  '.py', '.c', '.cpp', '.h', '.hpp', '.cs', '.dart', '.md', '.txt', 
  '.xml', '.env', '.yaml', '.yml', '.sql', '.sh'
])

/**
 * Searches across all files in workspace directory
 * @param {string} workspacePath 
 * @param {string} query 
 * @param {object} options 
 */
export async function searchWorkspace(workspacePath, query, options = {}) {
  if (!query || !query.trim()) {
    return { results: [], totalMatches: 0, filesCount: 0 }
  }

  const rootDir = workspacePath && fs.existsSync(workspacePath) ? workspacePath : process.cwd()
  const { caseSensitive = false, matchWholeWord = false, useRegex = false, includesPattern = '' } = options

  let regex = null
  try {
    let flags = caseSensitive ? 'g' : 'gi'
    let pattern = query
    if (!useRegex) {
      pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    if (matchWholeWord) {
      pattern = `\\b${pattern}\\b`
    }
    regex = new RegExp(pattern, flags)
  } catch (err) {
    return { error: `Invalid Regular Expression: ${err.message}`, results: [] }
  }

  const results = []
  let totalMatches = 0
  let filesSearched = 0

  async function walkDir(currentDir) {
    let files
    try {
      files = await fs.promises.readdir(currentDir)
    } catch (e) {
      return
    }

    for (const file of files) {
      if (IGNORED_DIRS.has(file)) continue
      const fullPath = path.join(currentDir, file)

      let stat
      try {
        stat = await fs.promises.stat(fullPath)
      } catch (e) {
        continue
      }

      if (stat.isDirectory()) {
        await walkDir(fullPath)
      } else {
        const ext = path.extname(file).toLowerCase()
        if (!TEXT_EXTENSIONS.has(ext)) continue

        if (includesPattern && !file.toLowerCase().includes(includesPattern.toLowerCase())) {
          continue
        }

        filesSearched++
        try {
          const content = await fs.promises.readFile(fullPath, 'utf-8')
          const lines = content.split('\n')
          const fileMatches = []

          lines.forEach((lineContent, idx) => {
            regex.lastIndex = 0
            if (regex.test(lineContent)) {
              fileMatches.push({
                lineNumber: idx + 1,
                lineContent: lineContent.trim(),
                fullLine: lineContent
              })
              totalMatches++
            }
          })

          if (fileMatches.length > 0) {
            results.push({
              file,
              path: fullPath,
              relativePath: path.relative(rootDir, fullPath),
              matchesCount: fileMatches.length,
              matches: fileMatches
            })
          }
        } catch (readErr) {
          // Ignore unreadable binary / encoded files
        }
      }
    }
  }

  await walkDir(rootDir)

  return {
    results,
    totalMatches,
    filesSearched,
    rootDir
  }
}
