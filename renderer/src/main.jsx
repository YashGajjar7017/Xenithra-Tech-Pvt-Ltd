import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './MainApp'
import './css/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Listen to main process menu actions (open files, toggle theme)
if (window.api) {
  try {
    window.api.onOpenFiles((files) => {
      console.log('Files opened from menu:', files)
      // TODO: implement handling (open in editor, recent list, etc.)
    })

    window.api.onToggleTheme(() => {
      window.dispatchEvent(new CustomEvent('toggle-theme'))
    })
  } catch (e) {
    console.warn('Renderer API listeners failed', e)
  }
}
