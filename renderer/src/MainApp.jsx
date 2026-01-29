import React, { useState, useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const MainApp = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Select');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('User');
  const [code, setCode] = useState(`/******************************************************************************
NovaGlass Code Studio. Futuristic glassmorphism IDE with neon gradients. Type here,
press enter, and enjoy the glow.
*******************************************************************************/
#include <stdio.h> int main(void) { printf("Hello, NovaGlass!\\n"); return 0; }`);
  const [terminalLines, setTerminalLines] = useState([
    { text: 'nova@glass:~$', className: 'prompt' },
    { text: 'Waiting for first run...', className: 'muted' }
  ]);
  const [cliArgs, setCliArgs] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const codeAreaRef = useRef(null);
  const terminalBodyRef = useRef(null);

  useEffect(() => {
    updateLineNumbers();
    checkAuthStatus();
  }, [code]);

  const updateLineNumbers = () => {
    // This would be implemented with a proper line numbering component
  };

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUsername(user.username);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setDropdownOpen(false);
  };

  const handleRun = async () => {
    const newLines = [
      ...terminalLines,
      { text: `nova@glass:~$ run '${selectedLanguage}' ${cliArgs || ''}`, className: 'prompt' },
      { text: 'contacting demo API...', className: 'muted' }
    ];
    setTerminalLines(newLines);

    try {
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: selectedLanguage, args: cliArgs, code })
      });

      const json = await res.json();
      const finalLines = [
        ...newLines,
        { text: `stdout: response status ${res.status}`, className: 'prompt' },
        { text: `stdout: bytes sent ${JSON.stringify(json.json).length}`, className: 'prompt' },
        { text: `stdout: url → ${json.url}`, className: 'prompt' }
      ];
      setTerminalLines(finalLines);
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `error: ${err.message}`, className: 'error' }
      ]);
    }
  };

  const handleLogin = () => {
    window.location.href = '/#/login'
  }

  const handleSignup = () => {
    window.location.href = '/#/signup'
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      alert('Logged out successfully!');
      window.location.href = '/';
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/*" element={<MainContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} username={username} setUsername={setUsername} />} />
      </Routes>
    </Router>
  )
}

const MainContent = ({ isLoggedIn, setIsLoggedIn, username, setUsername }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('Select')
  const [code, setCode] = useState(`/******************************************************************************
NovaGlass Code Studio. Futuristic glassmorphism IDE with neon gradients. Type here,
press enter, and enjoy the glow.
*******************************************************************************/
#include <stdio.h> int main(void) { printf("Hello, NovaGlass!\\n"); return 0; }`)
  const [terminalLines, setTerminalLines] = useState([
    { text: 'nova@glass:~$', className: 'prompt' },
    { text: 'Waiting for first run...', className: 'muted' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const codeAreaRef = useRef(null)
  const terminalBodyRef = useRef(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setIsLoggedIn(true)
        setUsername(user.username)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang)
    setDropdownOpen(false)
  }

  const handleRun = async () => {
    const newLines = [
      ...terminalLines,
      { text: `nova@glass:~$ run '${selectedLanguage}' ${cliArgs || ''}`, className: 'prompt' },
      { text: 'contacting demo API...', className: 'muted' }
    ]
    setTerminalLines(newLines)

    try {
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: selectedLanguage, args: cliArgs, code })
      })

      const json = await res.json()
      const finalLines = [
        ...newLines,
        { text: `stdout: response status ${res.status}`, className: 'prompt' },
        { text: `stdout: bytes sent ${JSON.stringify(json.json).length}`, className: 'prompt' },
        { text: `stdout: url → ${json.url}`, className: 'prompt' }
      ]
      setTerminalLines(finalLines)
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `error: ${err.message}`, className: 'error' }
      ])
    }
  }

  const handleLogin = () => {
    window.location.href = '/#/login'
  }

  const handleSignup = () => {
    window.location.href = '/#/signup'
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user')
      setIsLoggedIn(false)
      setUsername('User')
      alert('Logged out successfully!')
      window.location.href = '/#/'
    }
  }

  return (
    <>
      {/* Menu Bar */}
      <div className="menu-bar">
        <button className="sidenav-toggle-btn" title="Toggle Sidebar" onClick={toggleSidebar}>☰</button>

        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">Selection</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Help</div>

        <div className="workspace-buttons">
          <button title="Dashboard">📊 Dashboard</button>
          <button title="Projects">📁 Projects</button>
          <button title="Snippets">📝 Snippets</button>
          <button title="Playground">🎮 Playground</button>
          <button title="Classroom">🏫 Classroom</button>
        </div>

        <div className="menu-spacer"></div>

        <div className="menu-panel">
          <div className="lang-select">
            <span>Language:</span>
            <div className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
              <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span>{selectedLanguage}</span>
                <span className="arrow">▾</span>
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleLanguageSelect('C (GCC)')}>C (GCC)</button>
                <button onClick={() => handleLanguageSelect('C++ (G++)')}>C++ (G++)</button>
                <button onClick={() => handleLanguageSelect('Python 3')}>Python 3</button>
                <button onClick={() => handleLanguageSelect('Node.js')}>Node.js</button>
                <button onClick={() => handleLanguageSelect('XML')}>XML</button>
                <button onClick={() => handleLanguageSelect('Dot Net')}>Dot Net</button>
                <button onClick={() => handleLanguageSelect('Dart')}>Dart</button>
                <button onClick={() => handleLanguageSelect('Next.js')}>Next.js</button>
              </div>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="auth-section">
              <button className="btn-login" onClick={handleLogin}>Login</button>
              <button className="btn-signup" onClick={handleSignup}>Signup</button>
            </div>
          ) : (
            <div className="user-display">
              <div className="user-logo">👤</div>
              <span className="user-name">{username}</span>
            </div>
          )}

          <div className="account-circle" title="Account" onClick={() => isLoggedIn ? toggleSidebar() : handleLogin()}>👤</div>
        </div>
      </div>

      <div className="app">
        <div className="border-neon"></div>
        <div className="shell">
          {/* Sidebar */}
          <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="logo">
              <div className="logo-box">⚡</div>
              <span id="logoText">Xenithra Technologics</span>
            </div>

            <div className="collapsed-icons" style={{ display: sidebarCollapsed ? 'flex' : 'none' }}>
              <button className="collapsed-icon" title="Dashboard">📊</button>
              <button className="collapsed-icon" title="Projects">📁</button>
              <button className="collapsed-icon" title="Snippets">📝</button>
              <button className="collapsed-icon" title="Playground">🎮</button>
            </div>

            <div className="sidebar-content" style={{ display: sidebarCollapsed ? 'none' : 'block' }}>
              <div className="subtitle">Frosted neon playground for modern C/C++ builds.</div>
              <div className="pill-label">Workspace</div>
              <button>Open Folder</button>
              <button>Dashboard</button>
              <button>Projects</button>
              <button>Snippets</button>
              <button>Playground</button>
            </div>

            {isLoggedIn && (
              <div className="user-section" style={{ display: sidebarCollapsed ? 'none' : 'block' }}>
                <div className="user-info">
                  <div className="user-logo">👤</div>
                  <span className="user-name">{username}</span>
                </div>
                <div className="pill-label" style={{ marginTop: '14px' }}>Account</div>
                <button>Profile</button>
                <button>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="main">
            <div className="editor-header">
              <div className="editor-controls">
                <button className="btn-run" onClick={handleRun}>▶ Run</button>
                <button>🐞 Debug</button>
                <button>■ Stop</button>
                <button>Share</button>
                <button>Save</button>
                <button>{'{ }'} Format</button>
                <button>Print</button>
                <button>Timer</button>
                <button>Github Account</button>
              </div>
            </div>

            <div className="editor-wrapper">
              <div className="editor">
                <div className="line-numbers">
                  {code.split('\n').map((_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <div
                  className="code-area"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setCode(e.target.innerText)}
                  ref={codeAreaRef}
                >
                  {code}
                </div>
              </div>

              <div className="terminal">
                <div className="terminal-header">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                  <span>integrated terminal • demo API</span>
                </div>
                <div className="terminal-body" ref={terminalBodyRef}>
                  {terminalLines.map((line, index) => (
                    <div key={index} className="terminal-line">
                      <span className={line.className}>{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bottom">
              <div>
                <label>Command line arguments:</label>
                <input
                  type="text"
                  value={cliArgs}
                  onChange={(e) => setCliArgs(e.target.value)}
                  placeholder="--help"
                />
              </div>
              <div className="stdin-options">
                Standard Input:
                <label><input type="radio" name="stdin" defaultChecked /> Interactive Console</label>
                <label><input type="radio" name="stdin" /> Text</label>
              </div>
            </div>
          </div>
        </div>
      </div>
  </>
  )
}

export default MainApp
