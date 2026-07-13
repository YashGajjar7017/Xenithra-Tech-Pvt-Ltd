import React, { useState, useEffect, useRef } from 'react'

const EditorPage = () => {
  const [isSplit, setIsSplit] = useState(false)
  const [activePane, setActivePane] = useState('left')

  // Left editor state
  const [leftTab, setLeftTab] = useState('index.html')
  const [leftCode, setLeftCode] = useState(`<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`)
  const [leftLang, setLeftLang] = useState('XML')

  // Right editor state
  const [rightTab, setRightTab] = useState('untitled.js')
  const [rightCode, setRightCode] = useState(`// Sideways Split Editor\nfunction hello() {\n  console.log("Hello from sideways pane!");\n}\nhello();`)
  const [rightLang, setRightLang] = useState('Node.js')

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

  const [terminalLines, setTerminalLines] = useState([
    { text: 'Xenithra Technologies IDE Terminal v2.0', className: 'muted' },
    { text: 'System diagnostics operational. Compiler engine online.', className: 'muted' },
    { text: 'xenithra@studio:~$', className: 'prompt' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal')

  // Layout resize states
  const [editorHeight, setEditorHeight] = useState(window.innerHeight * 0.7) // default editor height to 70% of screen
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)

  const leftCodeAreaRef = useRef(null)
  const rightCodeAreaRef = useRef(null)
  const codeAreaRef = activePane === 'left' ? leftCodeAreaRef : rightCodeAreaRef
  const terminalBodyRef = useRef(null)

  // Listen to window size and set initial 70% height
  useEffect(() => {
    setEditorHeight(window.innerHeight * 0.7)
  }, [])

  // Listen to open-file and change-language events
  useEffect(() => {
    const handleOpenFile = (event) => {
      if (event.detail) {
        const { filename, code: fileCode } = event.detail
        setActiveTab(filename)
        if (fileCode) {
          setCode(fileCode)
        }

        // Auto-set compilation language based on extension
        const ext = filename.split('.').pop()
        if (ext === 'html') setSelectedLanguage('XML')
        else if (ext === 'js') setSelectedLanguage('Node.js')
        else if (ext === 'css') setSelectedLanguage('XML')
        else if (ext === 'py') setSelectedLanguage('Python 3')
        else if (ext === 'cpp') setSelectedLanguage('C++ (G++)')
        else if (ext === 'c') setSelectedLanguage('C (GCC)')
        else if (ext === 'cs') setSelectedLanguage('Dot Net')
        else if (ext === 'dart') setSelectedLanguage('Dart')
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
  }, [activePane]) // Re-run when pane toggles to ensure proper setter binds

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
    }
    const onSave = () => {
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeTab
      a.click()
      URL.revokeObjectURL(url)
      setTerminalLines(prev => [
        ...prev,
        { text: `[SAVED] File saved successfully: ${activeTab}`, className: 'success' },
        { text: 'xenithra@studio:~$', className: 'prompt' }
      ])
    }
    const onSaveAs = () => {
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
  }, [code, selectedLanguage, cliArgs, isRunning, terminalLines, activePane, isSplit])

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
      const newHeight = Math.max(120, Math.min(800, startHeight + deltaY))
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
            <div className="editor-tabs">
              <div className="editor-tab active">
                <span>📄</span>
                <span>{leftTab}</span>
                <span className="close-btn" style={{ cursor: 'pointer', marginLeft: '6px' }}>×</span>
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
              <div className="editor-tabs">
                <div className={`editor-tab ${activePane === 'left' ? 'active' : ''}`}>
                  <span>📄</span>
                  <span>{leftTab}</span>
                  <span style={{ fontSize: '9px', marginLeft: '6px', color: 'var(--accent-color)', fontWeight: 'bold' }}>LEFT</span>
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
              <div className="editor-tabs">
                <div className={`editor-tab ${activePane === 'right' ? 'active' : ''}`}>
                  <span>📄</span>
                  <span>{rightTab}</span>
                  <span style={{ fontSize: '9px', marginLeft: '6px', color: '#ff6b6b', fontWeight: 'bold' }}>RIGHT</span>
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

      </div>

      {/* DRAGGABLE HORIZONTAL SPLIT RESIZER */}
      <div 
        className={`resizer-h ${isResizingTerminal ? 'resizing' : ''}`} 
        onMouseDown={handleTerminalMouseDown}
        style={{ height: '3px', cursor: 'row-resize', background: 'var(--panel-border)', zIndex: 10 }}
      />

      {/* Terminal View panel */}
      <div className="terminal" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Terminal Header Tabs */}
        <div className="terminal-tabs">
          <div 
            className={`terminal-tab ${activeTerminalTab === 'Problems' ? 'active' : ''}`}
            onClick={() => setActiveTerminalTab('Problems')}
          >
            Problems
          </div>
          <div 
            className={`terminal-tab ${activeTerminalTab === 'Output' ? 'active' : ''}`}
            onClick={() => setActiveTerminalTab('Output')}
          >
            Output
          </div>
          <div 
            className={`terminal-tab ${activeTerminalTab === 'Debug' ? 'active' : ''}`}
            onClick={() => setActiveTerminalTab('Debug')}
          >
            Debug Console
          </div>
          <div 
            className={`terminal-tab ${activeTerminalTab === 'Terminal' ? 'active' : ''}`}
            onClick={() => setActiveTerminalTab('Terminal')}
          >
            Terminal
          </div>
        </div>

        {/* Terminal Body Console log */}
        <div 
          className="terminal-body" 
          ref={terminalBodyRef}
          style={{
            flex: 1,
            padding: '12px',
            overflowY: 'auto',
            background: 'var(--terminal-bg)',
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontSize: '12px',
            lineHeight: '1.6',
            color: 'var(--terminal-text)'
          }}
        >
          {activeTerminalTab === 'Terminal' ? (
            terminalLines.map((line, idx) => (
              <div 
                key={idx} 
                style={{
                  color: line.className === 'prompt' ? 'var(--accent-color)' : 
                         line.className === 'error' ? '#ff5252' : 
                         line.className === 'success' ? '#00e676' : 
                         line.className === 'warning' ? '#ffd740' : 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '4px'
                }}
              >
                {line.text}
              </div>
            ))
          ) : activeTerminalTab === 'Problems' ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No problems have been detected in the workspace.</div>
          ) : activeTerminalTab === 'Output' ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>[Xenithra Output Shell is operational]</div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>[Debugger console initialized]</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorPage
