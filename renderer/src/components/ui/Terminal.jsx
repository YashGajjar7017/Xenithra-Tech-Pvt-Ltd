import React, { useState, useEffect, useRef } from 'react'

const Terminal = ({ isRunning, onClose }) => {
  const [history, setHistory] = useState([
    { type: 'sys', text: 'Xenithra Integrated Terminal Engine v2.0 initialized.\nConnected to backend native shell process (kernel32.dll / cmd.exe).' }
  ])
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [activeTab, setActiveTab] = useState('Terminal')

  const terminalEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize backend terminal session on mount
  useEffect(() => {
    let unsubscribe = null

    if (window.api && typeof window.api.onTerminalData === 'function') {
      unsubscribe = window.api.onTerminalData((data) => {
        setHistory(prev => [...prev, data])
      })
    }

    if (window.api && typeof window.api.initTerminal === 'function') {
      const activePath = localStorage.getItem('activeWorkspacePath') || ''
      window.api.initTerminal(activePath).catch(err => {
        setHistory(prev => [...prev, { type: 'stderr', text: `Failed to initialize backend shell: ${err.message}` }])
      })
    }

    return () => {
      // Cleanup
    }
  }, [])

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = inputVal
      if (!cmd.trim()) return

      // Add to command history
      setCmdHistory(prev => [...prev, cmd])
      setHistoryIdx(-1)

      // Print input line
      setHistory(prev => [...prev, { type: 'input', text: cmd }])
      setInputVal('')

      // Send to backend shell process
      if (window.api && typeof window.api.writeTerminal === 'function') {
        window.api.writeTerminal(cmd)
      } else {
        setHistory(prev => [...prev, { type: 'stderr', text: 'Backend terminal IPC unavailable.' }])
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1)
      setHistoryIdx(nextIdx)
      setInputVal(cmdHistory[nextIdx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx === -1) return
      const nextIdx = historyIdx + 1
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1)
        setInputVal('')
      } else {
        setHistoryIdx(nextIdx)
        setInputVal(cmdHistory[nextIdx] || '')
      }
    }
  }

  const handleClear = () => {
    setHistory([{ type: 'sys', text: 'Terminal output cleared.' }])
  }

  return (
    <div 
      className="terminal-window" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#0a0e17',
        color: '#c9d1d9',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: '12px',
        borderTop: '1px solid var(--panel-border)',
        overflow: 'hidden'
      }}
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* Terminal Header Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          userSelect: 'none'
        }}
      >
        {/* Left Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {['Terminal', 'Problems', 'Output', 'Debug Console'].map(tab => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: '11px',
                fontWeight: activeTab === tab ? '600' : 'normal',
                color: activeTab === tab ? 'var(--accent-color)' : '#8b949e',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#8b949e'}
            title="Clear Terminal Output"
          >
            🗑 Clear
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              title="Close Terminal Panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Body */}
      <div 
        style={{
          flex: 1,
          padding: '10px 14px',
          overflowY: 'auto',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}
      >
        {history.map((item, idx) => {
          if (item.type === 'input') {
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa', marginTop: '4px' }}>
                <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>xenithra@studio:~$</span>
                <span>{item.text}</span>
              </div>
            )
          }
          if (item.type === 'stderr') {
            return <div key={idx} style={{ color: '#ff6b6b' }}>{item.text}</div>
          }
          if (item.type === 'sys') {
            return <div key={idx} style={{ color: '#8b949e', fontStyle: 'italic' }}>{item.text}</div>
          }
          return <div key={idx} style={{ color: '#e6edf3' }}>{item.text}</div>
        })}

        {/* Input Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>xenithra@studio:~$</span>
          <input 
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#00ffaa',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
            autoFocus
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}

export default Terminal
