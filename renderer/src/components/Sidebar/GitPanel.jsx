import React, { useState, useEffect } from 'react'

const GitPanel = () => {
  const [gitData, setGitData] = useState({ isGitRepo: true, currentBranch: 'main', statusFiles: [], commitLogs: [] })
  const [commitMsg, setCommitMsg] = useState('')
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [cloneUrl, setCloneUrl] = useState('')
  const [cloneStatus, setCloneStatus] = useState('')
  const [diffContent, setDiffContent] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchGitInfo = async () => {
    if (window.api && typeof window.api.getGitInfo === 'function') {
      const activePath = localStorage.getItem('activeWorkspacePath') || ''
      try {
        const info = await window.api.getGitInfo(activePath)
        setGitData(info || { isGitRepo: false })
      } catch (err) {
        console.error('[GitPanel] Error fetching git info:', err)
      }
    }
  }

  useEffect(() => {
    fetchGitInfo()
  }, [])

  const handleCommit = async () => {
    if (!commitMsg.trim()) return
    setLoading(true)
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.commitGitChanges === 'function') {
      const res = await window.api.commitGitChanges(activePath, commitMsg)
      if (res && res.success) {
        setCommitMsg('')
        fetchGitInfo()
      } else {
        alert(`Git Commit Failed: ${res ? res.error : 'Unknown error'}`)
      }
    }
    setLoading(false)
  }

  const handlePush = async () => {
    setLoading(true)
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.pushGitChanges === 'function') {
      const res = await window.api.pushGitChanges(activePath)
      alert(res.success ? 'Git Push Successful!' : `Push Failed: ${res.error}`)
      fetchGitInfo()
    }
    setLoading(false)
  }

  const handlePull = async () => {
    setLoading(true)
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.pullGitChanges === 'function') {
      const res = await window.api.pullGitChanges(activePath)
      alert(res.success ? 'Git Pull Successful!' : `Pull Failed: ${res.error}`)
      fetchGitInfo()
    }
    setLoading(false)
  }

  const handleCloneRepo = async () => {
    if (!cloneUrl.trim()) return
    setCloneStatus('Cloning repository... please wait...')
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.cloneGitRepo === 'function') {
      const res = await window.api.cloneGitRepo(cloneUrl, activePath)
      if (res && res.success) {
        setCloneStatus('Clone Successful!')
        setShowCloneModal(false)
        setCloneUrl('')
        fetchGitInfo()
      } else {
        setCloneStatus(`Clone Failed: ${res ? res.error : 'Error'}`)
      }
    }
  }

  const handleFileClick = async (filePath) => {
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.getGitFileDiff === 'function') {
      const res = await window.api.getGitFileDiff(activePath, filePath)
      if (res && res.diff) {
        setDiffContent({ file: filePath, diff: res.diff })
      } else {
        setDiffContent({ file: filePath, diff: 'No uncommitted changes detected in file diff.' })
      }
    }
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sidebar-bg)',
        color: 'var(--text-main)',
        fontSize: '12px',
        padding: '12px',
        overflowY: 'auto'
      }}
    >
      {/* Panel Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>SOURCE CONTROL (GIT)</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => setShowCloneModal(true)}
            style={{ background: 'rgba(88, 166, 255, 0.15)', border: '1px solid #58a6ff', color: '#58a6ff', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
          >
            + Clone Repo
          </button>
          <button 
            onClick={fetchGitInfo}
            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '13px' }}
            title="Refresh Git Status"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>Clone Git Repository</div>
          <input 
            type="text" 
            placeholder="https://github.com/user/repo.git" 
            value={cloneUrl} 
            onChange={(e) => setCloneUrl(e.target.value)}
            style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '11px', marginBottom: '6px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleCloneRepo} style={{ flex: 1, background: '#00ffaa', border: 'none', color: '#000', fontWeight: 'bold', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>Clone</button>
            <button onClick={() => setShowCloneModal(false)} style={{ background: 'transparent', border: '1px solid #666', color: '#ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
          {cloneStatus && <div style={{ fontSize: '10px', color: '#58a6ff', marginTop: '6px' }}>{cloneStatus}</div>}
        </div>
      )}

      {/* Branch & Actions Info */}
      {gitData.isGitRepo ? (
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>🌿 {gitData.currentBranch || 'main'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handlePull} disabled={loading} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Pull</button>
              <button onClick={handlePush} disabled={loading} style={{ background: 'rgba(0, 229, 255, 0.15)', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Push</button>
            </div>
          </div>

          {/* Commit Message Box */}
          <div style={{ marginBottom: '14px' }}>
            <textarea 
              rows="2"
              placeholder="Commit message (Ctrl+Enter to commit)..."
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              onKeyDown={(e) => e.ctrlKey && e.key === 'Enter' && handleCommit()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', resize: 'vertical' }}
            />
            <button 
              onClick={handleCommit}
              disabled={loading || !commitMsg.trim()}
              style={{ width: '100%', marginTop: '6px', background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ✓ Commit Changes
            </button>
          </div>

          {/* Changes List */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.05em' }}>
              CHANGES ({gitData.statusFiles ? gitData.statusFiles.length : 0})
            </div>
            {(!gitData.statusFiles || gitData.statusFiles.length === 0) ? (
              <div style={{ fontSize: '11px', color: '#8b949e', fontStyle: 'italic' }}>No uncommitted changes in workspace.</div>
            ) : (
              gitData.statusFiles.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleFileClick(item.file)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', cursor: 'pointer', borderRadius: '3px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{item.file}</span>
                  <span style={{ 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    padding: '1px 5px', 
                    borderRadius: '3px',
                    background: item.status === 'Untracked' ? '#2d3b2f' : '#3d301f',
                    color: item.status === 'Untracked' ? '#8be9fd' : '#ffb86c'
                  }}>
                    {item.code || 'M'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* File Diff Viewer Modal */}
          {diffContent && (
            <div style={{ background: '#0d1117', border: '1px solid var(--panel-border)', padding: '10px', borderRadius: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#58a6ff' }}>DIFF: {diffContent.file}</span>
                <span style={{ cursor: 'pointer', color: '#8b949e' }} onClick={() => setDiffContent(null)}>✕</span>
              </div>
              <pre style={{ background: '#000', padding: '8px', borderRadius: '4px', fontSize: '10px', color: '#00ffaa', overflowX: 'auto', maxHeight: '150px' }}>
                {diffContent.diff}
              </pre>
            </div>
          )}

          {/* Commit History Logs */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.05em' }}>COMMIT HISTORY</div>
            {gitData.commitLogs && gitData.commitLogs.map((log, idx) => (
              <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58a6ff', fontSize: '11px' }}>
                  <span>{log.hash}</span>
                  <span style={{ color: '#8b949e', fontSize: '10px' }}>{log.date}</span>
                </div>
                <div style={{ color: '#c9d1d9', fontSize: '11px', marginTop: '2px' }}>{log.message}</div>
              </div>
            ))}
          </div>
        </React.Fragment>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 10px', color: '#8b949e' }}>
          <div>Workspace is not a Git repository.</div>
          <button 
            onClick={() => setShowCloneModal(true)}
            style={{ marginTop: '12px', background: '#58a6ff', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Clone Repository
          </button>
        </div>
      )}
    </div>
  )
}

export default GitPanel
