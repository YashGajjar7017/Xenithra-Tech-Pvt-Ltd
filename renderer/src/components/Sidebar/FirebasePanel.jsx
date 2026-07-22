import React, { useState, useEffect } from 'react'

const FirebasePanel = () => {
  const [projectId, setProjectId] = useState(localStorage.getItem('firebase:projectId') || 'xenithra-app-1002')
  const [apiKey, setApiKey] = useState(localStorage.getItem('firebase:apiKey') || 'AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P')
  const [connected, setConnected] = useState(localStorage.getItem('firebase:connected') === 'true')
  const [activeTab, setActiveTab] = useState('auth') // 'auth', 'firestore', 'hosting'
  
  // Auth mock users list
  const [users, setUsers] = useState([
    { uid: 'usr_0918', email: 'lead@xenithra.com', created: '2026-07-10', lastLogin: '2026-07-22' },
    { uid: 'usr_8471', email: 'yash@xenithra.tech', created: '2026-07-12', lastLogin: '2026-07-21' },
    { uid: 'usr_3920', email: 'guest@google.com', created: '2026-07-18', lastLogin: '2026-07-18' }
  ])
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Firestore mock data structure
  const [collections, setCollections] = useState({
    'users': [
      { id: 'usr_0918', data: { username: 'admin', role: 'Administrator', theme: 'vscode-dark' } },
      { id: 'usr_8471', data: { username: 'yash_gajjar', role: 'Lead Developer', theme: 'glass-dark' } }
    ],
    'settings': [
      { id: 'editor_config', data: { tabSize: 4, autoSave: true, wordWrap: 'on' } },
      { id: 'network_config', data: { bindHost: '0.0.0.0', apiPort: 8000 } }
    ]
  })
  const [selectedCol, setSelectedCol] = useState('users')
  const [newDocId, setNewDocId] = useState('')
  const [newDocField, setNewDocField] = useState('')
  const [newDocVal, setNewDocVal] = useState('')

  // Deploy states
  const [deploying, setDeploying] = useState(false)
  const [deployLogs, setDeployLogs] = useState([])

  const saveConfig = () => {
    localStorage.setItem('firebase:projectId', projectId)
    localStorage.setItem('firebase:apiKey', apiKey)
    localStorage.setItem('firebase:connected', 'true')
    setConnected(true)
  }

  const disconnectFirebase = () => {
    localStorage.setItem('firebase:connected', 'false')
    setConnected(false)
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    if (!newEmail) return
    const newUser = {
      uid: 'usr_' + Math.floor(1000 + Math.random() * 9000),
      email: newEmail,
      created: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0]
    }
    setUsers([...users, newUser])
    setNewEmail('')
    setNewPassword('')
  }

  const handleDeleteUser = (uid) => {
    setUsers(users.filter(u => u.uid !== uid))
  }

  const handleAddDoc = (e) => {
    e.preventDefault()
    if (!newDocId || !newDocField || !newDocVal) return
    const updatedCol = [...(collections[selectedCol] || [])]
    updatedCol.push({
      id: newDocId,
      data: { [newDocField]: newDocVal }
    })
    setCollections({
      ...collections,
      [selectedCol]: updatedCol
    })
    setNewDocId('')
    setNewDocField('')
    setNewDocVal('')
  }

  const handleDeleteDoc = (docId) => {
    setCollections({
      ...collections,
      [selectedCol]: collections[selectedCol].filter(d => d.id !== docId)
    })
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
        setDeployLogs(prev => [...prev, logs[currentLogIdx]])
        currentLogIdx++
      } else {
        clearInterval(interval)
        setDeploying(false)
      }
    }, 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '14px', color: 'var(--text-main)', fontSize: '12px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <i className="bx bxl-firebase" style={{ fontSize: '24px', color: '#ffca28' }}></i>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.05em' }}>FIREBASE CONSOLE</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {connected ? `Active Project: ${projectId}` : 'Connect your Firebase project'}
          </div>
        </div>
        {connected && (
          <button 
            onClick={disconnectFirebase} 
            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
          >
            Disconnect
          </button>
        )}
      </div>

      {!connected ? (
        /* Configuration form */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Connection Details</div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>Project ID</label>
            <input 
              type="text" 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
            />
          </div>
          <button 
            onClick={saveConfig}
            style={{ width: '100%', background: '#ffca28', border: 'none', color: '#000', borderRadius: '4px', padding: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
          >
            Connect Project
          </button>
        </div>
      ) : (
        /* Project Dashboard Dashboard */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Sub Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '10px', height: '30px', alignItems: 'center' }}>
            {['auth', 'firestore', 'hosting'].map(tab => (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: activeTab === tab ? '#ffca28' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid #ffca28' : 'none',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'uppercase'
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Tab contents */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            
            {activeTab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '600' }}>Authentication Users</div>
                
                {/* Users List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {users.map(u => (
                    <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        <span style={{ fontSize: '11px', color: '#ffca28' }}>{u.email}</span>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>UID: {u.uid}</div>
                      </div>
                      <span 
                        onClick={() => handleDeleteUser(u.uid)} 
                        style={{ color: '#ff6b6b', cursor: 'pointer', fontSize: '13px', padding: '0 4px' }}
                        title="Delete User"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add User Form */}
                <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: '500', fontSize: '11px' }}>Create User</div>
                  <input 
                    type="email" 
                    placeholder="User Email..." 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
                  />
                  <input 
                    type="password" 
                    placeholder="User Password..." 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#ffca28', border: 'none', color: '#000', padding: '6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    + Add User
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'firestore' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>Firestore Explorer</span>
                  <select 
                    value={selectedCol} 
                    onChange={e => setSelectedCol(e.target.value)}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
                  >
                    <option value="users">Collection: users</option>
                    <option value="settings">Collection: settings</option>
                  </select>
                </div>

                {/* Documents List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {(collections[selectedCol] || []).map(doc => (
                    <div key={doc.id} style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#58a6ff', fontSize: '10px' }}>ID: {doc.id}</span>
                        <span onClick={() => handleDeleteDoc(doc.id)} style={{ color: '#ff6b6b', cursor: 'pointer', fontSize: '12px' }}>×</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888' }}>
                        {JSON.stringify(doc.data, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Document Form */}
                <form onSubmit={handleAddDoc} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: '500', fontSize: '11px' }}>Add Document</div>
                  <input 
                    type="text" 
                    placeholder="Document ID (e.g. key)..." 
                    value={newDocId}
                    onChange={e => setNewDocId(e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="Field Name" 
                      value={newDocField}
                      onChange={e => setNewDocField(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      value={newDocVal}
                      onChange={e => setNewDocVal(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '4px', color: '#fff', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <button type="submit" style={{ background: '#ffca28', border: 'none', color: '#000', padding: '6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    + Save Document
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'hosting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '600' }}>Firebase Hosting</div>
                <button 
                  onClick={triggerSimDeploy}
                  disabled={deploying}
                  style={{
                    background: deploying ? 'rgba(255,252,40,0.2)' : '#ffca28',
                    border: 'none',
                    color: '#000',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: deploying ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {deploying ? '⚡ Deploying...' : '🚀 Deploy Site to Production'}
                </button>

                {deployLogs.length > 0 && (
                  <div style={{ background: '#0a0d14', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '10px', border: '1px solid #30363d', minHeight: '140px', overflowY: 'auto' }}>
                    {deployLogs.map((log, i) => (
                      <div key={i} style={{ 
                        color: log.startsWith('✔') ? '#00ffaa' : log.startsWith('e') || log.startsWith('!') ? '#ff6b6b' : '#c9d1d9',
                        marginBottom: '4px'
                      }}>
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
