// WebRTC connection handler for collaborative sessions
class WebRTCConnection {
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
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
    this.setupSocketConnection()
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
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server')
    })
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      this.displayLocalStream()
      return true
    } catch (error) {
      console.error('Error accessing media devices:', error)
      return false
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

  async handleUserJoined(userId) {
    if (userId === this.userId) return

    console.log('Handling user joined:', userId)
    const peerConnection = this.createPeerConnection(userId)
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
    }
  }

  createPeerConnection(userId) {
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
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${userId}:`, peerConnection.iceConnectionState)
    }

    return peerConnection
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
      const peerConnection = this.createPeerConnection(from)
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
          video: true,
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

        // Stop old video track
        const oldVideoTrack = this.localStream.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
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
          width: { ideal: 640 },
          height: { ideal: 480 },
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

  disconnect() {
    console.log('Disconnecting WebRTC')

    this.peerConnections.forEach((pc, userId) => {
      pc.close()
    })
    this.peerConnections.clear()

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
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
  }
}
