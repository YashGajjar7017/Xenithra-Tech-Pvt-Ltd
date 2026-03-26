/**
 * Comprehensive Button Handler System
 * Centralized handlers for all application buttons and user interactions
 */

import { API_CONFIG } from '../config/api.config'

/**
 * File Menu Handlers
 */
export const fileMenuHandlers = {
  new: async () => {
    try {
      console.log('Creating new file...')
      const filename = prompt('Enter filename:')
      if (!filename) return
      
      // Dispatch event or call API
      const response = await apiCall('POST', `${API_CONFIG.files.create}`, {
        name: filename,
        content: '',
        language: 'javascript'
      })
      
      if (response.success) {
        console.log('File created successfully:', response.data)
        document.dispatchEvent(new CustomEvent('file-created', { detail: response.data }))
      }
    } catch (error) {
      console.error('Error creating file:', error)
      showNotification('Failed to create file', 'error')
    }
  },

  open: async () => {
    try {
      console.log('Opening file dialog...')
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        const reader = new FileReader()
        reader.onload = async (event) => {
          const content = event.target.result
          document.dispatchEvent(new CustomEvent('file-opened', { 
            detail: { name: file.name, content } 
          }))
        }
        reader.readAsText(file)
      }
      input.click()
    } catch (error) {
      console.error('Error opening file:', error)
      showNotification('Failed to open file', 'error')
    }
  },

  save: async () => {
    try {
      console.log('Saving file...')
      const codeContent = document.querySelector('[data-code-editor]')?.textContent || ''
      const filename = document.querySelector('[data-filename]')?.value || 'untitled.js'
      
      const response = await apiCall('POST', `${API_CONFIG.files.create}`, {
        name: filename,
        content: codeContent
      })
      
      if (response.success) {
        showNotification('File saved successfully', 'success')
        document.dispatchEvent(new CustomEvent('file-saved', { detail: response.data }))
      }
    } catch (error) {
      console.error('Error saving file:', error)
      showNotification('Failed to save file', 'error')
    }
  },

  saveAs: async () => {
    try {
      const filename = prompt('Save file as:', 'untitled.js')
      if (!filename) return
      
      const codeContent = document.querySelector('[data-code-editor]')?.textContent || ''
      
      const response = await apiCall('POST', `${API_CONFIG.files.create}`, {
        name: filename,
        content: codeContent
      })
      
      if (response.success) {
        showNotification('File saved successfully', 'success')
        document.dispatchEvent(new CustomEvent('file-saved', { detail: response.data }))
      }
    } catch (error) {
      console.error('Error saving file:', error)
      showNotification('Failed to save file', 'error')
    }
  },

  export: async (format = 'json') => {
    try {
      console.log(`Exporting code as ${format}...`)
      const codeContent = document.querySelector('[data-code-editor]')?.textContent || ''
      
      if (format === 'json') {
        const data = { code: codeContent, timestamp: new Date().toISOString() }
        downloadFile(JSON.stringify(data, null, 2), 'code.json', 'application/json')
      } else if (format === 'txt') {
        downloadFile(codeContent, 'code.txt', 'text/plain')
      }
      
      showNotification('File exported successfully', 'success')
    } catch (error) {
      console.error('Error exporting file:', error)
      showNotification('Failed to export file', 'error')
    }
  },

  exit: () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow()
    } else if (window.ipcRenderer?.invoke) {
      window.ipcRenderer.invoke('close-window')
    } else {
      console.warn('Cannot close window - no API available')
    }
  }
}

/**
 * Edit Menu Handlers
 */
export const editMenuHandlers = {
  undo: () => {
    console.log('Undo')
    document.execCommand('undo')
    document.dispatchEvent(new CustomEvent('editor-change'))
  },

  redo: () => {
    console.log('Redo')
    document.execCommand('redo')
    document.dispatchEvent(new CustomEvent('editor-change'))
  },

  cut: () => {
    console.log('Cut')
    document.execCommand('cut')
  },

  copy: () => {
    console.log('Copy')
    document.execCommand('copy')
  },

  paste: () => {
    console.log('Paste')
    document.execCommand('paste')
    document.dispatchEvent(new CustomEvent('editor-change'))
  },

  selectAll: () => {
    console.log('Select All')
    document.execCommand('selectAll')
  },

  delete: () => {
    console.log('Delete')
    document.execCommand('delete')
    document.dispatchEvent(new CustomEvent('editor-change'))
  }
}

