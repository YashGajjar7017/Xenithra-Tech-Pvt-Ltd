import React, { useState, useEffect } from 'react'

const FirebasePanel = () => {
  const [projectId, setProjectId] = useState('xenithra-app-1002')
  const [apiKey, setApiKey] = useState('AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P')
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('auth') // 'auth', 'firestore', 'hosting'

  // Auth states
  const [users, setUsers] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Firestore states
  const [collections, setCollections] = useState({})
  const [selectedCol, setSelectedCol] = useState('users')
  const [newDocId, setNewDocId] = useState('')
  const [newDocField, setNewDocField] = useState('')
  const [newDocVal, setNewDocVal] = useState('')

  // Deploy states
  const [deploying, setDeploying] = useState(false)
  const [deployLogs, setDeployLogs] = useState([])

  // Load configuration and data from IPC backend on mount
  useEffect(() => {
    const initFirebase = async () => {
      if (window.api && typeof window.api.getFirebaseConfig === 'function') {
        const config = await window.api.getFirebaseConfig()
        if (config) {
          setProjectId(config.projectId || 'xenithra-app-1002')
          setApiKey(config.apiKey || 'AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P')
          setConnected(config.connected || false)
        }
      }
    }
    initFirebase()
  }, [])

  // Sync data when connection state or active tab changes
  useEffect(() => {
    if (!connected) return

    const fetchData = async () => {
      if (activeTab === 'auth' && window.api && typeof window.api.getFirebaseUsers === 'function') {
        const userList = await window.api.getFirebaseUsers()
        setUsers(userList || [])
      } else if (
        activeTab === 'firestore' &&
        window.api &&
        typeof window.api.getFirestoreCollections === 'function'
      ) {
        const cols = await window.api.getFirestoreCollections()
        setCollections(cols || {})
      }
    }
    fetchData()
  }, [connected, activeTab])

  const saveConfig = async () => {
    if (window.api && typeof window.api.saveFirebaseConfig === 'function') {
      const config = await window.api.saveFirebaseConfig(projectId, apiKey)
      if (config) {
        setConnected(true)
      }
    } else {
      setConnected(true)
    }
  }

  const disconnectFirebase = async () => {
    if (window.api && typeof window.api.disconnectFirebase === 'function') {
      await window.api.disconnectFirebase()
    }
    setConnected(false)
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!newEmail) return
    if (window.api && typeof window.api.addFirebaseUser === 'function') {
      await window.api.addFirebaseUser(newEmail, newPassword)
      const userList = await window.api.getFirebaseUsers()
      setUsers(userList || [])
    } else {
      const newUser = {
        uid: 'usr_' + Math.floor(1000 + Math.random() * 9000),
        email: newEmail,
        created: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      }
      setUsers([...users, newUser])
    }
    setNewEmail('')
    setNewPassword('')
  }

  const handleDeleteUser = async (uid) => {
    if (window.api && typeof window.api.deleteFirebaseUser === 'function') {
      await window.api.deleteFirebaseUser(uid)
      const userList = await window.api.getFirebaseUsers()
      setUsers(userList || [])
    } else {
      setUsers(users.filter((u) => u.uid !== uid))
    }
  }

  const handleAddDoc = async (e) => {
    e.preventDefault()
    if (!newDocId || !newDocField || !newDocVal) return

    if (window.api && typeof window.api.addFirestoreDocument === 'function') {
      const updatedList = await window.api.addFirestoreDocument(selectedCol, newDocId, {
        [newDocField]: newDocVal
      })
      setCollections((prev) => ({ ...prev, [selectedCol]: updatedList }))
    } else {
      const updatedCol = [...(collections[selectedCol] || [])]
      updatedCol.push({
        id: newDocId,
        data: { [newDocField]: newDocVal }
      })
      setCollections({
        ...collections,
        [selectedCol]: updatedCol
      })
    }
    setNewDocId('')
    setNewDocField('')
    setNewDocVal('')
  }

  const handleDeleteDoc = async (docId) => {
    if (window.api && typeof window.api.deleteFirestoreDocument === 'function') {
      await window.api.deleteFirestoreDocument(selectedCol, docId)
      const cols = await window.api.getFirestoreCollections()
      setCollections(cols || {})
    } else {
      setCollections({
        ...collections,
        [selectedCol]: collections[selectedCol].filter((d) => d.id !== docId)
      })
    }
  }

  const triggerSimDeploy = () => {
    if (deploying) return
    setDeploying(true)
    setDeployLogs([])

    const logs = [
      '=== Deploying to project: ' + projectId + ' ===',
      'i  hosting: hashing files...',
      'i  hosting: uploading 12 files...',
      '✔  hosting: upload complete!',
      'i  hosting: finalizing version...',
      '✔  hosting: release complete!',
      '✔  Deploy complete!',
      ' Hosting URL: https://' + projectId + '.web.app'
    ]

    let currentLogIdx = 0
    const interval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setDeployLogs((prev) => [...prev, logs[currentLogIdx]])
        currentLogIdx++
      } else {
        clearInterval(interval)
        setDeploying(false)
      }
    }, 800)

    if (window.api && typeof window.api.deployFirebaseHosting === 'function') {
      window.api.deployFirebaseHosting(projectId)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        padding: '14px',
        color: 'var(--text-main)',
        fontSize: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <i
          className="bx bxl-firebase"
          style={{
            fontSize: '24px',
            color: '#ffca28',
            filter: 'drop-shadow(0 0 4px rgba(255,202,40,0.3))'
          }}
        ></i>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--text-main)'
            }}
          >
            FIREBASE CONSOLE
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {connected ? `Project: ${projectId}` : 'Connect your Firebase project'}
          </div>
        </div>
        {connected && (
          <button
            onClick={disconnectFirebase}
            style={{
              background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.25)',
              color: '#ff6b6b',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,107,107,0.15)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(255,107,107,0.08)')}
          >
            Disconnect
          </button>
        )}
      </div>

      {!connected ? (
        /* Configuration form */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(255,255,255,0.02)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--text-main)' }}>
            Connection Details
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginBottom: '4px'
              }}
            >
              Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginBottom: '4px'
              }}
            >
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={saveConfig}
            style={{
              width: '100%',
              background: '#ffca28',
              border: 'none',
              color: '#000',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '4px',
              transition: 'all 0.25s'
            }}
            onMouseEnter={(e) => (e.target.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.target.style.filter = 'none')}
          >
            Connect Project
          </button>
        </div>
      ) : (
        /* Project Dashboard */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub Navigation */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.15)',
              borderRadius: '6px',
              padding: '2px',
              marginBottom: '12px'
            }}
          >
            {['auth', 'firestore', 'hosting'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? 'var(--sidebar-active)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab ? '#ffca28' : 'var(--text-muted)',
                  padding: '6px 0',
                  fontSize: '10px',
                  fontWeight: '700',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
            {activeTab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                  Authentication Users
                </div>

                {/* Users List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}
                >
                  {users.map((u) => (
                    <div
                      key={u.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '85%'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#ffca28', fontWeight: '500' }}>
                          {u.email}
                        </span>
                        <div
                          style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}
                        >
                          UID: {u.uid}
                        </div>
                      </div>
                      <span
                        onClick={() => handleDeleteUser(u.uid)}
                        style={{
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0 4px'
                        }}
                        title="Delete User"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        padding: '10px 0'
                      }}
                    >
                      No users found.
                    </div>
                  )}
                </div>

                {/* Add User Form */}
                <form
                  onSubmit={handleAddUser}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '11px', color: 'var(--text-main)' }}>
                    Create User
                  </div>
                  <input
                    type="email"
                    placeholder="User Email..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="password"
                    placeholder="User Password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#ffca28',
                      border: 'none',
                      color: '#000',
                      padding: '6px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    + Add User
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'firestore' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    Firestore Explorer
                  </span>
                  <select
                    value={selectedCol}
                    onChange={(e) => setSelectedCol(e.target.value)}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  >
                    <option value="users">Collection: users</option>
                    <option value="settings">Collection: settings</option>
                  </select>
                </div>

                {/* Documents List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}
                >
                  {(collections[selectedCol] || []).map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          paddingBottom: '4px',
                          marginBottom: '4px'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#58a6ff', fontSize: '10px' }}>
                          ID: {doc.id}
                        </span>
                        <span
                          onClick={() => handleDeleteDoc(doc.id)}
                          style={{
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0 2px'
                          }}
                        >
                          ×
                        </span>
                      </div>
                      <pre
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '9px',
                          color: '#888',
                          margin: 0,
                          overflowX: 'auto'
                        }}
                      >
                        {JSON.stringify(doc.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                  {(collections[selectedCol] || []).length === 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        padding: '10px 0'
                      }}
                    >
                      No documents in this collection.
                    </div>
                  )}
                </div>

                {/* Add Document Form */}
                <form
                  onSubmit={handleAddDoc}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '11px', color: 'var(--text-main)' }}>
                    Add Document
                  </div>
                  <input
                    type="text"
                    placeholder="Document ID (e.g. key)..."
                    value={newDocId}
                    onChange={(e) => setNewDocId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Field Name"
                      value={newDocField}
                      onChange={(e) => setNewDocField(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newDocVal}
                      onChange={(e) => setNewDocVal(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#ffca28',
                      border: 'none',
                      color: '#000',
                      padding: '6px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    + Save Document
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'hosting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Firebase Hosting</div>
                <button
                  onClick={triggerSimDeploy}
                  disabled={deploying}
                  style={{
                    background: deploying ? 'rgba(255,202,40,0.15)' : '#ffca28',
                    border: deploying ? '1px solid rgba(255,202,40,0.3)' : 'none',
                    color: deploying ? '#ffca28' : '#000',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: deploying ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  {deploying ? '⚡ Deploying...' : '🚀 Deploy Site to Production'}
                </button>

                {deployLogs.length > 0 && (
                  <div
                    style={{
                      background: '#0a0d14',
                      padding: '10px',
                      borderRadius: '6px',
                      fontFamily: "'JetBrains Mono', Consolas, monospace",
                      fontSize: '9px',
                      border: '1px solid #30363d',
                      minHeight: '140px',
                      overflowY: 'auto'
                    }}
                  >
                    {deployLogs.map((log, i) => (
                      <div
                        key={i}
                        style={{
                          color: log.startsWith('✔')
                            ? '#00ffaa'
                            : log.startsWith('e') || log.startsWith('!')
                              ? '#ff6b6b'
                              : '#c9d1d9',
                          marginBottom: '4px'
                        }}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FirebasePanel
