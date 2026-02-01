import { useState } from 'react'
import { topbarStyles } from './topbarStyles'

const Topbar = ({ onToggleSidebar }) => {
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

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    setDropdownOpen(false)
  }

  const handleLogin = () => {
    // Implement login logic
    console.log('Login clicked')
  }

  const handleSignup = () => {
    // Implement signup logic
    console.log('Signup clicked')
  }

  // Menu handler functions
  const handleFileNew = () => {
    console.log('File: New')
    setFileDropdownOpen(false)
  }

  const handleFileOpen = () => {
    console.log('File: Open')
    setFileDropdownOpen(false)
  }

  const handleFileSave = () => {
    console.log('File: Save')
    setFileDropdownOpen(false)
  }

  const handleEditUndo = () => {
    console.log('Edit: Undo')
    setEditDropdownOpen(false)
  }

  const handleEditRedo = () => {
    console.log('Edit: Redo')
    setEditDropdownOpen(false)
  }

  const handleEditCut = () => {
    console.log('Edit: Cut')
    setEditDropdownOpen(false)
  }

  const handleEditCopy = () => {
    console.log('Edit: Copy')
    setEditDropdownOpen(false)
  }

  const handleEditPaste = () => {
    console.log('Edit: Paste')
    setEditDropdownOpen(false)
  }

  const handleSelectionAll = () => {
    console.log('Selection: Select All')
    setSelectionDropdownOpen(false)
  }

  const handleSelectionNone = () => {
    console.log('Selection: Select None')
    setSelectionDropdownOpen(false)
  }

  const handleViewZoomIn = () => {
    console.log('View: Zoom In')
    setViewDropdownOpen(false)
  }

  const handleViewZoomOut = () => {
    console.log('View: Zoom Out')
    setViewDropdownOpen(false)
  }

  const handleViewReset = () => {
    console.log('View: Reset View')
    setViewDropdownOpen(false)
  }

  const handleHelpAbout = () => {
    console.log('Help: About')
    setHelpDropdownOpen(false)
  }

  const handleHelpDocumentation = () => {
    console.log('Help: Documentation')
    setHelpDropdownOpen(false)
  }

  return (
    <div className="menu-bar">
      <button className="sidenav-toggle-btn" title="Toggle Sidebar" onClick={onToggleSidebar}>☰</button>

      <div className="menu-item" onClick={() => setFileDropdownOpen(!fileDropdownOpen)}>
        File
        {fileDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleFileNew}>New</button>
            <button onClick={handleFileOpen}>Open</button>
            <button onClick={handleFileSave}>Save</button>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => setEditDropdownOpen(!editDropdownOpen)}>
        Edit
        {editDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleEditUndo}>Undo</button>
            <button onClick={handleEditRedo}>Redo</button>
            <button onClick={handleEditCut}>Cut</button>
            <button onClick={handleEditCopy}>Copy</button>
            <button onClick={handleEditPaste}>Paste</button>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => setSelectionDropdownOpen(!selectionDropdownOpen)}>
        Selection
        {selectionDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleSelectionAll}>Select All</button>
            <button onClick={handleSelectionNone}>Select None</button>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => setViewDropdownOpen(!viewDropdownOpen)}>
        View
        {viewDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleViewZoomIn}>Zoom In</button>
            <button onClick={handleViewZoomOut}>Zoom Out</button>
            <button onClick={handleViewReset}>Reset View</button>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}>
        Help
        {helpDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleHelpAbout}>About</button>
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
        <div className="lang-select">
          <span>Language:</span>
          <div className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>{selectedLang}</span>
              <span className="arrow">▾</span>
            </button>
            <div className="dropdown-menu">
              {languages.map((lang) => (
                <button key={lang} onClick={() => handleLanguageSelect(lang)}>{lang}</button>
              ))}
            </div>
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
