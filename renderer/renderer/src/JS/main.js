/**
 * Enhanced Main JavaScript Module
 * Modern, secure, and maintainable code execution environment
 * @version 2.0.0
 */

// ===========================
// CONFIGURATION & CONSTANTS
// ===========================
const API_KEY = '34c8103e63msh909728bfda25be5p1bb0fbjsnd587398101bf' // PLEASE DON'T SHARE
// API_KEY = "cc6dcd8390msh2e162a8a61f0938p1a4717jsn3b68ec13545b"; // PLEASE DON'T SHARE

var language_to_id = {
  C: 50,
  'C++': 54,
  Java: 62,
  Python: 71
}

function encode(str) {
  return btoa(unescape(encodeURIComponent(str || '')))
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ''))
  try {
    return decodeURIComponent(escaped)
  } catch {
    return unescape(escaped)
  }
}

function errorHandler(jqXHR, textStatus, errorThrown) {
  $('#terminal').val(`${JSON.stringify(jqXHR, null, 4)}`)
  $('#run').prop('disabled', false)
}

function check(token) {
  $('#terminal').val($('#terminal').val() + '\nChecking submission status...')
  $.ajax({
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
    type: 'GET',
    headers: {
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'x-rapidapi-key': API_KEY
    },
    success: function (data, textStatus, jqXHR) {
      if ([1, 2].includes(data['status']['id'])) {
        $('#terminal').val($('#terminal').val() + '\nStatus: ' + data['status']['description'])
        setTimeout(function () {
          check(token)
        }, 1000)
      } else {
        var output = [decode(data['compile_output']), decode(data['stdout'])].join('\n').trim()
        $('#terminal').val(output)
        $('#run').prop('disabled', false)
      }
    },
    error: errorHandler
  })
}

function run() {
  $('#run').prop('disabled', true)
  $('#terminal').val('Creating submission...')
  $.ajax({
    url: 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true',
    type: 'POST',
    contentType: 'application/json',
    headers: {
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'x-rapidapi-key': API_KEY
    },
    data: JSON.stringify({
      language_id: language_to_id[$('#lang').val()],
      source_code: encode($('#source').val()),
      stdin: encode($('#terminal').val()),
      redirect_stderr_to_stdout: true
    }),
    success: function (data, textStatus, jqXHR) {
      $('#terminal').val($('#terminal').val() + '\nSubmission created.')
      setTimeout(function () {
        check(data['token'])
      }, 2000)
    },
    error: errorHandler
  })
}

$('body').keydown(function (e) {
  if (e.ctrlKey && e.keyCode == 13) {
    run()
  }
})

$('textarea').keydown(function (e) {
  if (e.keyCode == 9) {
    e.preventDefault()
    var start = this.selectionStart
    var end = this.selectionEnd

    var append = '    '
    $(this).val($(this).val().substring(0, start) + append + $(this).val().substring(end))

    this.selectionStart = this.selectionEnd = start + append.length
  }
})

// const CONFIG = {
//     API: {
//         BASE_URL: window.CONFIG?.API?.BASE_URL || 'http://localhost:8000',
//         ENDPOINT: '/api/compiler/compile-content'
//     },
//     LANGUAGES: {
//         'C': 'c',
//         'C++': 'cpp',
//         'Java': 'java',
//         'Python': 'python'
//     },
//     DEBOUNCE_DELAY: 300,
//     AUTO_SAVE_INTERVAL: 5000
// };

