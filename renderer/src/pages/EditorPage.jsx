import React from 'react'
import Sidebar from '@components/ui/Sidebar'
import Topbar from '@components/ui/Topbar'
import Editor from '@components/ui/Editor'
import Terminal from '@components/ui/Terminal'
import Bottom from '@components/ui/Bottom'
import '@styles/EditorLayout.css'

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
