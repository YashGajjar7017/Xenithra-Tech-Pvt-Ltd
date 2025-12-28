import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
// import '/css/NovaGlass.css'

const NovaGlassCodeStudio = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [language, setLanguage] = useState('C (GCC)')
  const [tabName, setTabName] = useState('main.c')
  const [statusText, setStatusText] = useState('autosave • synced to cloud')
  const [terminalLines, setTerminalLines] = useState([
    <span key="prompt1" className="prompt">
      nova@glass
    </span>,
    <span className="muted">~</span>,
    '$ run main.c',
    <span key="waiting" className="muted">
      Waiting for first run...
    </span>
  ])
  const [sideBySide, setSideBySide] = useState(false)
  const [code, setCode] =
    useState(`/******************************************************************************
 NovaGlass Code Studio.
 Futuristic glassmorphism IDE with neon gradients.
 Type here, press enter, and enjoy the glow.
*******************************************************************************/

#include <stdio.h>

int main(void) 
{
    printf("Hello, NovaGlass!\\n");
    
    return 0;
}`)
  const [cliArgs, setCliArgs] = useState('')
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const codeAreaRef = useRef(null)
  const terminalBodyRef = useRef(null)

  const languages = [
    { label: 'C (GCC)', value: 'c', tab: 'main.c' },
    { label: 'C++ (G++)', value: 'cpp', tab: 'main.cpp' },
    { label: 'Python 3', value: 'py', tab: 'main.py' },
    { label: 'Node.js', value: 'js', tab: 'index.js' }
  ]

  const updateLineNumbers = useCallback(() => {
    if (codeAreaRef.current) {
      const lines = code.split('\n').length
      const lineNumbers = Array.from({ length: Math.max(lines, 16) }, (_, i) => i + 1).join('<br>')
      codeAreaRef.current.innerHTML = lineNumbers
    }
  }, [code])

  const handleCodeChange = useCallback(() => {
    setStatusText('editing • unsaved changes...')
    const saveTimeout = setTimeout(() => {
      setStatusText('autosave • synced to cloud')
    }, 800)
    return () => clearTimeout(saveTimeout)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang.label)
    setTabName(lang.tab)
    setShowLangDropdown(false)
  }

  const appendTerminalLine = useCallback((elements) => {
    setTerminalLines((prev) => [...prev, ...elements])
  }, [])

  const handleRun = async () => {
    // Run button animation
    const runBtn = document.getElementById('runBtn')
    if (runBtn) {
      runBtn.style.filter = 'brightness(1.5)'
      runBtn.style.transform = 'translateY(-2px) scale(1.03)'
      setTimeout(() => {
        runBtn.style.filter = 'brightness(1)'
        runBtn.style.transform = ''
      }, 200)
    }

    appendTerminalLine([
      <React.Fragment key="prompt-run">
        <span className="prompt">nova@glass</span>
        <span className="muted">~</span>
        <span>
          $ run '{language}' {cliArgs || ''}
        </span>
      </React.Fragment>,
      <span key="contacting" className="muted">
        contacting demo API...
      </span>
    ])

    try {
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, args: cliArgs, code })
      })
      const json = await res.json()

      appendTerminalLine([
        <React.Fragment key="stdout">
          <span className="prompt">stdout</span>: response status {res.status}
        </React.Fragment>,
        <span key="output" className="muted">
          {JSON.stringify(json, null, 2)}
        </span>
      ])
    } catch (error) {
      appendTerminalLine([
        <span key="error" className="error">
          Error: Failed to execute code
        </span>
      ])
    }
  }

  useEffect(() => {
    updateLineNumbers()
  }, [updateLineNumbers])

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [terminalLines])

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '    ')
    }
  }

  return (
    <div className="app">
      <div className="border-neon"></div>
      <div className="shell">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="logo">
            <div className="logo-box">⚡</div>
            NovaGlass
          </div>
          <div className="subtitle">Frosted neon playground for modern C/C++ builds.</div>
          <div className="pill-label">Workspace</div>
          <button>Dashboard</button>
          <button>Projects</button>
          <button>Snippets</button>
          <button>Playground</button>
          <div className="pill-label" style={{ marginTop: '14px' }}>
            Account
          </div>
          <button>Profile</button>
          <button>Settings</button>
          <button>Logout</button>
        </div>

        {/* Main */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <button
              id="sidebarToggle"
              title="Collapse sidebar"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '☰' : '✕'}
            </button>

            <div className="topbar-title">NOVA GLASS CODE STUDIO</div>
            <button className="btn-run" id="runBtn" onClick={handleRun}>
              ▶ Run
            </button>
            <button>🐞 Debug</button>
            <button>■ Stop</button>
            <button>Share</button>
            <button>Save</button>
            <button>{ } Format</button>

            <div className="lang-select">
              <span>Language:</span>
              <div className={`dropdown ${showLangDropdown ? 'open' : ''}`} id="langDropdown">
                <button
                  className="dropdown-toggle"
                  type="button"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <span id="langLabel">{language}</span>
                  <span className="arrow">▾</span>
                </button>
                <div className="dropdown-menu">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      data-lang={lang.value}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Editor header */}
          <div className="editor-header">
            <div className="tab">{tabName}</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }} id="statusText">
              {statusText}
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Terminal layout</span>
              <button id="termLayoutToggle" onClick={() => setSideBySide(!sideBySide)}>
                {sideBySide ? 'side' : 'bottom'}
              </button>
            </div>
          </div>

          {/* Editor + terminal */}
          <div className={`editor-wrapper ${sideBySide ? 'side-by-side' : ''}`} id="editorWrapper">
            <div className="editor" id="editor">
              <div className="line-numbers" id="lineNumbers" ref={codeAreaRef} />
              <div
                className="code-area"
                id="codeArea"
                contentEditable
                spellCheck={false}
                onInput={handleCodeChange}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
              >
                {code}
              </div>
            </div>

            <div className="terminal" id="terminal">
              <div className="terminal-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
                <span>integrated terminal • demo API</span>
              </div>
              <div className="terminal-body" id="terminalBody" ref={terminalBodyRef}>
                {terminalLines.map((line, index) => (
                  <div key={index} className="terminal-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="bottom">
            <div>
              <label>Command line arguments:</label>
              <input
                type="text"
                id="cliArgs"
                placeholder="--help"
                value={cliArgs}
                onChange={(e) => setCliArgs(e.target.value)}
              />
            </div>
            <div className="stdin-options">
              Standard Input:
              <label>
                <input type="radio" name="stdin" defaultChecked /> Interactive Console
              </label>
              <label>
                <input type="radio" name="stdin" /> Text
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NovaGlassCodeStudio

// Render the app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<NovaGlassCodeStudio />)