// ===========================
// UTILITY FUNCTIONS
// ===========================
const Utils = {
  encode: (str) => btoa(unescape(encodeURIComponent(str || ''))),
  decode: (bytes) => {
    try {
      return decodeURIComponent(escape(atob(bytes || '')))
    } catch {
      return unescape(escape(atob(bytes || '')))
    }
  },
  debounce: (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  },
  sanitizeInput: (input) => {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  },
  /**
   * Adds multiple numbers together
   * @param {...number} nums - Numbers to add
   * @returns {number} Sum of all numbers
   */
  addNumbers: (...nums) => nums.reduce((sum, num) => sum + num, 0),
  /**
   * Concatenates multiple strings
   * @param {...string} strs - Strings to concatenate
   * @returns {string} Concatenated string
   */
  addStrings: (...strs) => strs.join(''),
  /**
   * Merges multiple arrays into one
   * @param {...Array} arrs - Arrays to merge
   * @returns {Array} Merged array
   */
  addArrays: (...arrs) => arrs.flat(),
  /**
   * Merges multiple objects (shallow merge)
   * @param {...Object} objs - Objects to merge
   * @returns {Object} Merged object
   */
  addObjects: (...objs) => Object.assign({}, ...objs),
  /**
   * Generic addition function for different types
   * @param {...*} values - Values to add
   * @returns {*} Result of addition
   * @throws {Error} If types are unsupported or mixed
   */
  addValues: (...values) => {
    if (values.length === 0) return 0
    if (values.every((v) => typeof v === 'number')) return Utils.addNumbers(...values)
    if (values.every((v) => typeof v === 'string')) return Utils.addStrings(...values)
    if (values.every((v) => Array.isArray(v))) return Utils.addArrays(...values)
    if (values.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v)))
      return Utils.addObjects(...values)
    throw new Error('Unsupported or mixed types for addition')
  }
}

