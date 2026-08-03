import React, { useState, useEffect } from 'react'

const DockerPanel = () => {
  const [containers, setContainers] = useState([])
  const [images, setImages] = useState([])
  const [activeTab, setActiveTab] = useState('containers') // 'containers' or 'images'
  const [selectedLogs, setSelectedLogs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState(null)

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
    const loadInit = async () => {
      await fetchDockerData()
    }
    loadInit()
    const interval = setInterval(fetchDockerData, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async (id) => {
    setLoading(true)
    setActionId(id)
    if (window.api && typeof window.api.startDockerContainer === 'function') {
      await window.api.startDockerContainer(id)
      await fetchDockerData()
    }
    setLoading(false)
    setActionId(null)
  }

  const handleStop = async (id) => {
    setLoading(true)
    setActionId(id)
    if (window.api && typeof window.api.stopDockerContainer === 'function') {
      await window.api.stopDockerContainer(id)
      await fetchDockerData()
    }
    setLoading(false)
    setActionId(null)
  }

  const handleRestart = async (id) => {
    setLoading(true)
    setActionId(id)
    if (window.api && typeof window.api.restartDockerContainer === 'function') {
      await window.api.restartDockerContainer(id)
      await fetchDockerData()
    }
    setLoading(false)
    setActionId(null)
  }

  const handleViewLogs = async (c) => {
    if (window.api && typeof window.api.getDockerLogs === 'function') {
      const res = await window.api.getDockerLogs(c.id)
      setSelectedLogs({
        name: c.name,
        logs:
          res && res.output
            ? res.output
            : `[SYSTEM] Container ${c.name} (${c.id}) logs initialized.`
      })
    }
  }

  return (
    <div
      style={{
        padding: '14px',
        color: 'var(--text-main)',
        fontSize: '12px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i
            className="bx bxl-docker"
            style={{ fontSize: '20px', color: 'var(--accent-color)' }}
          ></i>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.08em',
              color: 'var(--text-main)'
            }}
          >
            DOCKER CONTAINERS
          </span>
        </div>
        <button
          onClick={fetchDockerData}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--accent-color)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          title="Refresh Docker Status"
        >
          <i className="bx bx-refresh"></i>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '6px',
          padding: '2px',
          marginBottom: '12px'
        }}
      >
        <button
          onClick={() => setActiveTab('containers')}
          style={{
            flex: 1,
            background: activeTab === 'containers' ? 'var(--sidebar-active)' : 'transparent',
            border: 'none',
            color: activeTab === 'containers' ? 'var(--accent-color)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: '600',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Containers ({containers.length})
        </button>
        <button
          onClick={() => setActiveTab('images')}
          style={{
            flex: 1,
            background: activeTab === 'images' ? 'var(--sidebar-active)' : 'transparent',
            border: 'none',
            color: activeTab === 'images' ? 'var(--accent-color)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: '600',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Images ({images.length})
        </button>
      </div>

      {/* Body List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '2px'
        }}
      >
        {activeTab === 'containers'
          ? containers.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'border 0.25s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '12px' }}>
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: c.isRunning
                        ? 'rgba(0, 255, 170, 0.12)'
                        : 'rgba(255, 107, 107, 0.12)',
                      color: c.isRunning ? '#00ffaa' : '#ff6b6b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: c.isRunning ? '#00ffaa' : '#ff6b6b',
                        display: 'inline-block'
                      }}
                    ></span>
                    {c.isRunning ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div>
                    Image:{' '}
                    <code
                      style={{
                        color: 'var(--accent-color)',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}
                    >
                      {c.image}
                    </code>
                  </div>
                  <div>Status: {c.status}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {c.isRunning ? (
                    <button
                      onClick={() => handleStop(c.id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 107, 107, 0.08)',
                        border: '1px solid rgba(255, 107, 107, 0.25)',
                        color: '#ff6b6b',
                        borderRadius: '4px',
                        padding: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.target.style.background = 'rgba(255, 107, 107, 0.15)'
                      }}
                      onMouseLeave={(e) =>
                        (e.target.style.background = 'rgba(255, 107, 107, 0.08)')
                      }
                    >
                      {loading && actionId === c.id ? 'Stopping...' : 'Stop'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(c.id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: 'rgba(0, 255, 170, 0.08)',
                        border: '1px solid rgba(0, 255, 170, 0.25)',
                        color: '#00ffaa',
                        borderRadius: '4px',
                        padding: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.target.style.background = 'rgba(0, 255, 170, 0.15)'
                      }}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(0, 255, 170, 0.08)')}
                    >
                      {loading && actionId === c.id ? 'Starting...' : 'Start'}
                    </button>
                  )}
                  <button
                    onClick={() => handleRestart(c.id)}
                    disabled={loading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-main)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.03)')}
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => handleViewLogs(c)}
                    style={{
                      background: 'rgba(88, 166, 255, 0.08)',
                      border: '1px solid rgba(88, 166, 255, 0.25)',
                      color: '#58a6ff',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(88, 166, 255, 0.15)')}
                    onMouseLeave={(e) => (e.target.style.background = 'rgba(88, 166, 255, 0.08)')}
                  >
                    Logs
                  </button>
                </div>
              </div>
            ))
          : images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border 0.25s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '11px' }}>
                    {img.repository}:{img.tag}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      marginTop: '2px'
                    }}
                  >
                    ID: {img.id}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {img.size}
                </span>
              </div>
            ))}
      </div>

      {/* Logs View Modal */}
      {selectedLogs && (
        <div
          style={{
            marginTop: '12px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--panel-border)',
            padding: '10px',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--accent-color)',
                letterSpacing: '0.05em'
              }}
            >
              LOGS: {selectedLogs.name}
            </span>
            <span
              style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }}
              onClick={() => setSelectedLogs(null)}
              onMouseEnter={(e) => (e.target.style.color = '#fff')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
            >
              ✕
            </span>
          </div>
          <pre
            style={{
              fontSize: '9px',
              background: '#000',
              padding: '8px',
              borderRadius: '6px',
              color: '#58a6ff',
              maxHeight: '110px',
              overflowY: 'auto',
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              margin: 0,
              border: '1px solid rgba(255,255,255,0.04)'
            }}
          >
            {selectedLogs.logs}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DockerPanel
