// Collaboration JavaScript
document.addEventListener('DOMContentLoaded', function () {
  initializeCollaboration()
  loadCollaborationData()
  setupEventListeners()
})

function initializeCollaboration() {
  // Check authentication
  const token = getCookie('token')
  if (!token) {
    window.location.href = '/Account/login'
    return
  }
}

function setupEventListeners() {
  // Create session button
  const createSessionBtn = document.getElementById('createSessionBtn')
  if (createSessionBtn) {
    createSessionBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('createSessionModal'))
      modal.show()
    })
  }

  // Join session button
  const joinSessionBtn = document.getElementById('joinSessionBtn')
  if (joinSessionBtn) {
    joinSessionBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('joinSessionModal'))
      modal.show()
    })
  }

  // Create session form submission
  const submitSessionBtn = document.getElementById('submitSessionBtn')
  if (submitSessionBtn) {
    submitSessionBtn.addEventListener('click', createSession)
  }

  // Join session form submission
  const joinSessionSubmitBtn = document.getElementById('joinSessionSubmitBtn')
  if (joinSessionSubmitBtn) {
    joinSessionSubmitBtn.addEventListener('click', joinSession)
  }

  // Session filter
  const sessionFilter = document.getElementById('sessionFilter')
  if (sessionFilter) {
    sessionFilter.addEventListener('change', function () {
      filterSessions(this.value)
    })
  }

  // Leave session button
  const leaveSessionBtn = document.getElementById('leaveSessionBtn')
  if (leaveSessionBtn) {
    leaveSessionBtn.addEventListener('click', leaveSession)
  }
}

function loadCollaborationData() {
  // Load user sessions
  loadUserSessions()

  // Load recent comments
  loadRecentComments()
}

function loadUserSessions() {
  fetch('/api/collaboration/sessions', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateSessionsList(data.data.sessions)
        checkActiveSession(data.data.activeSession)
      }
    })
    .catch((error) => console.error('Error loading sessions:', error))
}

function loadRecentComments() {
  fetch('/api/collaboration/comments', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateCommentsList(data.data.comments)
      }
    })
    .catch((error) => console.error('Error loading comments:', error))
}

function updateSessionsList(sessions) {
  const sessionsList = document.getElementById('sessionsList')
  if (!sessionsList) return

  if (!sessions || sessions.length === 0) {
    sessionsList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-group'></i>
                <h3>No sessions yet</h3>
                <p>Create your first collaboration session to get started!</p>
            </div>
        `
    return
  }

  sessionsList.innerHTML = sessions
    .map((session) => {
      const deleteButton = session.isOwner
        ? `<button class="btn btn-sm btn-danger" onclick="deleteSession('${session.id}')">Delete</button>`
        : ''
      return `
        <div class="session-item" data-session-id="${session.id}">
            <div class="session-header">
                <div class="session-title">${session.title}</div>
                <div class="session-status ${session.status}">${session.status}</div>
            </div>
            <div class="session-meta">
                <span><i class='bx bx-user'></i> ${session.participants || 0} participants</span>
                <span><i class='bx bx-code-alt'></i> ${session.language}</span>
                <span><i class='bx bx-time-five'></i> ${formatDate(session.createdAt)}</span>
            </div>
            <div class="session-description">${session.description || 'No description provided'}</div>
            <div class="session-actions">
                <button class="btn btn-sm btn-primary" onclick="joinSession('${session.id}')">Join</button>
                <button class="btn btn-sm btn-info" onclick="viewSessionDetails('${session.id}')">Details</button>
                ${deleteButton}
            </div>
        </div>
    `
    })
    .join('')
}

function updateCommentsList(comments) {
  const commentsList = document.getElementById('commentsList')
  const commentCount = document.getElementById('commentCount')
  if (!commentsList) return

  if (commentCount) {
    commentCount.textContent = `${comments ? comments.length : 0} comments`
  }

  if (!comments || comments.length === 0) {
    commentsList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-message-square'></i>
                <h3>No comments yet</h3>
                <p>Comments from your collaboration sessions will appear here.</p>
            </div>
        `
    return
  }

  commentsList.innerHTML = comments
    .map(
      (comment) => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-avatar">
                    ${comment.author.charAt(0).toUpperCase()}
                </div>
                <div class="comment-info">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-time">${formatDate(comment.createdAt)}</div>
                </div>
                <div class="comment-type ${comment.type}">${comment.type}</div>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <span onclick="likeComment('${comment.id}')"><i class='bx bx-heart'></i> ${comment.likes || 0}</span>
                <span onclick="replyToComment('${comment.id}')"><i class='bx bx-reply'></i> Reply</span>
            </div>
        </div>
    `
    )
    .join('')
}

function checkActiveSession(activeSession) {
  const banner = document.getElementById('activeSessionBanner')
  if (!banner) return

  if (activeSession) {
    document.getElementById('activeSessionName').textContent = activeSession.title
    banner.style.display = 'block'
  } else {
    banner.style.display = 'none'
  }
}

function createSession() {
  const form = document.getElementById('createSessionForm')
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const formData = new FormData(form)
  const sessionData = {
    title: formData.get('sessionTitle'),
    description: formData.get('sessionDescription'),
    projectId: formData.get('projectId'),
    language: formData.get('language'),
    initialCode: formData.get('initialCode'),
    isPublic: formData.get('isPublic') === 'on'
  }

  // Show loading state
  const submitBtn = document.getElementById('submitSessionBtn')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Creating..."
  submitBtn.disabled = true

  fetch('/api/collaboration/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getCookie('token')
    },
    body: JSON.stringify(sessionData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createSessionModal'))
        modal.hide()

        // Reset form
        form.reset()

        // Refresh sessions
        loadCollaborationData()

        // Show success message
        showNotification('Session created successfully!', 'success')
      } else {
        showNotification('Error creating session: ' + data.message, 'error')
      }
    })
    .catch((error) => {
      console.error('Error creating session:', error)
      showNotification('Error creating session. Please try again.', 'error')
    })
    .finally(() => {
      // Reset button state
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    })
}

function joinSession(sessionId) {
  if (!sessionId) {
    // Get from join modal
    const sessionCode = document.getElementById('sessionCode').value.trim()
    if (!sessionCode) {
      showNotification('Please enter a session code or URL', 'error')
      return
    }
    sessionId = sessionCode
  }

  fetch(`/api/collaboration/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Close join modal if open
        const joinModal = bootstrap.Modal.getInstance(document.getElementById('joinSessionModal'))
        if (joinModal) joinModal.hide()

        // Update active session
        checkActiveSession(data.data.session)

        // Redirect to collaboration editor or update UI
        showNotification('Joined session successfully!', 'success')

        // Optionally redirect to the session
        // window.location.href = `/collaboration/${sessionId}`;
      } else {
        showNotification('Error joining session: ' + data.message, 'error')
      }
    })
    .catch((error) => {
      console.error('Error joining session:', error)
      showNotification('Error joining session. Please try again.', 'error')
    })
}

