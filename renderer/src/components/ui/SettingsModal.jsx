import React, { useState, useEffect } from 'react'

const SettingsModal = ({ isOpen, onClose, theme, setTheme }) => {
  const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') === 'true')
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '13')
  const [tabSize, setTabSize] = useState(localStorage.getItem('tabSize') || '2')
  const [lineNumbers, setLineNumbers] = useState(localStorage.getItem('lineNumbers') !== 'false')
  const [apiPort, setApiPort] = useState(localStorage.getItem('api-port') || '8000')

  useEffect(() => {
    const port = localStorage.getItem('api-port') || '8000'
    setApiPort(port)
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem('autoSave', autoSave ? 'true' : 'false')
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('tabSize', tabSize)
    localStorage.setItem('lineNumbers', lineNumbers ? 'true' : 'false')
    localStorage.setItem('api-port', apiPort)
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)

    window.dispatchEvent(new CustomEvent('settings-updated', {
      detail: { autoSave, fontSize, tabSize, lineNumbers, apiPort, theme }
    }))

    onClose()
  }

  const themes = [
    { id: 'vscode-dark', name: 'VS Code Dark' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'glass-dark', name: 'Glassy Dark' },
    { id: 'glass-light', name: 'Light Frosted' },
    { id: 'neon-purple', name: 'Neon Violet' },
    { id: 'emerald', name: 'Emerald Matrix' },
    { id: 'cyber-amber', name: 'Cyber Amber' }
  ]

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
          width: '520px',
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
            <i className="bx bx-cog" style={{ fontSize: '18px', color: 'var(--accent-color)' }}></i>
            <span style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '0.04em' }}>IDE SETTINGS & PREFERENCES</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Theme selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-color)', marginBottom: '6px', display: 'block' }}>Appearance Theme</label>
            <select 
              value={theme} 
              onChange={(e) => {
                setTheme(e.target.value)
                document.documentElement.setAttribute('data-theme', e.target.value)
              }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
            >
              {themes.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#161b22', color: '#fff' }}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Auto save */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>Auto Save Files</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Automatically save file edits on focus loss</div>
            </div>
            <input 
              type="checkbox" 
              checked={autoSave} 
              onChange={(e) => setAutoSave(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {/* Font size */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Editor Font Size (px)</label>
              <input 
                type="number" 
                value={fontSize} 
                onChange={(e) => setFontSize(e.target.value)}
                min="10"
                max="28"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tab Indent Size</label>
              <select 
                value={tabSize} 
                onChange={(e) => setTabSize(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
              >
                <option value="2" style={{ background: '#161b22', color: '#fff' }}>2 Spaces</option>
                <option value="4" style={{ background: '#161b22', color: '#fff' }}>4 Spaces</option>
              </select>
            </div>
          </div>

          {/* Line Numbers */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>Show Line Numbers</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Display line numbers column in editor</div>
            </div>
            <input 
              type="checkbox" 
              checked={lineNumbers} 
              onChange={(e) => setLineNumbers(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {/* Compiler Engine Port */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Compiler Backend API Port</label>
            <input 
              type="text" 
              value={apiPort} 
              onChange={(e) => setApiPort(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px 18px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
