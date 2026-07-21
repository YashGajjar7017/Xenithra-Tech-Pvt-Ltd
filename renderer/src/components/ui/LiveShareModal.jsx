import React, { useState } from 'react'

const LiveShareModal = ({ isOpen, onClose, code = '', onSyncCode }) => {
  const [mode, setMode] = useState('menu') // 'menu', 'host', 'join'
  const [roomCode, setRoomCode] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [connected, setConnected] = useState(false)
  const [peersCount, setPeersCount] = useState(1)
  const [statusMsg, setStatusMsg] = useState('')

  if (!isOpen) return null

  const handleHostSession = async () => {
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

  const handleJoinSession = async () => {
    if (!inputRoomCode.trim()) return
    if (window.api && typeof window.api.joinRtcRoom === 'function') {
      const res = await window.api.joinRtcRoom(inputRoomCode.trim())
      if (res && res.success) {
        setRoomCode(res.roomCode)
        setMode('join')
        setConnected(true)
        setPeersCount(res.peersCount)
        if (res.currentText && onSyncCode) {
          onSyncCode(res.currentText)
        }
        setStatusMsg(`Successfully connected to Live Session ${res.roomCode}!`)
      } else {
        setStatusMsg(res ? res.error : 'Failed to join room.')
      }
    }
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
          width: '460px',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🌐</span>
            <span style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.04em' }}>2-PLAYER REALTIME RTC LIVE SHARE</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                🎮 Host 2-Player Live Session
              </button>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#8b949e' }}>— OR —</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Room Code (e.g. RTC-849201)..." 
                  value={inputRoomCode} 
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', outline: 'none' }} 
                />
                <button 
                  onClick={handleJoinSession}
                  style={{ background: '#58a6ff', border: 'none', color: '#fff', fontWeight: 'bold', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Join
                </button>
              </div>
            </div>
          )}

          {connected && (
            <div style={{ background: 'rgba(0, 255, 170, 0.1)', border: '1px solid #00ffaa', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#00ffaa', fontWeight: 'bold' }}>● LIVE SESSION ACTIVE</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Players: {peersCount}/2</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#fff', textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '4px' }}>
                ROOM CODE: <span style={{ color: '#00ffaa' }}>{roomCode}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#8b949e', textAlign: 'center' }}>
                Real-time WebSocket & P2P DataSync connected. Both players can type simultaneously!
              </div>
            </div>
          )}

          {statusMsg && !connected && (
            <div style={{ fontSize: '11px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '8px', borderRadius: '4px' }}>
              {statusMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default LiveShareModal
