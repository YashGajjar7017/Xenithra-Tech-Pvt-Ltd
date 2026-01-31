import React, { useState } from 'react'
import '../../css/Topbar.css'

function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        <h2>Code Editor</h2>
      </div>
      <div className="topbar-right">
        <button className="btn btn-primary">Run</button>
        <button className="btn btn-secondary">Debug</button>
        <button className="btn btn-secondary">Save</button>
      </div>
    </header>
  )
}

export default Topbar
