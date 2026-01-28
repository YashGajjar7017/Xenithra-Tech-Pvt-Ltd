import React, { useState } from 'react'
import '../styles/Sidebar.css'

function Sidebar() {
  const [activeItem, setActiveItem] = useState('home')

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'projects', label: 'Projects', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Xenithra</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => setActiveItem(item.id)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
