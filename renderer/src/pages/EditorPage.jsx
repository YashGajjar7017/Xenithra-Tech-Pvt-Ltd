import React from 'react'
import Sidebar from '@components/Sidebar'
import Topbar from '@components/Topbar'
import Editor from '@components/Editor'
import Terminal from '@components/Terminal'
import Bottom from '@components/Bottom'
import '../styles/EditorLayout.css'

function EditorPage() {
  return (
    <div className="editor-layout">
      <Sidebar />
      <div className="editor-main">
        <Topbar />
        <div className="editor-body">
          <Editor />
          <Terminal />
        </div>
        <Bottom />
      </div>
    </div>
  )
}

export default EditorPage
