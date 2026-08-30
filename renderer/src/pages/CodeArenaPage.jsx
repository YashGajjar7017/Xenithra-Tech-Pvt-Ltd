import React, { useState, useEffect, useRef } from 'react'

const CodeArenaPage = () => {
  const [matchStatus, setMatchStatus] = useState('idle') // idle, matching, playing, finished
  const [roomToken, setRoomToken] = useState('')
  const [opponentName, setOpponentName] = useState('Simulated Bot')
  const [userCode, setUserCode] = useState('function twoSum(nums, target) {\n    // Write code here\n}')
  const [opponentCode, setOpponentCode] = useState('')
  const [timer, setTimer] = useState(120)
  const [logs, setLogs] = useState([])
  const [outcome, setOutcome] = useState('')

  const matchTimerRef = useRef(null)
  const botTypeIntervalRef = useRef(null)

  const exitArena = () => {
    window.location.hash = '#/'
  }

  // Quick Match / Token Join
  const startMatching = (tokenVal = '') => {
    setMatchStatus('matching')
    setRoomToken(tokenVal || Math.random().toString(36).substring(2, 8).toUpperCase())
    setOutcome('')
    setLogs([])

    // Simulated network delay matching radar
    setTimeout(() => {
      setMatchStatus('playing')
      setTimer(120)
      setOpponentName(tokenVal ? 'Remote Competitor' : 'NeuralBot-v4')
      setUserCode('function twoSum(nums, target) {\n    // Write code here\n}')
      setOpponentCode('function twoSum(nums, target) {\n\n}')
      simulateOpponentCoding()
    }, 4000)
  }

  // Simulate opponent typing code line-by-line
  const simulateOpponentCoding = () => {
    if (botTypeIntervalRef.current) clearInterval(botTypeIntervalRef.current)
    const botLines = [
      "function twoSum(nums, target) {",
      "    const map = new Map();",
      "    for (let i = 0; i < nums.length; i++) {",
      "        const diff = target - nums[i];",
      "        if (map.has(diff)) {",
      "            return [map.get(diff), i];",
      "        }",
      "        map.set(nums[i], i);",
      "    }",
      "    return [];",
      "}"
    ]

    let curLineIdx = 0
    botTypeIntervalRef.current = setInterval(() => {
      if (curLineIdx < botLines.length) {
        setOpponentCode((prev) => {
          const lines = prev.split('\n')
          lines.push(botLines[curLineIdx])
          curLineIdx++
          return lines.join('\n')
        })
      } else {
        clearInterval(botTypeIntervalRef.current)
      }
    }, 4500)
  }

  // Countdown timer Effect
  useEffect(() => {
    if (matchStatus === 'playing' && timer > 0) {
      matchTimerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000)
    } else if (timer === 0 && matchStatus === 'playing') {
      endMatch('Timeout - Draw!')
    }
    return () => {
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current)
    }
  }, [timer, matchStatus])

  useEffect(() => {
    return () => {
      if (botTypeIntervalRef.current) clearInterval(botTypeIntervalRef.current)
    }
  }, [])

  const endMatch = (resultMsg) => {
    setMatchStatus('finished')
    setOutcome(resultMsg)
    if (botTypeIntervalRef.current) clearInterval(botTypeIntervalRef.current)
  }

  // Test Solution Validation
  const submitSolution = () => {
    setLogs((prev) => [...prev, '⚡ Compiling user source code...', '🧪 Initiating test suite (3 test cases)...'])
    
    setTimeout(() => {
      try {
        const evalFunc = new Function(userCode + '\nreturn twoSum;')
        const twoSum = evalFunc()
        
        // Run test inputs
        const t1 = twoSum([2, 7, 11, 15], 9)
        const t2 = twoSum([3, 2, 4], 6)
        
        const test1Pass = Array.isArray(t1) && t1.includes(0) && t1.includes(1)
        const test2Pass = Array.isArray(t2) && t2.includes(1) && t2.includes(2)

        if (test1Pass && test2Pass) {
          setLogs((prev) => [...prev, '✓ Case 1 passed: nums=[2,7,11,15], target=9 got index combination', '✓ Case 2 passed: nums=[3,2,4], target=6', '🏆 ALL TESTS PASSED!'])
          endMatch('Victory! You solved the challenge ahead of opponent!')
        } else {
          setLogs((prev) => [...prev, '✗ Case 1 failed: Expected index output adding to target', '⚠️ Review logic indices returns'])
        }
      } catch (err) {
        setLogs((prev) => [...prev, `✗ Compilation Error: ${err.message}`])
      }
    }, 1500)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#040209',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#0b0816',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>⚔️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.06em', color: '#a78bfa' }}>
              XENITHRA CODE BATTLE ARENA
            </h2>
            <div style={{ fontSize: '10px', color: '#7c3aed', marginTop: '2px' }}>
              1v1 PvP Real-time Code Duels
            </div>
          </div>
        </div>

        <button
          onClick={exitArena}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '11px',
            padding: '6px 14px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✕ Exit Arena
        </button>
      </div>

      {/* MATCH STATUS SCREEN TOGGLES */}

      {/* IDLE / LOBBY MODE */}
      {matchStatus === 'idle' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(20,10,38,1) 0%, rgba(3,2,6,1) 100%)' }}>
          <div
            style={{
              width: '450px',
              padding: '32px',
              background: 'rgba(18, 12, 33, 0.82)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 30px rgba(139, 92, 246, 0.15)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚔️</div>
              <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: '#a78bfa', letterSpacing: '0.04em' }}>
                CHOOSE COMBAT METHOD
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>
                Queue up for Quick Match matching or connect directly with online peers using room tokens.
              </p>
            </div>

            <button
              onClick={() => startMatching()}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.45)'
              }}
            >
              🚀 Enter Matchmaker Queue (Quick Bot Match)
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Or join via token</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="ENTER ROOM TOKEN"
                value={roomToken}
                onChange={(e) => setRoomToken(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => startMatching(roomToken)}
                disabled={!roomToken}
                style={{
                  background: roomToken ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: roomToken ? '#a78bfa' : '#666',
                  padding: '0 16px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: roomToken ? 'pointer' : 'default'
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MATCHMAKER MATCHING RADAR SCREEN */}
      {matchStatus === 'matching' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#05030b' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)',
              marginBottom: '32px'
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                borderTop: '2px solid #a78bfa',
                animation: 'spin 1.5s linear infinite'
              }}
            />
            <span style={{ fontSize: '24px' }}>🛡️</span>
          </div>

          <div style={{ fontWeight: '800', color: '#a78bfa', letterSpacing: '0.08em', fontSize: '13px' }}>
            SCANNING LOBBY FOR DUELISTS...
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '6px' }}>
            Room Token ID: {roomToken}
          </div>

          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* PLAYING DUEL WORKSPACE */}
      {(matchStatus === 'playing' || matchStatus === 'finished') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Top Status Arena HUD */}
          <div style={{ display: 'flex', padding: '12px 20px', background: '#080512', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Match Time</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: timer < 20 ? '#ff4d4f' : '#a78bfa', fontFamily: 'monospace' }}>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#00ffaa', fontSize: '12px' }}>● You</span>
                <span style={{ color: '#666' }}>vs</span>
                <span style={{ color: '#a78bfa', fontSize: '12px' }}>{opponentName}</span>
              </div>
            </div>

            {/* Duel challenge info description bubble */}
            <div style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: '6px 16px', borderRadius: '6px', maxWidth: '500px', lineHeight: '1.4' }}>
              📝 <b>Problem:</b> Implement <code>twoSum(nums, target)</code> returning index array of two items adding up to target value.
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {matchStatus === 'playing' ? (
                <button
                  onClick={submitSolution}
                  style={{
                    background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)',
                    border: 'none',
                    color: '#020617',
                    fontWeight: '800',
                    fontSize: '11px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 255, 170, 0.3)'
                  }}
                >
                  🚀 Submit Solution
                </button>
              ) : (
                <button
                  onClick={() => setMatchStatus('idle')}
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#a78bfa',
                    fontWeight: '800',
                    fontSize: '11px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ↩ Exit Battle
                </button>
              )}
            </div>
          </div>

          {/* User vs Opponent Code Screens Grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
            
            {/* Left Screen: User's Live Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', fontWeight: 'bold', color: '#00ffaa' }}>
                👨‍💻 YOUR EDITOR BUFFER
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#040208',
                  color: '#fff',
                  padding: '16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  border: 'none',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {/* Right Screen: Opponent's Blurred Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: '#020104' }}>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', fontWeight: 'bold', color: '#ff4d4f', zIndex: 5 }}>
                📡 {opponentName.toUpperCase()}'S ACTIVE VIEW (BLURRED)
              </div>
              
              {/* Code text wrapped in blur */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.3)',
                  filter: 'blur(6.5px)',
                  userSelect: 'none',
                  whiteSpace: 'pre',
                  background: '#050308',
                  pointerEvents: 'none'
                }}
              >
                {opponentCode}
              </div>

              {/* Fog overlay for security aesthetics */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,2,9,0.85) 0%, rgba(4,2,9,0.2) 100%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Test Outputs Logs and Battle Outcomes Overlay */}
          <div style={{ height: '140px', background: '#07050e', borderTop: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '6px 16px', background: '#0b0816', fontSize: '9px', fontWeight: 'bold', color: '#666', letterSpacing: '0.04em' }}>
              SOLUTION DEPLOYMENT TELEMETRY
            </div>
            <div style={{ flex: 1, padding: '8px 16px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#a78bfa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {logs.length === 0 ? (
                <span style={{ color: '#444', fontStyle: 'italic' }}>Write your code solution and deploy testing telemetry logs...</span>
              ) : (
                logs.map((log, idx) => <div key={idx}>{log}</div>)
              )}
            </div>
          </div>

          {/* MATCH OUTCOME GLOW POPUP */}
          {matchStatus === 'finished' && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(22, 16, 40, 0.95)',
                border: '2px solid rgba(139, 92, 246, 0.75)',
                borderRadius: '16px',
                padding: '36px',
                width: '400px',
                textAlign: 'center',
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{ fontSize: '42px' }}>👑</div>
                <h4 style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#a78bfa', letterSpacing: '0.04em' }}>
                  MATCH CONCLUDED
                </h4>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {outcome}
                </p>
                <button
                  onClick={() => setMatchStatus('idle')}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Return to Lobby
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default CodeArenaPage
