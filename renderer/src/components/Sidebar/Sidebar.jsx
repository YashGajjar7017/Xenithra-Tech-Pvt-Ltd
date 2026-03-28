import { useState, useEffect } from 'react'
import { sidebarStyles } from './sidebarStyles'

const Sidebar = ({ collapsed }) => {
  const [activeItem, setActiveItem] = useState('home')
  const [folderPath, setFolderPath] = useState('')
  const [folderContents, setFolderContents] = useState([])
  const [expandedDirs, setExpandedDirs] = useState({})

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'open-folder', label: 'Open Folder', icon: '📁' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  // Handle Open Folder - simulate file browser
  const handleOpenFolder = () => {
    // In Electron, this would use ipcRenderer
    // For web, we can use the File System Access API
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('open-folder-dialog').then(result => {
        if (result && !result.cancelled) {
          setFolderPath(result.filePaths[0])
          setActiveItem('open-folder')
          loadFolderContents(result.filePaths[0])
        }
      })
    } else {
      // Fallback: just show a message
      alert('Using fallback: Folder dialog - Set folder path')
      setFolderPath('C:/Users/Projects/MyApp')
      setActiveItem('open-folder')
      loadFolderContents('C:/Users/Projects/MyApp')
    }
  }

  // Mock folder loading
  const loadFolderContents = (path) => {
    // Simulate folder structure
    const mockContents = [
      { name: 'src', isDir: true },
      { name: 'public', isDir: true },
      { name: 'README.md', isDir: false },
      { name: 'package.json', isDir: false },
      { name: '.gitignore', isDir: false },
      { name: 'node_modules', isDir: true }
    ]
    setFolderContents(mockContents)
  }

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId)
    
    if (itemId === 'open-folder') {
      handleOpenFolder()
    } else if (itemId === 'dashboard') {
      window.location.href = '/#/Dashboard'
    } else if (itemId === 'settings') {
      console.log('Settings clicked')
    }
  }

  const toggleDirExpand = (dirName) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirName]: !prev[dirName]
    }))
  }

  const handleFileClick = (fileName) => {
    // In a real app, this would open the file in the editor
    console.log('File clicked:', fileName)
    // Dispatch event to editor to open file
    window.dispatchEvent(new CustomEvent('open-file', { detail: { fileName } }))
  }

  return (
    <div style={{ ...sidebarStyles.sidebar, width: collapsed ? '60px' : '230px' }}>
      <div style={sidebarStyles.logo}>
        <div style={sidebarStyles.logoBox}>X</div>
        {!collapsed && <span>Xenithra</span>}
      </div>

      {!collapsed && <div style={sidebarStyles.subtitle}>Technologies</div>}

      {!collapsed && <div style={sidebarStyles.pillLabel}>Explorer</div>}

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
            onClick={() => handleMenuClick(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span>{item.icon}</span>
            {!collapsed && <span style={{ marginLeft: '8px' }}>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Folder Contents */}
      {!collapsed && folderPath && (
        <>
          <div style={{ ...sidebarStyles.pillLabel, marginTop: '12px' }}>Explorer</div>
          <div style={{ 
            fontSize: '10px', 
            padding: '8px', 
            opacity: 0.7,
            wordBreak: 'break-all',
            marginBottom: '10px'
          }}>
            📂 {folderPath.split('\\').pop() || folderPath.split('/').pop()}
          </div>
          
          <div style={{
            fontSize: '11px',
            maxHeight: '300px',
            overflowY: 'auto',
            paddingLeft: '8px'
          }}>
            {folderContents.map((item, idx) => (
              <div key={idx}>
                {item.isDir ? (
                  <>
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '4px',
                        hover: { background: 'rgba(255,255,255,0.1)' }
                      }}
                      onClick={() => toggleDirExpand(item.name)}
                    >
                      {expandedDirs[item.name] ? '▼' : '▶'} 📁 {item.name}
                    </div>
                    {expandedDirs[item.name] && (
                      <div style={{ paddingLeft: '16px', color: '#aaa' }}>
                        <div style={{ padding: '2px', cursor: 'pointer' }}>📄 file.js</div>
                        <div style={{ padding: '2px', cursor: 'pointer' }}>📄 file2.js</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      cursor: 'pointer',
                      padding: '4px',
                      paddingLeft: '16px'
                    }}
                    onClick={() => handleFileClick(item.name)}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    📄 {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!collapsed && (
        <>
          <div style={sidebarStyles.pillLabel}>Tools</div>
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
        </>
      )}

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
