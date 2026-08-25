import React, { useState, useEffect, useRef } from 'react'

const WebRtcPanel = () => {
  const [mode, setMode] = useState('menu') // 'menu', 'hosting', 'joining', 'connected'
  const [roomCode, setRoomCode] = useState('')
  const [hostIps, setHostIps] = useState([])
  const [inputIp, setInputIp] = useState('localhost')
  const [inputRoomCode, setInputRoomCode] = useState('')

  // Connection Log & Stats
  const [connLogs, setConnLogs] = useState([])
  const [ping, setPing] = useState(0)
  const [bytesTransferred, setBytesTransferred] = useState(0)
  const [peersCount, setPeersCount] = useState(0)

  // WebRTC & Polling Refs
  const peerConnRef = useRef(null)
  const dataChannelRef = useRef(null)
  const pollTimerRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const processedSignalsRef = useRef(new Set())

  const apiPort = localStorage.getItem('api-port') || '8000'

  // Add Log Message helper
  const addLog = (msg, type = 'info') => {
    setConnLogs((prev) => [...prev, { text: `[${new Date().toLocaleTimeString()}] ${msg}`, type }])
  }

  // Cleanup WebRTC connections
  const disconnectSession = () => {
    clearInterval(pingIntervalRef.current)
    clearInterval(pollTimerRef.current)

    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
      } catch (e) {}
      dataChannelRef.current = null
    }

    if (peerConnRef.current) {
      try {
        peerConnRef.current.close()
      } catch (e) {}
      peerConnRef.current = null
    }

    processedSignalsRef.current.clear()
    setMode('menu')
    setRoomCode('')
    setPing(0)
    setPeersCount(0)
    addLog('Collaboration session disconnected.', 'warn')
  }

  useEffect(() => {
    return () => {
      clearInterval(pingIntervalRef.current)
      clearInterval(pollTimerRef.current)
      if (peerConnRef.current) peerConnRef.current.close()
    }
  }, [])

  // Listen to keystroke sync events from EditorPage.jsx to send over RTC data channel
  useEffect(() => {
    const handleLocalCodeChange = (e) => {
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        const payload = JSON.stringify({
          type: 'code',
          code: e.detail.code,
          filename: e.detail.filename
        })
        dataChannelRef.current.send(payload)
        setBytesTransferred((prev) => prev + payload.length)
      }
    }

    const handleLocalCursorMove = (e) => {
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        const payload = JSON.stringify({
          type: 'cursor',
          cursorIndex: e.detail.cursorIndex,
          username: e.detail.username,
          filename: e.detail.filename
        })
        dataChannelRef.current.send(payload)
        setBytesTransferred((prev) => prev + payload.length)
      }
    }

    window.addEventListener('local-code-changed', handleLocalCodeChange)
    window.addEventListener('local-cursor-moved', handleLocalCursorMove)
    return () => {
      window.removeEventListener('local-code-changed', handleLocalCodeChange)
      window.removeEventListener('local-cursor-moved', handleLocalCursorMove)
    }
  }, [mode])

  // Setup Data Channel event listeners
  const configureDataChannel = (channel) => {
    dataChannelRef.current = channel

    channel.onopen = () => {
      setMode('connected')
      setPeersCount(1)
      addLog('🚀 WebRTC P2P DataChannel connected successfully!', 'success')

      // Start ping heartbeat to measure latency
      pingIntervalRef.current = setInterval(() => {
        if (channel.readyState === 'open') {
          channel.send(JSON.stringify({ type: 'ping', time: Date.now() }))
        }
      }, 3000)
    }

    channel.onclose = () => {
      addLog('WebRTC DataChannel closed by peer', 'warn')
      disconnectSession()
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ping') {
          // Send pong back
          channel.send(JSON.stringify({ type: 'pong', time: data.time }))
        } else if (data.type === 'pong') {
          const latency = Date.now() - data.time
          setPing(latency)
        } else if (data.type === 'code') {
          window.dispatchEvent(
            new CustomEvent('webrtc-code-sync', {
              detail: { code: data.code, filename: data.filename }
            })
          )
        } else if (data.type === 'cursor') {
          window.dispatchEvent(
            new CustomEvent('webrtc-cursor-sync', {
              detail: {
                username: data.username,
                cursorIndex: data.cursorIndex,
                filename: data.filename
              }
            })
          )
        }
      } catch (err) {
        console.error('RTC DataChannel message parse error:', err)
      }
    }
  }

  // Create Host RTCPeerConnection
  const initWebRtcHost = async (room) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    peerConnRef.current = pc

    addLog('RTCPeerConnection initialized. Awaiting peer connection...')

    // Listen for incoming Data Channel
    pc.ondatachannel = (event) => {
      addLog('Incoming WebRTC data channel detected.')
      configureDataChannel(event.channel)
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to peer via local Express server
        fetch(`http://localhost:${apiPort}/api/webrtc/post-signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: room,
            signal: { type: 'candidate', candidate: event.candidate, sender: 'host' }
          })
        })
      }
    }
  }

  // Create Guest RTCPeerConnection
  const initWebRtcGuest = async (hostIp, room) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    peerConnRef.current = pc

    addLog('Creating WebRTC DataChannel (collaboration)...')
    const channel = pc.createDataChannel('collaboration')
    configureDataChannel(channel)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to host
        fetch(`http://${hostIp}:${apiPort}/api/webrtc/post-signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: room,
            signal: { type: 'candidate', candidate: event.candidate, sender: 'peer' }
          })
        })
      }
    }

    // Create SDP Offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    addLog('WebRTC SDP Offer generated. Uploading to host...')

    // Post offer signal to Host's Express server
    await fetch(`http://${hostIp}:${apiPort}/api/webrtc/post-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: room,
        signal: { type: 'offer', sdp: offer.sdp, sender: 'peer' }
      })
    })

    // Start polling host for Answer / candidates
    let signalCount = 0
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `http://${hostIp}:${apiPort}/api/webrtc/get-signals?roomCode=${room}`
        )
        const data = await res.json()
        if (data.success && data.signals) {
          for (const sig of data.signals) {
            const sigId = JSON.stringify(sig)
            if (processedSignalsRef.current.has(sigId)) continue
            processedSignalsRef.current.add(sigId)

            if (sig.type === 'answer' && sig.sender === 'host') {
              addLog('SDP Answer received from host. Applying remote description...')
              await pc.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: sig.sdp })
              )
            } else if (sig.type === 'candidate' && sig.sender === 'host') {
              addLog('Applying remote ICE candidate from host...')
              await pc.addIceCandidate(new RTCIceCandidate(sig.candidate))
            }
          }
        }
      } catch (err) {
        signalCount++
        if (signalCount > 30) {
          addLog('Connection handshake timeout. Make sure host is online.', 'error')
          disconnectSession()
        }
      }
    }, 1000)
  }

  // Host Session (Create Room)
  const handleHostSession = async () => {
    setMode('hosting')
    setConnLogs([])
    addLog('Generating collaboration room session...', 'info')

    try {
      const res = await fetch(`http://localhost:${apiPort}/api/webrtc/create-room`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setRoomCode(data.roomCode)
        setHostIps(data.ips || [])
        addLog(
          `Room ${data.roomCode} online. IPs: ${data.ips?.join(', ') || 'localhost'}`,
          'success'
        )

        // Initialize WebRTC
        await initWebRtcHost(data.roomCode)

        // Poll for peer signals
        pollTimerRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(
              `http://localhost:${apiPort}/api/webrtc/get-signals?roomCode=${data.roomCode}`
            )
            const pollData = await pollRes.json()
            if (pollData.success && pollData.signals) {
              const pc = peerConnRef.current
              if (!pc) return

              for (const sig of pollData.signals) {
                const sigId = JSON.stringify(sig)
                if (processedSignalsRef.current.has(sigId)) continue
                processedSignalsRef.current.add(sigId)

                if (sig.type === 'offer' && sig.sender === 'peer') {
                  addLog('SDP Offer received from peer. Applying remote description...')
                  await pc.setRemoteDescription(
                    new RTCSessionDescription({ type: 'offer', sdp: sig.sdp })
                  )

                  addLog('Creating SDP Answer...')
                  const answer = await pc.createAnswer()
                  await pc.setLocalDescription(answer)

                  // Post answer back to Express
                  await fetch(`http://localhost:${apiPort}/api/webrtc/post-signal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      roomCode: data.roomCode,
                      signal: { type: 'answer', sdp: answer.sdp, sender: 'host' }
                    })
                  })
                  addLog('SDP Answer uploaded to room signaling channel.')
                } else if (sig.type === 'candidate' && sig.sender === 'peer') {
                  addLog('Applying remote ICE candidate from peer...')
                  await pc.addIceCandidate(new RTCIceCandidate(sig.candidate))
                }
              }
            }
          } catch (e) {
            console.error('Polling error:', e)
          }
        }, 1000)
      }
    } catch (err) {
      addLog(`Failed to create hosting session: ${err.message}`, 'error')
      setMode('menu')
    }
  }

  // Join Session (Guest Room)
  const handleJoinSession = async () => {
    if (!inputIp.trim() || !inputRoomCode.trim()) {
      alert('Please fill out the host IP and Room Code.')
      return
    }

    setMode('joining')
    setConnLogs([])
    const targetRoom = inputRoomCode.trim().toUpperCase()
    const targetHostIp = inputIp.trim()

    addLog(`Connecting to Host signaling portal http://${targetHostIp}:${apiPort}...`, 'info')

    try {
      await initWebRtcGuest(targetHostIp, targetRoom)
    } catch (err) {
      addLog(`Handshake failed: ${err.message}`, 'error')
      setMode('menu')
    }
  }

  const handleForceSync = () => {
    // Send request to EditorPage via custom event to get current code
    window.dispatchEvent(new CustomEvent('webrtc-request-code-push'))
    addLog('Force synchronized current active code with peer.', 'info')
  }

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.header}>
        <span style={styles.title}>P2P WEBRTC REALTIME SHARING</span>
        <span
          style={{
            ...styles.listeningBadge,
            background:
              mode === 'connected' ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: mode === 'connected' ? '#00ffaa' : 'var(--text-muted)',
            borderColor: mode === 'connected' ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255,255,255,0.08)'
          }}
        >
          {mode === 'connected' ? '● SYNCED' : 'OFFLINE'}
        </span>
      </div>

      <div style={styles.statusBox}>
        <div style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
          Direct Peer-to-Peer Coding
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Connects via WebRTC Data Channels. Keystrokes sync with sub-millisecond lag.
        </div>
      </div>

      {/* Menu Mode */}
      {mode === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleHostSession} style={styles.hostBtn}>
            📡 Host P2P Live Session
          </button>

          <div style={styles.divider}>— OR JOIN PEER —</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={styles.fieldLabel}>Host IP Address</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.150"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={styles.fieldLabel}>Room Code</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="e.g. RTC-549182"
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  style={{ ...styles.input, textTransform: 'uppercase' }}
                />
                <button onClick={handleJoinSession} style={styles.joinBtn}>
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Hosting/Joining / Connected Room */}
      {mode !== 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Room Card info */}
          <div style={styles.roomCard}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '10px', color: '#00ffaa', fontWeight: 'bold' }}>
                {mode === 'connected' ? '● CONNECTION ACTIVE' : '🔌 ESTABLISHING HANDSHAKE...'}
              </span>
              <button onClick={disconnectSession} style={styles.disconnectLink}>
                Disconnect
              </button>
            </div>

            {roomCode && (
              <div style={styles.codeText}>
                ROOM CODE: <span style={{ color: '#00ffaa' }}>{roomCode}</span>
              </div>
            )}

            {hostIps.length > 0 && (
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  textAlign: 'center'
                }}
              >
                Share your IP: <code>{hostIps[0]}</code>
              </div>
            )}
          </div>

          {/* Connected stats */}
          {mode === 'connected' && (
            <div style={styles.statsRow}>
              <div style={styles.statWidget}>
                <span style={styles.statLabel}>Ping Latency</span>
                <span style={styles.statVal}>{ping} ms</span>
              </div>
              <div style={styles.statWidget}>
                <span style={styles.statLabel}>Data Transferred</span>
                <span style={styles.statVal}>{(bytesTransferred / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {mode === 'connected' && (
            <button onClick={handleForceSync} style={styles.syncBtn}>
              🔄 Force Push Active Code
            </button>
          )}

          {/* Connection Log list */}
          <div style={styles.sectionHeader}>SIGNALING LOGS</div>
          <div style={styles.logBox}>
            {connLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>
                No active logs...
              </div>
            ) : (
              connLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    color:
                      log.type === 'success'
                        ? '#00ffaa'
                        : log.type === 'error'
                          ? '#ff6b6b'
                          : log.type === 'warn'
                            ? '#ffb86c'
                            : '#c9d1d9',
                    fontSize: '9.5px',
                    fontFamily: 'monospace',
                    marginBottom: '4px',
                    wordBreak: 'break-all'
                  }}
                >
                  {log.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '12px',
    color: 'var(--text-main)',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  title: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    color: 'var(--text-main)'
  },
  listeningBadge: {
    fontSize: '9px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 'bold',
    border: '1px solid'
  },
  statusBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  hostBtn: {
    background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)',
    border: 'none',
    color: '#000',
    fontWeight: 'bold',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.25s ease'
  },
  divider: {
    textAlign: 'center',
    fontSize: '10px',
    color: 'var(--text-muted)',
    margin: '6px 0'
  },
  fieldLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: '0.04em'
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '11px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  joinBtn: {
    background: '#58a6ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0 16px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  roomCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '10px'
  },
  disconnectLink: {
    background: 'none',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '10px',
    padding: 0
  },
  codeText: {
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    color: '#fff',
    textAlign: 'center',
    background: 'rgba(0,0,0,0.3)',
    padding: '6px',
    borderRadius: '4px'
  },
  statsRow: {
    display: 'flex',
    gap: '8px'
  },
  statWidget: {
    flex: 1,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '6px 8px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  statLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  statVal: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff'
  },
  syncBtn: {
    background: 'rgba(0, 255, 170, 0.1)',
    border: '1px solid rgba(0, 255, 170, 0.25)',
    color: '#00ffaa',
    fontWeight: 'bold',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    width: '100%'
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    marginTop: '6px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '4px'
  },
  logBox: {
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '8px',
    height: '160px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }
}

export default WebRtcPanel
