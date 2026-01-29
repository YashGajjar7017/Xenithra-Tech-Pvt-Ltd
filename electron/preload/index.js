import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Suppress specific DevTools errors
const originalConsoleError = console.error
console.error = (...args) => {
  const errorMessage = args.join(' ')
  if (
    errorMessage.includes('Autofill.enable') ||
    errorMessage.includes('Autofill.setAddresses') ||
    errorMessage.includes('Unexpected token \'H\'') ||
    errorMessage.includes('is not valid JSON')
  ) {
    return // Suppress these errors
  }
  originalConsoleError(...args)
}

const api = {
  // Renderer can register callbacks for messages from main
  onOpenFiles: (cb) => ipcRenderer.on('open-files', (_event, files) => cb(files)),
  onToggleTheme: (cb) => ipcRenderer.on('toggle-theme', () => cb())
}

// Expose APIs to renderer. Prefer contextBridge when available (recommended).
try {
  if (contextBridge && typeof contextBridge.exposeInMainWorld === 'function') {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } else {
    // Fallback for older environments / tests
    window.electron = electronAPI
    window.api = api
  }
} catch (error) {
  console.error('Preload expose error:', error)
}
