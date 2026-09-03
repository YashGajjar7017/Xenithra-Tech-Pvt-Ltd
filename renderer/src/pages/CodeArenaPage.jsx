import React, { useState, useEffect, useRef } from 'react'

const CodeArenaPage = () => {
  const [matchStatus, setMatchStatus] = useState('idle') // 'idle' | 'hosting' | 'joining' | 'playing' | 'finished'
  const [roomCode, setRoomCode] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [hostIp, setHostIp] = useState('127.0.0.1')
  const [port, setPort] = useState(8000)
  const [playerId, setPlayerId] = useState('p1')
  const [playerName, setPlayerName] = useState('Warrior-' + Math.floor(Math.random() * 900 + 100))
  const [opponentName, setOpponentName] = useState('Waiting for opponent...')
  
  const [joinInput, setJoinInput] = useState('')
  const [copiedToken, setCopiedToken] = useState(false)

  // Coding States
  const [userCode, setUserCode] = useState(
    'function twoSum(nums, target) {\n    // Write your optimized solution here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}'
  )
  const [opponentCode, setOpponentCode] = useState('// Opponent is coding in real-time...\n')
  const [userTestsPassed, setUserTestsPassed] = useState(0)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState(0)
  const [timer, setTimer] = useState(180)
  const [logs, setLogs] = useState([])
  const [outcome, setOutcome] = useState('')

  const pollIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)

  const exitArena = () => {
    window.location.hash = '#/'
  }

  // Frameless window controls
  const handleMinimize = () => window.api?.minimizeWindow?.()
  const handleMaximize = () => window.api?.maximizeWindow?.()
  const handleClose = () => window.api?.closeWindow?.()

  // Host Arena Room on Open Port
  const handleCreateRoom = async () => {
    try {
      setLogs(['⚡ Opening port and registering Arena Room on local network...'])
      const res = await fetch('/api/arena/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName, problemId: 'two-sum' })
      })

      if (res.ok) {
        const data = await res.json()
        setRoomCode(data.roomCode)
        setShareToken(data.shareToken)
        setHostIp(data.localIp)
        setPort(data.port)
        setPlayerId('p1')
        setMatchStatus('hosting')
        setLogs((prev) => [
          ...prev,
          `✔ Arena Room created: ${data.roomCode}`,
          `🌐 Host Listening on Port: ${data.port} (${data.localIp})`,
          '📡 Share Room Code or Invite Token to invite competitors on the network.'
        ])
      }
    } catch (err) {
      setLogs((prev) => [...prev, `✗ Error opening Arena port: ${err.message}`])
    }
  }

  // Join Room by Code or Token
  const handleJoinRoom = async () => {
    if (!joinInput.trim()) return
    try {
      setLogs([`⚡ Connecting to Arena room ${joinInput.trim()}...`])
      const res = await fetch('/api/arena/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: joinInput.trim(),
          shareToken: joinInput.trim(),
          playerName
        })
      })

      if (res.ok) {
        const data = await res.json()
        setRoomCode(data.roomCode)
        setPlayerId('p2')
        setOpponentName(data.room?.player1?.name || 'Host Warrior')
        setMatchStatus('playing')
        setTimer(180)
        setLogs((prev) => [...prev, `✔ Connected to ${data.roomCode}! Battle is starting.`])
      } else {
        const err = await res.json()
        setLogs((prev) => [...prev, `✗ Join failed: ${err.message}`])
      }
    } catch (err) {
      setLogs((prev) => [...prev, `✗ Connection failed: ${err.message}`])
    }
  }

  // Polling room state every 800ms
  useEffect(() => {
    if ((matchStatus === 'hosting' || matchStatus === 'playing') && roomCode) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/arena/room/${roomCode}`)
          if (res.ok) {
            const data = await res.json()
            const room = data.room

            if (matchStatus === 'hosting' && room.player2) {
              setOpponentName(room.player2.name)
              setMatchStatus('playing')
              setTimer(180)
            }

            if (matchStatus === 'playing') {
              if (playerId === 'p1' && room.player2) {
                setOpponentCode(room.player2.code || '')
                setOpponentTestsPassed(room.player2.testsPassed || 0)
              } else if (playerId === 'p2' && room.player1) {
                setOpponentCode(room.player1.code || '')
                setOpponentTestsPassed(room.player1.testsPassed || 0)
              }

              if (room.status === 'finished') {
                setMatchStatus('finished')
                setOutcome(
                  room.winner === playerName
                    ? '🏆 VICTORY! You solved all test cases first!'
                    : `⚔️ DEFEAT! ${room.winner} solved the challenge first.`
                )
              }
            }
          }
        } catch (e) {
          // Silent polling catch
        }
      }, 800)
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [matchStatus, roomCode, playerId, playerName])

  // Sync user typing to host
  const handleCodeChange = (e) => {
    const val = e.target.value
    setUserCode(val)

    if (matchStatus === 'playing' && roomCode) {
      fetch('/api/arena/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, code: val })
      }).catch(() => {})
    }
  }

  // Timer countdown
  useEffect(() => {
    if (matchStatus === 'playing' && timer > 0) {
      timerIntervalRef.current = setTimeout(() => setTimer((t) => t - 1), 1000)
    } else if (timer === 0 && matchStatus === 'playing') {
      setMatchStatus('finished')
      setOutcome('⏱️ Match Timeout - Draw!')
    }
    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current)
    }
  }, [timer, matchStatus])

  // Test Solution Validation
  const submitSolution = async () => {
    setLogs((prev) => [...prev, '⚡ Compiling and executing test suite...'])

    try {
      const evalFunc = new Function(userCode + '\nreturn twoSum;')
      const twoSum = evalFunc()

      const t1 = twoSum([2, 7, 11, 15], 9)
      const t2 = twoSum([3, 2, 4], 6)
      const t3 = twoSum([3, 3], 6)

      const pass1 = Array.isArray(t1) && t1.includes(0) && t1.includes(1)
      const pass2 = Array.isArray(t2) && t2.includes(1) && t2.includes(2)
      const pass3 = Array.isArray(t3) && t3.includes(0) && t3.includes(1)

      const passedCount = (pass1 ? 1 : 0) + (pass2 ? 1 : 0) + (pass3 ? 1 : 0)
      setUserTestsPassed(passedCount)

      setLogs((prev) => [
        ...prev,
        pass1 ? '✓ Case 1 passed: [2,7,11,15], target=9' : '✗ Case 1 failed: [2,7,11,15], target=9',
        pass2 ? '✓ Case 2 passed: [3,2,4], target=6' : '✗ Case 2 failed: [3,2,4], target=6',
        pass3 ? '✓ Case 3 passed: [3,3], target=6' : '✗ Case 3 failed: [3,3], target=6'
      ])

      // Push test count to server
      await fetch('/api/arena/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, testsPassed: passedCount, totalTests: 3 })
      })

      if (passedCount === 3) {
        setMatchStatus('finished')
        setOutcome('🏆 VICTORY! All 3/3 Test Cases Passed!')
      }
    } catch (err) {
      setLogs((prev) => [...prev, `✗ Syntax/Runtime Error: ${err.message}`])
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(shareToken || roomCode)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: '#040209',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 9999
      }}
    >
      {/* Pinned Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '48px',
          minHeight: '48px',
          maxHeight: '48px',
          background: '#0b0816',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          boxSizing: 'border-box',
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={exitArena}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '11px',
              padding: '5px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Exit Studio
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#a78bfa' }}>⚔️</span>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Xenithra Code Battle Arena (1v1 PvP)
            </span>
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#c084fc',
                fontSize: '9.5px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Port {port} Live Socket
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {roomCode && (
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>Room: {roomCode}</span>
              <button
                onClick={handleCopyToken}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Copy Invite Token"
              >
                {copiedToken ? '✓ Copied' : '📋'}
              </button>
            </div>
          )}

          {matchStatus === 'playing' && (
            <div
              style={{
                background: timer <= 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
                border: timer <= 30 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: timer <= 30 ? '#ef4444' : '#fff'
              }}
            >
              ⏱️ {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
          )}

          {/* Window controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            <button
              onClick={handleMinimize}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
            >
              &#8212;
            </button>
            <button
              onClick={handleMaximize}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
            >
              &#9633;
            </button>
            <button
              onClick={handleClose}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
            >
              &#10005;
            </button>
          </div>
        </div>
      </header>

      {/* Main Arena Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 48px - 28px)' }}>
        {matchStatus === 'idle' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'radial-gradient(circle at 50% 50%, #170f2e 0%, #06030c 100%)'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '540px',
                background: 'rgba(18, 12, 34, 0.85)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '28px',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#c084fc', fontWeight: '800' }}>
                  Xenithra Multi-Client PvP Arena
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Battle against peers across open ports on the local network in real-time.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  Warrior Alias:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={handleCreateRoom}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  🚀 Host Match on Port {port}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Enter Room Code or Token..."
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🔑 Join Remote Match
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {matchStatus === 'hosting' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: '#040209'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                background: 'rgba(18, 12, 34, 0.85)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '32px' }}>📡</div>
              <h3 style={{ margin: 0, color: '#c084fc', fontSize: '16px' }}>
                Waiting for Challenger to Join...
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                Room Code: <strong style={{ color: '#fff' }}>{roomCode}</strong> (Port {port})
              </p>

              <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10.5px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#a78bfa' }}>
                {shareToken}
              </div>

              <button
                onClick={handleCopyToken}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {copiedToken ? '✓ Invite Token Copied!' : '📋 Copy Shareable Invite Token'}
              </button>
            </div>
          </div>
        )}

        {(matchStatus === 'playing' || matchStatus === 'finished') && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', overflow: 'hidden' }}>
            {/* Left Column: Player Editor */}
            <div
              style={{
                background: '#080512',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 14px',
                  background: '#0e091e',
                  borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  <span style={{ color: '#c084fc' }}>● {playerName} (You)</span>
                  <span style={{ fontSize: '10px', color: '#10b981' }}>({userTestsPassed}/3 Cases Passed)</span>
                </div>
                <button
                  onClick={submitSolution}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Submit Solution
                </button>
              </div>

              <textarea
                value={userCode}
                onChange={handleCodeChange}
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#030206',
                  color: '#e2e8f0',
                  padding: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflowY: 'auto'
                }}
              />
            </div>

            {/* Right Column: Opponent Live Screen & Outcome */}
            <div
              style={{
                background: '#080512',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 14px',
                  background: '#0e091e',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  <span style={{ color: '#f59e0b' }}>⚔️ Opponent: {opponentName}</span>
                  <span style={{ fontSize: '10px', color: '#f59e0b' }}>({opponentTestsPassed}/3 Cases Passed)</span>
                </div>
                <span style={{ fontSize: '10px', color: '#888' }}>Live Synchronized</span>
              </div>

              <textarea
                value={opponentCode}
                readOnly
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#030206',
                  color: '#94a3b8',
                  padding: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflowY: 'auto',
                  opacity: 0.8
                }}
              />

              {outcome && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: outcome.includes('VICTORY') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderTop: outcome.includes('VICTORY') ? '1px solid #10b981' : '1px solid #ef4444',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: outcome.includes('VICTORY') ? '#34d399' : '#f87171',
                    textAlign: 'center'
                  }}
                >
                  {outcome}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pinned Bottom Statusbar */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '28px',
          minHeight: '28px',
          maxHeight: '28px',
          background: '#0b0816',
          borderTop: '1px solid rgba(139, 92, 246, 0.25)',
          fontSize: '11px',
          color: '#94a3b8',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#c084fc', fontWeight: 'bold' }}>
            ● Match Status: {matchStatus.toUpperCase()}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Room: {roomCode || 'None'}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: '#10b981' }}>Host Socket: http://{hostIp}:{port}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Latency: ~14ms</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Port {port} Open</span>
        </div>
      </footer>
    </div>
  )
}

export default CodeArenaPage
