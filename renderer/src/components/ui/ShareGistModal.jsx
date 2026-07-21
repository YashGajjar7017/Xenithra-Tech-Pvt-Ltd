import React, { useState } from 'react'

const ShareGistModal = ({ isOpen, onClose, filename = 'script.js', code = '' }) => {
  const [description, setDescription] = useState('Xenithra IDE Shared Snippet')
  const [isPublic, setIsPublic] = useState(true)
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCreateGist = async () => {
    setLoading(true)
    setErrorMsg('')
    setResultUrl('')

    if (githubToken) {
      localStorage.setItem('github_token', githubToken)
    }

    if (window.api && typeof window.api.shareGitHubGist === 'function') {
      try {
        const res = await window.api.shareGitHubGist(filename, code, description, isPublic, githubToken)
        if (res && res.success) {
          setResultUrl(res.url)
        } else {
          setErrorMsg(res ? res.error : 'Failed to publish Gist.')
        }
      } catch (err) {
        setErrorMsg(err.message)
      }
    } else {
      setErrorMsg('GitHub Gist API unavailable.')
    }
    setLoading(false)
  }

  const handleCopyLink = () => {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '480px',
          background: '#161b22',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main)',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🐙</span>
            <span style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.04em' }}>SHARE CODE VIA GITHUB GIST</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#8b949e', marginBottom: '4px', display: 'block' }}>Target Filename</label>
            <input type="text" value={filename} readOnly style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#00ffaa', padding: '6px 10px', borderRadius: '4px', fontSize: '11px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#8b949e', marginBottom: '4px', display: 'block' }}>Gist Description</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description for this code snippet..." 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#8b949e', marginBottom: '4px', display: 'block' }}>GitHub Token (Optional for User Account Gists)</label>
            <input 
              type="password" 
              value={githubToken} 
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', outline: 'none' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500' }}>Visibility: Public Gist</span>
            <input 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)} 
              style={{ width: '14px', height: '14px', cursor: 'pointer' }} 
            />
          </div>

          {resultUrl && (
            <div style={{ background: 'rgba(0, 255, 170, 0.1)', border: '1px solid #00ffaa', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: '#00ffaa', fontWeight: 'bold' }}>✓ Gist Published Successfully!</div>
              <div style={{ fontSize: '10px', color: '#58a6ff', wordBreak: 'break-all' }}>{resultUrl}</div>
              <button onClick={handleCopyLink} style={{ alignSelf: 'flex-start', background: '#00ffaa', border: 'none', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>
                {copied ? '✓ Copied Link!' : '📋 Copy Link'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: '11px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '8px', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Close</button>
          <button onClick={handleCreateGist} disabled={loading} style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px 18px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
            {loading ? 'Publishing...' : 'Publish to GitHub Gist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareGistModal
