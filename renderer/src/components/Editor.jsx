import React, { useState } from 'react'
import '../styles/Editor.css'

function Editor() {
  const [code, setCode] = useState('// Start coding here...\nconsole.log("Hello World");')

  const handleCodeChange = (e) => {
    setCode(e.target.value)
  }

  const handleRun = () => {
    console.log('Running code:', code)
    // Add execution logic here
  }

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button className="btn btn-success" onClick={handleRun}>
          ▶ Run
        </button>
        <button className="btn btn-secondary">🐞 Debug</button>
        <button className="btn btn-secondary">Share</button>
        <button className="btn btn-secondary">Format</button>
        <button className="btn btn-secondary">Save</button>
      </div>
      <div className="editor-wrapper">
        <textarea
          className="code-editor"
          value={code}
          onChange={handleCodeChange}
          spellCheck="false"
          placeholder="Enter your code here..."
        />
      </div>
    </div>
  )
}

export default Editor
