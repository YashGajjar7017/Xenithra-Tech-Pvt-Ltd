import { useState, useEffect, useCallback } from 'react'
import '../css/bootstrap/css/bootstrap.min.css'
import '../css/boxicons/boxicons.min.css'
import '../css/collaboration.css'

const CollaborationPage = () => {
  // Main states
  const [activeSession, setActiveSession] = useState(null)
  const [showActiveSessionBanner, setShowActiveSessionBanner] = useState(false)
  const [sessions, setSessions] = useState([])
  const [comments, setComments] = useState([])
  const [sessionFilter, setSessionFilter] = useState('all')
  const [commentCount, setCommentCount] = useState(0)

  // Modal states
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)

  // Form states
  const [createSessionForm, setCreateSessionForm] = useState({
    title: '',
    description: '',
    projectId: '',
    language: 'javascript',
    initialCode: '',
    isPublic: true
  })
  const [joinSessionCode, setJoinSessionCode] = useState('')
  const [commentForm, setCommentForm] = useState({
    text: '',
    type: 'general'
  })

  // Mock data
  const mockSessions = [
    {
      id: 'sess-1',
      title: 'Team Sprint Review',
      creator: 'john_doe',
      language: 'javascript',
      status: 'active',
      members: 4,
      created: '2025-12-25',
      isMine: true
    },
    {
      id: 'sess-2',
      title: 'Algorithm Challenge',
      creator: 'alice_smith',
      language: 'python',
      status: 'completed',
      members: 3,
      created: '2025-12-24',
      isMine: false
    }
  ]

  const mockComments = [
    {
      id: 'comm-1',
      author: 'john_doe',
      text: 'Great progress on the auth module!',
      type: 'general',
      timestamp: '2 hours ago'
    },
    {
      id: 'comm-2',
      author: 'alice_smith',
      text: 'Should we use async/await instead of promises here?',
      type: 'suggestion',
      timestamp: '3 hours ago'
    }
  ]

  // Handlers
  const handleCreateSession = async (e) => {
    e.preventDefault()
    // Simulate API call
    const newSession = {
      ...createSessionForm,
      id: `sess-${Date.now()}`,
      status: 'active',
      members: 1,
      created: new Date().toISOString().split('T')[0]
    }

    setSessions((prev) => [newSession, ...prev])
    setShowCreateModal(false)
    setCreateSessionForm({
      title: '',
      description: '',
      projectId: '',
      language: 'javascript',
      initialCode: '',
      isPublic: true
    })
    alert('Session created successfully!')
  }

  const handleJoinSession = async () => {
    if (!joinSessionCode.trim()) return
    // Simulate join
    alert(`Joining session: ${joinSessionCode}`)
    setShowJoinModal(false)
    setJoinSessionCode('')
  }

  const handleLeaveSession = () => {
    setActiveSession(null)
    setShowActiveSessionBanner(false)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    const newComment = {
      id: `comm-${Date.now()}`,
      author: 'Current User',
      text: commentForm.text,
      type: commentForm.type,
      timestamp: 'Just now'
    }

    setComments((prev) => [newComment, ...prev])
    setCommentCount((prev) => prev + 1)
    setShowCommentModal(false)
    setCommentForm({ text: '', type: 'general' })
  }

  // Effects
  useEffect(() => {
    // Load sessions and comments from API
    setSessions(mockSessions)
    setComments(mockComments)
    setCommentCount(mockComments.length)
  }, [])

  const filteredSessions = sessions.filter((session) => {
    if (sessionFilter === 'all') return true
    if (sessionFilter === 'active') return session.status === 'active'
    if (sessionFilter === 'completed') return session.status === 'completed'
    if (sessionFilter === 'mine') return session.isMine
    return true
  })

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-success',
      completed: 'bg-secondary',
      'in-progress': 'bg-warning'
    }
    return badges[status] || 'bg-primary'
  }

  const renderSessionCard = (session) => (
    <div key={session.id} className="session-card">
      <div className="session-header">
        <h5 className="session-title">{session.title}</h5>
        <span className={`badge ${getStatusBadge(session.status)}`}>{session.status}</span>
      </div>
      <div className="session-meta">
        <span>
          <i className="bx bx-user"></i> {session.creator}
        </span>
        <span>
          <i className="bx bx-code-alt"></i> {session.language}
        </span>
        <span>
          <i className="bx bx-group"></i> {session.members}
        </span>
      </div>
      <div className="session-actions">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setShowSessionModal(true)}
        >
          Details
        </button>
        <button className="btn btn-sm btn-primary">Join</button>
      </div>
    </div>
  )

  const renderComment = (comment) => (
    <div key={comment.id} className="comment-item">
      <div className="comment-header">
        <strong>{comment.author}</strong>
        <span
          className={`comment-type badge bg-${comment.type === 'question' ? 'info' : comment.type === 'suggestion' ? 'warning' : 'secondary'}`}
        >
          {comment.type}
        </span>
        <small>{comment.timestamp}</small>
      </div>
      <p>{comment.text}</p>
    </div>
  )

  return (
    <div className="collaboration-container">
      {/* Header */}
      <header className="collaboration-header">
        <div className="header-content">
          <h1>
            <i className="bx bx-group"></i> Code Collaboration
          </h1>
          <p>Work together on code in real-time</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="bx bx-plus"></i> Create Session
          </button>
          <button className="btn btn-outline-primary" onClick={() => setShowJoinModal(true)}>
            <i className="bx bx-link"></i> Join Session
          </button>
        </div>
      </header>

      {/* Active Session Banner */}
      {showActiveSessionBanner && activeSession && (
        <div className="active-session-banner">
          <div className="banner-content">
            <i className="bx bx-circle" style={{ color: '#28a745' }}></i>
            <span>
              Active in session: <strong>{activeSession.title}</strong>
            </span>
            <button className="btn btn-sm btn-outline-light" onClick={handleLeaveSession}>
              <i className="bx bx-log-out"></i> Leave
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="collaboration-content">
        {/* Sessions Section */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>Your Sessions</h2>
            <div className="session-filters">
              <select
                className="form-select form-select-sm"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
              >
                <option value="all">All Sessions</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="mine">Created by Me</option>
              </select>
            </div>
          </div>
          <div className="sessions-list">
            {filteredSessions.length > 0 ? (
              filteredSessions.map(renderSessionCard)
            ) : (
              <div className="empty-state">
                <i className="bx bx-group"></i>
                <h3>No sessions yet</h3>
                <p>Create your first collaboration session to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="section-header">
            <h2>Recent Comments</h2>
            <span className="comment-count">{commentCount} comments</span>
          </div>
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map(renderComment)
            ) : (
              <div className="empty-state">
                <i className="bx bx-message-square"></i>
                <h3>No comments yet</h3>
                <p>Comments from your collaboration sessions will appear here.</p>
              </div>
            )}
            <button
              className="btn btn-outline-primary btn-sm mt-3"
              onClick={() => setShowCommentModal(true)}
            >
              <i className="bx bx-plus"></i> Add Comment
            </button>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      <div className={`modal fade ${showSessionModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Session Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowSessionModal(false)}
              />
            </div>
            <div className="modal-body">
              <p>Session details content would be loaded here...</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSessionModal(false)}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Join Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      <div className={`modal fade ${showCreateModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Collaboration Session</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              />
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateSession}>
                <div className="mb-3">
                  <label htmlFor="sessionTitle" className="form-label">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="sessionTitle"
                    value={createSessionForm.title}
                    onChange={(e) =>
                      setCreateSessionForm({ ...createSessionForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="sessionDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="sessionDescription"
                    rows="3"
                    value={createSessionForm.description}
                    onChange={(e) =>
                      setCreateSessionForm({ ...createSessionForm, description: e.target.value })
                    }
                    placeholder="Describe what you'll be working on..."
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="projectId" className="form-label">
                        Project ID *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="projectId"
                        value={createSessionForm.projectId}
                        onChange={(e) =>
                          setCreateSessionForm({ ...createSessionForm, projectId: e.target.value })
                        }
                        required
                        placeholder="e.g., proj-123"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="language" className="form-label">
                        Programming Language
                      </label>
                      <select
                        className="form-control"
                        id="language"
                        value={createSessionForm.language}
                        onChange={(e) =>
                          setCreateSessionForm({ ...createSessionForm, language: e.target.value })
                        }
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="html">HTML/CSS</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="initialCode" className="form-label">
                    Initial Code (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="initialCode"
                    rows="8"
                    value={createSessionForm.initialCode}
                    onChange={(e) =>
                      setCreateSessionForm({ ...createSessionForm, initialCode: e.target.value })
                    }
                    placeholder="Paste your starting code here..."
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPublic"
                      checked={createSessionForm.isPublic}
                      onChange={(e) =>
                        setCreateSessionForm({ ...createSessionForm, isPublic: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="isPublic">
                      Make session public (anyone with the link can join)
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCreateSession}>
                <i className="bx bx-plus"></i> Create Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Join & Comment Modals (similar pattern) */}
      {/* Add Join Session Modal and Comment Modal following the same pattern */}
    </div>
  )
}

export default CollaborationPage
