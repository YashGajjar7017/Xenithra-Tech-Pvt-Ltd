import React from 'react'
import '../styles/Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Explorer</h3>
      </div>
      <div className="sidebar-content">
        <ul className="file-tree">
          <li className="file-item">
            <span className="file-icon">📁</span>
            src
          </li>
          <li className="file-item">
            <span className="file-icon">📄</span>
            index.js
          </li>
          <li className="file-item">
            <span className="file-icon">📄</span>
            App.js
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