// ===========================
// API SERVICE
// ===========================
class CodeExecutionService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL
    this.endpoint = CONFIG.API.ENDPOINT
    this.headers = {
      'Content-Type': 'application/json'
    }
  }

  async submitCode(language, sourceCode, stdin = '') {
    try {
      // Check if language is supported by local backend
      if (!CONFIG.LANGUAGES[language]) {
        throw new Error(
          `Language "${language}" is not supported by the local compiler. Supported languages: ${Object.keys(CONFIG.LANGUAGES).join(', ')}`
        )
      }

      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          content: sourceCode,
          language: CONFIG.LANGUAGES[language],
          outputName: 'output'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Compilation failed: ${error.message}`)
    }
  }

  // Local compilation is synchronous, so no need for polling
  async checkSubmission(result) {
    return result
  }
}

// ===========================
// EDITOR MANAGER
// ===========================
class EditorManager {
  constructor() {
    this.editors = new Map()
    this.lineCounters = new Map()
    this.initializeEditors()
  }

  initializeEditors() {
    const editorConfigs = [
      { id: 'source', lineCounterId: 'lineCounter' },
      { id: 'htmlTextarea', lineCounterId: 'lineCounter1' }
    ]

    editorConfigs.forEach((config) => {
      const editor = document.getElementById(config.id)
      const lineCounter = document.getElementById(config.lineCounterId)

      if (editor && lineCounter) {
        this.editors.set(config.id, editor)
        this.lineCounters.set(config.id, lineCounter)
        this.setupEditor(editor, lineCounter)
      }
    })
  }

  setupEditor(editor, lineCounter) {
    // Sync scrolling
    editor.addEventListener('scroll', () => {
      lineCounter.scrollTop = editor.scrollTop
      lineCounter.scrollLeft = editor.scrollLeft
    })

    // Update line numbers
    const updateLines = () => {
      const lines = editor.value.split('\n').length
      const lineNumbers = Array.from({ length: lines }, (_, i) => `${i + 1}.`).join('\n')
      lineCounter.value = lineNumbers
    }

    editor.addEventListener('input', Utils.debounce(updateLines, 100))
    updateLines() // Initial call
  }

  getValue(editorId) {
    return this.editors.get(editorId)?.value || ''
  }

  setValue(editorId, value) {
    const editor = this.editors.get(editorId)
    if (editor) {
      editor.value = value
      editor.dispatchEvent(new Event('input'))
    }
  }
}

// ===========================
// UI MANAGER
// ===========================
class UIManager {
  constructor() {
    this.elements = this.cacheElements()
    this.setupEventListeners()
  }

  cacheElements() {
    return {
      runBtn: document.getElementById('run'),
      terminal: document.getElementById('terminal'),
      source: document.getElementById('source'),
      lang: document.getElementById('lang'),
      loader: document.getElementById('loader')
    }
  }

  setupEventListeners() {
    // Run code
    this.elements.runBtn?.addEventListener('click', () => this.handleRun())

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        this.handleRun()
      }
      if (e.key === 'Tab' && e.target.tagName === 'TEXTAREA') {
        e.preventDefault()
        this.insertTab(e.target)
      }
    })

    // Auto-save
    this.setupAutoSave()
  }

  async handleRun() {
    const { lang, source, terminal } = this.elements

    if (!lang?.value || !source?.value) {
      this.showError('Please select a language and enter source code')
      return
    }

    this.showLoading(true)

    try {
      const codeService = new CodeExecutionService()
      const result = await codeService.submitCode(lang.value, source.value, terminal?.value || '')

      this.displayResult(result)
    } catch (error) {
      this.showError(error.message)
    } finally {
      this.showLoading(false)
    }
  }

  displayResult(result) {
    let output = ''

    if (result.success) {
      output = result.output || 'Program executed successfully with no output'
      if (result.errors) {
        output += '\n\nErrors/Warnings:\n' + result.errors
      }
    } else {
      output = 'Compilation/Execution failed:\n' + (result.message || 'Unknown error')
      if (result.errors) {
        output += '\n\nDetails:\n' + result.errors
      }
    }

    this.elements.terminal.value = output
  }

  showLoading(show) {
    this.elements.runBtn.disabled = show
    this.elements.terminal.value = show ? 'Executing code...' : ''
  }

  showError(message) {
    this.elements.terminal.value = `Error: ${message}`
  }

  updateStatus(status) {
    this.elements.terminal.value = `Status: ${status}`
  }

  insertTab(textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    textarea.value = value.substring(0, start) + '    ' + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 4
  }

  setupAutoSave() {
    const saveToStorage = Utils.debounce(() => {
      const data = {
        source: this.elements.source?.value || '',
        input: this.elements.terminal?.value || '',
        lang: this.elements.lang?.value || 'Python'
      }
      localStorage.setItem('codeEditorState', JSON.stringify(data))
    }, CONFIG.AUTO_SAVE_INTERVAL)

    ;['source', 'terminal', 'lang'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', saveToStorage)
    })

    // Load saved state
    const saved = localStorage.getItem('codeEditorState')
    if (saved) {
      const data = JSON.parse(saved)
      this.elements.source.value = data.source || ''
      this.elements.terminal.value = data.input || ''
      this.elements.lang.value = data.lang || 'Python'
    }
  }
}

// ===========================
// THEME MANAGER
// ===========================
class ThemeManager {
  constructor() {
    this.body = document.body
    this.initializeTheme()
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    this.setTheme(savedTheme)
  }

  setTheme(theme) {
    this.body.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }

  toggleTheme() {
    const isDark = this.body.classList.contains('dark')
    this.setTheme(isDark ? 'light' : 'dark')
  }
}

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize managers
  const editorManager = new EditorManager()
  const uiManager = new UIManager()
  const themeManager = new ThemeManager()

  // Global accessibility
  window.app = {
    editorManager,
    uiManager,
    themeManager,
    runCode: () => uiManager.handleRun()
  }

  // Setup theme toggle
  const themeToggle = document.querySelector('.dark-light')
  themeToggle?.addEventListener('click', () => themeManager.toggleTheme())

  console.log('Enhanced Code Editor initialized successfully')
})

// ===========================
// EXPORT FOR MODULE SYSTEM
// ===========================
export { EditorManager, UIManager, ThemeManager, CodeExecutionService }