/**
 * View Menu Handlers
 */
export const viewMenuHandlers = {
  zoomIn: () => {
    const currentZoom = parseInt(localStorage.getItem('zoomLevel') || 100)
    const newZoom = Math.min(200, currentZoom + 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = newZoom / 100
    console.log(`Zoom: ${newZoom}%`)
  },

  zoomOut: () => {
    const currentZoom = parseInt(localStorage.getItem('zoomLevel') || 100)
    const newZoom = Math.max(50, currentZoom - 10)
    localStorage.setItem('zoomLevel', newZoom)
    document.documentElement.style.zoom = newZoom / 100
    console.log(`Zoom: ${newZoom}%`)
  },

  resetZoom: () => {
    localStorage.setItem('zoomLevel', 100)
    document.documentElement.style.zoom = 1
    console.log('Zoom reset to 100%')
  },

  toggleSidebar: () => {
    document.dispatchEvent(new CustomEvent('toggle-sidebar'))
  },

  toggleFullscreen: () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(error => {
        console.error('Fullscreen error:', error)
      })
    }
  },

  toggleDarkMode: () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const newTheme = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }))
  }
}

/**
 * Code Compilation Handlers
 */
export const compilerHandlers = {
  run: async () => {
    try {
      console.log('Running code...')
      const code = document.querySelector('[data-code-editor]')?.textContent || ''
      const language = document.querySelector('[data-language-select]')?.value || 'javascript'
      
      const response = await apiCall('POST', API_CONFIG.compiler.execute, {
        code,
        language
      })
      
      if (response.success) {
        console.log('Execution output:', response.data.output)
        document.dispatchEvent(new CustomEvent('code-executed', { 
          detail: { output: response.data.output, error: response.data.error } 
        }))
      }
    } catch (error) {
      console.error('Execution error:', error)
      showNotification('Code execution failed', 'error')
    }
  },

  debug: async () => {
    try {
      console.log('Starting debugger...')
      const code = document.querySelector('[data-code-editor]')?.textContent || ''
      document.dispatchEvent(new CustomEvent('debug-started', { detail: { code } }))
    } catch (error) {
      console.error('Debug error:', error)
      showNotification('Failed to start debugger', 'error')
    }
  },

  stop: () => {
    console.log('Stopping execution...')
    document.dispatchEvent(new CustomEvent('execution-stopped'))
  },

  format: async () => {
    try {
      console.log('Formatting code...')
      const code = document.querySelector('[data-code-editor]')?.textContent || ''
      const language = document.querySelector('[data-language-select]')?.value || 'javascript'
      
      const response = await apiCall('POST', API_CONFIG.compiler.format, {
        code,
        language
      })
      
      if (response.success) {
        document.dispatchEvent(new CustomEvent('code-formatted', { 
          detail: { code: response.data.formatted_code } 
        }))
        showNotification('Code formatted successfully', 'success')
      }
    } catch (error) {
      console.error('Format error:', error)
      showNotification('Failed to format code', 'error')
    }
  },

  analyze: async () => {
    try {
      console.log('Analyzing code...')
      const code = document.querySelector('[data-code-editor]')?.textContent || ''
      const language = document.querySelector('[data-language-select]')?.value || 'javascript'
      
      const response = await apiCall('POST', API_CONFIG.compiler.analyze, {
        code,
        language
      })
      
      if (response.success) {
        document.dispatchEvent(new CustomEvent('code-analyzed', { 
          detail: response.data 
        }))
      }
    } catch (error) {
      console.error('Analysis error:', error)
      showNotification('Failed to analyze code', 'error')
    }
  }
}

/**
 * Authentication Handlers
 */
export const authHandlers = {
  login: async (credentials) => {
    try {
      console.log('Attempting login...')
      const response = await apiCall('POST', API_CONFIG.auth.login, credentials)
      
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        document.dispatchEvent(new CustomEvent('user-logged-in', { detail: response.data }))
        showNotification('Login successful', 'success')
        return response.data
      }
    } catch (error) {
      console.error('Login error:', error)
      showNotification('Login failed', 'error')
      throw error
    }
  },

  signup: async (credentials) => {
    try {
      console.log('Attempting signup...')
      const response = await apiCall('POST', API_CONFIG.auth.signup, credentials)
      
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        document.dispatchEvent(new CustomEvent('user-signed-up', { detail: response.data }))
        showNotification('Signup successful', 'success')
        return response.data
      }
    } catch (error) {
      console.error('Signup error:', error)
      showNotification('Signup failed', 'error')
      throw error
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      document.dispatchEvent(new CustomEvent('user-logged-out'))
      showNotification('Logged out successfully', 'success')
    } catch (error) {
      console.error('Logout error:', error)
      showNotification('Logout failed', 'error')
    }
  },

  github: async () => {
    try {
      console.log('Attempting GitHub login...')
      // This would typically open an OAuth flow
      window.open(`${API_CONFIG.auth.login}?provider=github`, '_blank')
    } catch (error) {
      console.error('GitHub login error:', error)
      showNotification('GitHub login failed', 'error')
    }
  }
}

