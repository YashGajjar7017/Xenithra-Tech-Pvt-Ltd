import React from 'react'
import '../styles/Bottom.css'

function Bottom() {
  return (
    <footer className="bottom-bar">
      <div className="status-info">
        <span className="status-item">Line: 1 | Column: 1</span>
        <span className="status-item">Encoding: UTF-8</span>
        <span className="status-item">Language: JavaScript</span>
      </div>
      <div className="status-actions">
        <button className="status-btn">🔔</button>
        <button className="status-btn">⚙️</button>
      </div>
    </footer>
  )
}

export default Bottom
