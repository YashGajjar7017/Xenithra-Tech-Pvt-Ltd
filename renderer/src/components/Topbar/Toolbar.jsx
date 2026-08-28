import React, { useState, useEffect } from 'react'
import CompilerLogo from '../ui/CompilerLogo'

const Toolbar = ({ theme, setTheme }) => {
  const [isLiveServerRunning, setIsLiveServerRunning] = useState(false)
  const [liveServerPort, setLiveServerPort] = useState(5500)

  // Check initial Live Server status
  useEffect(() => {
    if (window.api && typeof window.api.getLiveServerStatus === 'function') {
      window.api
        .getLiveServerStatus()
        .then((status) => {
          if (status) {
            setIsLiveServerRunning(status.running)
            if (status.port) setLiveServerPort(status.port)
          }
        })
        .catch(() => {})
    }
  }, [])

  const toggleLiveServer = async () => {
    if (!window.api || typeof window.api.startLiveServer !== 'function') return
    if (isLiveServerRunning) {
      await window.api.stopLiveServer()
      setIsLiveServerRunning(false)
    } else {
      const activeWorkspacePath = localStorage.getItem('activeWorkspacePath') || ''
      try {
        const res = await window.api.startLiveServer(activeWorkspacePath, 5500)
        if (res && res.success) {
          setIsLiveServerRunning(true)
          setLiveServerPort(res.port)
          window.open(res.url, '_blank')
        } else {
          alert(`Live Server status: ${res ? res.message : 'Starting server...'}`)
        }
      } catch (err) {
        console.error('Live Server error:', err)
      }
    }
  }

  const runCode = () => window.dispatchEvent(new CustomEvent('menu-run-code'))
  const debugCode = () => window.dispatchEvent(new CustomEvent('menu-debug-code'))
  const formatCode = () => window.dispatchEvent(new CustomEvent('menu-format-code'))
  const stopCode = () => window.dispatchEvent(new CustomEvent('menu-stop-code'))
  const packageCode = () => window.dispatchEvent(new CustomEvent('menu-package-code'))
  const splitEditor = () => window.dispatchEvent(new CustomEvent('menu-split-editor'))
  const shareGist = () => window.dispatchEvent(new CustomEvent('menu-share-gist'))
  const liveShare = () => window.dispatchEvent(new CustomEvent('menu-live-share'))

  return (
    <div className="responsive-toolbar">
      {/* Left: Compiler Brand Logo & Runner Label */}
      <div className="toolbar-left-group">
        <CompilerLogo
          size={20}
          showText={true}
          textStyle={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}
        />
        <span className="toolbar-separator">|</span>
        <div className="toolbar-runner-badge">
          <i
            className="bx bx-play-circle"
            style={{ color: 'var(--accent-color)', fontSize: '13px' }}
          ></i>
          <span className="toolbar-runner-text">Runner Engine</span>
        </div>
      </div>

      {/* Center: Responsive Execution & Debugging Control Actions */}
      <div className="toolbar-center-actions">
        {/* Run Button */}
        <button
          onClick={runCode}
          title="Run Active Code (Ctrl+F5 / ▶)"
          className="toolbar-btn btn-run-glow"
        >
          <span className="btn-icon">▶</span>
          <span className="btn-label">Run</span>
        </button>

        {/* Debug Button */}
        <button
          onClick={debugCode}
          title="Debug Active Code with Breakpoints (F5)"
          className="toolbar-btn btn-debug-glow"
        >
          <span className="btn-icon">🐞</span>
          <span className="btn-label">Debug</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={stopCode}
          title="Stop Running Process / Terminate (Shift+F5)"
          className="toolbar-btn btn-stop-glow"
        >
          <span className="btn-icon">■</span>
          <span className="btn-label">Stop</span>
        </button>

        <span className="toolbar-separator">|</span>

        {/* Live Server Toggle */}
        <button
          onClick={toggleLiveServer}
          title={
            isLiveServerRunning
              ? `Live Server running on http://localhost:${liveServerPort}. Click to stop.`
              : 'Start Live Server for workspace root index.html'
          }
          className={`toolbar-btn ${isLiveServerRunning ? 'btn-liveserver-active' : 'btn-liveserver'}`}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isLiveServerRunning ? '#00ffaa' : '#888',
              boxShadow: isLiveServerRunning ? '0 0 6px #00ffaa' : 'none'
            }}
          />
          <span className="btn-icon">⚡</span>
          <span className="btn-label">
            Live Server{isLiveServerRunning ? `: :${liveServerPort}` : ''}
          </span>
        </button>

        <span className="toolbar-separator">|</span>

        {/* Format */}
        <button onClick={formatCode} title="Format Document (Shift+Alt+F)" className="toolbar-btn">
          <span className="btn-icon">{`{ }`}</span>
          <span className="btn-label">Format</span>
        </button>

        {/* Package Binary */}
        <button
          onClick={packageCode}
          title="Compile and package standalone executable"
          className="toolbar-btn btn-package"
        >
          <span className="btn-icon">📦</span>
          <span className="btn-label">Package</span>
        </button>

        {/* Split Editor */}
        <button
          onClick={splitEditor}
          title="Toggle Sideways Split Screen Editors"
          className="toolbar-btn"
        >
          <span className="btn-icon">||</span>
          <span className="btn-label">Split</span>
        </button>

        {/* Gist Share */}
        <button onClick={shareGist} title="Share code via GitHub Gist" className="toolbar-btn btn-gist">
          <span className="btn-icon">🐙</span>
          <span className="btn-label">Gist</span>
        </button>

        {/* Live Share RTC */}
        <button
          onClick={liveShare}
          title="Start or Join Realtime Peer Collaboration Session"
          className="toolbar-btn btn-rtc"
        >
          <span className="btn-icon">🌐</span>
          <span className="btn-label">Live Share</span>
        </button>
      </div>

      {/* Right: Quick Engine Status Pill */}
      <div className="toolbar-right-group">
        <div
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#d8b4fe',
              boxShadow: '0 0 4px #d8b4fe'
            }}
          />
          <span style={{ fontWeight: '600' }}>GLM-4 Core</span>
        </div>
      </div>
    </div>
  )
}

