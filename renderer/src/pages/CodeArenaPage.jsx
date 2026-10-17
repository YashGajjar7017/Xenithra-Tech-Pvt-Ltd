import React, { useState, useEffect, useRef } from 'react'

const CHALLENGES = [
  {
    id: 'two-sum',
    title: 'Two Sum Algorithm (Hash Map)',
    difficulty: 'Medium / Speed',
    fnName: 'twoSum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    starterCode: `function twoSum(nums, target) {\n    // Write your optimized solution here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
    aiSolution: `function twoSum(nums, target) {\n    const seen = {};\n    for (let i = 0; i < nums.length; i++) {\n        const rem = target - nums[i];\n        if (seen[rem] !== undefined) return [seen[rem], i];\n        seen[nums[i]] = i;\n    }\n    return [];\n}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], desc: '[2, 7, 11, 15], target = 9' },
      { input: [[3, 2, 4], 6], expected: [1, 2], desc: '[3, 2, 4], target = 6' },
      { input: [[3, 3], 6], expected: [0, 1], desc: '[3, 3], target = 6' }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome (Two Pointers)',
    difficulty: 'Easy / Speed',
    fnName: 'isPalindrome',
    description: 'Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    starterCode: `function isPalindrome(s) {\n    // Clean string and check palindrome\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    let l = 0, r = clean.length - 1;\n    while (l < r) {\n        if (clean[l] !== clean[r]) return false;\n        l++; r--;\n    }\n    return true;\n}`,
    aiSolution: `function isPalindrome(s) {\n    const str = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return str === str.split('').reverse().join('');\n}`,
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true, desc: '"A man, a plan, a canal: Panama"' },
      { input: ['race a car'], expected: false, desc: '"race a car"' },
      { input: [' '], expected: true, desc: '" "' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses (Stack)',
    difficulty: 'Medium / Speed',
    fnName: 'isValid',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    starterCode: `function isValid(s) {\n    // Stack implementation\n    const stack = [];\n    const map = { ')': '(', '}': '{', ']': '[' };\n    for (const ch of s) {\n        if (!map[ch]) stack.push(ch);\n        else if (stack.pop() !== map[ch]) return false;\n    }\n    return stack.length === 0;\n}`,
    aiSolution: `function isValid(s) {\n    const st = [];\n    for (let c of s) {\n        if (c === '(') st.push(')');\n        else if (c === '{') st.push('}');\n        else if (c === '[') st.push(']');\n        else if (st.pop() !== c) return false;\n    }\n    return st.length === 0;\n}`,
    testCases: [
      { input: ['()[]{}'], expected: true, desc: '"()[]{}"' },
      { input: ['(]'], expected: false, desc: '"(]"' },
      { input: ['{[]}'], expected: true, desc: '"{[]}"' }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search (Log N Complexity)',
    difficulty: 'Easy / Speed',
    fnName: 'search',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. Return its index or -1.',
    starterCode: `function search(nums, target) {\n    // Binary search logic\n    let low = 0, high = nums.length - 1;\n    while (low <= high) {\n        const mid = Math.floor((low + high) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
    aiSolution: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = (l + r) >> 1;\n        if (nums[m] === target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, desc: 'nums=[-1,0,3,5,9,12], target=9' },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, desc: 'nums=[-1,0,3,5,9,12], target=2' },
      { input: [[5], 5], expected: 0, desc: 'nums=[5], target=5' }
    ]
  }
]

const CodeArenaPage = () => {
  const [matchStatus, setMatchStatus] = useState('idle') // 'idle' | 'hosting' | 'playing' | 'finished'
  const [roomCode, setRoomCode] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [hostIp, setHostIp] = useState('127.0.0.1')
  const [port, setPort] = useState(localStorage.getItem('api-port') || '8000')
  const [serverOnline, setServerOnline] = useState(false)
  const [playerId, setPlayerId] = useState('p1')
  const [playerName, setPlayerName] = useState('Warrior-' + Math.floor(Math.random() * 900 + 100))
  const [opponentName, setOpponentName] = useState('Waiting for opponent...')
  const [isAiMatch, setIsAiMatch] = useState(false)

  // Challenge selection & Code generation
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState(0)
  const currentChallenge = CHALLENGES[selectedChallengeIdx]

  const [joinInput, setJoinInput] = useState('')
  const [copiedToken, setCopiedToken] = useState(false)

  // Coding States
  const [userCode, setUserCode] = useState(currentChallenge.starterCode)
  const [opponentCode, setOpponentCode] = useState('// Opponent is coding in real-time...\n')
  const [userTestsPassed, setUserTestsPassed] = useState(0)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState(0)
  const [timer, setTimer] = useState(180)
  const [logs, setLogs] = useState([])
  const [outcome, setOutcome] = useState('')

  const pollIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const aiIntervalRef = useRef(null)

  const apiBase = `http://localhost:${port}`

  // Check Local Server Port 8000 Health on Mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${apiBase}/api/health`)
        if (res.ok) {
          setServerOnline(true)
        } else {
          setServerOnline(false)
        }
      } catch (e) {
        setServerOnline(false)
      }
    }
    checkServer()
    const intv = setInterval(checkServer, 5000)
    return () => clearInterval(intv)
  }, [apiBase])

  const exitArena = () => {
    window.location.hash = '#/'
  }

  // Frameless window controls
  const handleMinimize = () => window.api?.minimizeWindow?.()
  const handleMaximize = () => window.api?.maximizeWindow?.()
  const handleClose = () => window.api?.closeWindow?.()

  // Generate / Cycle Challenge Problem and Starter Code
  const handleGenerateChallenge = (idx) => {
    const nextIdx = idx !== undefined ? idx : (selectedChallengeIdx + 1) % CHALLENGES.length
    setSelectedChallengeIdx(nextIdx)
    const chal = CHALLENGES[nextIdx]
    setUserCode(chal.starterCode)
    setUserTestsPassed(0)
    setLogs([`⚡ Generated Challenge: "${chal.title}"`, `📋 ${chal.description}`])
  }

  // Host Arena Room on Open Port 8000
  const handleCreateRoom = async () => {
    try {
      setLogs([`⚡ Connecting to local engine on port ${port} and creating Arena Room...`])
      const res = await fetch(`${apiBase}/api/arena/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName, problemId: currentChallenge.id })
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
      } else {
        throw new Error('Local server returned status ' + res.status)
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        `✗ Error on Port ${port}: ${err.message}`,
        `💡 Ensure Electron backend is running on http://localhost:${port}`
      ])
    }
  }

  // Start AI Battle (Instant PvP Bot Match)
  const handleStartAiBattle = () => {
    setIsAiMatch(true)
    const mockRoomCode = 'ARENA-AI-' + Math.floor(1000 + Math.random() * 9000)
    setRoomCode(mockRoomCode)
    setPlayerId('p1')
    setOpponentName('DeepMind-Bot (AI)')
    setMatchStatus('playing')
    setTimer(180)
    setUserTestsPassed(0)
    setOpponentTestsPassed(0)
    setOutcome('')
    setLogs([
      `⚔️ AI PvP Match Started! Opponent: DeepMind-Bot`,
      `Problem: ${currentChallenge.title}`,
      `⚡ Code and test against the AI in real time!`
    ])

    // Simulate AI typing solution over 30-45 seconds
    const aiTargetCode = currentChallenge.aiSolution
    let aiChars = 0
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current)

    aiIntervalRef.current = setInterval(() => {
      aiChars += Math.floor(Math.random() * 6 + 2)
      if (aiChars < aiTargetCode.length) {
        setOpponentCode(aiTargetCode.substring(0, aiChars) + ' ▌')
        if (aiChars > aiTargetCode.length * 0.4 && opponentTestsPassed === 0) {
          setOpponentTestsPassed(1)
        }
        if (aiChars > aiTargetCode.length * 0.75 && opponentTestsPassed <= 1) {
          setOpponentTestsPassed(2)
        }
      } else {
        setOpponentCode(aiTargetCode)
        setOpponentTestsPassed(3)
        clearInterval(aiIntervalRef.current)
      }
    }, 400)
  }

  // Join Room by Code or Token
  const handleJoinRoom = async () => {
    if (!joinInput.trim()) return
    try {
      setLogs([`⚡ Connecting to Arena room ${joinInput.trim()} on port ${port}...`])
      const res = await fetch(`${apiBase}/api/arena/join-room`, {
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
    if (!isAiMatch && (matchStatus === 'hosting' || matchStatus === 'playing') && roomCode) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${apiBase}/api/arena/room/${roomCode}`)
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
        } catch (e) {}
      }, 800)
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [matchStatus, roomCode, playerId, playerName, isAiMatch, apiBase])

  // Sync user typing to host
  const handleCodeChange = (e) => {
    const val = e.target.value
    setUserCode(val)

    if (!isAiMatch && matchStatus === 'playing' && roomCode) {
      fetch(`${apiBase}/api/arena/update`, {
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

  // Execute Dynamic Test Suite Validation
  const submitSolution = async () => {
    setLogs((prev) => [...prev, `⚡ Executing test suite for ${currentChallenge.title}...`])

    try {
      const evalFunc = new Function(userCode + `\nreturn ${currentChallenge.fnName};`)
      const fn = evalFunc()

      let passedCount = 0
      const testResults = []

      currentChallenge.testCases.forEach((tc, idx) => {
        try {
          const res = fn(...tc.input)
          const pass = JSON.stringify(res) === JSON.stringify(tc.expected)
          if (pass) passedCount++
          testResults.push(
            pass
              ? `✓ Case ${idx + 1} passed: ${tc.desc} => ${JSON.stringify(res)}`
              : `✗ Case ${idx + 1} failed: ${tc.desc} (Expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(res)})`
          )
        } catch (err) {
          testResults.push(`✗ Case ${idx + 1} error: ${err.message}`)
        }
      })

      setUserTestsPassed(passedCount)
      setLogs((prev) => [...prev, ...testResults])

      if (!isAiMatch && roomCode) {
        await fetch(`${apiBase}/api/arena/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode,
            playerId,
            testsPassed: passedCount,
            totalTests: currentChallenge.testCases.length
          })
        }).catch(() => {})
      }

      if (passedCount === currentChallenge.testCases.length) {
        setMatchStatus('finished')
        setOutcome('🏆 VICTORY! All ' + passedCount + '/' + currentChallenge.testCases.length + ' Test Cases Passed!')
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
        background: '#1e1f22',
        color: '#dfe1e5',
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 9999
      }}
    >
      {/* JetBrains-Style Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '46px',
          minHeight: '46px',
          background: '#2b2d30',
          borderBottom: '1px solid #393b40',
          boxSizing: 'border-box',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={exitArena}
            style={{
              background: '#393b40',
              border: '1px solid #4e5157',
              color: '#dfe1e5',
              fontWeight: '600',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Exit Studio
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', color: '#3574f0' }}>⚔️</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
              Xenithra Battle Arena
            </span>
            <span
              style={{
                background: serverOnline ? 'rgba(46, 164, 79, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: serverOnline ? '1px solid #2ea44f' : '1px solid #ef4444',
                color: serverOnline ? '#3fb950' : '#f85149',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {serverOnline ? `● Port ${port} Online` : `○ Port ${port} Offline`}
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {roomCode && (
            <div
              style={{
                background: '#1e1f22',
                border: '1px solid #393b40',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ color: '#3574f0', fontWeight: 'bold' }}>Room: {roomCode}</span>
              <button
                onClick={handleCopyToken}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '11px' }}
                title="Copy Invite Token"
              >
                {copiedToken ? '✓ Copied' : '📋'}
              </button>
            </div>
          )}

          {matchStatus === 'playing' && (
            <div
              style={{
                background: timer <= 30 ? 'rgba(239, 68, 68, 0.2)' : '#1e1f22',
                border: timer <= 30 ? '1px solid #ef4444' : '1px solid #393b40',
                padding: '4px 10px',
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

      {/* Main Arena Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {matchStatus === 'idle' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: '#1e1f22'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#2b2d30',
                border: '1px solid #393b40',
                borderRadius: '8px',
                padding: '28px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '700' }}>
                  Xenithra PvP Code Arena
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#868a91' }}>
                  Battle against peers or AI in real-time on local server port {port}.
                </p>
              </div>

              {/* Problem / Code Generator Card */}
              <div
                style={{
                  background: '#1e1f22',
                  border: '1px solid #393b40',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3574f0' }}>
                    🎯 BATTLE CHALLENGE GENERATOR
                  </span>
                  <button
                    onClick={() => handleGenerateChallenge()}
                    style={{
                      background: '#3574f0',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🎲 Generate Next Problem
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                    {currentChallenge.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    {currentChallenge.difficulty}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#868a91', lineHeight: '1.4' }}>
                  {currentChallenge.description}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#868a91', marginBottom: '4px' }}>
                  Warrior Alias:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e1f22',
                    border: '1px solid #393b40',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleCreateRoom}
                  style={{
                    background: '#3574f0',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Host Room on Port {port}
                </button>

                <button
                  onClick={handleStartAiBattle}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🤖 Battle vs AI Opponent
                </button>
              </div>

              {/* Join Room Section */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #393b40', paddingTop: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. ARENA-1024)..."
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#1e1f22',
                    border: '1px solid #393b40',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  style={{
                    background: '#393b40',
                    border: '1px solid #4e5157',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🔑 Join Match
                </button>
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
              background: '#1e1f22'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#2b2d30',
                border: '1px solid #393b40',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '32px' }}>📡</div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
                Waiting for Competitor to Connect...
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#868a91' }}>
                Room Code: <strong style={{ color: '#3574f0' }}>{roomCode}</strong> (Port {port})
              </p>

              <div
                style={{
                  background: '#1e1f22',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #393b40',
                  fontSize: '10.5px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  color: '#9da0a8'
                }}
              >
                {shareToken}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopyToken}
                  style={{
                    flex: 1,
                    background: '#3574f0',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedToken ? '✓ Invite Token Copied!' : '📋 Copy Invite Token'}
                </button>
                <button
                  onClick={handleStartAiBattle}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Switch to AI Bot
                </button>
              </div>
            </div>
          </div>
        )}

        {(matchStatus === 'playing' || matchStatus === 'finished') && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px', overflow: 'hidden' }}>
            {/* Left Column: Player Editor Card */}
            <div
              style={{
                background: '#1e1f22',
                border: '1px solid #393b40',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: '#2b2d30',
                  borderBottom: '1px solid #393b40',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  <span style={{ color: '#3574f0' }}>● {playerName} (You)</span>
                  <span style={{ fontSize: '10px', color: '#10b981' }}>
                    ({userTestsPassed}/{currentChallenge.testCases.length} Tests Passed)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleGenerateChallenge()}
                    style={{
                      background: '#393b40',
                      border: '1px solid #4e5157',
                      color: '#dfe1e5',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                    title="Change / Regenerate problem template"
                  >
                    🎲 Next Problem
                  </button>
                  <button
                    onClick={submitSolution}
                    style={{
                      background: '#3574f0',
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
              </div>

              <textarea
                value={userCode}
                onChange={handleCodeChange}
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#1e1f22',
                  color: '#bcbec4',
                  padding: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflowY: 'auto'
                }}
              />

              {/* Logs area */}
              <div
                style={{
                  height: '80px',
                  background: '#18191c',
                  borderTop: '1px solid #393b40',
                  padding: '8px',
                  fontSize: '10.5px',
                  fontFamily: 'monospace',
                  overflowY: 'auto',
                  color: '#9da0a8'
                }}
              >
                {logs.map((log, i) => (
                  <div key={i} style={{ color: log.startsWith('✓') ? '#10b981' : log.startsWith('✗') ? '#f87171' : '#9da0a8' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Opponent Live Screen Card */}
            <div
              style={{
                background: '#1e1f22',
                border: '1px solid #393b40',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: '#2b2d30',
                  borderBottom: '1px solid #393b40',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  <span style={{ color: '#f59e0b' }}>⚔️ Opponent: {opponentName}</span>
                  <span style={{ fontSize: '10px', color: '#f59e0b' }}>
                    ({opponentTestsPassed}/{currentChallenge.testCases.length} Tests Passed)
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#868a91' }}>Live Synchronized</span>
              </div>

              <textarea
                value={opponentCode}
                readOnly
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#1e1f22',
                  color: '#868a91',
                  padding: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflowY: 'auto'
                }}
              />

              {outcome && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: outcome.includes('VICTORY') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
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
          height: '26px',
          minHeight: '26px',
          background: '#2b2d30',
          borderTop: '1px solid #393b40',
          fontSize: '11px',
          color: '#868a91',
          boxSizing: 'border-box',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#3574f0', fontWeight: 'bold' }}>
            ● Status: {matchStatus.toUpperCase()}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Room: {roomCode || 'None'}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: '#10b981' }}>Host: http://{hostIp}:{port}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Latency: ~12ms</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: serverOnline ? '#10b981' : '#ef4444' }}>
            Port {port} {serverOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default CodeArenaPage
