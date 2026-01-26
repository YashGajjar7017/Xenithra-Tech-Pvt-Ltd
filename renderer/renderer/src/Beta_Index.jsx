import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/NovaGlass.css'

const NovaGlassCodeStudio = () => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('C (GCC)')
  const [tabName, setTabName] = useState('main.c')
  const [statusText, setStatusText] = useState('autosave • synced to cloud')
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Login status - temporarily set to true for testing
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Sidebar toggle
  const [userName, setUserName] = useState('John Doe') // Mock username
  const [terminalLines, setTerminalLines] = useState([
    <Fragment key="initial">
      <span className="prompt">nova@glass</span>:<span className="muted">~</span>$ run main.c
    </Fragment>,
    <span key="waiting" className="muted">
      Waiting for first run...
    </span>
  ])
  const [code, setCode] = useState(`/******************************************************************************
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
  const lineNumbersRef = useRef(null)
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
    if (codeAreaRef.current) {
      setCode(codeAreaRef.current.innerText)
    }
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
      <Fragment key="prompt-run">
        <span className="prompt">nova@glass</span>:<span className="muted">~</span>$ run '{language}' {cliArgs || ''}
      </Fragment>,
      <span key="contacting" className="muted">
        contacting demo API...
      </span>
    ])

    try {
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: language, args: cliArgs, code })
      })
      const json = await res.json()

      appendTerminalLine([
        <Fragment key="stdout-status">
          <span className="prompt">stdout</span>: response status {res.status}
        </Fragment>,
        <Fragment key="stdout-bytes">
          <span className="prompt">stdout</span>: bytes sent {JSON.stringify(json.json).length}
        </Fragment>,
        <Fragment key="stdout-url">
          <span className="prompt">stdout</span>: url → {json.url}
        </Fragment>
      ])
    } catch (err) {
      appendTerminalLine([
        <span key="error" className="error">
          error: {err.message}
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

  const handleNavigation = (page) => {
    const lowerPage = page.toLowerCase()
    switch (lowerPage) {
      case 'login':
        navigate('/login')
        break
      case 'signup':
        navigate('/signup')
        break
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'maintenance':
        navigate('/maintenance')
        break
      case 'classroom':
        navigate('/classroom')
        break
      case 'logout':
        if (confirm('Are you sure you want to logout?')) {
          // In a real app, this would clear session/token
          alert('Logged out successfully!')
          setIsLoggedIn(false)
          navigate('/login')
        }
        break
      default:
        // For pages like Projects, Snippets, Profile, Settings - could add routes later
        alert(`${page} page coming soon!`)
        break
    }
  }

  return (
    <>
      {/* Menu Bar */}
      <div className="menu-bar">
        <div className="menu-item" onClick={() => alert('File menu: New, Open, Save, etc.')}>File</div>
        <div className="menu-item" onClick={() => alert('Edit menu: Undo, Redo, Find, etc.')}>Edit</div>
        <div className="menu-item" onClick={() => alert('Selection menu: Select All, Expand Selection, etc.')}>Selection</div>
        <div className="menu-item" onClick={() => alert('View menu: Toggle Sidebar, Zoom, etc.')}>View</div>
        <div className="menu-item" onClick={() => alert('Help menu: Documentation, About, etc.')}>Help</div>
        <div className="menu-spacer"></div>
        <div className="menu-panel">
          {!isLoggedIn ? (
            <>
              <button className="btn-login" onClick={() => handleNavigation('Login')}>Login</button>
              <button className="btn-signup" onClick={() => handleNavigation('Signup')}>Signup</button>
            </>
          ) : (
            <div className="user-info">
              <div className="user-logo">👤</div>
              <span className="user-name">{userName}</span>
            </div>
          )}
          <div className="account-circle" onClick={() => isLoggedIn ? handleNavigation('Profile') : handleNavigation('Login')}>
            👤
          </div>
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
      </div>
      <div className="app">
        <div className="border-neon"></div>
        <div className="shell">
        {/* Sidebar */}
        <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
          <div className="logo">
            <div className="logo-box">⚡</div>
            {isSidebarOpen && 'NovaGlass'}
          </div>
          {isSidebarOpen && (
            <>
              <div className="subtitle">Frosted neon playground for modern C/C++ builds.</div>
              <div className="pill-label">Workspace</div>
              <button onClick={() => handleNavigation('Dashboard')}>Dashboard</button>
              <button onClick={() => handleNavigation('Projects')}>Projects</button>
              <button onClick={() => handleNavigation('Snippets')}>Snippets</button>
              <button onClick={() => handleNavigation('Playground')}>Playground</button>
            </>
          )}
          {isLoggedIn && (
            <div className="user-section">
              <div className="user-info">
                <div className="user-logo">👤</div>
                {isSidebarOpen && <span className="user-name">{userName}</span>}
              </div>
              {isSidebarOpen && (
                <>
                  <div className="pill-label" style={{ marginTop: '14px' }}>
                    Account
                  </div>
                  <button onClick={() => handleNavigation('Profile')}>Profile</button>
                  <button onClick={() => handleNavigation('Settings')}>Settings</button>
                  <button onClick={() => handleNavigation('Logout')}>Logout</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title">NOVA GLASS CODE STUDIO</div>
            <button className="btn-run" id="runBtn" onClick={handleRun}>
              ▶ Run
            </button>
            <button>?? Debug</button>
            <button>� Stop</button>
            <button>Share</button>
            <button>Save</button>
            <button>{'{}'} Format</button>

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

          <>
            {/* Editor header */}
            <div className="editor-header">
              <div className="tab">{tabName}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }} id="statusText">
                {statusText}
              </div>
            </div>

            {/* Editor + terminal */}
            <div className="editor-wrapper" id="editorWrapper">
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
          </>
        </div>
      </div>
    </div>
  </>
)
}

export default NovaGlassCodeStudio
