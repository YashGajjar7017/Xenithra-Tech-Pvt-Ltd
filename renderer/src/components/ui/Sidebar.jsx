import React from 'react'

const Sidebar = () => {
  return (
    <div className="sidebar" id="sidebar">
      <div className="logo">
        <div className="logo-box">⚡</div>
        <span id="logoText">Xenithra Technologics</span>
      </div>
      <div className="collapsed-icons" id="collapsedIcons">
        <button className="collapsed-icon" data-page="dashboard" title="Dashboard">
          📊
        </button>
        <button className="collapsed-icon" data-page="projects" title="Projects">
          📁
        </button>
        <button className="collapsed-icon" data-page="snippets" title="Snippets">
          📝
        </button>
        <button className="collapsed-icon" data-page="playground" title="Playground">
          🎮
        </button>
      </div>
      <div className="sidebar-content" id="sidebarContent">
        <div className="subtitle">Frosted neon playground for modern C/C++ builds.</div>
        <div className="pill-label">Workspace</div>
        <button>Open Folder</button>
        <button>Dashboard</button>
        <button>Projects</button>
        <button>Snippets</button>
        <button>Playground</button>
      </div>
      <div className="user-section" id="userSection" style={{ display: 'none' }}>
        <div className="user-info">
          <div className="user-logo">👤</div>
          <span className="user-name">John Doe</span>
        </div>
        <div className="pill-label" style={{ marginTop: '14px' }}>
          Account
        </div>
        <button>Profile</button>
        <button>Settings</button>
        <button>Logout</button>
      </div>
    </div>
  )
}

export default Sidebar
