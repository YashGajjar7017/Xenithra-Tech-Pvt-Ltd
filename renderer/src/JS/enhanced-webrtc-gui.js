// Enhanced WebRTC GUI controller with advanced features
class EnhancedWebRTCGUI {
  constructor(webrtcConnection) {
    this.webrtc = webrtcConnection
    this.isVideoEnabled = true
    this.isAudioEnabled = true
    this.isScreenSharing = false
    this.isWebRTCActive = false
    this.isRecording = false
    this.isMinimized = false
    this.participants = new Map()
    this.connectionStatus = 'connecting'
    this.recordingStartTime = null
    this.recordingInterval = null

    this.init()
  }

  init() {
    this.createEnhancedWebRTCControls()
    this.setupEventListeners()
    this.setupConnectionMonitoring()
  }

  createEnhancedWebRTCControls() {
    // Create enhanced WebRTC container
    const webrtcContainer = document.createElement('div')
    webrtcContainer.id = 'enhancedWebRTCContainer'
    webrtcContainer.className = 'enhanced-webrtc-container'
    webrtcContainer.innerHTML = `
            <div class="webrtc-header">
                <div class="header-left">
                    <h3>Video Call</h3>
                    <div class="connection-status" id="connectionStatus">
                        <span class="status-indicator" id="statusIndicator"></span>
                        <span id="statusText">Connecting...</span>
                    </div>
                </div>
                <div class="header-right">
                    <button id="minimizeWebRTC" class="webrtc-btn minimize" title="Minimize">−</button>
                    <button id="closeWebRTC" class="webrtc-btn close" title="Close">×</button>
                </div>
            </div>
            
            <div class="webrtc-controls">
                <div class="control-group">
                    <button id="toggleVideoBtn" class="webrtc-btn" title="Toggle Video">
                        <span class="icon">📹</span>
                        <span class="label">Video</span>
                    </button>
                    <button id="toggleAudioBtn" class="webrtc-btn" title="Toggle Audio">
                        <span class="icon">🎤</span>
                        <span class="label">Audio</span>
                    </button>
                    <button id="shareScreenBtn" class="webrtc-btn" title="Share Screen">
                        <span class="icon">🖥️</span>
                        <span class="label">Share</span>
                    </button>
                    <button id="startRecordingBtn" class="webrtc-btn" title="Start Recording">
                        <span class="icon">🎬</span>
                        <span class="label">Record</span>
                    </button>
                    <button id="hangupBtn" class="webrtc-btn danger" title="End Call">
                        <span class="icon">📞</span>
                        <span class="label">End</span>
                    </button>
                </div>
                
                <div class="control-group">
                    <button id="settingsBtn" class="webrtc-btn" title="Settings">
                        <span class="icon">⚙️</span>
                    </button>
                    <button id="participantsBtn" class="webrtc-btn" title="Participants">
                        <span class="icon">👥</span>
                        <span class="badge" id="participantCount">0</span>
                    </button>
                </div>
            </div>
            
            <div class="video-container">
                <div class="local-video-container">
                    <video id="localVideo" autoplay muted playsinline></video>
                    <div class="video-label">You</div>
                    <div class="video-controls-overlay">
                        <button id="localVideoSettings" class="video-settings-btn">⚙️</button>
                    </div>
                </div>
                
                <div id="remoteVideosContainer" class="remote-videos-container">
                    <!-- Remote videos will be added here -->
                </div>
            </div>
            
            <div class="webrtc-info-panel">
                <div class="connection-info">
                    <div class="info-item">
                        <span class="label">Quality:</span>
                        <span id="connectionQuality" class="value">Good</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Latency:</span>
                        <span id="connectionLatency" class="value">--ms</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Bitrate:</span>
                        <span id="connectionBitrate" class="value">--kbps</span>
                    </div>
                </div>
                
                <div class="recording-info" id="recordingInfo" style="display: none;">
                    <div class="recording-indicator">
                        <span class="recording-dot"></span>
                        <span>Recording</span>
                        <span id="recordingTime">00:00</span>
                    </div>
                </div>
            </div>
            
            <div class="participants-panel" id="participantsPanel" style="display: none;">
                <div class="panel-header">
                    <h4>Participants</h4>
                    <button id="closeParticipantsPanel" class="close-btn">×</button>
                </div>
                <div class="participants-list" id="participantsList">
                    <!-- Participants will be populated here -->
                </div>
            </div>
            
            <div class="settings-panel" id="settingsPanel" style="display: none;">
                <div class="panel-header">
                    <h4>Settings</h4>
                    <button id="closeSettingsPanel" class="close-btn">×</button>
                </div>
                <div class="settings-content">
                    <div class="setting-group">
                        <label>Video Quality:</label>
                        <select id="videoQualitySelect">
                            <option value="low">Low (360p)</option>
                            <option value="medium">Medium (720p)</option>
                            <option value="high">High (1080p)</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Audio Quality:</label>
                        <select id="audioQualitySelect">
                            <option value="low">Low (32kbps)</option>
                            <option value="medium">Medium (128kbps)</option>
                            <option value="high">High (256kbps)</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="echoCancellation"> Echo Cancellation
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="noiseSuppression"> Noise Suppression
                        </label>
                    </div>
                </div>
            </div>
        `

    // Add to sidebar
    const sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      sidebar.appendChild(webrtcContainer)
    }
  }

  setupEventListeners() {
    document.getElementById('toggleVideoBtn').addEventListener('click', () => {
      this.toggleVideo()
    })

    document.getElementById('toggleAudioBtn').addEventListener('click', () => {
      this.toggleAudio()
    })

    document.getElementById('shareScreenBtn').addEventListener('click', () => {
      this.toggleScreenShare()
    })

    document.getElementById('startRecordingBtn').addEventListener('click', () => {
      this.toggleRecording()
    })

    document.getElementById('hangupBtn').addEventListener('click', () => {
      this.hangUp()
    })

    document.getElementById('minimizeWebRTC').addEventListener('click', () => {
      this.toggleMinimize()
    })

    document.getElementById('closeWebRTC').addEventListener('click', () => {
      this.closeWebRTC()
    })

    document.getElementById('participantsBtn').addEventListener('click', () => {
      this.toggleParticipantsPanel()
    })

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.toggleSettingsPanel()
    })

    document.getElementById('closeParticipantsPanel').addEventListener('click', () => {
      this.toggleParticipantsPanel()
    })

    document.getElementById('closeSettingsPanel').addEventListener('click', () => {
      this.toggleSettingsPanel()
    })

    // Video quality settings
    document.getElementById('videoQualitySelect').addEventListener('change', (e) => {
      this.changeVideoQuality(e.target.value)
    })

    // Audio quality settings
    document.getElementById('audioQualitySelect').addEventListener('change', (e) => {
      this.changeAudioQuality(e.target.value)
    })
  }

  setupConnectionMonitoring() {
    // Listen for connection quality updates
    if (this.webrtc.socket) {
      this.webrtc.socket.on('connection-quality-update', (data) => {
        this.updateConnectionQuality(data.quality)
      })
    }
  }

  toggleVideo() {
    if (!this.webrtc) return

    this.isVideoEnabled = this.webrtc.toggleVideo()
    const btn = document.getElementById('toggleVideoBtn')

    if (this.isVideoEnabled) {
      btn.classList.remove('disabled')
      btn.querySelector('.icon').textContent = '📹'
    } else {
      btn.classList.add('disabled')
      btn.querySelector('.icon').textContent = '📹⛔'
    }
  }

  toggleAudio() {
    if (!this.webrtc) return

    this.isAudioEnabled = this.webrtc.toggleAudio()
    const btn = document.getElementById('toggleAudioBtn')

    if (this.isAudioEnabled) {
      btn.classList.remove('disabled')
      btn.querySelector('.icon').textContent = '🎤'
    } else {
      btn.classList.add('disabled')
      btn.querySelector('.icon').textContent = '🎤⛔'
    }
  }

  async toggleScreenShare() {
    if (!this.webrtc) return

    const btn = document.getElementById('shareScreenBtn')

    if (!this.isScreenSharing) {
      btn.classList.add('active')
      btn.querySelector('.icon').textContent = '🖥️✅'
      const success = await this.webrtc.toggleScreenShare()
      if (success) {
        this.isScreenSharing = true
      } else {
        btn.classList.remove('active')
        btn.querySelector('.icon').textContent = '🖥️'
      }
    } else {
      btn.classList.remove('active')
      btn.querySelector('.icon').textContent = '🖥️'
      await this.webrtc.stopScreenShare()
      this.isScreenSharing = false
    }
  }

  async toggleRecording() {
    if (!this.webrtc) return

    const btn = document.getElementById('startRecordingBtn')

    if (!this.isRecording) {
      const success = await this.webrtc.startRecording()
      if (success) {
        this.isRecording = true
        this.recordingStartTime = Date.now()
        btn.classList.add('active')
        btn.querySelector('.icon').textContent = '⏹️'
        btn.querySelector('.label').textContent = 'Stop'
        this.showRecordingInfo()
        this.startRecordingTimer()
      }
    } else {
      const success = await this.webrtc.stopRecording()
      if (success) {
        this.isRecording = false
        btn.classList.remove('active')
        btn.querySelector('.icon').textContent = '🎬'
        btn.querySelector('.label').textContent = 'Record'
        this.hideRecordingInfo()
        this.stopRecordingTimer()
      }
    }
  }

  startRecordingTimer() {
    this.recordingInterval = setInterval(() => {
      if (this.recordingStartTime) {
        const elapsed = Date.now() - this.recordingStartTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        document.getElementById('recordingTime').textContent =
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    }, 1000)
  }

  stopRecordingTimer() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval)
      this.recordingInterval = null
    }
    this.recordingStartTime = null
  }

  showRecordingInfo() {
    document.getElementById('recordingInfo').style.display = 'block'
  }

  hideRecordingInfo() {
    document.getElementById('recordingInfo').style.display = 'none'
  }

  updateConnectionQuality(quality) {
    const qualityElement = document.getElementById('connectionQuality')
    const latencyElement = document.getElementById('connectionLatency')
    const bitrateElement = document.getElementById('connectionBitrate')

    // Update quality indicator
    if (quality.latency < 100) {
      qualityElement.textContent = 'Excellent'
      qualityElement.className = 'quality-excellent'
    } else if (quality.latency < 200) {
      qualityElement.textContent = 'Good'
      qualityElement.className = 'quality-good'
    } else if (quality.latency < 500) {
      qualityElement.textContent = 'Fair'
      qualityElement.className = 'quality-fair'
    } else {
      qualityElement.textContent = 'Poor'
      qualityElement.className = 'quality-poor'
    }

    // Update latency
    latencyElement.textContent = `${Math.round(quality.latency)}ms`

    // Update bitrate
    bitrateElement.textContent = `${Math.round(quality.bitrate / 1000)}kbps`
  }

  updateConnectionStatus(status) {
    const statusIndicator = document.getElementById('statusIndicator')
    const statusText = document.getElementById('statusText')

    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1)

    switch (status) {
      case 'connected':
        statusIndicator.className = 'status-indicator connected'
        break
      case 'connecting':
        statusIndicator.className = 'status-indicator connecting'
        break
      case 'disconnected':
        statusIndicator.className = 'status-indicator disconnected'
        break
      case 'reconnecting':
        statusIndicator.className = 'status-indicator reconnecting'
        break
    }
  }

  addParticipant(userId, username = null) {
    this.participants.set(userId, {
      userId,
      username: username || `User ${userId}`,
      joinedAt: new Date()
    })
    this.updateParticipantCount()
    this.updateParticipantsList()
  }

  removeParticipant(userId) {
    this.participants.delete(userId)
    this.updateParticipantCount()
    this.updateParticipantsList()
  }

  updateParticipantCount() {
    const count = this.participants.size + 1 // +1 for self
    document.getElementById('participantCount').textContent = count
  }

  updateParticipantsList() {
    const list = document.getElementById('participantsList')
    list.innerHTML = ''

    // Add self
    const selfItem = document.createElement('div')
    selfItem.className = 'participant-item self'
    selfItem.innerHTML = `
            <span class="participant-name">You</span>
            <span class="participant-status">Host</span>
        `
    list.appendChild(selfItem)

    // Add other participants
    this.participants.forEach((participant) => {
      const item = document.createElement('div')
      item.className = 'participant-item'
      item.innerHTML = `
                <span class="participant-name">${participant.username}</span>
                <span class="participant-status">Connected</span>
            `
      list.appendChild(item)
    })
  }

  toggleParticipantsPanel() {
    const panel = document.getElementById('participantsPanel')
    const isVisible = panel.style.display !== 'none'
    panel.style.display = isVisible ? 'none' : 'block'
  }

  toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel')
    const isVisible = panel.style.display !== 'none'
    panel.style.display = isVisible ? 'none' : 'block'
  }

  toggleMinimize() {
    const container = document.getElementById('enhancedWebRTCContainer')
    const content = container.querySelector('.video-container')

    if (!this.isMinimized) {
      content.style.display = 'none'
      document.getElementById('minimizeWebRTC').textContent = '+'
      this.isMinimized = true
    } else {
      content.style.display = 'block'
      document.getElementById('minimizeWebRTC').textContent = '−'
      this.isMinimized = false
    }
  }

  hangUp() {
    if (this.webrtc) {
      this.webrtc.disconnect()
      this.hideWebRTC()
    }
  }

  closeWebRTC() {
    this.hangUp()
  }

  showWebRTC() {
    const container = document.getElementById('enhancedWebRTCContainer')
    if (container) {
      container.style.display = 'block'
      this.isWebRTCActive = true
      this.updateConnectionStatus('connected')
    }
  }

  hideWebRTC() {
    const container = document.getElementById('enhancedWebRTCContainer')
    if (container) {
      container.style.display = 'none'
      this.isWebRTCActive = false
    }
  }

  showError(message) {
    const container = document.getElementById('enhancedWebRTCContainer')
    if (container) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'webrtc-error'
      errorDiv.innerHTML = `
                <p>${message}</p>
                <button onclick="location.reload()">Retry</button>
            `
      container.appendChild(errorDiv)
    }
  }

  changeVideoQuality(quality) {
    // Implement video quality change
    console.log('Changing video quality to:', quality)
  }

  changeAudioQuality(quality) {
    // Implement audio quality change
    console.log('Changing audio quality to:', quality)
  }
}

// Backward compatibility
class WebRTCGUI extends EnhancedWebRTCGUI {
  constructor(webrtcConnection) {
    super(webrtcConnection)
  }
}
