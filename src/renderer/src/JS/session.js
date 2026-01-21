// Session management and collaborative coding
class CollaborativeSession {
  constructor() {
    this.sessionId = null
    this.userId = this.generateUserId()
    this.username = null
    this.editor = null
    this.isHost = false
    this.participants = []
    this.socket = null
    this.webrtc = null
    this.webrtcGUI = null

    this.init()
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9)
  }

  getAuthHeaders() {
    const token = this.getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  getAuthToken() {
    // Try to get token from localStorage first, then sessionStorage, then cookie
    let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    if (!token) {
      // Try to get from cookie
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'auth_token') {
          token = decodeURIComponent(value)
          break
        }
      }
    }

    return token
  }

  async init() {
    this.setupEditor()
    this.setupEventListeners()

    // Check for session ID in URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session')

    if (sessionId) {
      document.getElementById('sessionCodeInput').value = sessionId
    }
  }

  setupEditor() {
    this.editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
      lineNumbers: true,
      mode: 'javascript',
      theme: 'monokai',
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4,
      lineWrapping: true
    })

    this.editor.on('change', (instance, change) => {
      if (change.origin !== 'setValue') {
        this.broadcastCodeChange()
      }
    })

    this.editor.on('cursorActivity', (instance) => {
      this.broadcastCursorPosition()
    })
  }

  setupEventListeners() {
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.changeLanguage(e.target.value)
    })

    // Poll for updates every 2 seconds
    setInterval(() => {
      if (this.sessionId) {
        this.fetchSessionUpdates()
        this.fetchChatMessages()
      }
    }, 2000)
  }

  async joinSession() {
    const username = document.getElementById('usernameInput').value.trim()
    const sessionCode = document.getElementById('sessionCodeInput').value.trim()

    if (!username) {
      alert('Please enter a username')
      return
    }

    this.username = username

    try {
      let response
      let data

      if (sessionCode) {
        // Join existing session
        response = await fetch(`/api/session/${sessionCode}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({
            userId: this.userId,
            username: this.username
          })
        })
      } else {
        // Create new session
        response = await fetch('/api/session/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({
            creatorId: this.userId,
            settings: {
              language: 'javascript',
              theme: 'dark',
              maxParticipants: 10
            }
          })
        })
      }

      data = await response.json()

      if (data.success) {
        this.sessionId = data.data.sessionId || sessionCode
        this.isHost = data.data.session.creatorId === this.userId

        document.getElementById('joinModal').classList.add('hidden')
        this.updateSessionInfo(data.data.session)
        this.loadInitialCode()
        this.startPolling()
      } else {
        alert(data.error || 'Failed to join session')
      }
    } catch (error) {
      console.error('Error joining session:', error)
      alert('Failed to join session. Please try again.')
    }
  }

  async loadInitialCode() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/code/get`)
      const data = await response.json()

      if (data.success) {
        this.editor.setValue(data.data.code || '')
      }
    } catch (error) {
      console.error('Error loading code:', error)
    }
  }

  async fetchSessionUpdates() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}`)
      const data = await response.json()

      if (data.success) {
        this.updateSessionInfo(data.data)
      }
    } catch (error) {
      console.error('Error fetching session updates:', error)
    }
  }

  async fetchChatMessages() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/chat/messages`)
      const data = await response.json()

      if (data.success) {
        this.updateChatMessages(data.data)
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    }
  }

  updateSessionInfo(session) {
    document.getElementById('sessionTitle').textContent = session.title || 'Collaborative Session'
    document.getElementById('sessionCode').textContent = session.joinCode || session.id

    this.participants = session.participants || []
    this.updateParticipantsList()
  }

  updateParticipantsList() {
    const participantsList = document.getElementById('participantsList')
    const participantsListSidebar = document.getElementById('participantsListSidebar')

    participantsList.innerHTML = '<span>Participants: </span>'
    participantsListSidebar.innerHTML = ''

    this.participants.forEach((participant) => {
      const participantDiv = document.createElement('div')
      participantDiv.className = 'participant'
      participantDiv.textContent = participant.username || participant.userId
      participantsList.appendChild(participantDiv)

      const participantItem = document.createElement('div')
      participantItem.className = 'participant-item'
      participantItem.textContent = participant.username || participant.userId
      participantsListSidebar.appendChild(participantItem)
    })
  }

  updateChatMessages(messages) {
    const chatMessages = document.getElementById('chatMessages')
    chatMessages.innerHTML = ''

    messages.forEach((message) => {
      const messageDiv = document.createElement('div')
      messageDiv.className = 'chat-message'
      messageDiv.innerHTML = `
                <div class="sender">${message.userId === this.userId ? 'You' : message.userId}</div>
                <div>${message.message}</div>
                <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
            `
      chatMessages.appendChild(messageDiv)
    })

    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  async broadcastCodeChange() {
    if (!this.sessionId) return

    try {
      await fetch(`/api/session/${this.sessionId}/code/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          code: this.editor.getValue(),
          userId: this.userId
        })
      })
    } catch (error) {
      console.error('Error saving code:', error)
    }
  }

  async broadcastCursorPosition() {
    if (!this.sessionId) return

    const cursor = this.editor.getCursor()
    try {
      await fetch(`/api/session/${this.sessionId}/cursor/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          userId: this.userId,
          cursor: {
            line: cursor.line,
            ch: cursor.ch
          }
        })
      })
    } catch (error) {
      console.error('Error updating cursor:', error)
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatInput')
    const message = input.value.trim()

    if (!message || !this.sessionId) return

    try {
      await fetch(`/api/session/${this.sessionId}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          userId: this.userId,
          message: message
        })
      })

      input.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  handleChatKeyPress(event) {
    if (event.key === 'Enter') {
      this.sendMessage()
    }
  }

  changeLanguage(language) {
    this.editor.setOption('mode', language)
  }

  async runCode() {
    const code = this.editor.getValue()
    // Implement code execution based on selected language
    console.log('Running code:', code)
    alert('Code execution feature coming soon!')
  }

  async saveCode() {
    try {
      await this.broadcastCodeChange()
      alert('Code saved successfully!')
    } catch (error) {
      alert('Failed to save code')
    }
  }

  shareSession() {
    const shareUrl = `${window.location.origin}/views/session.html?session=${this.sessionId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Session link copied to clipboard!')
    })
  }

  async leaveSession() {
    if (this.sessionId) {
      try {
        await fetch(`/api/session/${this.sessionId}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({
            userId: this.userId
          })
        })
      } catch (error) {
        console.error('Error leaving session:', error)
      }
    }

    window.location.reload()
  }

  startPolling() {
    // Already handled by setInterval in setupEventListeners
  }

  async startWebRTC() {
    if (!this.sessionId) {
      alert('Please join a session first')
      return
    }

    try {
      // Load enhanced WebRTC classes
      if (typeof EnhancedWebRTCConnection !== 'undefined') {
        this.webrtc = new EnhancedWebRTCConnection(this.sessionId, this.userId)
        this.webrtcGUI = new EnhancedWebRTCGUI(this.webrtc)
      } else {
        // Fallback to original classes
        this.webrtc = new WebRTCConnection(this.sessionId, this.userId)
        this.webrtcGUI = new WebRTCGUI(this.webrtc)
      }

      const success = await this.webrtc.initializeMedia()

      if (success) {
        this.webrtcGUI.showWebRTC()
      } else {
        alert('Failed to access camera/microphone. Please check permissions.')
      }
    } catch (error) {
      console.error('Error starting WebRTC:', error)
      alert('Failed to start video call. Please try again.')
    }
  }
}

// Global functions for HTML onclick handlers
function joinSession() {
  session.joinSession()
}

function sendMessage() {
  session.sendMessage()
}

function handleChatKeyPress(event) {
  session.handleChatKeyPress(event)
}

function runCode() {
  session.runCode()
}

function saveCode() {
  session.saveCode()
}

function shareSession() {
  session.shareSession()
}

function leaveSession() {
  session.leaveSession()
}

// Initialize the collaborative session
const session = new CollaborativeSession()
