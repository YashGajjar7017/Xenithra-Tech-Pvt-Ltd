import React, { useState, useEffect } from 'react'

const DockerPanel = () => {
  const [containers, setContainers] = useState([])
  const [images, setImages] = useState([])
  const [activeTab, setActiveTab] = useState('containers') // 'containers' or 'images'
  const [selectedLogs, setSelectedLogs] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDockerData = async () => {
    if (window.api && typeof window.api.getDockerContainers === 'function') {
      try {
        const cList = await window.api.getDockerContainers()
        const iList = await window.api.getDockerImages()
        setContainers(cList || [])
        setImages(iList || [])
      } catch (e) {
        console.error('Docker fetch error:', e)
      }
    }
  }

  useEffect(() => {
    fetchDockerData()
    const interval = setInterval(fetchDockerData, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async (id) => {
    setLoading(true)
    if (window.api && typeof window.api.startDockerContainer === 'function') {
      await window.api.startDockerContainer(id)
      fetchDockerData()
    }
    setLoading(false)
  }

  const handleStop = async (id) => {
    setLoading(true)
    if (window.api && typeof window.api.stopDockerContainer === 'function') {
      await window.api.stopDockerContainer(id)
      fetchDockerData()
    }
    setLoading(false)
  }

  const handleRestart = async (id) => {
    setLoading(true)
    if (window.api && typeof window.api.restartDockerContainer === 'function') {
      await window.api.restartDockerContainer(id)
      fetchDockerData()
    }
    setLoading(false)
  }

  const handleViewLogs = async (c) => {
    if (window.api && typeof window.api.getDockerLogs === 'function') {
      const res = await window.api.getDockerLogs(c.id)
      setSelectedLogs({
        name: c.name,
        logs: res && res.output ? res.output : `[SYSTEM] Container ${c.name} (${c.id}) logs initialized.`
      })
    }
  }

  return (
    <div style={{ padding: '12px', color: 'var(--text-main)', fontSize: '12px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>🐳</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em' }}>DOCKER CONTAINER MANAGER</span>
        </div>
        <button 
          onClick={fetchDockerData} 
          style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '13px' }}
          title="Refresh Docker Status"
        >
          ↻
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('containers')} 
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'containers' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeTab === 'containers' ? 'var(--accent-color)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Containers ({containers.length})
        </button>
        <button 
          onClick={() => setActiveTab('images')} 
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'images' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeTab === 'images' ? 'var(--accent-color)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Images ({images.length})
        </button>
      </div>

      {/* Body List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeTab === 'containers' ? (
          containers.map(c => (
            <div 
              key={c.id} 
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#58a6ff' }}>{c.name}</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: c.isRunning ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                  color: c.isRunning ? '#00ffaa' : '#ff6b6b'
                }}>
                  {c.isRunning ? '● RUNNING' : '■ STOPPED'}
                </span>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Image: <code>{c.image}</code></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status: {c.status}</div>

              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {c.isRunning ? (
                  <button onClick={() => handleStop(c.id)} disabled={loading} style={{ flex: 1, background: 'rgba(255, 107, 107, 0.2)', border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Stop</button>
                ) : (
                  <button onClick={() => handleStart(c.id)} disabled={loading} style={{ flex: 1, background: 'rgba(0, 255, 170, 0.2)', border: '1px solid #00ffaa', color: '#00ffaa', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Start</button>
                )}
                <button onClick={() => handleRestart(c.id)} disabled={loading} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Restart</button>
                <button onClick={() => handleViewLogs(c)} style={{ background: 'rgba(88, 166, 255, 0.2)', border: '1px solid #58a6ff', color: '#58a6ff', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Logs</button>
              </div>
            </div>
          ))
        ) : (
          images.map((img, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#d8b4fe' }}>{img.repository}:{img.tag}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {img.id}</div>
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>{img.size}</span>
            </div>
          ))
        )}
      </div>

      {/* Logs View Modal */}
      {selectedLogs && (
        <div style={{ marginTop: '10px', background: '#090d16', border: '1px solid var(--panel-border)', padding: '8px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#00ffaa' }}>LOGS: {selectedLogs.name}</span>
            <span style={{ cursor: 'pointer', color: '#8b949e' }} onClick={() => setSelectedLogs(null)}>✕</span>
          </div>
          <pre style={{ fontSize: '9px', background: '#000', padding: '6px', borderRadius: '4px', color: '#58a6ff', maxHeight: '120px', overflowX: 'auto' }}>
            {selectedLogs.logs}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DockerPanel
