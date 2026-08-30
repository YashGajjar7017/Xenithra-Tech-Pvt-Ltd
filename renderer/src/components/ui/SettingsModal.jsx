import React, { useState, useEffect } from 'react'

const SettingsModal = ({ isOpen, onClose, theme, setTheme }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') === 'true')
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '13')
  const [tabSize, setTabSize] = useState(localStorage.getItem('tabSize') || '2')
  const [lineNumbers, setLineNumbers] = useState(localStorage.getItem('lineNumbers') !== 'false')
  const [apiPort, setApiPort] = useState(localStorage.getItem('api-port') || '8000')

  // Additional Editor Settings
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('fontFamily') || "'JetBrains Mono', 'Fira Code', monospace")
  const [lineHeight, setLineHeight] = useState(localStorage.getItem('lineHeight') || '1.5')
  const [showMinimap, setShowMinimap] = useState(localStorage.getItem('showMinimap') !== 'false')

  // Dev Kit Compiler Paths
  const [compilerPaths, setCompilerPaths] = useState({
    'Node.js': '',
    'Python 3': '',
    'C (GCC)': '',
    'C++ (G++)': '',
    'Dot Net': '',
    'Dart': '',
    'PHP': ''
  })

  useEffect(() => {
    const port = localStorage.getItem('api-port') || '8000'
    setApiPort(port)

    const savedPaths = localStorage.getItem('user_compiler_paths')
    if (savedPaths) {
      try {
        setCompilerPaths((prev) => ({
          ...prev,
          ...JSON.parse(savedPaths)
        }))
      } catch (e) {
        console.warn('Failed to parse user compiler paths', e)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBrowsePath = async (lang) => {
    if (window.api && typeof window.api.selectExecutableDialog === 'function') {
      try {
        const selected = await window.api.selectExecutableDialog()
        if (selected) {
          setCompilerPaths((prev) => ({
            ...prev,
            [lang]: selected
          }))
        }
      } catch (err) {
        console.error('Failed to open select executable dialog', err)
      }
    } else {
      alert('Local file dialog API is not available in this environment.')
    }
  }

  const handleSave = () => {
    localStorage.setItem('autoSave', autoSave ? 'true' : 'false')
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('tabSize', tabSize)
    localStorage.setItem('lineNumbers', lineNumbers ? 'true' : 'false')
    localStorage.setItem('api-port', apiPort)
    localStorage.setItem('theme', theme)
    
    // Additional settings
    localStorage.setItem('fontFamily', fontFamily)
    localStorage.setItem('lineHeight', lineHeight)
    localStorage.setItem('showMinimap', showMinimap ? 'true' : 'false')

    // Compiler Paths
    localStorage.setItem('user_compiler_paths', JSON.stringify(compilerPaths))

    document.documentElement.setAttribute('data-theme', theme)

    window.dispatchEvent(
      new CustomEvent('settings-updated', {
        detail: { 
          autoSave, 
          fontSize, 
          tabSize, 
          lineNumbers, 
          apiPort, 
          theme,
          fontFamily,
          lineHeight,
          showMinimap,
          compilerPaths
        }
      })
    )

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
        background: 'rgba(5, 8, 16, 0.72)',
        backdropFilter: 'blur(12px)',
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
          width: '720px',
          height: '520px',
          background: 'rgba(18, 22, 33, 0.88)',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 30px rgba(0, 243, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e2e8f0',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '0.06em', color: '#00f3ff' }}>
              XENITHRA CONTROL PANEL
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ff4d4f')}
            onMouseLeave={(e) => (e.target.style.color = '#8b949e')}
          >
            ✕
          </button>
        </div>

        {/* Workspace: Tabs Sidebar + Tab Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tabs Sidebar */}
          <div
            style={{
              width: '180px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px'
            }}
          >
            {[
              { id: 'general', label: '🖥️ General' },
              { id: 'editor', label: '📝 Editor' },
              { id: 'devkit', label: '🛠️ Dev Kit (Paths)' }
            ].map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid transparent',
                    color: active ? '#00f3ff' : '#94a3b8',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content Box */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(5, 8, 16, 0.2)' }}>
            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                    THEME TEMPLATE
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value)
                      document.documentElement.setAttribute('data-theme', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id} style={{ background: '#121621', color: '#fff' }}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Auto Save Files</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Automatically save edited code buffers on focus change</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                    COMPILER PORT
                  </label>
                  <input
                    type="text"
                    value={apiPort}
                    onChange={(e) => setApiPort(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* EDITOR SETTINGS */}
            {activeTab === 'editor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>FONT SIZE (PX)</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      min="10"
                      max="32"
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>TAB INDENT SIZE</label>
                    <select
                      value={tabSize}
                      onChange={(e) => setTabSize(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="2">2 Spaces</option>
                      <option value="4">4 Spaces</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>FONT FAMILY</label>
                  <input
                    type="text"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>LINE HEIGHT</label>
                    <input
                      type="text"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Show Line Numbers</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Display line numbers column in editor viewports</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={lineNumbers}
                      onChange={(e) => setLineNumbers(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', marginLeft: 'auto' }}
                    />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Show Minimap</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Show vertical outline preview panel on the right</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showMinimap}
                      onChange={(e) => setShowMinimap(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', marginLeft: 'auto' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DEV KIT COMPILERS */}
            {activeTab === 'devkit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '8px', fontStyle: 'italic', lineHeight: '1.4' }}>
                  💡 Select compiler binaries (.exe) to execute code locally instead of using system variables. Keep blank to use default systems.
                </div>

                {Object.keys(compilerPaths).map((lang) => (
                  <div key={lang} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#00f3ff', letterSpacing: '0.02em' }}>
                      {lang.toUpperCase()} INTERPRETER / EXECUTABLE
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={compilerPaths[lang]}
                        placeholder={`Using default '${lang === 'Python 3' ? 'python' : lang === 'Node.js' ? 'node' : lang.toLowerCase()}'`}
                        onChange={(e) =>
                          setCompilerPaths((prev) => ({ ...prev, [lang]: e.target.value }))
                        }
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleBrowsePath(lang)}
                        style={{
                          background: 'rgba(0, 243, 255, 0.1)',
                          border: '1px solid rgba(0, 243, 255, 0.3)',
                          color: '#00f3ff',
                          borderRadius: '6px',
                          padding: '0 12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.4)')}
            onMouseLeave={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)',
              border: 'none',
              color: '#020617',
              fontWeight: '800',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 255, 170, 0.3)'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