function leaveSession() {
  fetch('/api/collaboration/sessions/leave', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        checkActiveSession(null)
        showNotification('Left session successfully', 'success')
        loadCollaborationData()
      } else {
        showNotification('Error leaving session: ' + data.message, 'error')
      }
    })
    .catch((error) => {
      console.error('Error leaving session:', error)
      showNotification('Error leaving session. Please try again.', 'error')
    })
}

function viewSessionDetails(sessionId) {
  fetch(`/api/collaboration/sessions/${sessionId}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSessionDetailsModal(data.data)
      } else {
        showNotification('Error loading session details: ' + data.message, 'error')
      }
    })
    .catch((error) => {
      console.error('Error loading session details:', error)
      showNotification('Error loading session details. Please try again.', 'error')
    })
}

function showSessionDetailsModal(session) {
  const modal = new bootstrap.Modal(document.getElementById('sessionModal'))
  const modalTitle = document.getElementById('sessionModalTitle')
  const modalBody = document.getElementById('sessionModalBody')

  modalTitle.textContent = session.title

  modalBody.innerHTML = `
        <div class="session-details">
            <div class="session-detail-header">
                <h5>${session.title}</h5>
                <span class="session-status ${session.status}">${session.status}</span>
            </div>

            <div class="session-detail-meta">
                <p><strong>Language:</strong> ${session.language}</p>
                <p><strong>Created:</strong> ${formatDate(session.createdAt)}</p>
                <p><strong>Participants:</strong> ${session.participants || 0}</p>
                <p><strong>Owner:</strong> ${session.owner}</p>
            </div>

            ${
              session.description
                ? `
                <div class="session-detail-description">
                    <h6>Description</h6>
                    <p>${session.description}</p>
                </div>
            `
                : ''
            }

            <div class="session-detail-participants">
                <h6>Participants</h6>
                <div class="participants-list">
                    ${
                      session.participantsList
                        ? session.participantsList
                            .map(
                              (p) => `
                        <span class="participant">${p.name}</span>
                    `
                            )
                            .join('')
                        : 'No participants yet'
                    }
                </div>
            </div>
        </div>
    `

  modal.show()
}

function filterSessions(filter) {
  const sessionItems = document.querySelectorAll('.session-item')

  sessionItems.forEach((item) => {
    const status = item.querySelector('.session-status').textContent.toLowerCase()
    const isOwner = item.querySelector('.btn-danger') !== null

    switch (filter) {
      case 'active':
        item.style.display = status === 'active' ? 'block' : 'none'
        break
      case 'completed':
        item.style.display = status === 'completed' ? 'block' : 'none'
        break
      case 'mine':
        item.style.display = isOwner ? 'block' : 'none'
        break
      default:
        item.style.display = 'block'
    }
  })
}

function deleteSession(sessionId) {
  if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
    return
  }

  fetch(`/api/collaboration/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification('Session deleted successfully', 'success')
        loadCollaborationData()
      } else {
        showNotification('Error deleting session: ' + data.message, 'error')
      }
    })
    .catch((error) => {
      console.error('Error deleting session:', error)
      showNotification('Error deleting session. Please try again.', 'error')
    })
}

function likeComment(commentId) {
  fetch(`/api/collaboration/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadRecentComments() // Refresh comments
      }
    })
    .catch((error) => console.error('Error liking comment:', error))
}

function replyToComment(commentId) {
  // Show reply form or modal
  console.log('Reply to comment:', commentId)
}

// Utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

function showNotification(message, type = 'info') {
  // Simple notification - you might want to use a proper notification library
  alert(message)
}

// Make functions globally available
window.joinSession = joinSession
window.viewSessionDetails = viewSessionDetails
window.deleteSession = deleteSession
window.likeComment = likeComment
window.replyToComment = replyToComment
