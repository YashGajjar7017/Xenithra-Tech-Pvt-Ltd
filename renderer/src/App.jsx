import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './css/index.css'
import 'boxicons/css/boxicons.min.css'
import Topbar from './components/Topbar/Topbar'
import Toolbar from './components/Topbar/Toolbar'
import Sidebar from './components/Sidebar/Sidebar'
import SettingsModal from './components/ui/SettingsModal'
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal'
import ShareGistModal from './components/ui/ShareGistModal'
import LiveShareModal from './components/ui/LiveShareModal'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

const MainApp = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'vscode-dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(230)

  // Sync theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen to menu events
  useEffect(() => {
    if (window.api && typeof window.api.onToggleTheme === 'function') {
      window.api.onToggleTheme(() => {
        setTheme(prev => {
          const themes = ['vscode-dark', 'github-dark', 'glass-dark', 'glass-light', 'neon-purple', 'emerald', 'cyber-amber']
          const nextIdx = (themes.indexOf(prev) + 1) % themes.length
          return themes[nextIdx]
        })
      })
    }
  }, [])

  // Resolve backend port dynamically on mount
  useEffect(() => {
    if (window.api && typeof window.api.getApiPort === 'function') {
      window.api.getApiPort().then(port => {
        console.log('[App] Resolved backend API port:', port)
        localStorage.setItem('api-port', port)
      }).catch(err => {
        console.error('[App] Failed to get API port:', err)
      })
    }

    if (window.api && typeof window.api.onOpenFiles === 'function') {
      window.api.onOpenFiles((files) => {
        if (files && files.length) {
          const file = files[0]
          const filename = file.name || file.path.split(/[\\/]/).pop()
          const fileCode = file.content
          window.dispatchEvent(new CustomEvent('open-file', {
            detail: { filename, code: fileCode, path: file.path }
          }))
        }
      })
    }

    if (window.api && typeof window.api.onOpenDirectory === 'function') {
      window.api.onOpenDirectory((dirResult) => {
        if (dirResult) {
          window.dispatchEvent(new CustomEvent('open-directory', {
            detail: dirResult
          }))
        }
      })
    }

    if (window.api && typeof window.api.onDeepLinkToken === 'function') {
      window.api.onDeepLinkToken((data) => {
        console.log('[App] Deep link token received:', data)
        if (data && data.token) {
          const userData = {
            token: data.token,
            username: 'Authenticated User',
            loginTime: new Date().toISOString()
          }
          localStorage.setItem('user', JSON.stringify(userData))
          window.dispatchEvent(new CustomEvent('auth-token-received', { detail: userData }))
          if (window.location.hash.includes('login') || window.location.hash.includes('signup')) {
            window.location.hash = '#/'
          }
        }
      })
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/Account/login" element={<LoginPage />} />
        <Route path="/Account/signup" element={<SignupPage />} />
        <Route 
          path="/Dashboard" 
          element={
            <MainLayout 
              theme={theme} 
              setTheme={setTheme} 
              sidebarCollapsed={sidebarCollapsed} 
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <DashboardPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/*" 
          element={
            <MainLayout 
              theme={theme} 
              setTheme={setTheme} 
              sidebarCollapsed={sidebarCollapsed} 
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <EditorPage theme={theme} setTheme={setTheme} />
            </MainLayout>
          } 
        />
      </Routes>
    </Router>
  )
}

// Main Layout Component - Wraps pages with Activity Bar, Sidebar, Workspace, and Status Bar
const MainLayout = ({ 
  children, 
  theme, 
  setTheme, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  sidebarWidth,
  setSidebarWidth 
}) => {
  const [filename, setFilename] = useState('index.html')
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [activeActivity, setActiveActivity] = useState('explorer')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState(false)
  const [isShareGistOpen, setIsShareGistOpen] = useState(false)
  const [isLiveShareOpen, setIsLiveShareOpen] = useState(false)

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true)
    const handleOpenKeybindings = () => setIsKeybindingsOpen(true)
    const handleShareGist = () => setIsShareGistOpen(true)
    const handleLiveShare = () => setIsLiveShareOpen(true)

    window.addEventListener('open-settings', handleOpenSettings)
    window.addEventListener('open-keybindings', handleOpenKeybindings)
    window.addEventListener('menu-share-gist', handleShareGist)
    window.addEventListener('menu-live-share', handleLiveShare)

    return () => {
      window.removeEventListener('open-settings', handleOpenSettings)
      window.removeEventListener('open-keybindings', handleOpenKeybindings)
      window.removeEventListener('menu-share-gist', handleShareGist)
      window.removeEventListener('menu-live-share', handleLiveShare)
    }
  }, [])

  // Ctrl+K Ctrl+S shortcut listener
  useEffect(() => {
    let ctrlKPressed = false
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        ctrlKPressed = true
        setTimeout(() => { ctrlKPressed = false }, 1200)
      } else if (ctrlKPressed && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        ctrlKPressed = false
        setIsKeybindingsOpen(true)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Auth Redirect Guard (Temporarily bypassed)
  // useEffect(() => {
  //   const user = localStorage.getItem('user')
  //   if (!user) {
  //     window.location.href = '/#/Account/login'
  //   }
  // }, [])

  const handleSidebarMouseDown = (e) => {
    e.preventDefault()
    setIsResizingSidebar(true)
    const startX = e.clientX
    const startWidth = sidebarWidth

    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(150, Math.min(500, startWidth + (moveEvent.clientX - startX)))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizingSidebar(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleActivityClick = (activity) => {
    if (activeActivity === activity) {
      setSidebarCollapsed(prev => !prev)
    } else {
      setActiveActivity(activity)
      setSidebarCollapsed(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        window.dispatchEvent(new CustomEvent('open-file', {
          detail: { 
            filename: file.name, 
            code: event.target.result 
          }
        }))
      }
      reader.readAsText(file)
    }
  }

  return (
    <div 
      className="ide-container" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}
    >
      {/* Animated Prism Blurs for Glassmorphism Depth */}
      <div className="prism-bg">
        <div className="prism-orb prism-orb-1"></div>
        <div className="prism-orb prism-orb-2"></div>
        <div className="prism-orb prism-orb-3"></div>
      </div>

      {/* TOP SLIM MENU BAR */}
      <Topbar 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        setTheme={setTheme}
        filename={filename}
        setFilename={setFilename}
      />

      {/* SECONDARY TOOLBAR */}
      <Toolbar theme={theme} setTheme={setTheme} />

      <div className="app" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT ACTIVITY BAR */}
        <div className="activity-bar">
          <div 
            className={`activity-icon ${activeActivity === 'explorer' ? 'active' : ''}`}
            onClick={() => handleActivityClick('explorer')}
            title="Explorer"
          >
            <i className="bx bx-folder" style={{ fontSize: '20px' }}></i>
          </div>
          <div 
            className={`activity-icon ${activeActivity === 'search' ? 'active' : ''}`}
            onClick={() => handleActivityClick('search')}
            title="Search"
          >
            <i className="bx bx-search" style={{ fontSize: '20px' }}></i>
          </div>
          <div 
            className={`activity-icon ${activeActivity === 'git' ? 'active' : ''}`}
            onClick={() => handleActivityClick('git')}
            title="Source Control"
          >
            <i className="bx bx-git-branch" style={{ fontSize: '20px' }}></i>
          </div>
          <div 
            className={`activity-icon ${activeActivity === 'debug' ? 'active' : ''}`}
            onClick={() => handleActivityClick('debug')}
            title="Run & Debug"
          >
            <i className="bx bx-bug" style={{ fontSize: '20px' }}></i>
          </div>
          <div 
            className={`activity-icon ${activeActivity === 'extensions' ? 'active' : ''}`}
            onClick={() => handleActivityClick('extensions')}
            title="Extensions Store"
          >
            <i className="bx bx-extension" style={{ fontSize: '20px' }}></i>
          </div>
          <div 
            className={`activity-icon ${activeActivity === 'docker' ? 'active' : ''}`}
            onClick={() => handleActivityClick('docker')}
            title="Docker Container Manager"
          >
            <span style={{ fontSize: '18px' }}>🐳</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div 
            className={`activity-icon ${activeActivity === 'settings' ? 'active' : ''}`}
            onClick={() => setIsSettingsOpen(true)}
            title="Settings Control"
          >
            <i className="bx bx-cog" style={{ fontSize: '20px' }}></i>
          </div>
        </div>

        {/* SIDEBAR PANEL */}
        <Sidebar collapsed={sidebarCollapsed} sidebarWidth={sidebarWidth} activeActivity={activeActivity} />

        {/* DRAGGABLE DIVIDER (SIZING BAR) */}
        {!sidebarCollapsed && (
          <div 
            className={`resizer-v ${isResizingSidebar ? 'resizing' : ''}`} 
            onMouseDown={handleSidebarMouseDown} 
          />
        )}

        {/* MAIN WORKSPACE */}
        <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>

      {/* BOTTOM SLIM STATUS BAR */}
      <div className="status-bar">
        <div className="status-item">
          <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>🌿 main</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>✗ 0</span>
          <span>⚠ 0</span>
        </div>
        <div className="status-item">
          <span>JavaScript</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Spaces: 2</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ textTransform: 'capitalize' }}>Theme: {theme.replace('-', ' ')}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ color: 'var(--accent-color)' }}>GLM-4 Connection: Active</span>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme} 
        setTheme={setTheme} 
      />

      <KeyboardShortcutsModal 
        isOpen={isKeybindingsOpen} 
        onClose={() => setIsKeybindingsOpen(false)} 
      />

      <ShareGistModal 
        isOpen={isShareGistOpen} 
        onClose={() => setIsShareGistOpen(false)} 
      />

      <LiveShareModal 
        isOpen={isLiveShareOpen} 
        onClose={() => setIsLiveShareOpen(false)} 
      />
    </div>
  )
}

export default MainApp