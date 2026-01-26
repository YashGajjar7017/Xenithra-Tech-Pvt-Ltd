import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Beta_Index from './Beta_Index.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ClassroomPage from './classroom.jsx'
import Dashboard_User from './Dashboard_User.jsx'
import Maintenance from './Maintenance.jsx'
import NotFound from './NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Beta_Index />} />
        <Route path="/playground" element={<Beta_Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/classroom" element={<ClassroomPage />} />
        <Route path="/dashboard" element={<Dashboard_User />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