/**
 * Collaboration Handlers
 */
export const collaborationHandlers = {
  share: async (fileId) => {
    try {
      console.log('Sharing file:', fileId)
      const email = prompt('Enter email to share with:')
      if (!email) return
      
      const response = await apiCall('POST', `${API_CONFIG.files.share(fileId)}`, {
        email
      })
      
      if (response.success) {
        showNotification('File shared successfully', 'success')
      }
    } catch (error) {
      console.error('Share error:', error)
      showNotification('Failed to share file', 'error')
    }
  },

  invite: async (sessionId) => {
    try {
      console.log('Inviting collaborators to session:', sessionId)
      const emails = prompt('Enter emails (comma-separated):')?.split(',') || []
      
      for (const email of emails) {
        const response = await apiCall('POST', API_CONFIG.collaboration.invite, {
          sessionId,
          email: email.trim()
        })
        
        if (!response.success) {
          showNotification(`Failed to invite ${email}`, 'error')
        }
      }
      
      showNotification('Invitations sent', 'success')
    } catch (error) {
      console.error('Invite error:', error)
      showNotification('Failed to send invitations', 'error')
    }
  }
}

/**
 * Classroom Handlers
 */
export const classroomHandlers = {
  create: async () => {
    try {
      const className = prompt('Enter class name:')
      if (!className) return
      
      const response = await apiCall('POST', API_CONFIG.classroom.createClass, {
        name: className
      })
      
      if (response.success) {
        showNotification('Class created successfully', 'success')
        document.dispatchEvent(new CustomEvent('class-created', { detail: response.data }))
      }
    } catch (error) {
      console.error('Create class error:', error)
      showNotification('Failed to create class', 'error')
    }
  },

  join: async () => {
    try {
      const classCode = prompt('Enter class code:')
      if (!classCode) return
      
      const response = await apiCall('POST', API_CONFIG.classroom.joinClass, {
        code: classCode
      })
      
      if (response.success) {
        showNotification('Joined class successfully', 'success')
        document.dispatchEvent(new CustomEvent('class-joined', { detail: response.data }))
      }
    } catch (error) {
      console.error('Join class error:', error)
      showNotification('Failed to join class', 'error')
    }
  }
}

/**
 * Admin Handlers
 */
export const adminHandlers = {
  refreshDashboard: async () => {
    try {
      const response = await apiCall('GET', API_CONFIG.admin.getDashboard)
      
      if (response.success) {
        document.dispatchEvent(new CustomEvent('admin-dashboard-updated', { 
          detail: response.data 
        }))
      }
    } catch (error) {
      console.error('Dashboard refresh error:', error)
    }
  },

  deleteUser: async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await apiCall('DELETE', API_CONFIG.admin.deleteUser(userId))
      
      if (response.success) {
        showNotification('User deleted successfully', 'success')
        document.dispatchEvent(new CustomEvent('user-deleted', { detail: userId }))
      }
    } catch (error) {
      console.error('Delete user error:', error)
      showNotification('Failed to delete user', 'error')
    }
  }
}

/**
 * Utility Functions
 */

/**
 * Make API call
 */
async function apiCall(method, url, data = null) {
  try {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    const config = {
      method,
      headers
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(url, config)
    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed')
    }

    return responseData
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

/**
 * Download file utility
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`)
  
  // Dispatch custom event for notification UI
  document.dispatchEvent(new CustomEvent('show-notification', {
    detail: { message, type }
  }))
}

/**
 * Export all handlers
 */
export default {
  fileMenuHandlers,
  editMenuHandlers,
  viewMenuHandlers,
  compilerHandlers,
  authHandlers,
  collaborationHandlers,
  classroomHandlers,
  adminHandlers,
  apiCall,
  downloadFile,
  showNotification
}
