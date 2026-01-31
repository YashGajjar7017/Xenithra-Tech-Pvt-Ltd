import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './css/App.css'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import NotFoundPage from './pages/NotFoundPage'

// Layouts
import MainLayout from './layouts/MainLayout'

function App() {
  React.useEffect(() => {
    const handler = () => document.body.classList.toggle('dark-theme')
    window.addEventListener('toggle-theme', handler)
    return () => window.removeEventListener('toggle-theme', handler)
  }, [])
  return (
    <Router>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
