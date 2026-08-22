// Helper to format code fallback
function fallbackFormat(code, lang) {
  const lines = code.split(/\r?\n/)
  let indentLevel = 0
  const tab = '    ' // Use 4 spaces for C, Python, C++, C#, Java, PHP, etc.
  const isPython = (lang || '').toLowerCase().includes('py')

  const formattedLines = lines.map((line) => {
    let trimmed = line.trim()
    if (!trimmed) return ''

    // For C-like languages: decrease indent if line starts with closing brace
    if (
      !isPython &&
      (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')'))
    ) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    const currentIndent = tab.repeat(indentLevel)
    const result = currentIndent + trimmed

    // Check for block openers
    if (isPython) {
      if (trimmed.endsWith(':')) {
        indentLevel++
      } else if (
        trimmed.startsWith('return ') ||
        trimmed.startsWith('break') ||
        trimmed.startsWith('continue') ||
        trimmed.startsWith('pass')
      ) {
        // Simple heuristic to step out of blocks in Python
      }
    } else {
      // C-like brace matching
      // If line opens braces but doesn't close them
      const opens = (trimmed.match(/\{|\[|\(/g) || []).length
      const closes = (trimmed.match(/\}|\]|\)/g) || []).length
      if (opens > closes) {
        indentLevel += opens - closes
      } else if (closes > opens) {
        indentLevel = Math.max(0, indentLevel - (closes - opens))
      }
    }

    return result
  })

  // Adjust Python block indentation correctly by looking ahead
  if (isPython) {
    let currentIndent = 0
    const pythonFormatted = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        pythonFormatted.push('')
        continue
      }
      // If line is elif/else/except/finally, decrease indent for that line
      if (
        line.startsWith('elif ') ||
        line.startsWith('else:') ||
        line.startsWith('except ') ||
        line.startsWith('except:') ||
        line.startsWith('finally:')
      ) {
        currentIndent = Math.max(0, currentIndent - 1)
      }
      pythonFormatted.push(tab.repeat(currentIndent) + line)
      if (line.endsWith(':')) {
        currentIndent++
      }
      // Simple end of block heuristic: if return or pass is followed by a less indented or blank statement
      if (
        line.startsWith('return') ||
        line.startsWith('pass') ||
        line.startsWith('raise') ||
        line.startsWith('break')
      ) {
        // look ahead to see if next statement is not elif/else
        let nextIndex = i + 1
        while (nextIndex < lines.length && !lines[nextIndex].trim()) {
          nextIndex++
        }
        if (nextIndex < lines.length) {
          const nextLine = lines[nextIndex].trim()
          if (
            !nextLine.startsWith('elif') &&
            !nextLine.startsWith('else') &&
            !nextLine.startsWith('except') &&
            !nextLine.startsWith('finally')
          ) {
            currentIndent = Math.max(0, currentIndent - 1)
          }
        }
      }
    }
    return pythonFormatted.join('\n')
  }

  return formattedLines.join('\n')
}

/**
 * Format source code using Prettier (if available) with dynamic fallback
 * @param {string} code
 * @param {string} lang
 * @param {string} filename
 * @returns {Promise<string>}
 */
export async function formatCode(code, lang = 'Node.js', filename = '') {
  if (!code || !code.trim()) return code

  const lowerLang = (lang || '').toLowerCase()
  const ext = filename ? filename.split('.').pop().toLowerCase() : ''

  // Determine Prettier parser
  let parser = null
  if (
    lowerLang.includes('javascript') ||
    lowerLang.includes('node') ||
    ext === 'js' ||
    ext === 'jsx'
  ) {
    parser = 'babel'
  } else if (lowerLang.includes('typescript') || ext === 'ts' || ext === 'tsx') {
    parser = 'typescript'
  } else if (lowerLang.includes('html') || ext === 'html') {
    parser = 'html'
  } else if (lowerLang.includes('css') || ext === 'css') {
    parser = 'css'
  } else if (lowerLang.includes('json') || ext === 'json') {
    parser = 'json'
  }

  if (parser) {
    try {
      // Dynamic import of prettier inside Electron
      const prettier = await import('prettier')
      const formatted = await prettier.default.format(code, {
        parser,
        semi: true,
        singleQuote: true,
        trailingComma: 'none',
        printWidth: 100,
        tabWidth: 2
      })
      return formatted
    } catch (err) {
      console.warn('[Format Service] Prettier import or run failed, using fallback:', err.message)
      // Standard JSON formatting fallback if parser is json
      if (parser === 'json') {
        try {
          return JSON.stringify(JSON.parse(code), null, 2)
        } catch {
          return code
        }
      }
    }
  }

  // Use robust fallback for Python, C, C++, C#, Java, Dart, PHP etc.
  return fallbackFormat(code, lang)
}
