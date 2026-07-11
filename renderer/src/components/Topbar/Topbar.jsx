import { useState, useRef, useEffect } from 'react'

const Topbar = ({ onToggleSidebar, theme, setTheme, filename, setFilename }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('Node.js')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  // Menu dropdown states
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false)
  const [editDropdownOpen, setEditDropdownOpen] = useState(false)
  const [selectionDropdownOpen, setSelectionDropdownOpen] = useState(false)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

  const langDropdownRef = useRef(null)
  const fileMenuRef = useRef(null)
  const editMenuRef = useRef(null)
  const selectionMenuRef = useRef(null)
  const viewMenuRef = useRef(null)
  const helpMenuRef = useRef(null)
  const themeMenuRef = useRef(null)

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

  // Check login state on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        setIsLoggedIn(true)
        setUsername(u.username || 'User')
      } catch (e) {
        setIsLoggedIn(false)
      }
    } else {
      setIsLoggedIn(false)
    }

    // Listen to theme changed custom events
    const handleThemeChange = (e) => {
      if (e.detail && e.detail.theme && setTheme) {
        setTheme(e.detail.theme)
      }
    }
    window.addEventListener('theme-changed', handleThemeChange)
    return () => window.removeEventListener('theme-changed', handleThemeChange)
  }, [setTheme])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setFileDropdownOpen(false)
      }
      if (editMenuRef.current && !editMenuRef.current.contains(event.target)) {
        setEditDropdownOpen(false)
      }
      if (selectionMenuRef.current && !selectionMenuRef.current.contains(event.target)) {
        setSelectionDropdownOpen(false)
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target)) {
        setViewDropdownOpen(false)
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
        setHelpDropdownOpen(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setThemeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    setDropdownOpen(false)
    // Dispatch custom event to notify editor language change
    window.dispatchEvent(new CustomEvent('change-language', { detail: { language: lang } }))
  }

  const handleLogin = () => {
    window.location.href = '/#/Account/login'
  }

  const handleSignup = () => {
    window.location.href = '/#/Account/signup'
  }

  // File Menu Handlers
  const handleFileNew = () => {
    setFileDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-file-new'))
  }

  const handleFileOpen = async () => {
    setFileDropdownOpen(false)
    try {
      const file = await window.api.openFileDialog()
      if (file) {
        window.dispatchEvent(new CustomEvent('open-file', {
          detail: { filename: file.name, code: file.content }
        }))
      }
    } catch (error) {
      console.error('Open file error:', error)
    }
  }

  const handleFileSave = () => {
    setFileDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-file-save'))
  }

  const handleFileSaveAs = () => {
    setFileDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-file-saveas'))
  }

  const handleFileExit = () => {
    setFileDropdownOpen(false)
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('close-window')
    }
  }

  // Edit Menu Handlers
  const handleEditUndo = () => {
    setEditDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-edit-undo'))
  }

  const handleEditRedo = () => {
    setEditDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-edit-redo'))
  }

  const handleEditCut = () => {
    setEditDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-edit-cut'))
  }

  const handleEditCopy = () => {
    setEditDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-edit-copy'))
  }

  const handleEditPaste = () => {
    setEditDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-edit-paste'))
  }

  // Selection Menu Handlers
  const handleSelectionAll = () => {
    setSelectionDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-selection-selectall'))
  }

  const handleSelectionNone = () => {
    setSelectionDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('menu-selection-selectnone'))
  }

  // View Menu Handlers
  const handleViewZoomIn = () => {
    setViewDropdownOpen(false)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.min(200, parseInt(currentZoom) + 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewZoomOut = () => {
    setViewDropdownOpen(false)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.max(50, parseInt(currentZoom) - 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewReset = () => {
    setViewDropdownOpen(false)
    localStorage.setItem('zoomLevel', 100)
    document.documentElement.style.zoom = 1
  }

  const handleViewToggleSidebar = () => {
    setViewDropdownOpen(false)
    onToggleSidebar()
  }

  // Help Menu Handlers
  const handleHelpAbout = () => {
    setHelpDropdownOpen(false)
    alert('Xenithra Technologies - Modern IDE\nVersion 1.0.0\n© 2024 Xenithra Tech Pvt Ltd')
  }

  const handleHelpDocumentation = () => {
    setHelpDropdownOpen(false)
    window.open('https://docs.xenithra.tech', '_blank')
  }

  const handleHelpShortcuts = () => {
    setHelpDropdownOpen(false)
    alert('Keyboard Shortcuts:\nCtrl+S: Save\nCtrl+O: Open\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+A: Select All')
  }

  return (
    <div className="menu-bar" style={{ height: '36px', display: 'flex', alignItems: 'center', position: 'relative', width: '100%', padding: '0 12px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--panel-border)' }}>
      {/* Sidenav toggle */}
      <button className="sidenav-toggle-btn" title="Toggle Sidebar" onClick={onToggleSidebar} style={{ padding: '3px 8px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>

      {/* Menus Group */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', zIndex: 10 }}>
        <div ref={fileMenuRef} className={`menu-item ${fileDropdownOpen ? 'open' : ''}`} onClick={() => setFileDropdownOpen(!fileDropdownOpen)}>
          File
          {fileDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleFileNew}>New</button>
              <button onClick={handleFileOpen}>Open...</button>
              <button onClick={handleFileSave}>Save</button>
              <button onClick={handleFileSaveAs}>Save As...</button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <button>Export as PDF</button>
              <button>Recent Files</button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={handleFileExit}>Exit</button>
            </div>
          )}
        </div>

        <div ref={editMenuRef} className={`menu-item ${editDropdownOpen ? 'open' : ''}`} onClick={() => setEditDropdownOpen(!editDropdownOpen)}>
          Edit
          {editDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleEditUndo}>Undo</button>
              <button onClick={handleEditRedo}>Redo</button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={handleEditCut}>Cut</button>
              <button onClick={handleEditCopy}>Copy</button>
              <button onClick={handleEditPaste}>Paste</button>
            </div>
          )}
        </div>

        <div ref={selectionMenuRef} className={`menu-item ${selectionDropdownOpen ? 'open' : ''}`} onClick={() => setSelectionDropdownOpen(!selectionDropdownOpen)}>
          Selection
          {selectionDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleSelectionAll}>Select All</button>
              <button onClick={handleSelectionNone}>Select None</button>
            </div>
          )}
        </div>

        <div ref={viewMenuRef} className={`menu-item ${viewDropdownOpen ? 'open' : ''}`} onClick={() => setViewDropdownOpen(!viewDropdownOpen)}>
          View
          {viewDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleViewZoomIn}>Zoom In (Ctrl++)</button>
              <button onClick={handleViewZoomOut}>Zoom Out (Ctrl+-)</button>
              <button onClick={handleViewReset}>Reset View</button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={handleViewToggleSidebar}>Toggle Sidebar</button>
            </div>
          )}
        </div>

        <div ref={helpMenuRef} className={`menu-item ${helpDropdownOpen ? 'open' : ''}`} onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}>
          Help
          {helpDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleHelpAbout}>About</button>
              <button onClick={handleHelpShortcuts}>Keyboard Shortcuts</button>
              <button onClick={handleHelpDocumentation}>Documentation</button>
            </div>
          )}
        </div>

        <div ref={themeMenuRef} className={`menu-item ${themeDropdownOpen ? 'open' : ''}`} onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}>
          Theme
          {themeDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setTheme('glass-dark'); document.documentElement.setAttribute('data-theme', 'glass-dark'); localStorage.setItem('theme', 'glass-dark'); }}>Glassy Dark</button>
              <button onClick={() => { setTheme('glass-light'); document.documentElement.setAttribute('data-theme', 'glass-light'); localStorage.setItem('theme', 'glass-light'); }}>Light Frosted</button>
              <button onClick={() => { setTheme('neon-purple'); document.documentElement.setAttribute('data-theme', 'neon-purple'); localStorage.setItem('theme', 'neon-purple'); }}>Neon Violet</button>
              <button onClick={() => { setTheme('emerald'); document.documentElement.setAttribute('data-theme', 'emerald'); localStorage.setItem('theme', 'emerald'); }}>Emerald Matrix</button>
              <button onClick={() => { setTheme('cyber-amber'); document.documentElement.setAttribute('data-theme', 'cyber-amber'); localStorage.setItem('theme', 'cyber-amber'); }}>Cyber Amber</button>
            </div>
          )}
        </div>
      </div>

      {/* Centralised Command Search Input */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '320px', zIndex: 5 }}>
        <input 
          type="text" 
          placeholder="Search commands..." 
          style={{
            width: '100%',
            height: '24px',
            background: 'rgba(0,0,0,0.22)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '4px',
            color: '#ccc',
            fontSize: '11px',
            textAlign: 'center',
            outline: 'none',
            padding: '0 8px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-color)'
            e.target.style.background = 'rgba(0,0,0,0.35)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.06)'
            e.target.style.background = 'rgba(0,0,0,0.22)'
          }}
        />
      </div>

      {/* Right-aligned Panel Options */}
      <div className="menu-panel" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', height: '100%', zIndex: 10 }}>
        {/* Play/Stop/Format Controls in the Navbar */}
        <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('menu-run-code'))}
            style={{
              background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '3px 10px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ▶ Run
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('menu-debug-code'))}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '3px 8px',
              height: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            🐞 Debug
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('menu-format-code'))}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '4px',
              color: 'var(--text-main)',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '3px 8px',
              height: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Format
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('menu-stop-code'))}
            style={{
              background: 'rgba(255,107,107,0.15)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: '4px',
              color: '#ff6b6b',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '3px 8px',
              height: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ■ Stop
          </button>
        </div>

        <div className="lang-select" ref={langDropdownRef} style={{ fontSize: '11px', gap: '6px', color: 'var(--text-muted)' }}>
          <span>Lang:</span>
          <div className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', height: '24px', display: 'flex', alignItems: 'center' }}>
              <span>{selectedLang}</span>
              <span className="arrow" style={{ marginLeft: '4px' }}>▾</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {languages.map((lang) => (
                  <button key={lang} onClick={() => handleLanguageSelect(lang)}>{lang}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="auth-section" style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-signup" onClick={handleSignup} style={{ padding: '3px 10px', height: '24px', fontSize: '11px', display: 'flex', alignItems: 'center' }}>Signup</button>
          </div>
        ) : (
          <div className="user-display" style={{ display: 'flex', gap: '6px', padding: '3px 8px', height: '24px', alignItems: 'center', background: 'rgba(0, 229, 255, 0.08)', borderRadius: '4px' }}>
            <div className="user-logo" style={{ width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
            <span className="user-name" style={{ fontSize: '11px' }}>{username}</span>
          </div>
        )}

        <div className="account-circle" title="Account" onClick={() => isLoggedIn ? onToggleSidebar() : handleLogin()} style={{ width: '24px', height: '24px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
      </div>
    </div>
  )
}

export default Topbar
