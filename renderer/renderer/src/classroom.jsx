import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'boxicons/css/boxicons.min.css'

const ClassroomPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState({
    id: '',
    role: 'user',
    token: '',
    username: 'Guest'
  })
  const [classroomToken, setClassroomToken] = useState('Loading...')
  const [members, setMembers] = useState([])
  const [showAdminActions, setShowAdminActions] = useState(false)
  const [joinToken, setJoinToken] = useState('')
  const [addMemberId, setAddMemberId] = useState('')
  const [editorContent, setEditorContent] = useState(
    '// Start coding together in real-time...\n// Changes sync across all members!'
  )
  const editorRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  const classroomId = searchParams.get('id')
  const urlToken = searchParams.get('token')

  // Get user from localStorage/cookies
  const getCurrentUser = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const role = localStorage.getItem('role') || 'user'
      if (user && user.token) {
        return { id: user.id || '', role, token: user.token, username: user.username || 'User' }
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e)
    }

    // Fallback to cookies (simplified)
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find((c) => c.includes('token='))
    const usernameCookie = cookies.find((c) => c.includes('username='))

    return {
      id: '',
      role: 'user',
      token: tokenCookie ? tokenCookie.split('=')[1] : '',
      username: usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : 'Guest'
    }
  }, [])

  // Fetch classroom data
  const fetchClassroom = useCallback(async () => {
    if (!classroomId || !currentUser.token) return

    try {
      const res = await fetch(`/api/classrooms/${classroomId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.classroom) {
          setClassroomToken(data.classroom.shareCode || 'N/A')
          setMembers(data.classroom)
          setShowAdminActions(currentUser.role === 'admin')
        }
      }
    } catch (error) {
      console.error('Failed to fetch classroom:', error)
    }
  }, [classroomId, currentUser])

  // Copy token to clipboard
  const copyToken = async () => {
    await navigator.clipboard.writeText(classroomToken)
    alert('Classroom token copied!')
  }

  // Join classroom
  const joinClassroom = async () => {
    const token = joinToken.trim()
    if (!token) return alert('Please enter a classroom code/token.')
    if (!currentUser.token) return alert('You must be logged in.')

    try {
      const res = await fetch(`/api/classrooms/join/${token}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` }
      })

      const data = await res.json()
      if (res.ok && data.classroomId) {
        alert('Joined classroom! Redirecting...')
        navigate(`/classroom?id=${data.classroomId}`)
      } else {
        alert(data.error || 'Failed to join classroom')
      }
    } catch (error) {
      alert('Failed to join classroom')
    }
  }

  // Add member (admin only)
  const addMember = async () => {
    const studentId = addMemberId.trim()
    if (!studentId) return alert('Enter user ID to add.')
    if (!currentUser.token) return alert('You must be logged in.')

    try {
      const res = await fetch('/api/classrooms/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ classroomId, studentId })
      })

      const data = await res.json()
      if (res.ok) {
        alert('Member added!')
        setAddMemberId('')
        fetchClassroom()
      } else {
        alert(data.error || 'Failed to add member')
      }
    } catch (error) {
      alert('Failed to add member')
    }
  }

  // WebRTC Peer connection (simplified demo)
  useEffect(() => {
    // Mock WebRTC peer connection
    const mockPeer = {
      connected: false,
      send: (data) => console.log('Peer sending:', data)
    }

    const timeout = setTimeout(() => {
      mockPeer.connected = true
      setIsConnected(true)
      editorRef.current.disabled = false
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  // Sync editor content (demo)
  const handleEditorChange = (e) => {
    setEditorContent(e.target.value)
    // In real implementation, send via WebRTC/data channel
  }

  // Load user and classroom on mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [getCurrentUser])

  useEffect(() => {
    if (currentUser.token) {
      fetchClassroom()

      // Auto-join if token in URL
      if (urlToken) {
        joinClassroom()
      }
    }
  }, [currentUser.token, classroomId, urlToken, fetchClassroom])

  // Render members list
  const renderMembers = () => {
    return members.map((member, index) => (
      <li
        key={index}
        className="member-item"
        style={{
          background: 'rgba(0,123,255,0.1)',
          color: '#007bff',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          fontSize: '0.98rem'
        }}
      >
        {member.username || member.email}
        {member.role === 'admin' && (
          <span
            className="admin-badge"
            style={{
              background: '#007bff',
              color: '#fff',
              borderRadius: '4px',
              padding: '0.1rem 0.5rem',
              fontSize: '0.8rem',
              marginLeft: '0.5rem'
            }}
          >
            Admin
          </span>
        )}
      </li>
    ))
  }

  return (
    <div id="main">
      {/* Navbar - Simplified for React Router */}
      <nav id="nav">
        <div className="nav-bar">
          <i className="bx bx-menu sidebarOpen"></i>
          <span className="logo navLogo">
            <a href="/">Human Error</a>
          </span>
          <div className="menu">
            <div className="logo-toggle">
              <span className="logo">
                <a href="/">Human Error</a>
              </span>
              <i className="bx bx-x siderbarClose"></i>
            </div>
            <ul className="nav-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/services">Services</a>
              </li>
              <li>
                <a href="/download">Download</a>
              </li>
              <li>
                <a href="/info">More info</a>
              </li>
              <li>
                <a href="/company">Company</a>
              </li>
            </ul>
          </div>
          <div className="darkLight-searchBox">
            <div className="dark-light">
              <i className="bx bx-moon moon"></i>
              <i className="bx bx-sun sun"></i>
            </div>
            <div className="searchBox">
              <div className="searchToggle">
                <i className="bx bx-x cancel"></i>
                <i className="bx bx-search search"></i>
              </div>
              <div className="search-field">
                <input type="text" placeholder="Search..." />
                <i className="bx bx-search"></i>
              </div>
            </div>
            <a href="/account/login" className="login">
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* Side Panel */}
      <div className="side-panel">
        <div className="user-logo">
          <img src="/images/github.jpg" alt="User Logo" />
        </div>
        <div className="user-name">
          <p>{currentUser.username}</p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="content"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '80vh'
        }}
      >
        <div
          className="glass-container"
          style={{
            background: 'rgba(255,255,255,0.25)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '2.5rem 2rem',
            width: '480px',
            maxWidth: '98vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}
        >
          {/* Header */}
          <div
            className="classroom-header"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span
              className="classroom-title"
              style={{ fontSize: '2rem', fontWeight: '700', color: '#222', letterSpacing: '1px' }}
            >
              Classroom
            </span>
            <i className="bx bxs-chalkboard" style={{ fontSize: '2rem', color: '#007bff' }}></i>
          </div>

          {/* Token Area */}
          <div
            className="token-area"
            style={{
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: '500',
              color: '#333',
              marginBottom: '0.5rem'
            }}
          >
            <span>{classroomToken}</span>
            <i
              className="bx bx-copy token-copy"
              title="Copy token"
              style={{
                cursor: 'pointer',
                color: '#007bff',
                fontSize: '1.3rem',
                marginLeft: '1rem'
              }}
              onClick={copyToken}
            />
          </div>

          {/* Join Area */}
          <div
            className="join-area"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <input
              type="text"
              className="join-input"
              placeholder="Paste classroom code/token to join..."
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                background: 'rgba(255,255,255,0.7)'
              }}
              value={joinToken}
              onChange={(e) => setJoinToken(e.target.value)}
            />
            <button
              className="join-btn"
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: '#007bff',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={joinClassroom}
            >
              Join Class
            </button>
          </div>

          {/* Members Area */}
          <div
            className="members-area"
            style={{
              background: 'rgba(255,255,255,0.4)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '1rem'
            }}
          >
            <div
              className="members-title"
              style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#333'
              }}
            >
              Members
            </div>
            <ul
              className="member-list"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              {members.length === 0 ? <li>Loading...</li> : renderMembers()}
            </ul>
            {showAdminActions && (
              <div id="admin-actions" style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  id="add-member-id"
                  placeholder="User ID to add"
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                  value={addMemberId}
                  onChange={(e) => setAddMemberId(e.target.value)}
                />
                <button
                  onClick={addMember}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#007bff',
                    color: '#fff'
                  }}
                >
                  Add Member
                </button>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div
            className="editor-area"
            style={{
              marginTop: '2rem',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <textarea
              id="editor"
              placeholder="Start coding together in real-time..."
              style={{
                width: '100%',
                height: '320px',
                fontSize: '1rem',
                background: '#1e1e1e',
                color: '#fff',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '1rem',
                fontFamily: "'Fira Mono','Consolas',monospace"
              }}
              value={editorContent}
              onChange={handleEditorChange}
              disabled={!isConnected}
            />
            {!isConnected && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#666',
                  fontSize: '0.9rem'
                }}
              >
                Connecting to peers...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassroomPage
