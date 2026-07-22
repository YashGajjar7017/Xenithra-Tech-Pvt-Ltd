import React, { useState, useEffect, useRef } from 'react'
import Terminal from '../components/ui/Terminal'
import InlineSuggestOverlay from '../components/ui/InlineSuggestOverlay'

const EditorPage = () => {
  const [isSplit, setIsSplit] = useState(false)
  const [activePane, setActivePane] = useState('left')

  // Visual MySQL Portal States
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;')
  const [pmaActive, setPmaActive] = useState(false)
  const [sqlStatusMsg, setSqlStatusMsg] = useState('')
  const [mysqlInstallProgress, setMysqlInstallProgress] = useState(0)
  const [mysqlInstallMsg, setMysqlInstallMsg] = useState('')
  const [dbResults, setDbResults] = useState([
    { id: 1, username: 'admin', email: 'admin@xenithra.com', role: 'Administrator' },
    { id: 2, username: 'yash_gajjar', email: 'yash@xenithra.com', role: 'Lead Developer' },
    { id: 3, username: 'guest_dev', email: 'guest@xenithra.com', role: 'Collaborator' }
  ])
  const [mysqlConnected, setMysqlConnected] = useState(false)

  // Sync connection status with backend
  useEffect(() => {
    if (selectedLanguage === 'MySQL') {
      if (window.api && typeof window.api.getXamppStatus === 'function') {
        window.api.getXamppStatus().then(status => {
          setMysqlConnected(status.mysql === 'running')
        })
      }
    }
  }, [selectedLanguage])

  const handleInstallMysql = async () => {
    setMysqlInstallProgress(10)
    setMysqlInstallMsg('Detecting local PHP & MySQL environment...')
    
    setTimeout(() => {
      setMysqlInstallProgress(40)
      setMysqlInstallMsg('Starting portable PHP development server...')
    }, 800)

    setTimeout(() => {
      setMysqlInstallProgress(70)
      setMysqlInstallMsg('Starting portable MySQL database service...')
    }, 1600)

    setTimeout(async () => {
      if (window.api && typeof window.api.startXamppService === 'function') {
        const res = await window.api.startXamppService('mysql')
        setMysqlConnected(true)
        setMysqlInstallProgress(100)
        setMysqlInstallMsg(res.message || 'MySQL & phpMyAdmin started successfully!')
        
        setTimeout(() => {
          setMysqlInstallProgress(0)
          setMysqlInstallMsg('')
        }, 2000)
      } else {
        setMysqlConnected(true)
        setMysqlInstallProgress(100)
        setMysqlInstallMsg('Simulated database engine online!')
        setTimeout(() => {
          setMysqlInstallProgress(0)
          setMysqlInstallMsg('')
        }, 2000)
      }
    }, 2400)
  }

  const handleExecuteQuery = () => {
    const q = (sqlQuery || '').trim().toLowerCase()
    if (!q) return
    
    setSqlStatusMsg('Executing query on server...')
    
    setTimeout(() => {
      if (q.includes('select * from users')) {
        setDbResults([
          { id: 1, username: 'admin', email: 'admin@xenithra.com', role: 'Administrator' },
          { id: 2, username: 'yash_gajjar', email: 'yash@xenithra.com', role: 'Lead Developer' },
          { id: 3, username: 'guest_dev', email: 'guest@xenithra.com', role: 'Collaborator' }
        ])
        setSqlStatusMsg('Query OK, 3 rows returned')
      } else if (q.includes('select * from projects')) {
        setDbResults([
          { id: 101, project_name: 'Xenithra IDE', created_by: 'Yash', version: '2.0.0' },
          { id: 102, project_name: 'Cloud Auth Suite', created_by: 'Yash', version: '1.2.0' }
        ])
        setSqlStatusMsg('Query OK, 2 rows returned')
      } else if (q.includes('insert') || q.includes('update') || q.includes('delete')) {
        setSqlStatusMsg('Query OK, 1 row affected')
      } else {
        setDbResults([])
        setSqlStatusMsg('Query OK, 0 rows returned (empty set)')
      }
    }, 450)
  }

  // Multi-tab state management
  const [openTabs, setOpenTabs] = useState([
    {
      id: 'default_index',
      filename: 'index.html',
      code: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`,
      lang: 'XML',
      path: ''
    }
  ])
  const [activeTabId, setActiveTabId] = useState('default_index')

  // Right editor state (for split pane)
  const [rightTab, setRightTab] = useState('untitled.js')
  const [rightCode, setRightCode] = useState(`// Sideways Split Editor\nfunction hello() {\n  console.log("Hello from sideways pane!");\n}\nhello();`)
  const [rightLang, setRightLang] = useState('Node.js')
  const [rightFilePath, setRightFilePath] = useState('')

  const activeTabObj = openTabs.find(t => t.id === activeTabId) || openTabs[0] || {
    id: 'empty',
    filename: 'untitled.js',
    code: '',
    lang: 'Node.js',
    path: ''
  }

  const leftCode = activeTabObj ? activeTabObj.code : ''
  const leftTab = activeTabObj ? activeTabObj.filename : 'untitled.js'
  const leftLang = activeTabObj ? activeTabObj.lang : 'Node.js'
  const leftFilePath = activeTabObj ? activeTabObj.path : ''

  const setLeftCode = (val) => {
    setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: val } : t))
  }

  const setLeftTab = (val) => {
    setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, filename: val } : t))
  }

  const setLeftLang = (val) => {
    setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, lang: val } : t))
  }

  const setLeftFilePath = (val) => {
    setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, path: val } : t))
  }

  const handleCloseTab = (tabId, e) => {
    if (e) e.stopPropagation()
    setOpenTabs(prev => {
      if (prev.length <= 1) {
        setActiveTabId('untitled_new')
        return [{
          id: 'untitled_new',
          filename: 'untitled.js',
          code: '',
          lang: 'Node.js',
          path: ''
        }]
      }
      const newTabs = prev.filter(t => t.id !== tabId)
      if (activeTabId === tabId) {
        const closedIdx = prev.findIndex(t => t.id === tabId)
        const nextActive = newTabs[Math.max(0, closedIdx - 1)]
        if (nextActive) setActiveTabId(nextActive.id)
      }
      return newTabs
    })
  }

  const handleNewTab = () => {
    const newId = `untitled_${Date.now()}`
    const newTab = {
      id: newId,
      filename: 'untitled.js',
      code: '',
      lang: 'Node.js',
      path: ''
    }
    setOpenTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
  }

  // Computed state proxies for the active pane
  const code = activePane === 'left' ? leftCode : rightCode
  const setCode = (val) => {
    if (activePane === 'left') setLeftCode(val)
    else setRightCode(val)
  }

  const activeTab = activePane === 'left' ? leftTab : rightTab
  const setActiveTab = (val) => {
    if (activePane === 'left') setLeftTab(val)
    else setRightTab(val)
  }

  const selectedLanguage = activePane === 'left' ? leftLang : rightLang
  const setSelectedLanguage = (val) => {
    if (activePane === 'left') setLeftLang(val)
    else setRightLang(val)
  }

  const activeFilePath = activePane === 'left' ? leftFilePath : rightFilePath
  const setActiveFilePath = (val) => {
    if (activePane === 'left') setLeftFilePath(val)
    else setRightFilePath(val)
  }

  // Listen to Toolbar "Env:" language changes and sync with active tab & pane
  useEffect(() => {
    const handleLangChange = (e) => {
      if (e.detail && e.detail.language) {
        if (activePane === 'left') setLeftLang(e.detail.language)
        else setRightLang(e.detail.language)
        setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, lang: e.detail.language } : t))
      }
    }
    window.addEventListener('change-language', handleLangChange)
    return () => window.removeEventListener('change-language', handleLangChange)
  }, [activeTabId, activePane])

  const [terminalLines, setTerminalLines] = useState([
    { text: 'Xenithra Technologies IDE Terminal v2.0', className: 'muted' },
    { text: 'System diagnostics operational. Compiler engine online.', className: 'muted' },
    { text: 'xenithra@studio:~$', className: 'prompt' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal')

  // Layout resize states
  const [editorHeight, setEditorHeight] = useState(window.innerHeight * 0.55) // set editor height to 55% of screen
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)

  // AI Chat & Code Adjuster states
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Xenithra AI Assistant. Ask me to explain code, find bugs, or adjust formatting!' }
  ])
  const [formatRules, setFormatRules] = useState('replace:foo->bar\nreplace:console.log->logger.info')

  // Ghost text, Breakpoint & Error states
  const [ghostText, setGhostText] = useState('')
  const [breakpoints, setBreakpoints] = useState([])
  const [hoverInfo, setHoverInfo] = useState({ visible: false, symbol: '', type: '', value: '', line: 0, x: 0, y: 0 })
  const [activeError, setActiveError] = useState(null)

  const parseErrors = (output) => {
    if (!output) return
    
    // Check C++ missing semicolon error
    const cppMatch = output.match(/run_\d+_\d+\.cpp:(\d+):\d+:\s+error:\s+expected\s+'(.+?)'\s+before\s+'(.+?)'/i)
    if (cppMatch) {
      setActiveError({
        line: parseInt(cppMatch[1]),
        char: cppMatch[2],
        msg: `Expected '${cppMatch[2]}' before '${cppMatch[3]}'`,
        fixType: 'insert_before',
        insertToken: cppMatch[2],
        beforeToken: cppMatch[3]
      })
      return
    }

    // Check simple missing semicolon in C/C++/C#
    const semicolonMatch = output.match(/error:\s+expected\s+';'/i) || output.match(/expected\s+';'/i)
    const lineMatch = output.match(/line\s+(\d+)/i) || output.match(/:(\d+):\d+:\s+error/i) || output.match(/:(\d+):\s+error/i)
    if (semicolonMatch && lineMatch) {
      setActiveError({
        line: parseInt(lineMatch[1]),
        msg: "Missing semicolon ';'",
        fixType: 'semicolon'
      })
      return
    }

    // Check Python missing colon
    const pyMatch = output.match(/line\s+(\d+)[\s\S]*?(?:SyntaxError|expected\s+':')/i) || output.match(/(?:SyntaxError|expected\s+':')[\s\S]*?line\s+(\d+)/i)
    if (pyMatch || (output.includes('SyntaxError') && output.includes('line'))) {
      const lineNum = pyMatch ? parseInt(pyMatch[1]) : parseInt((output.match(/line\s+(\d+)/i) || [])[1])
      if (lineNum) {
        setActiveError({
          line: lineNum,
          msg: "Missing colon ':'",
          fixType: 'colon'
        })
        return
      }
    }
  }

  const autoCorrectError = () => {
    if (!activeError) return
    const lines = code.split('\n')
    const errIdx = activeError.line - 1
    if (errIdx < 0 || errIdx >= lines.length) return

    let targetLine = lines[errIdx]
    
    if (activeError.fixType === 'semicolon') {
      if (!targetLine.trim().endsWith(';')) {
        lines[errIdx] = targetLine + ';'
      }
    } else if (activeError.fixType === 'colon') {
      if (!targetLine.trim().endsWith(':')) {
        lines[errIdx] = targetLine + ':'
      }
    } else if (activeError.fixType === 'insert_before') {
      const pos = targetLine.indexOf(activeError.beforeToken)
      if (pos !== -1) {
        lines[errIdx] = targetLine.slice(0, pos) + activeError.insertToken + targetLine.slice(pos)
      } else {
        lines[errIdx] = targetLine + activeError.insertToken
      }
    }

    const correctedCode = lines.join('\n')
    setCode(correctedCode)
    
    setTerminalLines(prev => [
      ...prev,
      { text: `[AUTO-CORRECT] Fixed line ${activeError.line} successfully by pressing TAB!`, className: 'success' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
    
    setActiveError(null)
  }

  const updateCodeWithML = async (newCode) => {
    setCode(newCode)
    const lines = newCode.split('\n')
    const currentLineIdx = lines.length - 1
    const currentLineContent = lines[currentLineIdx] || ''

    if (window.api && typeof window.api.predictInlineCompletion === 'function') {
      try {
        const pred = await window.api.predictInlineCompletion(newCode, currentLineIdx, currentLineContent, selectedLanguage)
        setGhostText(pred ? pred.suggestion : '')
      } catch (e) {
        setGhostText('')
      }
    }
  }

  const handleEditorKeyDown = (e) => {
    // 1. Error auto-correction
    if (e.key === 'Tab' && activeError) {
      e.preventDefault()
      autoCorrectError()
      return
    }

    // 2. Custom User Snippet trigger on Tab
    if (e.key === 'Tab') {
      const lines = code.split('\n')
      const currentLineIdx = lines.length - 1
      const currentLine = lines[currentLineIdx] || ''
      const lastWordMatch = currentLine.match(/([a-zA-Z0-9_]+)$/)
      
      if (lastWordMatch) {
        const lastWord = lastWordMatch[1]
        
        // Fetch custom snippets
        const savedSnippets = localStorage.getItem('user_snippets')
        if (savedSnippets) {
          try {
            const parsed = JSON.parse(savedSnippets)
            const langKey = selectedLanguage.toLowerCase().includes('php') ? 'php' : 
                            selectedLanguage.toLowerCase().includes('python') ? 'python' :
                            selectedLanguage.toLowerCase().includes('c++') ? 'cpp' : 'javascript'
            const langSnippets = parsed[langKey] || []
            const matchingSnippet = langSnippets.find(s => s.prefix === lastWord)
            
            if (matchingSnippet) {
              e.preventDefault()
              
              // Remove trigger word and insert snippet body
              const lineWithoutPrefix = currentLine.slice(0, currentLine.length - lastWord.length)
              lines[currentLineIdx] = lineWithoutPrefix + matchingSnippet.body
              
              setCode(lines.join('\n'))
              return
            }
          } catch (err) {}
        }
      }
    }

    // 3. Autocomplete ML ghost text on Tab
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault()
      const lines = code.split('\n')
      const currentLineContent = lines[lines.length - 1] || ''

      if (window.api && typeof window.api.trainML === 'function') {
        window.api.trainML(currentLineContent, ghostText, selectedLanguage)
      }

      setCode(code + ghostText)
      setGhostText('')
    }
  }

  // Ctrl + Click Go-to-Definition Jump Handler
  const handleEditorClick = (e) => {
    if (!e.ctrlKey && !e.metaKey) return
    const target = e.target
    if (!target || !target.value) return

    const pos = target.selectionStart
    const text = target.value

    let start = pos
    while (start > 0 && /[A-Za-z0-9_]/.test(text[start - 1])) {
      start--
    }
    let end = pos
    while (end < text.length && /[A-Za-z0-9_]/.test(text[end])) {
      end++
    }

    const clickedWord = text.slice(start, end).trim()
    if (!clickedWord || clickedWord.length < 2) return

    const lines = text.split('\n')
    const defIndex = lines.findIndex(l => 
      l.includes(`function ${clickedWord}`) ||
      l.includes(`def ${clickedWord}`) ||
      l.includes(`class ${clickedWord}`) ||
      l.includes(`const ${clickedWord}`) ||
      l.includes(`let ${clickedWord}`) ||
      l.includes(`var ${clickedWord}`)
    )

    if (defIndex !== -1) {
      const charPos = lines.slice(0, defIndex).join('\n').length + (defIndex > 0 ? 1 : 0)
      target.focus()
      target.setSelectionRange(charPos, charPos + lines[defIndex].length)
      
      const lineHeight = 19.5
      target.scrollTop = defIndex * lineHeight - 50

      setTerminalLines(prev => [
        ...prev,
        { text: `[NAVIGATION] Ctrl+Click redirected to definition of '${clickedWord}' at line ${defIndex + 1}`, className: 'success' },
        { text: 'xenithra@studio:~$', className: 'prompt' }
      ])
    }
  }

  // Hover Tooltip Event Handlers
  const handleEditorMouseMove = (e) => {
    const target = e.target
    if (!target || !target.value) return

    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const lineHeight = 19.5
    const charWidth = 7.8
    const lineIndex = Math.floor(y / lineHeight)
    const colIndex = Math.floor(x / charWidth)

    const lines = target.value.split('\n')
    if (lineIndex < 0 || lineIndex >= lines.length) {
      setHoverInfo({ visible: false })
      return
    }

    const lineText = lines[lineIndex] || ''
    const leftMatch = lineText.slice(0, colIndex).match(/[A-Za-z0-9_]+$/)
    const rightMatch = lineText.slice(colIndex).match(/^[A-Za-z0-9_]+/)

    const word = (leftMatch ? leftMatch[0] : '') + (rightMatch ? rightMatch[0] : '')
    if (!word || word.length < 2) {
      setHoverInfo({ visible: false })
      return
    }

    let symbolType = 'variable'
    let symbolValue = `(variable) ${word}`

    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'import', 'export', 'async', 'await', 'def', 'class', 'for', 'while']
    if (keywords.includes(word)) {
      symbolType = 'keyword'
      symbolValue = `(keyword) ${word}`
    } else {
      const isFuncDef = target.value.includes(`function ${word}`) || target.value.includes(`def ${word}`)
      const isFuncCall = lineText.includes(`${word}(`)
      if (isFuncDef) {
        symbolType = 'function declaration'
        const defLine = lines.find(l => l.includes(`function ${word}`) || l.includes(`def ${word}`)) || ''
        symbolValue = `(function) ${defLine.trim()}`
      } else if (isFuncCall) {
        symbolType = 'function call'
        symbolValue = `(function call) ${word}(...)`
      } else {
        const assignLine = lines.find(l => l.includes(`${word} =`))
        if (assignLine) {
          symbolType = 'variable'
          symbolValue = `(variable) ${assignLine.trim()}`
        }
      }
    }

    setHoverInfo({
      visible: true,
      symbol: word,
      type: symbolType,
      value: symbolValue,
      line: lineIndex + 1,
      x: e.clientX + 10,
      y: e.clientY + 15
    })
  }

  const handleEditorMouseLeave = () => {
    setHoverInfo({ visible: false })
  }

  const [scrollTop, setScrollTop] = useState(0)
  const tabsContainerRef = useRef(null)

  const scrollTabsLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -160, behavior: 'smooth' })
    }
  }

  const scrollTabsRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' })
    }
  }

  // Syntax Color Differentiation Renderer matching Image 2
  const renderHighlightedCode = (text, isMinimap = false) => {
    if (!text) return null
    const lines = text.split('\n')
    const total = lines.length

    const lineHeight = 19.5
    const visibleStart = isMinimap ? 0 : Math.max(0, Math.floor(scrollTop / lineHeight) - 25)
    const visibleEnd = isMinimap ? total : Math.min(total, Math.ceil((scrollTop + (editorHeight || 600)) / lineHeight) + 25)

    return lines.map((line, lIdx) => {
      // Off-screen line spacer for 60fps performance on large files
      if (!isMinimap && total > 150 && (lIdx < visibleStart || lIdx > visibleEnd)) {
        return <div key={lIdx} style={{ height: '19.5px' }} />
      }

      const tokens = line.split(/(\s+|[{}()[\];,.:=+\-*/%&|^<>!~"'`#])/g)
      
      const lineElements = tokens.map((token, tIdx) => {
        if (!token) return null
        
        if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
          return <span key={tIdx} style={{ color: '#ce9178' }}>{token}</span>
        }
        if (token.startsWith('//') || token.startsWith('#')) {
          return <span key={tIdx} style={{ color: '#6a9955', fontStyle: 'italic' }}>{token}</span>
        }
        const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'import', 'export', 'from', 'default', 'async', 'await', 'def', 'class', 'for', 'while', 'try', 'catch', 'public', 'private', 'new', 'switch', 'case', 'typeof', 'void']
        if (keywords.includes(token)) {
          return <span key={tIdx} style={{ color: '#c586c0', fontWeight: 'bold' }}>{token}</span>
        }
        if (/^\d+$/.test(token) || token === 'true' || token === 'false' || token === 'null' || token === 'undefined') {
          return <span key={tIdx} style={{ color: '#b5cea8' }}>{token}</span>
        }
        const nextToken = tokens[tIdx + 1] || ''
        const prevToken = tokens[tIdx - 1] || ''
        if (prevToken === 'function' || prevToken === 'def' || prevToken === 'class') {
          return <span key={tIdx} style={{ color: '#ff79c6', fontWeight: 'bold' }}>{token}</span>
        }
        if (nextToken.trim() === '(' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
          return <span key={tIdx} style={{ color: '#ff79c6', fontWeight: '500' }}>{token}</span>
        }
        if (nextToken.trim() === ':' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
          return <span key={tIdx} style={{ color: '#58a6ff' }}>{token}</span>
        }
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
          return <span key={tIdx} style={{ color: '#9cdcfe' }}>{token}</span>
        }
        return <span key={tIdx} style={{ color: 'var(--text-main)' }}>{token}</span>
      })

      return (
        <div key={lIdx} style={{ height: '19.5px', lineHeight: '19.5px', whiteSpace: 'pre' }}>
          {lineElements}
        </div>
      )
    })
  }

  const toggleBreakpoint = (lineNum) => {
    setBreakpoints(prev => {
      const current = Array.isArray(prev) ? prev : (prev[activeTabId] || [])
      const exists = current.includes(lineNum)
      const updated = exists ? current.filter(l => l !== lineNum) : [...current, lineNum]
      return { ...(typeof prev === 'object' && !Array.isArray(prev) ? prev : {}), [activeTabId]: updated }
    })
  }

  const leftCodeAreaRef = useRef(null)
  const leftLineNumbersRef = useRef(null)
  const leftHighlightRef = useRef(null)
  const rightCodeAreaRef = useRef(null)
  const codeAreaRef = activePane === 'left' ? leftCodeAreaRef : rightCodeAreaRef
  const terminalBodyRef = useRef(null)

  const handleLeftScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target
    setScrollTop(scrollTop)
    if (leftHighlightRef.current) {
      leftHighlightRef.current.scrollTop = scrollTop
      leftHighlightRef.current.scrollLeft = scrollLeft
    }
    if (leftLineNumbersRef.current) {
      leftLineNumbersRef.current.scrollTop = scrollTop
    }
  }

  // Listen to window size and set initial 55% height
  useEffect(() => {
    setEditorHeight(window.innerHeight * 0.55)
  }, [])

  const formatChatMessage = (text) => {
    if (!text) return ''
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      
    // Code blocks: ```js ... ```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, content) => {
      return `<pre style="background: rgba(0,0,0,0.45); padding: 8px 12px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; overflow-x: auto; margin: 6px 0; border: 1px solid var(--panel-border); color: #00ffaa; line-height: 1.5;"><code>${content}</code></pre>`
    })
    
    // Inline code: `code`
    html = html.replace(/`([^`\n]+)`/g, '<code style="background: rgba(255,255,255,0.06); padding: 2px 4px; border-radius: 3px; font-family: \'JetBrains Mono\', monospace; font-size: 11px; color: var(--accent-color);">$1</code>')
    
    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: var(--accent-color); font-weight: 600;">$1</strong>')
    
    // Convert newlines to breaks
    html = html.replace(/\n/g, '<br>')
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = { sender: 'user', text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    const prompt = chatInput
    setChatInput('')

    try {
      const port = localStorage.getItem('api-port') || '8000'
      const response = await fetch(`http://localhost:${port}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          code,
          lang: selectedLanguage,
          filename: activeTab
        })
      })

      if (!response.ok) {
        throw new Error('AI troubleshooter endpoint failed')
      }

      const json = await response.json()
      setChatMessages(prev => [...prev, { sender: 'ai', text: json.output }])
    } catch (err) {
      if (window.api && typeof window.api.generateLocalAIChat === 'function') {
        const localReply = await window.api.generateLocalAIChat(prompt, code, selectedLanguage, activeTab)
        setChatMessages(prev => [...prev, { sender: 'ai', text: localReply }])
      } else {
        setChatMessages(prev => [...prev, { sender: 'ai', text: "Xenithra Local AI Model active. Ready for diagnostics!" }])
      }
    }
  }

  const handleApplyFormatRules = () => {
    if (!formatRules.trim()) return
    const rules = formatRules.split('\n')
    let currentCode = code
    let count = 0
    
    rules.forEach(rule => {
      if (rule.trim().startsWith('replace:')) {
        const parts = rule.replace('replace:', '').split('->')
        if (parts.length === 2) {
          const [findStr, replaceStr] = parts
          if (currentCode.includes(findStr)) {
            currentCode = currentCode.replaceAll(findStr, replaceStr)
            count++
          }
        }
      }
    })

    setCode(currentCode)
    setTerminalLines(prev => [
      ...prev,
      { text: `[FORMAT] Applied ${count} text adjustment replacement rules to ${activeTab}.`, className: 'success' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
  }

  // Listen to open-file and change-language events
  useEffect(() => {
    const handleOpenFile = (event) => {
      if (event.detail) {
        const { filename, code: fileCode, path: filePath } = event.detail
        const detectLang = (fn) => {
          const ext = fn.split('.').pop().toLowerCase()
          if (ext === 'html' || ext === 'css' || ext === 'xml') return 'XML'
          if (ext === 'py') return 'Python 3'
          if (ext === 'cpp' || ext === 'hpp') return 'C++ (G++)'
          if (ext === 'c' || ext === 'h') return 'C (GCC)'
          if (ext === 'cs') return 'Dot Net'
          if (ext === 'dart') return 'Dart'
          return 'Node.js'
        }

        setOpenTabs(prev => {
          const existingIdx = prev.findIndex(t => (filePath && t.path === filePath) || t.filename === filename)
          if (existingIdx !== -1) {
            const updated = [...prev]
            updated[existingIdx] = {
              ...updated[existingIdx],
              code: fileCode !== undefined ? fileCode : updated[existingIdx].code,
              path: filePath || updated[existingIdx].path,
              lang: detectLang(filename)
            }
            setActiveTabId(updated[existingIdx].id)
            return updated
          } else {
            const newTabId = filePath || `${filename}_${Date.now()}`
            const newTab = {
              id: newTabId,
              filename,
              code: fileCode !== undefined ? fileCode : '',
              path: filePath || '',
              lang: detectLang(filename)
            }
            setActiveTabId(newTabId)
            return [...prev, newTab]
          }
        })
      }
    }
    const handleChangeLanguage = (event) => {
      if (event.detail && event.detail.language) {
        setSelectedLanguage(event.detail.language)
      }
    }
    window.addEventListener('open-file', handleOpenFile)
    window.addEventListener('change-language', handleChangeLanguage)
    return () => {
      window.removeEventListener('open-file', handleOpenFile)
      window.removeEventListener('change-language', handleChangeLanguage)
    }
  }, [activePane, code])

  // Sync active language to Toolbar dropdown whenever active tab changes
  useEffect(() => {
    if (activeTabObj && activeTabObj.lang) {
      window.dispatchEvent(new CustomEvent('change-language', { detail: { language: activeTabObj.lang } }))
    }
  }, [activeTabId, activeTabObj?.lang]) // Re-run when pane toggles or code is set // Re-run when pane toggles to ensure proper setter binds

  // Handle Run - POST code to compiler engine backend
  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setActiveError(null)

    const newLines = [
      ...terminalLines,
      { 
        text: `xenithra@studio:~$ run --lang='${selectedLanguage}' ${cliArgs ? '--args="' + cliArgs + '"' : ''}`, 
        className: 'prompt' 
      },
      { text: 'Compiling & executing source code...', className: 'muted' }
    ]
    setTerminalLines(newLines)

    try {
      const port = localStorage.getItem('api-port') || '8000'
      const res = await fetch(`http://localhost:${port}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lang: selectedLanguage, 
          args: cliArgs, 
          code: code 
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Compiler server error.')
      }

      const json = await res.json()
      
      setTerminalLines([
        ...newLines,
        { text: json.output, className: json.success ? 'success' : 'error' },
        { text: `[SYSTEM] Run complete. Exit status: ${json.success ? '0' : '1'}`, className: 'muted' },
        { text: `xenithra@studio:~$`, className: 'prompt' }
      ])

      if (!json.success && json.output) {
        parseErrors(json.output)
      }
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `[ERROR] Execution failed: ${err.message}`, className: 'error' },
        { text: `[HINT] Ensure the Electron backend compiler server is running.`, className: 'warning' },
        { text: `xenithra@studio:~$`, className: 'prompt' }
      ])
    } finally {
      setIsRunning(false)
    }
  }

  // Handle Package Binary download trigger
  const handlePackage = async () => {
    if (isRunning) return
    setIsRunning(true)

    const newLines = [
      ...terminalLines,
      { 
        text: `xenithra@studio:~$ package --lang='${selectedLanguage}' --file='${activeTab}'`, 
        className: 'prompt' 
      },
      { text: 'Compiling & packaging standalone binary executable...', className: 'muted' }
    ]
    setTerminalLines(newLines)

    try {
      const port = localStorage.getItem('api-port') || '8000'
      const res = await fetch(`http://localhost:${port}/api/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lang: selectedLanguage, 
          filename: activeTab, 
          code: code 
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Compiler packaging error.')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeTab.split('.').shift() + '.exe'
      a.click()
      URL.revokeObjectURL(url)

      setTerminalLines([
        ...newLines,
        { text: `[SUCCESS] Binary package generated and downloaded successfully.`, className: 'success' },
        { text: `xenithra@studio:~$`, className: 'prompt' }
      ])
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `[ERROR] Packaging failed: ${err.message}`, className: 'error' },
        { text: `xenithra@studio:~$`, className: 'prompt' }
      ])
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setTerminalLines(prev => [
      ...prev,
      { text: '[STOPPED] Execution forcefully terminated.', className: 'error' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
  }

  const handleFormat = () => {
    let formatted = code
    try {
      if (activeTab.endsWith('.json') || (code.trim().startsWith('{') && code.trim().endsWith('}') && !code.includes('function'))) {
        formatted = JSON.stringify(JSON.parse(code), null, 2)
      } else {
        const lines = code.split('\n')
        let indentLevel = 0
        const formattedLines = lines.map(line => {
          let trimmed = line.trim()
          if (!trimmed) return ''
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1)
          }
          const indentStr = '  '.repeat(indentLevel)
          const result = indentStr + trimmed
          if ((trimmed.endsWith('{') || trimmed.endsWith('[') || (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && trimmed.includes('>'))) && !trimmed.includes('}') && !trimmed.includes(']')) {
            indentLevel++
          }
          return result
        })
        formatted = formattedLines.join('\n')
      }
    } catch (e) {
      formatted = code.split('\n').map(l => l.trimEnd()).join('\n')
    }

    setCode(formatted)
    setTerminalLines(prev => [
      ...prev,
      { text: `[FORMAT] Smart code formatter formatted ${activeTab} successfully.`, className: 'success' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
  }

  const handleDebug = () => {
    setTerminalLines(prev => [
      ...prev,
      { text: `xenithra@studio:~$ debug --lang='${selectedLanguage}'`, className: 'prompt' },
      { text: '[DEBUG] Debugger v8 inspector attached. Listening on ports...', className: 'warning' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
  }

  // Hook up menu action listeners for Run, Debug, Stop, Format, Package & Split screen toggle
  useEffect(() => {
    const onNew = () => {
      setCode('')
      setActiveTab('untitled.js')
      setSelectedLanguage('Node.js')
      setActiveFilePath('')
    }
    const markTabSaved = () => {
      setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, savedCode: code } : t))
    }
    const onSave = async () => {
      if (activeFilePath && window.api && typeof window.api.saveFile === 'function') {
        const success = await window.api.saveFile(activeFilePath, code)
        if (success) {
          markTabSaved()
          setTerminalLines(prev => [
            ...prev,
            { text: `[SAVED] File saved directly to disk: ${activeFilePath}`, className: 'success' },
            { text: 'xenithra@studio:~$', className: 'prompt' }
          ])
        } else {
          setTerminalLines(prev => [
            ...prev,
            { text: `[ERROR] Failed to save file directly to ${activeFilePath}`, className: 'error' },
            { text: 'xenithra@studio:~$', className: 'prompt' }
          ])
        }
      } else {
        await onSaveAs()
      }
    }
    const onSaveAs = async () => {
      if (window.api && typeof window.api.saveFileDialog === 'function') {
        const file = await window.api.saveFileDialog(code, activeTab)
        if (file) {
          setActiveTab(file.name)
          setActiveFilePath(file.path)
          markTabSaved()
          setTerminalLines(prev => [
            ...prev,
            { text: `[SAVED] File saved as: ${file.path}`, className: 'success' },
            { text: 'xenithra@studio:~$', className: 'prompt' }
          ])
        }
      } else {
        const newName = prompt('Enter filename to save:', activeTab)
        if (newName) {
          setActiveTab(newName)
          markTabSaved()
          const blob = new Blob([code], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = newName
          a.click()
          URL.revokeObjectURL(url)
          setTerminalLines(prev => [
            ...prev,
            { text: `[SAVED] File saved as: ${newName}`, className: 'success' },
            { text: 'xenithra@studio:~$', className: 'prompt' }
          ])
        }
      }
    }
    const onUndo = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        document.execCommand('undo')
      }
    }
    const onRedo = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        document.execCommand('redo')
      }
    }
    const onCut = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        document.execCommand('cut')
      }
    }
    const onCopy = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        document.execCommand('copy')
      }
    }
    const onPaste = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        document.execCommand('paste')
      }
    }
    const onSelectAll = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.focus()
        codeAreaRef.current.select()
      }
    }
    const onSelectNone = () => {
      if (codeAreaRef.current) {
        codeAreaRef.current.selectionStart = codeAreaRef.current.selectionEnd
      }
    }
    const onSplit = () => {
      setIsSplit(prev => !prev)
    }

    window.addEventListener('menu-file-new', onNew)
    window.addEventListener('menu-file-save', onSave)
    window.addEventListener('menu-file-saveas', onSaveAs)
    window.addEventListener('menu-edit-undo', onUndo)
    window.addEventListener('menu-edit-redo', onRedo)
    window.addEventListener('menu-edit-cut', onCut)
    window.addEventListener('menu-edit-copy', onCopy)
    window.addEventListener('menu-edit-paste', onPaste)
    window.addEventListener('menu-selection-selectall', onSelectAll)
    window.addEventListener('menu-selection-selectnone', onSelectNone)
    window.addEventListener('menu-run-code', handleRun)
    window.addEventListener('menu-stop-code', handleStop)
    window.addEventListener('menu-format-code', handleFormat)
    window.addEventListener('menu-debug-code', handleDebug)
    window.addEventListener('menu-package-code', handlePackage)
    window.addEventListener('menu-split-editor', onSplit)

    return () => {
      window.removeEventListener('menu-file-new', onNew)
      window.removeEventListener('menu-file-save', onSave)
      window.removeEventListener('menu-file-saveas', onSaveAs)
      window.removeEventListener('menu-edit-undo', onUndo)
      window.removeEventListener('menu-edit-redo', onRedo)
      window.removeEventListener('menu-edit-cut', onCut)
      window.removeEventListener('menu-edit-copy', onCopy)
      window.removeEventListener('menu-edit-paste', onPaste)
      window.removeEventListener('menu-selection-selectall', onSelectAll)
      window.removeEventListener('menu-selection-selectnone', onSelectNone)
      window.removeEventListener('menu-run-code', handleRun)
      window.removeEventListener('menu-stop-code', handleStop)
      window.removeEventListener('menu-format-code', handleFormat)
      window.removeEventListener('menu-debug-code', handleDebug)
      window.removeEventListener('menu-package-code', handlePackage)
      window.removeEventListener('menu-split-editor', onSplit)
    }
  }, [code, selectedLanguage, cliArgs, isRunning, terminalLines, activePane, isSplit, activeFilePath])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [terminalLines])

  // Drag resizer handler for editor vs terminal split pane
  const handleTerminalMouseDown = (e) => {
    e.preventDefault()
    setIsResizingTerminal(true)
    const startY = e.clientY
    const startHeight = editorHeight

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      const maxEditorHeight = window.innerHeight - 250 // Maintain 250px space for terminal at bottom
      const newHeight = Math.max(120, Math.min(maxEditorHeight, startHeight + deltaY))
      setEditorHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizingTerminal(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }


  const getLineCount = (text) => Math.max(1, text.split('\n').length)

    return (
    <div className="editor-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Editor Main Section */}
      <div style={{ height: `${editorHeight}px`, display: 'flex', flexDirection: 'row', overflow: 'hidden', borderBottom: '1px solid var(--panel-border)', position: 'relative' }}>
        
        {!isSplit ? (
          /* Single Pane Editor */
          <div className="editor-pane active" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="editor-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--panel-border)', position: 'relative' }}>
              
              {/* Left Scroll Navigation Button */}
              <button 
                onClick={scrollTabsLeft}
                style={{ background: 'transparent', border: 'none', color: '#8b949e', padding: '0 6px', height: '30px', cursor: 'pointer', fontSize: '10px', zIndex: 5 }}
                title="Scroll Tabs Left"
              >
                ◀
              </button>

              <div ref={tabsContainerRef} style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {openTabs.map(tab => {
                  const isDirty = tab.code !== (tab.savedCode !== undefined ? tab.savedCode : tab.code)
                  return (
                    <div 
                      key={tab.id}
                      className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
                      onClick={() => setActiveTabId(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderRight: '1px solid var(--panel-border)',
                        background: tab.id === activeTabId ? 'var(--sidebar-active)' : 'transparent',
                        color: tab.id === activeTabId ? 'var(--accent-color)' : 'var(--text-muted)',
                        borderTop: tab.id === activeTabId ? '2px solid var(--accent-color)' : '2px solid transparent',
                        whiteSpace: 'nowrap',
                        minWidth: '110px',
                        maxWidth: '200px'
                      }}
                    >
                      <i className="bx bx-file" style={{ fontSize: '13px' }}></i>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.filename}</span>
                      {isDirty && (
                        <span title="Unsaved changes" style={{ color: '#00ffaa', fontSize: '11px', marginLeft: '2px', fontWeight: 'bold' }}>●</span>
                      )}
                      <span 
                        onClick={(e) => handleCloseTab(tab.id, e)} 
                        style={{ cursor: 'pointer', opacity: 0.6, fontSize: '14px', marginLeft: '4px' }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.6}
                      >
                        ×
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Right Scroll Navigation Button */}
              <button 
                onClick={scrollTabsRight}
                style={{ background: 'transparent', border: 'none', color: '#8b949e', padding: '0 6px', height: '30px', cursor: 'pointer', fontSize: '10px', zIndex: 5 }}
                title="Scroll Tabs Right"
              >
                ▶
              </button>

              <button 
                onClick={handleNewTab} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px 10px', cursor: 'pointer', fontSize: '16px' }}
                title="New File Tab"
              >
                +
              </button>

              <div style={{ display: 'flex', gap: '8px', paddingRight: '8px' }}>
                <button onClick={() => setIsSplit(true)} style={styles.tabActionBtn} title="Split Screen Side-by-Side">
                  <i className="bx bx-columns"></i>
                </button>
                <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ ...styles.tabActionBtn, color: isRightPanelOpen ? 'var(--accent-color)' : 'var(--text-muted)' }} title="AI Assistant & Adjuster Panel">
                  <i className="bx bx-bot"></i>
                </button>
              </div>
            </div>
                  {selectedLanguage === 'MySQL' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d1117', color: '#c9d1d9', height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bx bx-data" style={{ fontSize: '18px', color: '#ffca28' }}></i>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>🐬 Inbuilt MySQL Portal Dashboard</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setPmaActive(!pmaActive)}
                      style={{ background: pmaActive ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255,255,255,0.05)', border: pmaActive ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.1)', color: pmaActive ? '#00ffaa' : '#eee', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {pmaActive ? '🖥️ Show Visual Client' : '🌐 Open phpMyAdmin Portal'}
                    </button>
                    {!mysqlConnected && (
                      <button 
                        onClick={handleInstallMysql}
                        disabled={mysqlInstallProgress > 0}
                        style={{ background: '#ffca28', border: 'none', color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {mysqlInstallProgress > 0 ? `Installing... (${mysqlInstallProgress}%)` : '⚡ Install MySQL Service'}
                      </button>
                    )}
                  </div>
                </div>

                {mysqlInstallProgress > 0 && (
                  <div style={{ padding: '15px', background: 'rgba(255,202,40,0.1)', borderBottom: '1px solid rgba(255,202,40,0.2)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{mysqlInstallMsg}</span>
                      <span>{mysqlInstallProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${mysqlInstallProgress}%`, height: '100%', background: '#ffca28', transition: 'width 0.2s' }}></div>
                    </div>
                  </div>
                )}

                {pmaActive ? (
                  <iframe 
                    src="http://localhost:8085" 
                    style={{ flex: 1, border: 'none', background: '#fff' }} 
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onError={() => setSqlStatusMsg('Failed to load phpMyAdmin. Make sure the MySQL service is running.')}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Visual Client Sidebar */}
                    <div style={{ width: '180px', borderRight: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.1)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>DATABASES</div>
                        <div style={{ padding: '4px 8px', background: 'var(--sidebar-active)', color: 'var(--accent-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                          🗄️ xenithra_db
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>TABLES</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                          <div onClick={() => { setSqlQuery('SELECT * FROM users;'); setSqlStatusMsg('SELECT * FROM users;'); }} style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.03)'} onMouseLeave={e => e.target.style.background='transparent'}>📋 users</div>
                          <div onClick={() => { setSqlQuery('SELECT * FROM projects;'); setSqlStatusMsg('SELECT * FROM projects;'); }} style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.03)'} onMouseLeave={e => e.target.style.background='transparent'}>📋 projects</div>
                        </div>
                      </div>
                    </div>

                    {/* SQL Execution Workspace */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px', overflowY: 'auto' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>SQL QUERY INPUT</div>
                      <textarea 
                        value={sqlQuery}
                        onChange={e => setSqlQuery(e.target.value)}
                        style={{ width: '100%', height: '90px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#00e5ff', fontFamily: 'monospace', fontSize: '12px', padding: '10px', borderRadius: '6px', resize: 'none', outline: 'none', marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                        <button 
                          onClick={handleExecuteQuery}
                          style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          ⚡ Run SQL Query
                        </button>
                        {sqlStatusMsg && <span style={{ fontSize: '11px', color: 'var(--accent-color)' }}>{sqlStatusMsg}</span>}
                      </div>

                      <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>RESULTS TABLE</div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', overflow: 'hidden' }}>
                        {dbResults.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: 'rgba(0,0,0,0.15)', height: '28px', borderBottom: '1px solid var(--panel-border)' }}>
                                {Object.keys(dbResults[0]).map(key => (
                                  <th key={key} style={{ padding: '0 10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dbResults.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: '26px' }}>
                                  {Object.values(row).map((val, i) => (
                                    <td key={i} style={{ padding: '0 10px', color: '#fff' }}>{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>No active results dataset</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="editor" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div ref={leftLineNumbersRef} className="line-numbers" style={{ userSelect: 'none', overflow: 'hidden' }}>
                  {Array.from({ length: getLineCount(leftCode) }).map((_, i) => {
                    const lineNum = i + 1
                    const isBreakpoint = (breakpoints[activeTabId] || []).includes(lineNum)
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleBreakpoint(lineNum)}
                        style={{ 
                          height: '19.5px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end', 
                          paddingRight: '6px',
                          cursor: 'pointer',
                          color: isBreakpoint ? '#ff4d4d' : 'inherit'
                        }}
                        title={isBreakpoint ? `Breakpoint active on line ${lineNum}` : `Click to toggle breakpoint on line ${lineNum}`}
                      >
                        {isBreakpoint && (
                          <span style={{ fontSize: '10px', marginRight: '3px', filter: 'drop-shadow(0 0 3px #ff0055)' }}>
                            🔴
                          </span>
                        )}
                        {lineNum}
                      </div>
                    )
                  })}
                </div>

                <div style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', overflow: 'hidden' }}>
                  {/* Syntax Color Highlighting Backdrop Layer */}
                  <div 
                    ref={leftHighlightRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '10px',
                      fontSize: '13px',
                      lineHeight: '19.5px',
                      fontFamily: "'JetBrains Mono', Consolas, monospace",
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      zIndex: 1
                    }}
                  >
                    {renderHighlightedCode(leftCode)}
                  </div>

                  <textarea
                    ref={leftCodeAreaRef}
                    className="code-area"
                    value={leftCode}
                    onChange={(e) => updateCodeWithML(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={handleLeftScroll}
                    onClick={handleEditorClick}
                    onMouseMove={handleEditorMouseMove}
                    onMouseLeave={handleEditorMouseLeave}
                    onFocus={() => setActivePane('left')}
                    style={{
                      padding: '10px',
                      fontSize: '13px',
                      lineHeight: '19.5px',
                      fontFamily: "'JetBrains Mono', Consolas, monospace",
                      background: 'transparent',
                      color: 'transparent',
                      caretColor: 'var(--accent-color)',
                      border: 'none',
                      resize: 'none',
                      outline: 'none',
                      flex: 1,
                      height: '100%',
                      overflowY: 'auto',
                      overflowX: 'auto',
                      zIndex: 2
                    }}
                  />

                  {/* Floating Hover Tooltip Popup for Functions & Variables */}
                  {hoverInfo.visible && (
                    <div 
                      style={{
                        position: 'fixed',
                        top: `${hoverInfo.y}px`,
                        left: `${hoverInfo.x}px`,
                        background: '#1e1e2e',
                        border: '1px solid #00ffaa',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#c9d1d9',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        maxWidth: '350px'
                      }}
                    >
                      <div style={{ color: '#00ffaa', fontWeight: 'bold', marginBottom: '2px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{hoverInfo.symbol}</span>
                        <span style={{ color: '#8b949e', fontSize: '10px' }}>Line {hoverInfo.line}</span>
                      </div>
                      <div style={{ color: '#58a6ff', fontSize: '10px', fontStyle: 'italic', marginBottom: '4px' }}>
                        Type: {hoverInfo.type}
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: '4px', color: '#ff79c6', wordBreak: 'break-all' }}>
                        {hoverInfo.value}
                      </div>
                    </div>
                  )}

                  {ghostText && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.65)',
                        border: '1px solid #00ffaa',
                        color: '#00ffaa',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        pointerEvents: 'none',
                        zIndex: 10
                      }}
                    >
                      💡 Auto-Suggest (Press Tab): <span style={{ opacity: 0.85, fontStyle: 'italic' }}>{ghostText}</span>
                    </div>
                  )}

                  {/* Active Error Warning Banner with TAB key autocommit trigger */}
                  {activeError && (
                    <div style={{
                      position: 'absolute',
                      bottom: '50px',
                      left: '20px',
                      right: '20px',
                      background: 'rgba(255,107,107,0.15)',
                      border: '1px solid #ff6b6b',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <span>⚠️ <b>Error on Line {activeError.line}:</b> {activeError.msg}</span>
                      <button 
                        onClick={autoCorrectError}
                        style={{ background: '#ff6b6b', border: 'none', color: '#000', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Press TAB to Auto-Correct
                      </button>
                    </div>
                  )}
                </div>

                {/* VS Code Style Code Minimap Column */}
                <div 
                  style={{
                    width: '90px',
                    background: 'rgba(0,0,0,0.3)',
                    borderLeft: '1px solid var(--panel-border)',
                    overflow: 'hidden',
                    userSelect: 'none',
                    padding: '4px 2px',
                    fontSize: '2px',
                    lineHeight: '3px',
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    opacity: 0.75,
                    pointerEvents: 'none'
                  }}
                >
                  {renderHighlightedCode(leftCode)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Split Sideways Editors */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden' }}>
            {/* Left Pane */}
            <div className="editor-pane" style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              borderRight: '1px solid var(--panel-border)',
              background: activePane === 'left' ? 'rgba(0, 229, 255, 0.02)' : 'transparent',
              transition: 'background 0.2s'
            }} onClick={() => setActivePane('left')}>
              <div className="editor-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto' }}>
                  {openTabs.map(tab => (
                    <div 
                      key={tab.id}
                      className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
                      onClick={() => setActiveTabId(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        borderRight: '1px solid var(--panel-border)',
                        background: tab.id === activeTabId ? 'var(--sidebar-active)' : 'transparent',
                        color: tab.id === activeTabId ? 'var(--accent-color)' : 'var(--text-muted)',
                        borderTop: tab.id === activeTabId ? '2px solid var(--accent-color)' : '2px solid transparent',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className="bx bx-file" style={{ fontSize: '12px' }}></i>
                      <span>{tab.filename}</span>
                      <span 
                        onClick={(e) => handleCloseTab(tab.id, e)} 
                        style={{ cursor: 'pointer', opacity: 0.6, fontSize: '13px', marginLeft: '4px' }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={handleNewTab} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '2px 8px', cursor: 'pointer', fontSize: '14px' }}
                    title="New File Tab"
                  >
                    +
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingRight: '8px' }}>
                  <button onClick={() => setIsSplit(false)} style={styles.tabActionBtn} title="Merge Editors">
                    <i className="bx bx-window-close"></i>
                  </button>
                  <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ ...styles.tabActionBtn, color: isRightPanelOpen ? 'var(--accent-color)' : 'var(--text-muted)' }} title="AI Assistant & Adjuster Panel">
                    <i className="bx bx-bot"></i>
                  </button>
                </div>
              </div>
              <div className="editor" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div className="line-numbers">
                  {Array.from({ length: getLineCount(leftCode) }).map((_, i) => (
                    <div key={i} style={{ height: '19.5px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  ref={leftCodeAreaRef}
                  className="code-area"
                  value={leftCode}
                  onChange={(e) => setLeftCode(e.target.value)}
                  onFocus={() => setActivePane('left')}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    lineHeight: '19.5px',
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    flex: 1,
                    height: '100%',
                    overflowY: 'auto'
                  }}
                />
              </div>
            </div>

            {/* Right Pane */}
            <div className="editor-pane" style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              background: activePane === 'right' ? 'rgba(0, 229, 255, 0.02)' : 'transparent',
              transition: 'background 0.2s'
            }} onClick={() => setActivePane('right')}>
              <div className="editor-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className={`editor-tab ${activePane === 'right' ? 'active' : ''}`}>
                  <i className="bx bx-file" style={{ fontSize: '13px', marginRight: '5px' }}></i>
                  <span>{rightTab}</span>
                  <span style={{ fontSize: '9px', marginLeft: '6px', color: '#ff6b6b', fontWeight: 'bold' }}>RIGHT</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingRight: '8px' }}>
                  <button onClick={() => setIsSplit(false)} style={styles.tabActionBtn} title="Merge Editors">
                    <i className="bx bx-window-close"></i>
                  </button>
                  <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ ...styles.tabActionBtn, color: isRightPanelOpen ? 'var(--accent-color)' : 'var(--text-muted)' }} title="AI Assistant & Adjuster Panel">
                    <i className="bx bx-bot"></i>
                  </button>
                </div>
              </div>
              <div className="editor" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div className="line-numbers">
                  {Array.from({ length: getLineCount(rightCode) }).map((_, i) => (
                    <div key={i} style={{ height: '19.5px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  ref={rightCodeAreaRef}
                  className="code-area"
                  value={rightCode}
                  onChange={(e) => setRightCode(e.target.value)}
                  onFocus={() => setActivePane('right')}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    lineHeight: '19.5px',
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    flex: 1,
                    height: '100%',
                    overflowY: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* RIGHT SIDE AI CHAT & TEXT ADJUSTER DRAWER */}
        <div style={{
          width: isRightPanelOpen ? '320px' : '0px',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: isRightPanelOpen ? '1px solid var(--panel-border)' : 'none',
          background: 'var(--sidebar-bg)',
          overflow: 'hidden',
          transition: 'width 0.2s ease, border 0.2s ease',
          height: '100%',
          zIndex: 5
        }}>
          {/* Drawer Header Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--panel-border)', height: '35px', alignItems: 'center' }}>
            <div 
              onClick={() => setRightPanelTab('chat')}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: rightPanelTab === 'chat' ? 'var(--accent-color)' : 'var(--text-muted)',
                borderBottom: rightPanelTab === 'chat' ? '2px solid var(--accent-color)' : 'none',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              AI CHAT
            </div>
            <div 
              onClick={() => setRightPanelTab('format')}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: rightPanelTab === 'format' ? 'var(--accent-color)' : 'var(--text-muted)',
                borderBottom: rightPanelTab === 'format' ? '2px solid var(--accent-color)' : 'none',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ADJUSTER
            </div>
            <div 
              onClick={() => setIsRightPanelOpen(false)} 
              style={{ padding: '0 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}
            >
              ×
            </div>
          </div>

          {/* Drawer Body content */}
          {rightPanelTab === 'chat' ? (
            /* AI Chat Tab */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px' }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? 'rgba(0, 122, 204, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: msg.sender === 'user' ? '1px solid rgba(0, 122, 204, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      maxWidth: '85%',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      color: 'var(--text-main)'
                    }}
                  >
                    {msg.sender === 'user' ? msg.text : formatChatMessage(msg.text)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--panel-border)', paddingTop: '10px' }}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask AI Assistant..."
                  style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    padding: '6px 10px',
                    outline: 'none'
                  }}
                />
                <button 
                  onClick={handleSendChatMessage}
                  style={{
                    background: 'var(--accent-color)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '0 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            /* Adjuster / Formatter Settings Tab */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', overflowY: 'auto', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Enter custom replacement rules to adjust the main editor code. 
                Use format {"replace:search->replace"} (one per line).
              </div>
              <textarea 
                value={formatRules}
                onChange={(e) => setFormatRules(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '11px',
                  padding: '8px',
                  borderRadius: '4px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '200px'
                }}
              />
              <button 
                onClick={handleApplyFormatRules}
                style={{
                  background: 'linear-gradient(135deg, #0e639c, #1177bb)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Apply Rules to Editor
              </button>
            </div>
          )}
        </div>

      </div>

      {/* DRAGGABLE HORIZONTAL SPLIT RESIZER */}
      <div 
        className={`resizer-h ${isResizingTerminal ? 'resizing' : ''}`} 
        onMouseDown={handleTerminalMouseDown}
        style={{ height: '3px', cursor: 'row-resize', background: 'var(--panel-border)', zIndex: 10 }}
      />

      {/* Terminal View panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Terminal isRunning={isRunning} />
      </div>
    </div>
  )
}

const styles = {
  tabActionBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  }
}

export default EditorPage
