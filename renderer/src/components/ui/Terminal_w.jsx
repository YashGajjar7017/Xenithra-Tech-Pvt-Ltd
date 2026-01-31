import React, { useState } from 'react'
import '../../css/Terminal.css'

function Terminal() {
  const [logs, setLogs] = useState(['Terminal ready...', '> '])

  const handleClearTerminal = () => {
    setLogs(['Terminal cleared...', '> '])
  }

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>Terminal</h3>
        <button className="btn btn-small" onClick={handleClearTerminal}>
          Clear
        </button>
      </div>
      <div className="terminal-output">
        {logs.map((log, idx) => (
          <div key={idx} className="terminal-line">
            {log}
          </div>
        ))}
      </div>
      <div className="terminal-input">
        <input
          type="text"
          placeholder="Enter command..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setLogs([...logs, e.target.value, '> '])
              e.target.value = ''
            }
          }}
        />
      </div>
    </div>
  )
}

export default Terminal