// Active styling tags injection
if (typeof document !== 'undefined' && !document.getElementById('responsive-toolbar-styles')) {
  const css = `
    .responsive-toolbar {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      background: rgba(10, 16, 32, 0.75);
      border-bottom: 1px solid var(--panel-border);
      z-index: 5;
      backdrop-filter: blur(14px);
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .responsive-toolbar::-webkit-scrollbar {
      display: none;
    }
    .toolbar-left-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .toolbar-separator {
      opacity: 0.25;
      color: #fff;
      font-size: 11px;
    }
    .toolbar-runner-badge {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .toolbar-runner-text {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .toolbar-center-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 4px;
    }
    .toolbar-center-actions::-webkit-scrollbar {
      display: none;
    }
    .toolbar-right-group {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .toolbar-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      color: var(--text-main);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      padding: 3px 8px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .toolbar-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .toolbar-btn:active {
      transform: scale(0.96);
    }
    .btn-run-glow {
      background: linear-gradient(135deg, #a855f7 0%, #00b0ff 100%) !important;
      border: none !important;
      color: #fff !important;
      font-weight: 700 !important;
      box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35);
    }
    .btn-run-glow:hover {
      box-shadow: 0 2px 14px rgba(168, 85, 247, 0.6) !important;
    }
    .btn-debug-glow {
      background: rgba(168, 85, 247, 0.1) !important;
      border-color: rgba(168, 85, 247, 0.35) !important;
      color: #d8b4fe !important;
    }
    .btn-stop-glow {
      background: rgba(255, 107, 107, 0.12) !important;
      border-color: rgba(255, 107, 107, 0.3) !important;
      color: #ff6b6b !important;
    }
    .btn-liveserver {
      color: var(--text-main);
    }
    .btn-liveserver-active {
      background: rgba(168, 85, 247, 0.15) !important;
      border-color: #d8b4fe !important;
      color: #d8b4fe !important;
      box-shadow: 0 0 8px rgba(168, 85, 247, 0.35);
    }
    .btn-package {
      background: rgba(168, 85, 247, 0.08) !important;
      border-color: rgba(168, 85, 247, 0.25) !important;
      color: #d8b4fe !important;
    }
    .btn-gist {
      background: rgba(216, 180, 254, 0.12) !important;
      border-color: #d8b4fe !important;
      color: #d8b4fe !important;
    }
    .btn-rtc {
      background: rgba(168, 85, 247, 0.12) !important;
      border-color: #d8b4fe !important;
      color: #d8b4fe !important;
    }

    /* Small Screen Responsive Rules */
    @media (max-width: 950px) {
      .toolbar-runner-text {
        display: none;
      }
      .toolbar-btn .btn-label {
        display: none;
      }
      .toolbar-btn {
        padding: 3px 6px;
      }
      .btn-run-glow .btn-label,
      .btn-debug-glow .btn-label,
      .btn-stop-glow .btn-label {
        display: inline !important;
      }
    }
    @media (max-width: 720px) {
      .btn-run-glow .btn-label,
      .btn-debug-glow .btn-label,
      .btn-stop-glow .btn-label {
        display: none !important;
      }
      .toolbar-right-group {
        display: none;
      }
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.id = 'responsive-toolbar-styles'
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default Toolbar
