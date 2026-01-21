import { useState, useEffect } from 'react'

const Session = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setSessions(sessions.filter((s) => s.id !== sessionId))
      }
    } catch (err) {
      alert('Failed to logout session')
    }
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Active Sessions</h1>
        {loading ? (
          <p>Loading sessions...</p>
        ) : (
          <div
            style={{ background: 'white', padding: '30px', borderRadius: '8px', marginTop: '20px' }}
          >
            {sessions.length === 0 ? (
              <p>No active sessions</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Device</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>IP Address</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Last Activity</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{session.device || 'Unknown'}</td>
                      <td style={{ padding: '10px' }}>{session.ipAddress || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>{session.lastActivity || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          style={{
                            padding: '5px 15px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Logout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Session
