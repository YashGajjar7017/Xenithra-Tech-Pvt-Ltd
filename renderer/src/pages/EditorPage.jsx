import React, { useState, useEffect, useRef } from 'react'

const EditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Node.js')
  const [activeTab, setActiveTab] = useState('index.html')
  const [code, setCode] = useState(`<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`)
  const [terminalLines, setTerminalLines] = useState([
    { text: 'Xenithra Technologies IDE Terminal v2.0', className: 'muted' },
    { text: 'System diagnostics operational. Compiler engine online.', className: 'muted' },
    { text: 'xenithra@studio:~$', className: 'prompt' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal')

  // Layout resize states
  const [editorHeight, setEditorHeight] = useState(380) // default editor height in pixels
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)

  const codeAreaRef = useRef(null)
  const terminalBodyRef = useRef(null)

  // Listen to open-file events from the sidebar
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
    window.addEventListener('open-file', handleOpenFile)
    return () => window.removeEventListener('open-file', handleOpenFile)
  }, [])

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

  const handleStop = () => {
    setIsRunning(false)
    setTerminalLines([
      ...terminalLines,
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

    setTerminalLines([
      ...terminalLines,
      { text: `[FORMAT] Source file auto-formatted successfully.`, className: 'success' },
      { text: 'xenithra@studio:~$', className: 'prompt' }
    ])
  }

  return (
    <div className="editor-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Editor Main Section */}
      <div style={{ height: `${editorHeight}px`, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid var(--panel-border)', position: 'relative' }}>
        {/* Editor Tabs bar */}
        <div className="editor-tabs">
          <div className="editor-tab active">
            <span>📄</span>
            <span>{activeTab}</span>
            <span className="close-btn" style={{ cursor: 'pointer', marginLeft: '6px' }}>×</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
            <button 
              onClick={handleRun}
              disabled={isRunning}
              style={{
                background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '3px 10px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isRunning ? 0.6 : 1
              }}
            >
              ▶ Run
            </button>
            <button 
              onClick={handleFormat}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '4px',
                color: 'var(--text-main)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '3px 8px',
                height: '22px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Format
            </button>
            <button 
              onClick={handleStop}
              style={{
                background: 'rgba(255,107,107,0.15)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '4px',
                color: '#ff6b6b',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '3px 8px',
                height: '22px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ■ Stop
            </button>
          </div>
        </div>

        {/* Editor Body (Line Numbers & Textarea) */}
        <div className="editor" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div className="line-numbers">
            {Array.from({ length: Math.max(1, code.split('\n').length) }).map((_, i) => (
              <div key={i} style={{ height: '19.5px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                {i + 1}
              </div>
            ))}
          </div>

          <textarea
            ref={codeAreaRef}
            className="code-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
