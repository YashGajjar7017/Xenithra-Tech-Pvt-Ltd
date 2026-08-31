import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import PreferencesPage from './pages/PreferencesPage'
import OcrPage from './pages/OcrPage'
import AiColabStudioPage from './pages/AiColabStudioPage'
import DsaStudioPage from './pages/DsaStudioPage'
import CodeArenaPage from './pages/CodeArenaPage'
import CDllStudioPage from './pages/CDllStudioPage'
import FooterEnvSelector from './components/ui/FooterEnvSelector'

const MainApp = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'github-dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth')
    return saved ? parseInt(saved, 10) : 230
  })

  // Sync theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen to menu events
  useEffect(() => {
    if (window.api && typeof window.api.onToggleTheme === 'function') {
      window.api.onToggleTheme(() => {
        setTheme((prev) => {
          const themes = [
            'vscode-dark',
            'github-dark',
            'glass-dark',
            'glass-light',
            'neon-purple',
            'emerald',
            'cyber-amber'
          ]
          const nextIdx = (themes.indexOf(prev) + 1) % themes.length
          return themes[nextIdx]
        })
      })
    }
  }, [])

  // Resolve backend port dynamically on mount
  useEffect(() => {
    if (window.api && typeof window.api.getApiPort === 'function') {
      window.api
        .getApiPort()
        .then((port) => {
          console.log('[App] Resolved backend API port:', port)
          localStorage.setItem('api-port', port)
        })
        .catch((err) => {
          console.error('[App] Failed to get API port:', err)
        })
    }

    if (window.api && typeof window.api.onOpenFiles === 'function') {
      window.api.onOpenFiles((files) => {
        if (files && files.length) {
          const file = files[0]
          const filename = file.name || file.path.split(/[\\/]/).pop()
          const fileCode = file.content
          window.dispatchEvent(
            new CustomEvent('open-file', {
              detail: { filename, code: fileCode, path: file.path }
            })
          )
        }
      })
    }

    if (window.api && typeof window.api.onOpenDirectory === 'function') {
      window.api.onOpenDirectory((dirResult) => {
        if (dirResult) {
          window.dispatchEvent(
            new CustomEvent('open-directory', {
              detail: dirResult
            })
          )
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
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route
          path="/ocr"
          element={
            <MainLayout
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <OcrPage />
            </MainLayout>
          }
        />
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
          path="/ai-colab"
          element={
            <MainLayout
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <AiColabStudioPage />
            </MainLayout>
          }
        />
        <Route
          path="/dsa-studio"
          element={
            <MainLayout
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <DsaStudioPage />
            </MainLayout>
          }
        />
        <Route
          path="/code-arena"
          element={
            <MainLayout
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <CodeArenaPage />
            </MainLayout>
          }
        />
        <Route
          path="/c-dll-studio"
          element={
            <MainLayout
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
            >
              <CDllStudioPage />
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
  const location = useLocation()
  const isAiColab =
    location.pathname === '/ai-colab' ||
    location.pathname === '/dsa-studio' ||
    location.pathname === '/code-arena' ||
    location.pathname === '/c-dll-studio'

  const defaultOrder = [
    'explorer',
    'search',
    'git',
    'debug',
    'cdllstudio',
    'aicolab',
    'dsastudio',
    'codearena',
    'extensions',
    'docker',
    'firebase',
    'clients',
    'webrtc'
  ]

  const [activityOrder, setActivityOrder] = useState(() => {
    const saved = localStorage.getItem('activity-order')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all default items are present in case they were added in newer versions
        const merged = [...parsed]
        defaultOrder.forEach((item) => {
          if (!merged.includes(item)) {
            merged.push(item)
          }
        })
        return merged
      } catch (e) {
        return defaultOrder
      }
    }
    return defaultOrder
  })

  const [colabTransitionActive, setColabTransitionActive] = useState(false)

  const triggerColabTransition = () => {
    if (location.pathname === '/ai-colab') return
    setColabTransitionActive(true)
    setTimeout(() => {
      window.location.hash = '#/ai-colab'
      setActiveActivity('aicolab')
    }, 600)
    setTimeout(() => {
      setColabTransitionActive(false)
    }, 1200)
  }

  const handleMoveActivity = (index, direction, e) => {
    e.stopPropagation()
    const newOrder = [...activityOrder]
    if (direction === 'up' && index > 0) {
      const temp = newOrder[index]
      newOrder[index] = newOrder[index - 1]
      newOrder[index - 1] = temp
    } else if (direction === 'down' && index < newOrder.length - 1) {
      const temp = newOrder[index]
      newOrder[index] = newOrder[index + 1]
      newOrder[index + 1] = temp
    }
    setActivityOrder(newOrder)
    localStorage.setItem('activity-order', JSON.stringify(newOrder))
  }

  const [filename, setFilename] = useState('index.html')
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [activeActivity, setActiveActivity] = useState('explorer')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState(false)
  const [isShareGistOpen, setIsShareGistOpen] = useState(false)
  const [isLiveShareOpen, setIsLiveShareOpen] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState('Node.js')

  useEffect(() => {
    const handleLangSync = (e) => {
      if (e.detail && e.detail.language) {
        setActiveLanguage(e.detail.language)
      }
    }
    window.addEventListener('change-language', handleLangSync)
    return () => window.removeEventListener('change-language', handleLangSync)
  }, [])

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
        setTimeout(() => {
          ctrlKPressed = false
        }, 1200)
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
      localStorage.setItem('sidebarWidth', newWidth.toString())
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
      setSidebarCollapsed((prev) => !prev)
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
        window.dispatchEvent(
          new CustomEvent('open-file', {
            detail: {
              filename: file.name,
              code: event.target.result
            }
          })
        )
      }
      reader.readAsText(file)
    }
  }

  return (
    <div
      className="ide-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Animated Prism Blurs for Glassmorphism Depth */}
      <div className="prism-bg">
        <div className="prism-orb prism-orb-1"></div>
        <div className="prism-orb prism-orb-2"></div>
        <div className="prism-orb prism-orb-3"></div>
      </div>

      {colabTransitionActive && (
        <div className="colab-sexy-transition">
          <div className="portal-ring"></div>
          <div className="scanline"></div>
          <div className="transition-text">INITIALIZING AI COLLAB STUDIO</div>
          <div className="grid-overlay"></div>
        </div>
      )}

      {/* TOP SLIM MENU BAR */}
      {!isAiColab && (
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          setTheme={setTheme}
          filename={filename}
          setFilename={setFilename}
        />
      )}

      {/* SECONDARY TOOLBAR */}
      {!isAiColab && <Toolbar theme={theme} setTheme={setTheme} />}

      <div className="app" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT ACTIVITY BAR */}
        {!isAiColab && (
          <div className="activity-bar">
            {activityOrder.map((activity, index) => {
              const isFirst = index === 0
              const isLast = index === activityOrder.length - 1

              const getIconDetails = () => {
                switch (activity) {
                  case 'explorer':
                    return {
                      title: 'Explorer',
                      element: <i className="bx bx-folder" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('explorer')
                    }
                  case 'search':
                    return {
                      title: 'Search',
                      element: <i className="bx bx-search" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('search')
                    }
                  case 'git':
                    return {
                      title: 'Source Control',
                      element: <i className="bx bx-git-branch" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('git')
                    }
                  case 'debug':
                    return {
                      title: 'Run & Debug',
                      element: <i className="bx bx-bug" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('debug')
                    }
                  case 'aicolab':
                    return {
                      title: 'AI Colab Studio',
                      element: (
                        <>
                          <span style={{ fontSize: '18px', color: '#00f3ff' }}>⚡</span>
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#00f3ff',
                              boxShadow: '0 0 6px #00f3ff'
                            }}
                          />
                        </>
                      ),
                      onClick: () => triggerColabTransition()
                    }
                  case 'dsastudio':
                    return {
                      title: 'DSA Play & Step Compile Studio',
                      element: (
                        <>
                          <i className="bx bx-code-block" style={{ fontSize: '20px', color: '#ff4d4f' }}></i>
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#ff4d4f',
                              boxShadow: '0 0 6px #ff4d4f'
                            }}
                          />
                        </>
                      ),
                      onClick: () => {
                        window.location.hash = '#/dsa-studio'
                      }
                    }
                  case 'codearena':
                    return {
                      title: 'Code Arena 1v1 PvP',
                      element: (
                        <>
                          <i className="bx bx-trophy" style={{ fontSize: '20px', color: '#a78bfa' }}></i>
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#a78bfa',
                              boxShadow: '0 0 6px #a78bfa'
                            }}
                          />
                        </>
                      ),
                      onClick: () => {
                        window.location.hash = '#/code-arena'
                      }
                    }
                  case 'cdllstudio':
                    return {
                      title: 'C to DLL MinGW Studio',
                      element: (
                        <>
                          <i className="bx bx-cog" style={{ fontSize: '20px', color: '#00f3ff' }}></i>
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#00f3ff',
                              boxShadow: '0 0 6px #00f3ff'
                            }}
                          />
                        </>
                      ),
                      onClick: () => {
                        window.location.hash = '#/c-dll-studio'
                      }
                    }
                  case 'extensions':
                    return {
                      title: 'Extensions Store',
                      element: <i className="bx bx-extension" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('extensions')
                    }
                  case 'docker':
                    return {
                      title: 'Docker Container Manager',
                      element: <i className="bx bxl-docker" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('docker')
                    }
                  case 'firebase':
                    return {
                      title: 'Firebase Explorer & Console',
                      element: <i className="bx bxl-firebase" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('firebase')
                    }
                  case 'clients':
                    return {
                      title: 'TCP Clients Pairing',
                      element: <i className="bx bx-devices" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('clients')
                    }
                  case 'webrtc':
                    return {
                      title: 'WebRTC Collaboration',
                      element: <i className="bx bx-share-alt" style={{ fontSize: '20px' }}></i>,
                      onClick: () => handleActivityClick('webrtc')
                    }
                  default:
                    return null
                }
              }

              const details = getIconDetails()
              if (!details) return null

              return (
                <div
                  key={activity}
                  className={`activity-icon ${activeActivity === activity ? 'active' : ''}`}
                  onClick={details.onClick}
                  title={details.title}
                  style={{ position: 'relative' }}
                >
                  {details.element}
                  
                  {/* Reordering Controls Overlay on Hover */}
                  <div className="reorder-buttons">
                    {!isFirst && (
                      <button
                        className="reorder-btn"
                        onClick={(e) => handleMoveActivity(index, 'up', e)}
                        title="Move Up"
                      >
                        ▲
                      </button>
                    )}
                    {!isLast && (
                      <button
                        className="reorder-btn"
                        onClick={(e) => handleMoveActivity(index, 'down', e)}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <div style={{ flex: 1 }}></div>
            <div
              className={`activity-icon ${activeActivity === 'settings' ? 'active' : ''}`}
              onClick={() => setIsSettingsOpen(true)}
              title="Settings Control"
            >
              <i className="bx bx-cog" style={{ fontSize: '20px' }}></i>
            </div>
          </div>
        )}

        {/* SIDEBAR PANEL */}
        {!isAiColab && (
          <Sidebar
            collapsed={sidebarCollapsed}
            sidebarWidth={sidebarWidth}
            activeActivity={activeActivity}
          />
        )}

        {/* DRAGGABLE DIVIDER (SIZING BAR) */}
        {!isAiColab && !sidebarCollapsed && (
          <div
            className={`resizer-v ${isResizingSidebar ? 'resizing' : ''}`}
            onMouseDown={handleSidebarMouseDown}
          />
        )}

        {/* MAIN WORKSPACE */}
        <div
          className="main"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
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
        <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FooterEnvSelector />
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Spaces: 2</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ textTransform: 'capitalize' }}>Theme: {theme.replace('-', ' ')}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ color: 'var(--accent-color)' }}>GLM-4 Core: Online</span>
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

      <ShareGistModal isOpen={isShareGistOpen} onClose={() => setIsShareGistOpen(false)} />

      <LiveShareModal isOpen={isLiveShareOpen} onClose={() => setIsLiveShareOpen(false)} />
    </div>
  )
}

export default MainApp
