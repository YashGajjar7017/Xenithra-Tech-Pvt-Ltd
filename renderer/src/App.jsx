import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './css/index.css'
import Topbar from './components/Topbar/Topbar'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

const MainApp = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'glass-dark')
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
          const themes = ['glass-dark', 'glass-light', 'neon-purple', 'emerald', 'cyber-amber']
          const nextIdx = (themes.indexOf(prev) + 1) % themes.length
          return themes[nextIdx]
        })
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

// Main Layout Component - Wraps pages with navbar, sidebar and prism blur backgrounds
const MainLayout = ({ 
  children, 
  theme, 
  setTheme, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  sidebarWidth,
  setSidebarWidth 
}) => {
  const [filename, setFilename] = useState('untitled.js')
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)

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

  return (
    <>
      <Topbar 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        setTheme={setTheme}
        filename={filename}
        setFilename={setFilename}
      />
      <div className="app">
        {/* Animated Prism Blurs for Glassmorphism Depth */}
        <div className="prism-bg">
          <div className="prism-orb prism-orb-1"></div>
          <div className="prism-orb prism-orb-2"></div>
          <div className="prism-orb prism-orb-3"></div>
        </div>

        <div className="shell">
          <Sidebar collapsed={sidebarCollapsed} sidebarWidth={sidebarWidth} />
          {!sidebarCollapsed && (
            <div 
              className={`resizer-v ${isResizingSidebar ? 'resizing' : ''}`} 
              onMouseDown={handleSidebarMouseDown} 
            />
          )}
          <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default MainApp