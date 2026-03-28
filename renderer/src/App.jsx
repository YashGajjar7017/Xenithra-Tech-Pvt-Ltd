import React, { useState, useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './css/index.css'
import Topbar from './components/Topbar/Topbar'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ClassroomPage from './views/classroom'

const MainApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Account/login" element={<LoginPage />} />
        <Route path="/Account/signup" element={<SignupPage />} />
        <Route path="/Dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/classroom" element={<ClassroomPage />} />
        <Route path="/*" element={<MainLayout><EditorPage /></MainLayout>} />
      </Routes>
    </Router>
  )
}

// Main Layout Component - Wraps pages with navbar and sidebar
const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <Topbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="app">
        <div className="border-neon"></div>
        <div className="shell">
          <Sidebar collapsed={sidebarCollapsed} />
          <div className="main">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Editor Page Component
const EditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Node.js')
  const [code, setCode] = useState(`/******************************************************************************
Xenithra Code Studio. Futuristic glassmorphism IDE with neon gradients. 
Type here, press enter, and enjoy the glow.
*******************************************************************************/
#include <stdio.h>

int main(void) {
    printf("Hello, Xenithra!\\n");
    return 0;
}`)
  const [terminalLines, setTerminalLines] = useState([
    { text: 'xenithra@glass:~$', className: 'prompt' },
    { text: 'Waiting for first run...', className: 'muted' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [timerTime, setTimerTime] = useState(300) // 5 minutes default
  const [timerRunning, setTimerRunning] = useState(false)

  const codeAreaRef = useRef(null)
  const terminalBodyRef = useRef(null)

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [terminalLines])

  // Handle Run
  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setIsStopped(false)

    const newLines = [
      ...terminalLines,
      { 
        text: `xenithra@glass:~$ run --lang='${selectedLanguage}' ${cliArgs || ''}`, 
        className: 'prompt' 
      },
      { text: 'Compiling and executing code...', className: 'muted' }
    ]
    setTerminalLines(newLines)

    try {
      // Try to fetch from API
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lang: selectedLanguage, 
          args: cliArgs, 
          code: code 
        })
      })

      const json = await res.json()
      const finalLines = [
        ...newLines,
        { text: `[OUTPUT] Process completed successfully`, className: 'success' },
        { text: `[SUCCESS] Status: ${res.status}`, className: 'success' },
        { text: `xenithra@glass:~$`, className: 'prompt' }
      ]
      setTerminalLines(finalLines)
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `[ERROR] ${err.message}`, className: 'error' },
        { text: `xenithra@glass:~$`, className: 'prompt' }
      ])
    } finally {
      setIsRunning(false)
    }
  }

  // Handle Stop
  const handleStop = () => {
    setIsRunning(false)
    setIsStopped(true)
    const newLines = [
      ...terminalLines,
      { text: '[STOPPED] Process terminated by user', className: 'error' },
      { text: 'xenithra@glass:~$', className: 'prompt' }
    ]
    setTerminalLines(newLines)
  }

  // Handle Debug
  const handleDebug = () => {
    const newLines = [
      ...terminalLines,
      { text: `xenithraTechnology@gmail.com:~$ debug --lang='${selectedLanguage}'`, className: 'prompt' },
      { text: '[DEBUG] Debugger attached. Press C to continue, B to set breakpoint', className: 'warning' },
      { text: 'xenithraTechnology@gmail.com:~$', className: 'prompt' }
    ]
    setTerminalLines(newLines)
  }

  // Handle GitHub Login
  const handleGitHub = () => {
    // Redirect to GitHub OAuth or login page
    window.location.href = 'https://github.com/login'
    console.log('GitHub login initiated')
  }

  // Handle Format Code
  const handleFormat = () => {
    // Simple format: remove extra spaces and organize
    const formatted = code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
    setCode(formatted)

    const newLines = [
      ...terminalLines,
      { text: `[FORMAT] Code formatted successfully`, className: 'success' },
      { text: 'xenithraTechnology@gmail.com:~$', className: 'prompt' }
    ]
    setTerminalLines(newLines)
  }

  // Handle Save
  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xenithra_${Date.now()}.${getFileExtension(selectedLanguage)}`
    a.click()
    URL.revokeObjectURL(url)

    const newLines = [
      ...terminalLines,
      { text: `[SAVED] File downloaded`, className: 'success' },
      { text: 'xenithraTechnology@gmail.com:~$', className: 'prompt' }
    ]
    setTerminalLines(newLines)
  }

  // Handle Print
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write('<pre>' + code + '</pre>')
    printWindow.document.close()
    printWindow.print()
  }

  const getFileExtension = (lang) => {
    const extensions = {
      'C (GCC)': 'c',
      'C++ (G++)': 'cpp',
      'Python 3': 'py',
      'Node.js': 'js',
      'XML': 'xml',
      'Dot Net': 'cs',
      'Dart': 'dart',
      'Next.js': 'jsx'
    }
    return extensions[lang] || 'txt'
  }

  return (
    <div className="editor-container">
      {/* Editor Header with Controls */}
      <div className="editor-header">
        <div className="editor-controls">
          <button 
            className={`btn-run ${isRunning ? 'disabled' : ''}`}
            onClick={handleRun}
            disabled={isRunning}
            title="Run code (Ctrl+Enter)"
          >
            ▶ Run
          </button>
          <button 
            className="btn-debug"
            onClick={handleDebug}
            title="Debug code"
          >
            🐞 Debug
          </button>
          <button 
            className={`btn-stop ${!isRunning ? 'disabled' : ''}`}
            onClick={handleStop}
            disabled={!isRunning}
            title="Stop execution"
          >
            ■ Stop
          </button>
          <button title="Share code">Share</button>
          <button onClick={handleSave} title="Download code">Save</button>
          <button onClick={handleFormat} title="Format code">{'{ }'} Format</button>
          <button onClick={handlePrint} title="Print code">Print</button>
          <button 
            onClick={() => setShowTimer(!showTimer)}
            title="Show timer"
          >
            ⏱️ Timer
          </button>
          <button 
            onClick={handleGitHub}
            title="Login with GitHub"
          >
            🐙 GitHub
          </button>
        </div>
      </div>

      {/* Timer Widget */}
      {showTimer && (
        <div className="timer-widget">
          <div className="timer-header">
            <span>⏱️ Timer</span>
            <button onClick={() => setShowTimer(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
          <div className="timer-display">
            {Math.floor(timerTime / 60)}:{String(timerTime % 60).padStart(2, '0')}
          </div>
          <div className="timer-controls">
            <input 
              type="range" 
              min="1" 
              max="3600" 
              value={timerTime}
              onChange={(e) => setTimerTime(parseInt(e.target.value))}
              disabled={timerRunning}
              style={{ width: '100%' }}
            />
          </div>
          <button 
            onClick={() => setTimerRunning(!timerRunning)}
            style={{
              width: '100%',
              padding: '8px',
              background: timerRunning ? '#ff6b6b' : '#00e676',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {timerRunning ? 'Pause' : 'Start'}
          </button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="editor-wrapper">
        <div className="editor">
          <div className="line-numbers">
            {code.split('\n').map((_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            className="code-area"
            ref={codeAreaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: '14px',
              padding: '10px',
resize: 'vertical',
              overflow: 'auto',
              minHeight: '300px'
            }}
          />
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
            <span>Integrated Terminal</span>
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

      {/* Bottom Panel */}
      <div className="bottom">
        <div>
          <label>Language:</label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              marginLeft: '10px',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="C (GCC)">C (GCC)</option>
            <option value="C++ (G++)">C++ (G++)</option>
            <option value="Python 3">Python 3</option>
            <option value="Node.js">Node.js</option>
            <option value="XML">XML</option>
            <option value="Dot Net">Dot Net</option>
            <option value="Dart">Dart</option>
            <option value="Next.js">Next.js</option>
          </select>
        </div>
        <div>
          <label>Command line arguments:</label>
          <input
            type="text"
            value={cliArgs}
            onChange={(e) => setCliArgs(e.target.value)}
            placeholder="--help"
            style={{
              marginLeft: '10px',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              minWidth: '200px'
            }}
          />
        </div>
        <div className="stdin-options">
          <label><input type="radio" name="stdin" defaultChecked /> Interactive Console</label>
          <label style={{ marginLeft: '15px' }}><input type="radio" name="stdin" /> Text Input</label>
        </div>
      </div>

      <style>{`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 40px);
          background: #0a0a0a;
          color: #e8f5ff;
          padding: 10px;
          gap: 10px;
        }

        .editor-header {
          background: rgba(10, 15, 40, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }

        .editor-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .editor-controls button {
          padding: 8px 12px;
          background: rgba(0, 229, 255, 0.15);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: #00e5ff;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .editor-controls button:hover:not(:disabled) {
          background: rgba(0, 229, 255, 0.3);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
        }

        .editor-controls button:disabled,
        .editor-controls button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-run {
          background: rgba(0, 230, 118, 0.2) !important;
          border-color: rgba(0, 230, 118, 0.4) !important;
          color: #00e676 !important;
        }

        .btn-debug {
          background: rgba(255, 193, 7, 0.2) !important;
          border-color: rgba(255, 193, 7, 0.4) !important;
          color: #ffc107 !important;
        }

        .btn-stop {
          background: rgba(255, 107, 107, 0.2) !important;
          border-color: rgba(255, 107, 107, 0.4) !important;
          color: #ff6b6b !important;
        }

        .timer-widget {
          background: rgba(10, 15, 40, 0.9);
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 12px;
          border-radius: 6px;
          width: 200px;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .timer-display {
          font-size: 28px;
          text-align: center;
          color: #00e676;
          margin-bottom: 10px;
          font-family: monospace;
        }

        .editor-wrapper {
          display: flex;
          gap: 10px;
          flex: 1;
          overflow: hidden;
        }

        .editor {
          flex: 1;
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          background: rgba(5, 10, 25, 0.8);
        }

        .line-numbers {
          background: rgba(0, 0, 0, 0.5);
          padding: 10px 8px;
          color: #666;
          font-size: 12px;
          font-family: monospace;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          user-select: none;
          overflow: hidden;
          line-height: 1.5;
        }

        .code-area {
          flex: 1;
          background: transparent;
          color: #e8f5ff;
          border: none;
          padding: 10px;
          font-family: Consolas, monospace;
          font-size: 14px;
          line-height: 1.5;
          outline: none;
        }

        .terminal {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          background: #000;
        }

        .terminal-header {
          background: rgba(10, 10, 10, 0.8);
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }

        .terminal-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          font-family: Consolas, monospace;
          font-size: 12px;
        }

        .terminal-line {
          line-height: 1.6;
        }

        .prompt {
          color: #00ff00;
        }

        .muted {
          color: #888;
        }

        .success {
          color: #00ff00;
        }

        .error {
          color: #ff6b6b;
        }

        .warning {
          color: #ffc107;
        }

        .bottom {
          background: rgba(10, 15, 40, 0.8);
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .bottom > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bottom label {
          font-size: 12px;
          white-space: nowrap;
        }

        .stdin-options {
          margin-left: auto;
        }

        .stdin-options label {
          margin-right: 15px;
          cursor: pointer;
        }

        .stdin-options input[type="radio"] {
          margin-right: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default MainApp

// // Layouts
// import MainLayout from './layouts/MainLayout'

// function App() {
//   React.useEffect(() => {
//     const handler = () => document.body.classList.toggle('dark-theme')
//     window.addEventListener('toggle-theme', handler)
//     return () => window.removeEventListener('toggle-theme', handler)
//   }, [])
//   return (
//     <Router>
//       <Routes>
//         <Route path="/editor" element={<EditorPage />} />
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/dashboard" element={<DashboardPage />} />
//           <Route path="*" element={<NotFoundPage />} />
//         </Route>
//       </Routes>
//     </Router>
//   )
// }