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
import LicensePage from './pages/LicensePage'

const FeatureGate = ({ featureName, featureKey, licenseStatus, onOpenLicense, children }) => {
  const isLicensed = licenseStatus?.status === 'licensed'
  const isEnabled =
    isLicensed ||
    (licenseStatus?.status !== 'expired' && licenseStatus?.features?.[featureKey] !== false)

  if (!isEnabled && licenseStatus) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
          color: '#e2e8f0',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(87, 147, 255, 0.15) 0%, transparent 70%)',
            top: '20%',
            left: '35%',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '20px',
            background: 'rgba(87, 147, 255, 0.1)',
            border: '1px solid rgba(87, 147, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: '#5793ff',
            marginBottom: '20px',
            boxShadow: '0 0 35px rgba(87, 147, 255, 0.2)'
          }}
        >
          <i className="bx bx-lock-alt"></i>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
          {featureName} is Restricted
        </h2>
        <p
          style={{
            color: '#94a3b8',
            maxWidth: '460px',
            lineHeight: '1.6',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >
          {licenseStatus.status === 'expired'
            ? 'Your 30-day trial has expired. Activate a license to restore full access to all IDE studios.'
            : `${featureName} is exclusive to licensed editions of Xenithra IDE. Activate your license or install your certificate to unlock.`}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onOpenLicense}
            style={{
              background: 'linear-gradient(135deg, #5793ff, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 24px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(87, 147, 255, 0.35)'
            }}
          >
            <i className="bx bx-key"></i> Activate License
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '11px 20px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  return children
}

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
            'cyber-amber',
            'xenithra-dark-pro'
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

  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [licenseStatus, setLicenseStatus] = useState(null)
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(
    sessionStorage.getItem('trial-banner-dismissed') === 'true'
  )

  // Load license status on mount
  useEffect(() => {
    const fetchLicense = async () => {
      try {
        if (window.api && typeof window.api.getLicenseStatus === 'function') {
          const status = await window.api.getLicenseStatus()
          setLicenseStatus(status)
        } else {
          setLicenseStatus({ status: 'trial', type: 'trial', daysLeft: 29 })
        }
      } catch (e) {
        setLicenseStatus({ status: 'trial', type: 'trial', daysLeft: 29 })
      }
    }
    fetchLicense()
    // Re-check after license activation
    const handleActivated = () => {
      fetchLicense()
      setShowLicenseModal(false)
    }
    window.addEventListener('license-activated', handleActivated)
    window.addEventListener('open-license-manager', () => setShowLicenseModal(true))
    return () => {
      window.removeEventListener('license-activated', handleActivated)
      window.removeEventListener('open-license-manager', () => setShowLicenseModal(true))
    }
  }, [])

  const dismissTrialBanner = () => {
    setTrialBannerDismissed(true)
    sessionStorage.setItem('trial-banner-dismissed', 'true')
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/Account/login" element={<LoginPage />} />
          <Route path="/Account/signup" element={<SignupPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/license" element={<LicensePage onClose={() => window.history.back()} />} />
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
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
                trialBannerDismissed={trialBannerDismissed}
                onDismissTrialBanner={dismissTrialBanner}
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
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
                trialBannerDismissed={trialBannerDismissed}
                onDismissTrialBanner={dismissTrialBanner}
              >
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/ai-colab"
            element={
              <FeatureGate
                featureName="AI Colab Studio"
                featureKey="aiColab"
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
              >
                <AiColabStudioPage />
              </FeatureGate>
            }
          />
          <Route
            path="/dsa-studio"
            element={
              <FeatureGate
                featureName="DSA Studio"
                featureKey="dsaStudio"
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
              >
                <DsaStudioPage />
              </FeatureGate>
            }
          />
          <Route
            path="/code-arena"
            element={
              <FeatureGate
                featureName="Code Arena PvP"
                featureKey="codeArena"
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
              >
                <CodeArenaPage />
              </FeatureGate>
            }
          />
          <Route
            path="/c-dll-studio"
            element={
              <FeatureGate
                featureName="C &rarr; DLL Studio"
                featureKey="cdllStudio"
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
              >
                <CDllStudioPage />
              </FeatureGate>
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
                licenseStatus={licenseStatus}
                onOpenLicense={() => setShowLicenseModal(true)}
                trialBannerDismissed={trialBannerDismissed}
                onDismissTrialBanner={dismissTrialBanner}
              >
                <EditorPage theme={theme} setTheme={setTheme} />
              </MainLayout>
            }
          />
        </Routes>
      </Router>

      {/* Global License Modal */}
      {showLicenseModal && (
        <LicensePage
          onClose={() => setShowLicenseModal(false)}
          onActivated={() => setShowLicenseModal(false)}
        />
      )}
    </>
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
  setSidebarWidth,
  licenseStatus,
  onOpenLicense,
  trialBannerDismissed,
  onDismissTrialBanner
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
          licenseStatus={licenseStatus}
          onOpenLicense={onOpenLicense}
        />
      )}

      {/* SECONDARY TOOLBAR */}
      {!isAiColab && <Toolbar theme={theme} setTheme={setTheme} />}

      {/* 30-DAY TRIAL BANNER */}
      {!isAiColab &&
        licenseStatus &&
        licenseStatus.status !== 'licensed' &&
        !trialBannerDismissed && (
          <div className={`trial-banner ${licenseStatus.status === 'expired' ? 'trial-banner-expired' : ''}`}>
            <div className="trial-banner-msg">
              <i className={`bx ${licenseStatus.status === 'expired' ? 'bx-x-circle' : 'bx-time'}`}></i>
              {licenseStatus.status === 'expired'
                ? <span><strong>Your 30-day trial has expired.</strong> Some features are disabled. Activate a license to restore full access.</span>
                : <span><strong>Trial Mode</strong> — {licenseStatus.daysLeft} days remaining of your 30-day free trial. Unlock all features with a license.</span>
              }
            </div>
            <div className="trial-banner-actions">
              <button
                className={`trial-upgrade-btn ${licenseStatus.status === 'expired' ? 'expired' : ''}`}
                onClick={onOpenLicense}
              >
                {licenseStatus.status === 'expired' ? '🔓 Activate Now' : '⚡ Upgrade'}
              </button>
              {licenseStatus.status !== 'expired' && (
                <button className="trial-dismiss-btn" onClick={onDismissTrialBanner} title="Dismiss for this session">
                  <i className="bx bx-x"></i>
                </button>
              )}
            </div>
          </div>
        )}

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
                          <i className="bx bx-chip" style={{ fontSize: '20px', color: '#00f3ff' }}></i>
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

            {/* Visual Divider distinguishing Settings from Main Activities */}
            <div
              style={{
                width: '32px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
                margin: '6px auto',
                boxShadow: '0 0 6px rgba(0, 243, 255, 0.2)'
              }}
            />

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
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: isAiColab ? '100%' : 'auto',
            width: '100%'
          }}
        >
          {children}
        </div>
      </div>

      {/* BOTTOM SLIM STATUS BAR */}
      {!isAiColab && (
        <div className="status-bar">
          <div className="status-item">
            <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>🌿 main</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>✗ 0</span>
            <span>⚠ 0</span>
          </div>
          <div
            className="status-item"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FooterEnvSelector />
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Spaces: 2</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ textTransform: 'capitalize' }}>Theme: {theme.replace('-', ' ')}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ color: 'var(--accent-color)' }}>GLM-4 Core: Online</span>
          </div>
        </div>
      )}

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
