// Enhanced WebRTC connection handler for collaborative sessions
class EnhancedWebRTCConnection {
  constructor(sessionId, userId) {
    this.sessionId = sessionId
    this.userId = userId
    this.localStream = null
    this.remoteStreams = new Map()
    this.peerConnections = new Map()
    this.socket = null
    this.isInitiator = false
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    }

    // Enhanced features
    this.connectionQuality = {
      bitrate: 0,
      packetLoss: 0,
      latency: 0,
      connectionState: 'connecting'
    }
    this.recordingEnabled = false
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isScreenSharing = false
    this.isRecording = false
    this.connectionStats = new Map()
    this.reconnectionAttempts = new Map()
    this.maxReconnectionAttempts = 3

    this.setupSocketConnection()
    this.startConnectionMonitoring()
  }

  setupSocketConnection() {
    this.socket = io(window.location.origin, {
      query: { sessionId: this.sessionId, userId: this.userId }
    })

    this.socket.on('user-joined', (userId) => {
      console.log('User joined:', userId)
      this.handleUserJoined(userId)
    })

    this.socket.on('user-left', (userId) => {
      console.log('User left:', userId)
      this.handleUserLeft(userId)
    })

    this.socket.on('webrtc-signal', (data) => {
      console.log('Received WebRTC signal:', data)
      this.handleWebRTCSignal(data)
    })

    this.socket.on('connect', () => {
      console.log('Connected to signaling server')
      this.updateConnectionStatus('connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server')
      this.updateConnectionStatus('disconnected')
      this.attemptReconnection()
    })

    this.socket.on('reconnect', () => {
      console.log('Reconnected to signaling server')
      this.updateConnectionStatus('reconnected')
      this.rejoinSession()
    })
  }

  startConnectionMonitoring() {
    setInterval(() => {
      this.monitorConnectionQuality()
    }, 5000)
  }

  async monitorConnectionQuality() {
    this.peerConnections.forEach(async (pc, userId) => {
      try {
        const stats = await pc.getStats()
        let quality = {
          bitrate: 0,
          packetLoss: 0,
          latency: 0,
          connectionState: pc.connectionState
        }

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            quality.latency = report.currentRoundTripTime * 1000 || 0
          }
          if (report.type === 'inbound-rtp') {
            quality.bitrate = (report.bytesReceived * 8) / report.timestamp || 0
            quality.packetLoss = report.packetsLost / report.packetsReceived || 0
          }
        })

        this.connectionStats.set(userId, quality)
        this.emitConnectionQualityUpdate(userId, quality)
      } catch (error) {
        console.error('Error monitoring connection quality:', error)
      }
    })
  }

  emitConnectionQualityUpdate(userId, quality) {
    if (this.socket) {
      this.socket.emit('connection-quality-update', {
        userId: this.userId,
        targetUserId: userId,
        quality: quality
      })
    }
  }

  updateConnectionStatus(status) {
    this.connectionQuality.connectionState = status
    if (window.webRTCGUI) {
      window.webRTCGUI.updateConnectionStatus(status)
    }
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      this.displayLocalStream()
      this.setupMediaRecorder()
      return true
    } catch (error) {
      console.error('Error accessing media devices:', error)
      this.handleMediaError(error)
      return false
    }
  }

  handleMediaError(error) {
    let errorMessage = 'Failed to access camera/microphone'

    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera/microphone access denied. Please check permissions.'
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera/microphone found. Please check device connection.'
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera/microphone is already in use by another application.'
    }

    if (window.webRTCGUI) {
      window.webRTCGUI.showError(errorMessage)
    }
  }

  displayLocalStream() {
    const localVideo = document.getElementById('localVideo')
    if (localVideo) {
      localVideo.srcObject = this.localStream
      localVideo.muted = true
      localVideo.play().catch((e) => console.error('Error playing local video:', e))
    }
  }

  setupMediaRecorder() {
    if (this.localStream) {
      this.mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete()
      }
    }
  }

  async startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.recordedChunks = []
      this.mediaRecorder.start()
      this.isRecording = true
      return true
    }
    return false
  }

  async stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
      this.isRecording = false
      return true
    }
    return false
  }

  handleRecordingComplete() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webrtc-recording-${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  async handleUserJoined(userId) {
    if (userId === this.userId) return

    console.log('Handling user joined:', userId)
    const peerConnection = this.createEnhancedPeerConnection(userId)
    this.peerConnections.set(userId, peerConnection)

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream)
      })
    }

    try {
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await peerConnection.setLocalDescription(offer)

      this.socket.emit('webrtc-signal', {
        to: userId,
        from: this.userId,
        signal: { type: 'offer', sdp: offer }
      })
    } catch (error) {
      console.error('Error creating offer:', error)
      this.handleConnectionError(userId, error)
    }
  }

  createEnhancedPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(this.configuration)

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId)
        this.socket.emit('webrtc-signal', {
          to: userId,
          from: this.userId,
          signal: { type: 'ice-candidate', candidate: event.candidate }
        })
      }
    }

    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', userId)
      this.handleRemoteStream(userId, event.streams[0])
    }

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState)
      this.handleConnectionStateChange(userId, peerConnection.connectionState)
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${userId}:`, peerConnection.iceConnectionState)
      this.handleICEConnectionStateChange(userId, peerConnection.iceConnectionState)
    }

    peerConnection.onicegatheringstatechange = () => {
      console.log(`ICE gathering state with ${userId}:`, peerConnection.iceGatheringState)
    }

    peerConnection.onsignalingstatechange = () => {
      console.log(`Signaling state with ${userId}:`, peerConnection.signalingState)
    }

    return peerConnection
  }

  handleConnectionStateChange(userId, state) {
    if (state === 'failed' || state === 'disconnected') {
      this.attemptReconnectionToUser(userId)
    }
  }

  handleICEConnectionStateChange(userId, state) {
    if (state === 'failed') {
      this.attemptReconnectionToUser(userId)
    }
  }

  handleConnectionError(userId, error) {
    console.error(`Connection error with ${userId}:`, error)
    this.reconnectionAttempts.set(userId, 0)
    this.attemptReconnectionToUser(userId)
  }

  attemptReconnectionToUser(userId) {
    const attempts = this.reconnectionAttempts.get(userId) || 0

    if (attempts < this.maxReconnectionAttempts) {
      this.reconnectionAttempts.set(userId, attempts + 1)
      setTimeout(
        () => {
          this.handleUserJoined(userId)
        },
        2000 * (attempts + 1)
      )
    }
  }

  attemptReconnection() {
    console.log('Attempting to reconnect...')
    this.peerConnections.forEach((pc, userId) => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.attemptReconnectionToUser(userId)
      }
    })
  }

  rejoinSession() {
    if (this.sessionId) {
      this.socket.emit('join-session', {
        sessionId: this.sessionId,
        userId: this.userId
      })
    }
  }

  handleRemoteStream(userId, stream) {
    this.remoteStreams.set(userId, stream)
    this.displayRemoteStream(userId, stream)
  }

  displayRemoteStream(userId, stream) {
    const container = document.getElementById('remoteVideosContainer')
    if (!container) return

    let remoteVideo = document.getElementById(`remoteVideo-${userId}`)
    if (!remoteVideo) {
      remoteVideo = document.createElement('video')
      remoteVideo.id = `remoteVideo-${userId}`
      remoteVideo.autoplay = true
      remoteVideo.playsinline = true
      remoteVideo.className = 'remote-video'

      const videoWrapper = document.createElement('div')
      videoWrapper.className = 'video-wrapper'
      videoWrapper.appendChild(remoteVideo)

      const label = document.createElement('div')
      label.className = 'video-label'
      label.textContent = `User ${userId}`
      videoWrapper.appendChild(label)

      container.appendChild(videoWrapper)
    }

    remoteVideo.srcObject = stream
  }

  async handleWebRTCSignal(data) {
    const { from, signal } = data

    if (!this.peerConnections.has(from)) {
      const peerConnection = this.createEnhancedPeerConnection(from)
      this.peerConnections.set(from, peerConnection)

      // Add local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, this.localStream)
        })
      }
    }

    const peerConnection = this.peerConnections.get(from)

    try {
      switch (signal.type) {
        case 'offer':
          console.log('Processing offer from:', from)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)

          this.socket.emit('webrtc-signal', {
            to: from,
            from: this.userId,
            signal: { type: 'answer', sdp: answer }
          })
          break

        case 'answer':
          console.log('Processing answer from:', from)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
          break

        case 'ice-candidate':
          console.log('Processing ICE candidate from:', from)
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate))
          break
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error)
      this.handleConnectionError(from, error)
    }
  }

  handleUserLeft(userId) {
    console.log('Handling user left:', userId)
    if (this.peerConnections.has(userId)) {
      this.peerConnections.get(userId).close()
      this.peerConnections.delete(userId)
    }

    if (this.remoteStreams.has(userId)) {
      this.remoteStreams.delete(userId)
      const remoteVideo = document.getElementById(`remoteVideo-${userId}`)
      if (remoteVideo) {
        remoteVideo.parentElement.remove()
      }
    }

    this.reconnectionAttempts.delete(userId)
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  async toggleScreenShare() {
    if (!this.isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: true
        })

        const videoTrack = screenStream.getVideoTracks()[0]

        // Replace video track in all peer connections
        this.peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            sender.replaceTrack(videoTrack)
          }
        })

        // Stop screen share track
        const screenTrack = this.localStream.getVideoTracks()[0]
        if (screenTrack) {
          screenTrack.stop()
        }

        // Update local stream
        this.localStream.removeTrack(this.localStream.getVideoTracks()[0])
        this.localStream.addTrack(videoTrack)

        // Update local video display
        this.displayLocalStream()

        this.isScreenSharing = true

        videoTrack.onended = () => {
          this.stopScreenShare()
        }

        return true
      } catch (error) {
        console.error('Error sharing screen:', error)
        return false
      }
    } else {
      return this.stopScreenShare()
    }
  }

  async stopScreenShare() {
    try {
      // Get new camera stream
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      const videoTrack = cameraStream.getVideoTracks()[0]

      // Replace video track in all peer connections
      this.peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
      })

      // Stop screen share track
      const screenTrack = this.localStream.getVideoTracks()[0]
      if (screenTrack) {
        screenTrack.stop()
      }

      // Update local stream
      this.localStream.removeTrack(this.localStream.getVideoTracks()[0])
      this.localStream.addTrack(videoTrack)

      // Update local video display
      this.displayLocalStream()

      this.isScreenSharing = false
      return true
    } catch (error) {
      console.error('Error stopping screen share:', error)
      return false
    }
  }

  getConnectionStats() {
    return {
      local: this.connectionQuality,
      remote: Object.fromEntries(this.connectionStats),
      totalParticipants: this.remoteStreams.size + 1
    }
  }

  disconnect() {
    console.log('Disconnecting WebRTC')

    this.peerConnections.forEach((pc, userId) => {
      pc.close()
    })
    this.peerConnections.clear()

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }

    if (this.socket) {
      this.socket.disconnect()
    }

    // Clean up UI
    const localVideo = document.getElementById('localVideo')
    if (localVideo) {
      localVideo.srcObject = null
    }

    const remoteContainer = document.getElementById('remoteVideosContainer')
    if (remoteContainer) {
      remoteContainer.innerHTML = ''
    }

    this.connectionStats.clear()
    this.reconnectionAttempts.clear()
  }
}

// Backward compatibility - keep original class name
class WebRTCConnection extends EnhancedWebRTCConnection {
  constructor(sessionId, userId) {
    super(sessionId, userId)
  }
}
