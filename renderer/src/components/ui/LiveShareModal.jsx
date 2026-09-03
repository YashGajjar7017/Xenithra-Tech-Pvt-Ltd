import React, { useState, useEffect } from 'react'

const LiveShareModal = ({ isOpen, onClose, code = '', onSyncCode }) => {
  const [mode, setMode] = useState('menu') // 'menu', 'host', 'join'
  const [roomCode, setRoomCode] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [connected, setConnected] = useState(false)
  const [peersCount, setPeersCount] = useState(1)
  const [statusMsg, setStatusMsg] = useState('')
  const [sessionsList, setSessionsList] = useState([])
  const [copied, setCopied] = useState(false)

  const apiPort = localStorage.getItem('api-port') || '8000'

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`http://localhost:${apiPort}/api/collaborate/sessions`)
      const data = await res.json()
      if (data.success && data.sessions) {
        setSessionsList(data.sessions)
      }
    } catch (e) {
      console.warn('Could not fetch sessions:', e)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Host a new session (or generate another local session)
  const handleHostSession = async () => {
    try {
      const res = await fetch(`http://localhost:${apiPort}/api/collaborate/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (data.success) {
        setRoomCode(data.sessionId)
        setMode('host')
        setConnected(true)
        setStatusMsg(`Live Session active! Share Code ${data.sessionId} with collaborators.`)
        fetchSessions()
      } else {
        setStatusMsg('Failed to create collaboration session')
      }
    } catch (err) {
      // Fallback to window.api
      if (window.api && typeof window.api.createRtcRoom === 'function') {
        const res = await window.api.createRtcRoom(code)
        if (res && res.success) {
          setRoomCode(res.roomCode)
          setMode('host')
          setConnected(true)
          setStatusMsg(`Live Room active! Share Code ${res.roomCode} with Player 2.`)
        }
      }
    }
  }

  const handleJoinSession = async (targetSession = null) => {
    const sId = targetSession || inputRoomCode.trim()
    if (!sId) return

    try {
      const res = await fetch(`http://localhost:${apiPort}/api/collaborate/poll?sessionId=${encodeURIComponent(sId)}`)
      const data = await res.json()
      if (data.success) {
        setRoomCode(sId)
        setMode('join')
        setConnected(true)
        if (data.code && onSyncCode) {
          onSyncCode(data.code)
        }
        setStatusMsg(`Successfully connected to Live Session ${sId}!`)
      } else {
        setStatusMsg(data.message || 'Session not found on local network.')
      }
    } catch (err) {
      if (window.api && typeof window.api.joinRtcRoom === 'function') {
        const res = await window.api.joinRtcRoom(sId)
        if (res && res.success) {
          setRoomCode(res.roomCode)
          setMode('join')
          setConnected(true)
          if (res.currentText && onSyncCode) {
            onSyncCode(res.currentText)
          }
          setStatusMsg(`Successfully connected to Live Session ${res.roomCode}!`)
        } else {
          setStatusMsg(res ? res.error : 'Failed to join room.')
        }
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '500px',
          background: '#161b22',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main)',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--panel-border)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🌐</span>
            <span style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.04em' }}>
              REALTIME LOCAL NETWORK SESSIONS
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleHostSession}
                style={{
                  background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ⚡ Generate New Local Network Session
              </button>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#8b949e' }}>— OR JOIN ACTIVE SESSION —</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter Session Token or Room Code..."
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleJoinSession()}
                  style={{
                    background: '#58a6ff',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Join
                </button>
              </div>

              {/* Active sessions list */}
              {sessionsList.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>
                    ACTIVE LOCAL SESSIONS ({sessionsList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {sessionsList.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '11px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', color: '#00e5ff' }}>{s.id}</span>
                          <span style={{ fontSize: '9px', color: '#8b949e' }}>Version: {s.version}</span>
                        </div>
                        <button
                          onClick={() => handleJoinSession(s.id)}
                          style={{
                            background: '#1f883d',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {connected && (
            <div
              style={{
                background: 'rgba(0, 255, 170, 0.1)',
                border: '1px solid #00ffaa',
                padding: '12px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '12px', color: '#00ffaa', fontWeight: 'bold' }}>
                  ● LIVE SESSION ACTIVE
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  Local Port: {apiPort}
                </span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  color: '#fff',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}
              >
                SESSION ID: <span style={{ color: '#00ffaa' }}>{roomCode}</span>
              </div>
              <button
                onClick={() => copyToClipboard(roomCode)}
                style={{
                  background: 'rgba(0,255,170,0.2)',
                  border: '1px solid #00ffaa',
                  color: '#00ffaa',
                  padding: '6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {copied ? '✔ Copied to Clipboard!' : '📋 Copy Session ID'}
              </button>
              <div style={{ fontSize: '10px', color: '#8b949e', textAlign: 'center' }}>
                Local network realtime session synchronized. Multiple collaborators can connect and live-edit!
              </div>
            </div>
          )}

          {statusMsg && !connected && (
            <div
              style={{
                fontSize: '11px',
                color: '#ff6b6b',
                background: 'rgba(255,107,107,0.1)',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              {statusMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 20px',
            borderTop: '1px solid var(--panel-border)',
            background: 'rgba(0,0,0,0.2)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ccc',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveShareModal
