import React, { useState, useEffect, useRef } from 'react'

const EditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Node.js')
  const [code, setCode] = useState(`/******************************************************************************
Xenithra Code Studio. Futuristic glassmorphism IDE with neon gradients. 
Type here, click Run, and enjoy the glow.
*******************************************************************************/

console.log('Hello, Xenithra!');`)
  const [terminalLines, setTerminalLines] = useState([
    { text: 'xenithra@glass:~$', className: 'prompt' },
    { text: 'System diagnostics operational. Compiler engine online.', className: 'muted' }
  ])
  const [cliArgs, setCliArgs] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [timerTime, setTimerTime] = useState(300) // 5 minutes default
  const [timerRunning, setTimerRunning] = useState(false)

  // Layout resize states
  const [editorHeight, setEditorHeight] = useState(400) // default editor height in pixels
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)

  const codeAreaRef = useRef(null)
  const terminalBodyRef = useRef(null)

  // Sync default code template when language changes
  useEffect(() => {
    switch (selectedLanguage) {
      case 'C (GCC)':
        setCode(`// Xenithra Code Studio - GCC compiler
#include <stdio.h>

int main() {
    printf("Hello from C compilation engine!\\n");
    return 0;
}`)
        break
      case 'C++ (G++)':
        setCode(`// Xenithra Code Studio - G++ compiler
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++ compilation engine!" << endl;
    return 0;
}`)
        break
      case 'Python 3':
        setCode(`# Xenithra Code Studio - Python 3 runner
import sys

print("Hello from Python runner engine!")
print("Version:", sys.version)`)
        break
      case 'Node.js':
        setCode(`// Xenithra Code Studio - Node.js runner
console.log("Hello from Node.js runner engine!");
console.log("Process PID:", process.pid);`)
        break
      case 'Dot Net':
        setCode(`// Xenithra Code Studio - C# compiler
using System;

class Program {
    static void Main(string[] args) {
        Console.WriteLine("Hello from C# compiler engine!");
    }
}`)
        break
      case 'Dart':
        setCode(`// Xenithra Code Studio - Dart runner
void main() {
  print("Hello from Dart runner engine!");
}`)
        break
      case 'XML':
        setCode(`<!-- Xenithra Code Studio - XML Syntax Validator -->
<xenithra>
    <project name="Xenithra Technologies" version="1.0.0"/>
    <status value="running" port="8000"/>
</xenithra>`)
        break
      case 'Next.js':
        setCode(`// Xenithra Code Studio - Next.js/React code mockup
import React from 'react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold text-cyan-400">Hello, Next.js!</h1>
    </div>
  );
}`)
        break
      default:
        break
    }
  }, [selectedLanguage])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [terminalLines])

  // Timer counter interval logic
  useEffect(() => {
    let interval = null
    if (timerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timerTime === 0) {
      setTimerRunning(false)
      setTerminalLines((prev) => [
        ...prev,
        { text: '[TIMER] Time limit reached!', className: 'warning' },
        { text: 'xenithra@glass:~$', className: 'prompt' }
      ])
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerTime])

  // Drag resizer handler for editor vs terminal split pane
  const handleTerminalMouseDown = (e) => {
    e.preventDefault()
    setIsResizingTerminal(true)
    const startY = e.clientY
    const startHeight = editorHeight

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      // Calculate new height, keeping it bounded between 120px and 700px
      const newHeight = Math.max(120, Math.min(700, startHeight + deltaY))
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
        text: `xenithra@glass:~$ run --lang='${selectedLanguage}' ${cliArgs ? '--args="' + cliArgs + '"' : ''}`, 
        className: 'prompt' 
      },
      { text: 'Compiling & launching execution shell...', className: 'muted' }
    ]
    setTerminalLines(newLines)

    try {
      const res = await fetch('http://localhost:8000/api/run', {
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
        { text: `[SYSTEM] Process completed with success status: ${json.success}`, className: 'muted' },
        { text: `xenithra@glass:~$`, className: 'prompt' }
      ])
    } catch (err) {
      setTerminalLines([
        ...newLines,
        { text: `[ERROR] Execution failed: ${err.message}`, className: 'error' },
        { text: `[HINT] Ensure the local server is running by verifying index.js startup.`, className: 'warning' },
        { text: `xenithra@glass:~$`, className: 'prompt' }
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
      { text: 'xenithra@glass:~$', className: 'prompt' }
    ])
  }

  const handleDebug = () => {
    setTerminalLines([
      ...terminalLines,
      { text: `xenithra@glass:~$ debug --lang='${selectedLanguage}'`, className: 'prompt' },
      { text: '[DEBUG] Debugger debugger-v8 attached successfully. Resuming breakpoints...', className: 'warning' },
      { text: 'xenithra@glass:~$', className: 'prompt' }
    ])
  }

  const handleFormat = () => {
    // Format simple indentation or cleanup
    const formatted = code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
    setCode(formatted)

    setTerminalLines([
      ...terminalLines,
      { text: `[FORMAT] Syntactical cleanup completed.`, className: 'success' },
      { text: 'xenithra@glass:~$', className: 'prompt' }
    ])
  }

  const handleSave = () => {
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
    const ext = extensions[selectedLanguage] || 'txt'
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xenithra_${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)

    setTerminalLines([
      ...terminalLines,
      { text: `[SAVED] Code downloaded as: xenithra_${Date.now()}.${ext}`, className: 'success' },
      { text: 'xenithra@glass:~$', className: 'prompt' }
    ])
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write('<pre style="padding:20px; font-family: monospace; background:#1e1e1e; color:#fff;">' + code + '</pre>')
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="editor-container" style={styles.container}>
      {/* Editor Header Controls */}
      <div className="editor-header" style={styles.header}>
        <div className="editor-controls" style={styles.controls}>
          <button 
            className={`btn-run ${isRunning ? 'disabled' : ''}`}
            onClick={handleRun}
            disabled={isRunning}
            style={styles.btnRun}
          >
            ▶ Run
          </button>
          <button 
            onClick={handleDebug}
            style={styles.btnDebug}
          >
            🐞 Debug
          </button>
          <button 
            onClick={handleStop}
            style={styles.btnStop}
          >
            ■ Stop
          </button>
          <button onClick={handleSave} style={styles.btnAction}>Save</button>
          <button onClick={handleFormat} style={styles.btnAction}>Format</button>
          <button onClick={handlePrint} style={styles.btnAction}>Print</button>
          <button 
            onClick={() => setShowTimer(!showTimer)}
            style={{
              ...styles.btnAction,
              borderColor: showTimer ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)'
            }}
          >
            ⏱️ Timer
          </button>
        </div>
      </div>

      {/* Timer Widget */}
      {showTimer && (
        <div className="timer-widget" style={styles.timerWidget}>
          <div style={styles.timerHeader}>
            <span>⏱️ Session Timer</span>
            <button onClick={() => setShowTimer(false)} style={styles.closeBtn}>✕</button>
          </div>
          <div style={styles.timerDisplay}>
            {Math.floor(timerTime / 60)}:{String(timerTime % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button 
              onClick={() => setTimerRunning(!timerRunning)}
              style={{
                ...styles.timerBtn,
                background: timerRunning ? 'rgba(255,107,107,0.25)' : 'rgba(0,230,118,0.25)',
                color: timerRunning ? '#ff6b6b' : '#00e676'
              }}
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={() => { setTimerRunning(false); setTimerTime(300); }}
              style={styles.timerBtnReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Split Pane Layout */}
      <div className="editor-wrapper" style={styles.wrapper}>
        
        {/* Code Editor Panel */}
        <div className="editor" style={{ ...styles.editorPanel, height: `${editorHeight}px` }}>
          <div className="line-numbers">
            {code.split('\n').map((_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            className="code-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={styles.textarea}
          />
        </div>

        {/* Horizontal resizer divider bar */}
        <div 
          className={`resizer-h ${isResizingTerminal ? 'resizing' : ''}`}
          onMouseDown={handleTerminalMouseDown}
        />

        {/* Integrated Terminal Panel */}
        <div className="terminal" style={styles.terminalPanel}>
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

      {/* Bottom Option Bar */}
      <div className="bottom" style={styles.bottomBar}>
        <div style={styles.optionGroup}>
          <label style={styles.label}>Language:</label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={styles.select}
          >
            <option value="C (GCC)">C (GCC)</option>
            <option value="C++ (G++)">C++ (G++)</option>
            <option value="Python 3">Python 3</option>
            <option value="Node.js">Node.js</option>
            <option value="XML">XML</option>
            <option value="Dot Net">Dot Net (C#)</option>
            <option value="Dart">Dart</option>
            <option value="Next.js">Next.js</option>
          </select>
        </div>
        
        <div style={styles.optionGroup}>
          <label style={styles.label}>Command Line Args:</label>
          <input
            type="text"
            value={cliArgs}
            onChange={(e) => setCliArgs(e.target.value)}
            placeholder="e.g. --help --debug"
            style={styles.input}
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '12px',
    gap: '10px',
    background: 'transparent',
    overflow: 'hidden'
  },
  header: {
    background: 'rgba(10, 15, 30, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '10px 15px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  btnRun: {
    padding: '8px 16px',
    background: 'rgba(0, 230, 118, 0.15)',
    border: '1px solid rgba(0, 230, 118, 0.4)',
    color: '#00e676',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(0, 230, 118, 0.25)',
    transition: 'all 0.2s ease'
  },
  btnDebug: {
    padding: '8px 16px',
    background: 'rgba(255, 193, 7, 0.15)',
    border: '1px solid rgba(255, 193, 7, 0.4)',
    color: '#ffc107',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnStop: {
    padding: '8px 16px',
    background: 'rgba(255, 107, 107, 0.15)',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    color: '#ff6b6b',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnAction: {
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  timerWidget: {
    background: 'rgba(10, 15, 40, 0.85)',
    border: '1px solid var(--accent-color)',
    padding: '12px',
    borderRadius: '12px',
    width: '210px',
    position: 'fixed',
    bottom: '80px',
    right: '25px',
    zIndex: 100,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  },
  timerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#8fa0b5'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '12px'
  },
  timerDisplay: {
    fontSize: '32px',
    textAlign: 'center',
    color: '#00e676',
    margin: '10px 0',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0,230,118,0.4)'
  },
  timerBtn: {
    flex: 1,
    padding: '6px',
    border: '1px solid transparent',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  timerBtnReset: {
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  editorPanel: {
    flex: 'none',
    display: 'flex',
    position: 'relative',
    overflow: 'auto',
    borderRadius: '12px 12px 0 0'
  },
  textarea: {
    flex: 1,
    height: '100%',
    width: '100%',
    background: 'transparent',
    border: 'none',
    resize: 'none',
    fontFamily: 'Consolas, monospace',
    fontSize: '14px',
    color: 'var(--text-main)',
    lineHeight: '1.55',
    outline: 'none',
    padding: '14px 15px',
    marginLeft: '42px'
  },
  terminalPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '0 0 12px 12px'
  },
  bottomBar: {
    background: 'rgba(10, 15, 30, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '12px 16px',
    borderRadius: '12px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
    backdropFilter: 'blur(10px)'
  },
  optionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#8fa0b5',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  select: {
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(5, 8, 22, 0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
    cursor: 'pointer'
  },
  input: {
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(5, 8, 22, 0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
    minWidth: '220px'
  }
}

export default EditorPage
