// WebRTC GUI controller for video call interface
class WebRTCGUI {
  constructor(webrtcConnection) {
    this.webrtc = webrtcConnection
    this.isVideoEnabled = true
    this.isAudioEnabled = true
    this.isScreenSharing = false
    this.isWebRTCActive = false
    this.init()
  }

  init() {
    this.createWebRTCControls()
    this.setupEventListeners()
  }

  createWebRTCControls() {
    // Create WebRTC container
    const webrtcContainer = document.createElement('div')
    webrtcContainer.id = 'webrtcContainer'
    webrtcContainer.className = 'webrtc-container'
    webrtcContainer.innerHTML = `
            <div class="webrtc-header">
                <h3>Video Call</h3>
                <button id="minimizeWebRTC" class="webrtc-btn minimize">−</button>
            </div>
            <div class="webrtc-controls">
                <button id="toggleVideoBtn" class="webrtc-btn" title="Toggle Video">
                    <span class="icon">📹</span>
                </button>
                <button id="toggleAudioBtn" class="webrtc-btn" title="Toggle Audio">
                    <span class="icon">🎤</span>
                </button>
                <button id="shareScreenBtn" class="webrtc-btn" title="Share Screen">
                    <span class="icon">🖥️</span>
                </button>
                <button id="hangupBtn" class="webrtc-btn danger" title="End Call">
                    <span class="icon">📞</span>
                </button>
            </div>
            <div class="video-container">
                <div class="local-video-container">
                    <video id="localVideo" autoplay muted playsinline></video>
                    <div class="video-label">You</div>
                </div>
                <div id="remoteVideosContainer" class="remote-videos-container"></div>
            </div>
            <div class="webrtc-status">
                <span id="webrtcStatus">Connecting...</span>
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

    document.getElementById('hangupBtn').addEventListener('click', () => {
      this.hangUp()
    })

    document.getElementById('minimizeWebRTC').addEventListener('click', () => {
      this.toggleMinimize()
    })
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

  hangUp() {
    if (this.webrtc) {
      this.webrtc.disconnect()
      this.hideWebRTC()
    }
  }

  showWebRTC() {
    const container = document.getElementById('webrtcContainer')
    if (container) {
      container.style.display = 'block'
      this.updateStatus('Connected')
    }
  }

  hideWebRTC() {
    const container = document.getElementById('webrtcContainer')
    if (container) {
      container.style.display = 'none'
    }
  }

  toggleMinimize() {
    const container = document.getElementById('webrtcContainer')
    const content = container.querySelector('.video-container')

    if (content.style.display === 'none') {
      content.style.display = 'block'
      document.getElementById('minimizeWebRTC').textContent = '−'
    } else {
      content.style.display = 'none'
      document.getElementById('minimizeWebRTC').textContent = '+'
    }
  }

  updateStatus(status) {
    const statusElement = document.getElementById('webrtcStatus')
    if (statusElement) {
      statusElement.textContent = status
    }
  }

  updateParticipantCount(count) {
    const statusElement = document.getElementById('webrtcStatus')
    if (statusElement) {
      statusElement.textContent = `${count} participant${count !== 1 ? 's' : ''}`
    }
  }

  showError(message) {
    const container = document.getElementById('webrtcContainer')
    if (container) {
      container.innerHTML = `
                <div class="webrtc-error">
                    <p>${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `
    }
  }
}
