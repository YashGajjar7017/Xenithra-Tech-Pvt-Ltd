import { useState } from 'react'
import { sidebarStyles } from './sidebarStyles'

const Sidebar = ({ collapsed }) => {
  const [activeItem, setActiveItem] = useState('home')

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'projects', label: 'Projects', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div style={{ ...sidebarStyles.sidebar, width: collapsed ? '60px' : '230px' }}>
      <div style={sidebarStyles.logo}>
        <div style={sidebarStyles.logoBox}>X</div>
        {!collapsed && <span>Xenithra</span>}
      </div>

      {!collapsed && <div style={sidebarStyles.subtitle}>Technologies</div>}

      {!collapsed && <div style={sidebarStyles.pillLabel}>Main</div>}

      <div style={sidebarStyles.buttonGroup}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...sidebarStyles.button,
              background:
                activeItem === item.id
                  ? 'rgba(0, 229, 255, 0.2)'
                  : 'radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.15), rgba(6, 10, 30, 0.94))'
            }}
            onClick={() => setActiveItem(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span>{item.icon}</span>
            {!collapsed && <span style={{ marginLeft: '8px' }}>{item.label}</span>}
          </button>
        ))}
      </div>

      {!collapsed && <div style={sidebarStyles.pillLabel}>Tools</div>}

      <div style={sidebarStyles.buttonGroup}>
        <button style={sidebarStyles.button} title={collapsed ? 'Terminal' : ''}>
          <span>💻</span>
          {!collapsed && <span style={{ marginLeft: '8px' }}>Terminal</span>}
        </button>
        <button style={sidebarStyles.button} title={collapsed ? 'Extensions' : ''}>
          <span>🔌</span>
          {!collapsed && <span style={{ marginLeft: '8px' }}>Extensions</span>}
        </button>
      </div>

      <div style={sidebarStyles.userSection}>
        <div style={sidebarStyles.userInfo}>
          <div style={sidebarStyles.userLogo}>👤</div>
          {!collapsed && <div style={sidebarStyles.userName}>User</div>}
        </div>
      </div>

      {collapsed && (
        <div style={sidebarStyles.collapsedIcons}>
          <div style={sidebarStyles.collapsedIcon}>⚙️</div>
          <div style={sidebarStyles.collapsedIcon}>🔔</div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
