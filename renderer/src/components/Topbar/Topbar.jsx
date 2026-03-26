import { useState, useRef, useEffect } from 'react'
import { topbarStyles } from './topbarStyles'

const Topbar = ({ onToggleSidebar, code, setCode, filename, setFilename }) => {
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

  const langDropdownRef = useRef(null)
  const fileMenuRef = useRef(null)
  const editMenuRef = useRef(null)
  const selectionMenuRef = useRef(null)
  const viewMenuRef = useRef(null)
  const helpMenuRef = useRef(null)

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    setDropdownOpen(false)
    console.log('Language selected:', lang)
  }

  const handleLogin = () => {
    console.log('Login clicked')
    window.location.href = '/#/Account/login'
  }

  const handleSignup = () => {
    console.log('Signup clicked')
    window.location.href = '/#/Account/signup'
  }

  // File Menu Handlers
  const handleFileNew = () => {
    console.log('File: New - Creating new file')
    setFileDropdownOpen(false)
    // TODO: Implement new file logic
  }

  const handleFileOpen = async () => {
    setFileDropdownOpen(false)
    try {
      const file = await window.api.openFileDialog()
      if (file) {
        setCode(file.content)
        setFilename(file.name)
        console.log('Opened file:', file.name)
      }
    } catch (error) {
      console.error('Open file error:', error)
    }
  }

  const handleFileSave = () => {
    console.log('File: Save - Saving current file:', filename)
    setFileDropdownOpen(false)
    // Download current file
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSaveAs = () => {
    console.log('File: Save As - Saving with new name')
    setFileDropdownOpen(false)
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xenithra_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileExit = () => {
    console.log('File: Exit - Closing application')
    setFileDropdownOpen(false)
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('close-window')
    }
  }

  // Edit Menu Handlers
  const handleEditUndo = () => {
    console.log('Edit: Undo')
    setEditDropdownOpen(false)
    // TODO: Implement undo logic
  }

  const handleEditRedo = () => {
    console.log('Edit: Redo')
    setEditDropdownOpen(false)
    // TODO: Implement redo logic
  }

  const handleEditCut = () => {
    console.log('Edit: Cut')
    setEditDropdownOpen(false)
    document.execCommand('cut')
  }

  const handleEditCopy = () => {
    console.log('Edit: Copy')
    setEditDropdownOpen(false)
    document.execCommand('copy')
  }

  const handleEditPaste = () => {
    console.log('Edit: Paste')
    setEditDropdownOpen(false)
    document.execCommand('paste')
  }

  // Selection Menu Handlers
  const handleSelectionAll = () => {
    console.log('Selection: Select All')
    setSelectionDropdownOpen(false)
    document.execCommand('selectAll')
  }

  const handleSelectionNone = () => {
    console.log('Selection: Select None')
    setSelectionDropdownOpen(false)
    window.getSelection().removeAllRanges()
  }

  // View Menu Handlers
  const handleViewZoomIn = () => {
    console.log('View: Zoom In')
    setViewDropdownOpen(false)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.min(200, parseInt(currentZoom) + 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewZoomOut = () => {
    console.log('View: Zoom Out')
    setViewDropdownOpen(false)
    const currentZoom = localStorage.getItem('zoomLevel') || 100
    const newZoom = Math.max(50, parseInt(currentZoom) - 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = (newZoom / 100)
  }

  const handleViewReset = () => {
    console.log('View: Reset View')
    setViewDropdownOpen(false)
    localStorage.setItem('zoomLevel', 100)
    document.documentElement.style.zoom = 1
  }

  const handleViewToggleSidebar = () => {
    console.log('View: Toggle Sidebar')
    setViewDropdownOpen(false)
    onToggleSidebar()
  }

  // Help Menu Handlers
  const handleHelpAbout = () => {
    console.log('Help: About')
    setHelpDropdownOpen(false)
    alert('Xenithra Technologies - Modern IDE\nVersion 1.0.0\n© 2024 Xenithra Tech Pvt Ltd')
  }

  const handleHelpDocumentation = () => {
    console.log('Help: Documentation')
    setHelpDropdownOpen(false)
    window.open('https://docs.xenithra.tech', '_blank')
  }

  const handleHelpShortcuts = () => {
    console.log('Help: Keyboard Shortcuts')
    setHelpDropdownOpen(false)
    alert('Keyboard Shortcuts:\nCtrl+S: Save\nCtrl+O: Open\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+A: Select All')
  }

  return (
    <div className="menu-bar">
      <button className="sidenav-toggle-btn" title="Toggle Sidebar" onClick={onToggleSidebar}>☰</button>

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

      {/* <div className="workspace-buttons">
        <button title="Dashboard">📊 Dashboard</button>
        <button title="Projects">📁 Projects</button>
        <button title="Snippets">📝 Snippets</button>
        <button title="Playground">🎮 Playground</button>
        <button title="Classroom">🏫 Classroom</button>
      </div> */}

      <div className="menu-spacer"></div>

      <div className="menu-panel">
        <div className="lang-select" ref={langDropdownRef}>
          <span>Language:</span>
          <div className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>{selectedLang}</span>
              <span className="arrow">▾</span>
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
          <div className="auth-section">
            {/* <button className="btn-login" onClick={handleLogin}>Login</button> */}
            <button className="btn-signup" onClick={handleSignup}>Signup</button>
          </div>
        ) : (
          <div className="user-display">
            <div className="user-logo">👤</div>
            <span className="user-name">{username}</span>
          </div>
        )}

        <div className="account-circle" title="Account" onClick={() => isLoggedIn ? onToggleSidebar() : handleLogin()}>👤</div>
      </div>
    </div>
  )
}

export default Topbar
