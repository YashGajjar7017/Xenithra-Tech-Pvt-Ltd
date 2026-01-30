import React, { useState } from 'react'
import '../styles/Editor.css'

function Editor() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, World!");')

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="file-name">main.js</span>
        <div className="editor-tabs">
          <button className="tab active">main.js</button>
        </div>
      </div>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code here..."
      />
    </div>
  )
}

export default Editor
