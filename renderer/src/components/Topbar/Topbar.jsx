import { useState, useRef, useEffect } from 'react'

const Topbar = ({ onToggleSidebar, theme, setTheme, filename, setFilename }) => {
  const [activeMenu, setActiveMenu] = useState(null) // 'file', 'edit', 'selection', 'view', 'run', 'help', 'theme', or null
  const [selectedLang, setSelectedLang] = useState('Node.js')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [showPalette, setShowPalette] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')

  const fileMenuRef = useRef(null)
  const editMenuRef = useRef(null)
  const selectionMenuRef = useRef(null)
  const viewMenuRef = useRef(null)
  const runMenuRef = useRef(null)
  const helpMenuRef = useRef(null)
  const themeMenuRef = useRef(null)
  const paletteRef = useRef(null)

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

  const updateTheme = (e, newTheme) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    setActiveMenu(null)
    if (setTheme) {
      setTheme(newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    }
  }

  const commands = [
    { name: 'Run Code', icon: '▶', action: () => window.dispatchEvent(new CustomEvent('menu-run-code')) },
    { name: 'Debug Code', icon: '🐞', action: () => window.dispatchEvent(new CustomEvent('menu-debug-code')) },
    { name: 'Stop Execution', icon: '■', action: () => window.dispatchEvent(new CustomEvent('menu-stop-code')) },
    { name: 'Format Document', icon: '✨', action: () => window.dispatchEvent(new CustomEvent('menu-format-code')) },
    { name: 'Package Standalone Binary', icon: '📦', action: () => window.dispatchEvent(new CustomEvent('menu-package-code')) },
    { name: 'Split Editor Screen', icon: '||', action: () => window.dispatchEvent(new CustomEvent('menu-split-editor')) },
    { name: 'Toggle Sidebar Panel', icon: '📁', action: () => onToggleSidebar() },
    { name: 'Open Local File', icon: '📄', action: () => {
        if (window.api && typeof window.api.openFileDialog === 'function') {
          window.api.openFileDialog().then(file => {
            if (file) window.dispatchEvent(new CustomEvent('open-file', { detail: { filename: file.name, code: file.content, path: file.path } }))
          })
        }
      }
    },
    { name: 'Open Workspace Folder', icon: '📂', action: () => {
        if (window.api && typeof window.api.openDirectoryDialog === 'function') {
          window.api.openDirectoryDialog().then(res => {
            if (res) window.dispatchEvent(new CustomEvent('open-directory', { detail: res }))
          })
        }
      }
    },
    { name: 'Switch Theme: GitHub Dark', icon: '🎨', action: () => updateTheme(null, 'github-dark') },
    { name: 'Switch Theme: VS Code Dark', icon: '🎨', action: () => updateTheme(null, 'vscode-dark') },
    { name: 'Switch Theme: Light Frosted', icon: '🎨', action: () => updateTheme(null, 'glass-light') }
  ]

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

  // Close dropdowns and command palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeMenu &&
        fileMenuRef.current && !fileMenuRef.current.contains(event.target) &&
        editMenuRef.current && !editMenuRef.current.contains(event.target) &&
        selectionMenuRef.current && !selectionMenuRef.current.contains(event.target) &&
        viewMenuRef.current && !viewMenuRef.current.contains(event.target) &&
        runMenuRef.current && !runMenuRef.current.contains(event.target) &&
        helpMenuRef.current && !helpMenuRef.current.contains(event.target) &&
        themeMenuRef.current && !themeMenuRef.current.contains(event.target)
      ) {
        setActiveMenu(null)
      }
      if (showPalette && paletteRef.current && !paletteRef.current.contains(event.target)) {
        setShowPalette(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenu, showPalette])

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    // Dispatch custom event to notify editor language change
    window.dispatchEvent(new CustomEvent('change-language', { detail: { language: lang } }))
  }

  const handleLogin = () => {
    window.location.href = '/#/Account/login'
  }

  const handleSignup = () => {
    window.location.href = '/#/Account/signup'
  }

  // Hover menu behavior: once a menu is open, hovering opens adjacent menus
  const handleMenuHeaderHover = (menuName) => {
    if (activeMenu !== null) {
      setActiveMenu(menuName)
    }
  }

  const handleMenuHeaderClick = (menuName) => {
    setActiveMenu(prev => prev === menuName ? null : menuName)
  }

  // File Menu Handlers
  const handleFileNew = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-file-new'))
  }

  const handleFileOpen = async (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    try {
      const file = await window.api.openFileDialog()
      if (file) {
        window.dispatchEvent(new CustomEvent('open-file', {
          detail: { filename: file.name, code: file.content, path: file.path }
        }))
      }
    } catch (error) {
      console.error('Open file error:', error)
    }
  }

  const handleOpenFolder = async (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    try {
      const result = await window.api.openDirectoryDialog()
      if (result) {
        window.dispatchEvent(new CustomEvent('open-directory', {
          detail: result
        }))
      }
    } catch (error) {
      console.error('Open directory error:', error)
    }
  }

  const handleCloseFolder = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('close-directory'))
  }

  const handleFileSave = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-file-save'))
  }

  const handleFileSaveAs = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-file-saveas'))
  }

  const handleFileExit = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    if (window.api && typeof window.api.closeWindow === 'function') {
      window.api.closeWindow()
    }
  }

  // Edit Menu Handlers
  const handleEditUndo = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-edit-undo'))
  }

  const handleEditRedo = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-edit-redo'))
  }

  const handleEditCut = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-edit-cut'))
  }

  const handleEditCopy = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-edit-copy'))
  }

  const handleEditPaste = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-edit-paste'))
  }

  // Selection Menu Handlers
  const handleSelectionAll = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-selection-selectall'))
  }

  const handleSelectionNone = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.dispatchEvent(new CustomEvent('menu-selection-selectnone'))
  }

  // View Menu Handlers
  const handleViewZoomIn = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.min(200, parseInt(currentZoom) + 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewZoomOut = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.max(50, parseInt(currentZoom) - 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewReset = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    localStorage.setItem('zoomLevel', 100)
    document.documentElement.style.zoom = 1
  }

  const handleViewToggleSidebar = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    onToggleSidebar()
  }

  // Help Menu Handlers
  const handleHelpAbout = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    alert('Xenithra Code Studio\nFuturistic IDE Workspace\nVersion 2.0.0\n© 2026 Xenithra Tech Pvt Ltd')
  }

  const handleHelpDocumentation = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    window.open('https://docs.xenithra.tech', '_blank')
  }

  const handleHelpShortcuts = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
    alert('Keybindings Map:\nCtrl+S: Direct Save\nCtrl+Shift+S: Save As\nCtrl+O: Open Local File\nCtrl+Z: Undo Operation\nCtrl+Y: Redo Operation\nCtrl+A: Selection Select All')
  }

  // Theme updated globally via helper

  return (
    <div className="menu-bar">
      {/* Sidenav toggle */}
      <button 
        className="sidenav-toggle-btn" 
        title="Toggle Sidebar" 
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      {/* Menus Group */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', zIndex: 10 }}>
        {/* FILE MENU */}
        <div 
          ref={fileMenuRef} 
          className={`menu-item ${activeMenu === 'file' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('file')}
          onMouseEnter={() => handleMenuHeaderHover('file')}
        >
          File
          {activeMenu === 'file' && (
            <div className="dropdown-menu">
              <button onClick={handleFileNew}>
                <span>New File</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+N</span>
              </button>
              <button onClick={handleFileOpen}>
                <span>Open File...</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+O</span>
              </button>
              <button onClick={handleOpenFolder}>
                <span>Open Folder...</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+Shift+O</span>
              </button>
              <button onClick={handleCloseFolder}>
                <span>Close Folder</span>
              </button>
              <button onClick={handleFileSave}>
                <span>Save</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+S</span>
              </button>
              <button onClick={handleFileSaveAs}>
                <span>Save As...</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+Shift+S</span>
              </button>
              <hr />
              <button onClick={handleFileExit}>
                <span>Exit Studio</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div 
          ref={editMenuRef} 
          className={`menu-item ${activeMenu === 'edit' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('edit')}
          onMouseEnter={() => handleMenuHeaderHover('edit')}
        >
          Edit
          {activeMenu === 'edit' && (
            <div className="dropdown-menu">
              <button onClick={handleEditUndo}>
                <span>Undo</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+Z</span>
              </button>
              <button onClick={handleEditRedo}>
                <span>Redo</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+Y</span>
              </button>
              <hr />
              <button onClick={handleEditCut}>
                <span>Cut</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+X</span>
              </button>
              <button onClick={handleEditCopy}>
                <span>Copy</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+C</span>
              </button>
              <button onClick={handleEditPaste}>
                <span>Paste</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+V</span>
              </button>
            </div>
          )}
        </div>

        {/* SELECTION MENU */}
        <div 
          ref={selectionMenuRef} 
          className={`menu-item ${activeMenu === 'selection' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('selection')}
          onMouseEnter={() => handleMenuHeaderHover('selection')}
        >
          Selection
          {activeMenu === 'selection' && (
            <div className="dropdown-menu">
              <button onClick={handleSelectionAll}>
                <span>Select All</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+A</span>
              </button>
              <button onClick={handleSelectionNone}>
                <span>Deselect All</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div 
          ref={viewMenuRef} 
          className={`menu-item ${activeMenu === 'view' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('view')}
          onMouseEnter={() => handleMenuHeaderHover('view')}
        >
          View
          {activeMenu === 'view' && (
            <div className="dropdown-menu">
              <button onClick={handleViewZoomIn}>
                <span>Zoom In</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl++</span>
              </button>
              <button onClick={handleViewZoomOut}>
                <span>Zoom Out</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+-</span>
              </button>
              <button onClick={handleViewReset}>
                <span>Reset Zoom</span>
              </button>
              <hr />
              <button onClick={handleViewToggleSidebar}>
                <span>Toggle Sidebar</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>Ctrl+B</span>
              </button>
            </div>
          )}
        </div>

        {/* RUN MENU */}
        <div 
          ref={runMenuRef} 
          className={`menu-item ${activeMenu === 'run' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('run')}
          onMouseEnter={() => handleMenuHeaderHover('run')}
        >
          Run
          {activeMenu === 'run' && (
            <div className="dropdown-menu">
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-run-code')) }}>
                <span>Run Code</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>▶</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-debug-code')) }}>
                <span>Debug Code</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>🐞</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-stop-code')) }}>
                <span>Stop Code</span>
                <span style={{ opacity: 0.4, fontSize: '10px' }}>■</span>
              </button>
              <hr />
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-format-code')) }}>
                <span>Format Document</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-package-code')) }}>
                <span>Package Binary</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); window.dispatchEvent(new CustomEvent('menu-split-editor')) }}>
                <span>Split Editor</span>
              </button>
            </div>
          )}
        </div>

        {/* HELP MENU */}
        <div 
          ref={helpMenuRef} 
          className={`menu-item ${activeMenu === 'help' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('help')}
          onMouseEnter={() => handleMenuHeaderHover('help')}
        >
          Help
          {activeMenu === 'help' && (
            <div className="dropdown-menu">
              <button onClick={handleHelpAbout}>
                <span>About Studio</span>
              </button>
              <button onClick={handleHelpShortcuts}>
                <span>Keyboard Shortcuts</span>
              </button>
              <button onClick={handleHelpDocumentation}>
                <span>Documentation</span>
              </button>
            </div>
          )}
        </div>

        {/* THEME MENU */}
        <div 
          ref={themeMenuRef} 
          className={`menu-item ${activeMenu === 'theme' ? 'open' : ''}`} 
          onClick={() => handleMenuHeaderClick('theme')}
          onMouseEnter={() => handleMenuHeaderHover('theme')}
        >
          Theme
          {activeMenu === 'theme' && (
            <div className="dropdown-menu">
              <button onClick={(e) => updateTheme(e, 'github-dark')}>
                <span>GitHub Dark</span>
                {theme === 'github-dark' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'vscode-dark')}>
                <span>VS Code Dark</span>
                {theme === 'vscode-dark' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'glass-dark')}>
                <span>Glassy Dark</span>
                {theme === 'glass-dark' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'glass-light')}>
                <span>Light Frosted</span>
                {theme === 'glass-light' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'neon-purple')}>
                <span>Neon Violet</span>
                {theme === 'neon-purple' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'emerald')}>
                <span>Emerald Matrix</span>
                {theme === 'emerald' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
              <button onClick={(e) => updateTheme(e, 'cyber-amber')}>
                <span>Cyber Amber</span>
                {theme === 'cyber-amber' && <span style={{ color: 'var(--accent-color)' }}>✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Centralised Command Search Input with Command Palette */}
      <div ref={paletteRef} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '320px', zIndex: 9999 }}>
        <input 
          type="text" 
          value={paletteQuery}
          onChange={(e) => setPaletteQuery(e.target.value)}
          onFocus={() => setShowPalette(true)}
          placeholder="Search commands..." 
          style={{
            width: '100%',
            height: '26px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--panel-border)',
            borderRadius: '6px',
            color: '#eee',
            fontSize: '12px',
            textAlign: 'center',
            outline: 'none',
            padding: '0 10px',
            transition: 'all 0.3s ease'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowPalette(false)
              e.target.blur()
            }
          }}
        />
        {showPalette && (
          <div className="command-palette-popover">
            {commands
              .filter(cmd => cmd.name.toLowerCase().includes(paletteQuery.toLowerCase()))
              .map((cmd, idx) => (
                <button 
                  key={idx} 
                  className="command-palette-item"
                  onClick={() => {
                    cmd.action()
                    setShowPalette(false)
                    setPaletteQuery('')
                  }}
                >
                  <span style={{ fontSize: '12px', width: '18px', display: 'inline-block' }}>{cmd.icon}</span>
                  <span>{cmd.name}</span>
                </button>
              ))}
            {commands.filter(cmd => cmd.name.toLowerCase().includes(paletteQuery.toLowerCase())).length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>No matching commands</div>
            )}
          </div>
        )}
      </div>

      {/* Right-aligned Panel Options */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', height: '100%', zIndex: 10 }}>
        {!isLoggedIn ? (
          <div className="auth-section" style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-signup" onClick={handleSignup} style={{ padding: '4px 12px', height: '26px', fontSize: '11px', display: 'flex', alignItems: 'center', fontWeight: '500' }}>Signup</button>
          </div>
        ) : (
          <div className="user-display">
            <img className="user-logo-img" src="Images/session_logo.png" alt="Session Logo" />
            <span className="user-name" style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>{username}</span>
          </div>
        )}

        <div className="account-circle" title="Account" onClick={() => isLoggedIn ? onToggleSidebar() : handleLogin()}>
          {isLoggedIn ? (
            <img className="account-circle-img" src="Images/session_logo.png" alt="Session Avatar" />
          ) : (
            <span style={{ fontSize: '13px' }}>👤</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topbar
