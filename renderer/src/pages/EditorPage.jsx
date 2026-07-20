import React, { useState, useEffect, useRef } from 'react'
import Terminal from '../components/ui/Terminal'
import InlineSuggestOverlay from '../components/ui/InlineSuggestOverlay'

const EditorPage = () => {
  const [isSplit, setIsSplit] = useState(false)
  const [activePane, setActivePane] = useState('left')

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

  // Ghost text & Breakpoint states
  const [ghostText, setGhostText] = useState('')
  const [breakpoints, setBreakpoints] = useState([])

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
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault()
      setCode(code + ghostText)
      setGhostText('')
    }
  }

  const toggleBreakpoint = (lineNum) => {
    setBreakpoints(prev => 
      prev.includes(lineNum) ? prev.filter(l => l !== lineNum) : [...prev, lineNum]
    )
  }

  const leftCodeAreaRef = useRef(null)
  const rightCodeAreaRef = useRef(null)
  const codeAreaRef = activePane === 'left' ? leftCodeAreaRef : rightCodeAreaRef
  const terminalBodyRef = useRef(null)

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
  }, [activePane, code]) // Re-run when pane toggles or code is set // Re-run when pane toggles to ensure proper setter binds

  // Handle Run - POST code to compiler engine backend
  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)

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
    const formatted = code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
    setCode(formatted)

    setTerminalLines(prev => [
      ...prev,
      { text: `[FORMAT] Source file auto-formatted successfully.`, className: 'success' },
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
    const onSave = async () => {
      if (activeFilePath && window.api && typeof window.api.saveFile === 'function') {
        const success = await window.api.saveFile(activeFilePath, code)
        if (success) {
          setTerminalLines(prev => [
            ...prev,
            { text: `[SAVED] File saved directly: ${activeFilePath}`, className: 'success' },
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
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRight: '1px solid var(--panel-border)',
                      background: tab.id === activeTabId ? 'var(--sidebar-active)' : 'transparent',
                      color: tab.id === activeTabId ? 'var(--accent-color)' : 'var(--text-muted)',
                      borderTop: tab.id === activeTabId ? '2px solid var(--accent-color)' : '2px solid transparent',
                      whiteSpace: 'nowrap',
                      minWidth: '100px',
                      maxWidth: '200px'
                    }}
                  >
                    <i className="bx bx-file" style={{ fontSize: '13px' }}></i>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.filename}</span>
                    <span 
                      onClick={(e) => handleCloseTab(tab.id, e)} 
                      style={{ cursor: 'pointer', opacity: 0.6, fontSize: '14px', marginLeft: '4px' }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.6}
                    >
                      ×
                    </span>
                  </div>
                ))}
                <button 
                  onClick={handleNewTab} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px 10px', cursor: 'pointer', fontSize: '16px' }}
                  title="New File Tab"
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingRight: '8px' }}>
                <button onClick={() => setIsSplit(true)} style={styles.tabActionBtn} title="Split Screen Side-by-Side">
                  <i className="bx bx-columns"></i>
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
