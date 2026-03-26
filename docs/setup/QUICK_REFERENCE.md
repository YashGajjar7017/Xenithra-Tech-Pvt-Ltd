# Quick Reference - Frontend Button Logic & API Setup

## File Locations

```
renderer/
├── src/
│   ├── config/
│   │   └── api.config.js           (All API endpoints)
│   ├── handlers/
│   │   └── buttonHandlers.js       (All button handlers)
│   └── utils/
│       ├── apiClient.js            (API client & functions)
│       └── envValidator.js         (Environment validator)
└── .env                             (Environment variables)
```

## Environment Variables (.env)

```env
# Core Configuration
NODE_ENV=development
PORT=3000
API_PORT=3000
RENDERER_PORT=8000

# Database
MONGODB_URI=mongodb+srv://...
DB_NAME=xenithra_db

# API URLs
API_BASE_URL=http://localhost:3000
API_URL=http://localhost:3000
FRONTEND_API_URL=http://localhost:3000/api

# Security Tokens
JWT_SECRET=your-secret-key
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional Features
ENABLE_WEBRTC=true
ENABLE_ANALYTICS=true
ENABLE_COLLABORATION=true
```

## API Configuration

### Import Configuration

```javascript
import { API_CONFIG, API_PREFIX, API_BASE_URL } from '../config/api.config'

// Access specific endpoints
API_CONFIG.auth.login           // /api/login
API_CONFIG.auth.signup          // /api/signup
API_CONFIG.files.list           // /api/files
API_CONFIG.compiler.execute     // /api/compiler/execute
API_CONFIG.classroom.createClass // /api/classroom/create
```

### All Endpoint Categories

| Category | Example Endpoints |
|----------|------------------|
| **Auth** | login, signup, logout, refresh, verify-otp |
| **Users** | getById, update, getProfile, updateSettings |
| **Compiler** | compile, execute, format, analyze, lint |
| **Files** | list, create, upload, download, share, delete |
| **Sessions** | create, join, leave, getHistory, exportCode |
| **Classroom** | createClass, joinClass, getMembers, getAssignments |
| **Collaboration** | invite, acceptInvite, createTeam, listCollaborators |
| **Achievements** | getAll, getUserAchievements, getLeaderboard |
| **Analytics** | getDashboard, getStats, getCodeStats |
| **Admin** | getDashboard, getUsers, getSystemHealth, getLogs |

## Button Handlers

### Import Handlers

```javascript
import { 
  fileMenuHandlers, 
  editMenuHandlers, 
  viewMenuHandlers,
  compilerHandlers,
  authHandlers,
  collaborationHandlers,
  classroomHandlers,
  adminHandlers
} from '../handlers/buttonHandlers'
```

### File Menu Handlers

```javascript
fileMenuHandlers.new()          // Create new file
fileMenuHandlers.open()         // Open file dialog
fileMenuHandlers.save()         // Save current file
fileMenuHandlers.saveAs()       // Save as new file
fileMenuHandlers.export('json') // Export as JSON/TXT
fileMenuHandlers.exit()         // Close app
```

### Edit Menu Handlers

```javascript
editMenuHandlers.undo()         // Undo
editMenuHandlers.redo()         // Redo
editMenuHandlers.cut()          // Cut
editMenuHandlers.copy()         // Copy
editMenuHandlers.paste()        // Paste
editMenuHandlers.selectAll()    // Select all
editMenuHandlers.delete()       // Delete
```

### View Menu Handlers

```javascript
viewMenuHandlers.zoomIn()           // Zoom in
viewMenuHandlers.zoomOut()          // Zoom out
viewMenuHandlers.resetZoom()        // Reset zoom
viewMenuHandlers.toggleSidebar()    // Toggle sidebar
viewMenuHandlers.toggleFullscreen() // Fullscreen
viewMenuHandlers.toggleDarkMode()   // Dark/Light mode
```

### Compiler Handlers

```javascript
compilerHandlers.run()      // Execute code
compilerHandlers.debug()    // Start debugger
compilerHandlers.stop()     // Stop execution
compilerHandlers.format()   // Format code
compilerHandlers.analyze()  // Analyze code
```

### Auth Handlers

```javascript
authHandlers.login(credentials)      // Login
authHandlers.signup(credentials)     // Signup
authHandlers.logout()                // Logout
authHandlers.github()                // GitHub OAuth
```

## API Client Functions

### Import API Functions

```javascript
import { 
  authAPI, 
  userAPI, 
  fileAPI, 
  compilerAPI,
  sessionAPI,
  classroomAPI,
  achievementAPI,
  adminAPI
} from '../utils/apiClient'
```

### Authentication API

```javascript
await authAPI.login({ email, password })
await authAPI.signup({ email, password, username })
await authAPI.logout()
await authAPI.refreshToken()
await authAPI.getCurrentUser()
await authAPI.sendOTP(email)
await authAPI.verifyOTP(email, otp)
```

### File API

```javascript
await fileAPI.list(page=1)
await fileAPI.create({ name, content })
await fileAPI.getById(id)
await fileAPI.update(id, data)
await fileAPI.delete(id)
await fileAPI.upload(file)
await fileAPI.download(id)
await fileAPI.share(id, email)
```

### Compiler API

```javascript
await compilerAPI.execute(code, language)
await compilerAPI.compile(code, language, version)
await compilerAPI.format(code, language)
await compilerAPI.analyze(code, language)
await compilerAPI.lint(code, language)
await compilerAPI.getLanguages()
```

### User API

```javascript
await userAPI.getProfile()
await userAPI.updateProfile(data)
await userAPI.getSettings()
await userAPI.updateSettings(data)
await userAPI.uploadAvatar(file)
await userAPI.search(query)
```

### Classroom API

```javascript
await classroomAPI.createClass(data)
await classroomAPI.getClasses()
await classroomAPI.joinClass(code)
await classroomAPI.getMembers(classId)
await classroomAPI.getAssignments(classId)
```

### Achievement API

```javascript
await achievementAPI.getAll()
await achievementAPI.getUserAchievements()
await achievementAPI.getLeaderboard()
await achievementAPI.getProgress()
```

### Admin API

```javascript
await adminAPI.getDashboard()
await adminAPI.getUsers(page=1)
await adminAPI.deleteUser(id)
await adminAPI.getSystemHealth()
await adminAPI.getLogs(page=1)
```

## React Component Example

```jsx
import React, { useState } from 'react'
import { compilerAPI } from '../utils/apiClient'
import { compilerHandlers } from '../handlers/buttonHandlers'

function CodeEditor() {
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    try {
      const code = document.querySelector('textarea').value
      const result = await compilerAPI.execute(code, 'javascript')
      setOutput(result.output)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleRun} disabled={loading}>
        {loading ? 'Running...' : 'Run Code'}
      </button>
      <pre>{output}</pre>
    </div>
  )
}

export default CodeEditor
```

## Error Handling

```javascript
import { authAPI, UnauthorizedError, APIError } from '../utils/apiClient'

try {
  const response = await authAPI.login(credentials)
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.error('Session expired')
  } else if (error instanceof APIError) {
    console.error(`API Error [${error.status}]: ${error.message}`)
  } else {
    console.error('Unknown error:', error)
  }
}
```

## Validation

```javascript
import { validateEnvironment } from '../utils/envValidator'

// Run validation
const result = validateEnvironment()
result.print()

// Check if valid
if (!result.valid) {
  console.error('Configuration errors detected')
}
```

## Common Patterns

### Login & Store Token

```javascript
const response = await authAPI.login({ email, password })
localStorage.setItem('token', response.data.token)
localStorage.setItem('user', JSON.stringify(response.data.user))
```

### Upload File

```javascript
const file = document.querySelector('input[type="file"]').files[0]
const response = await fileAPI.upload(file)
console.log('Uploaded:', response.data.id)
```

### Execute Code

```javascript
const code = 'console.log("Hello")'
const result = await compilerAPI.execute(code, 'javascript')
console.log('Output:', result.output)
```

### Handle Token Expiry

```javascript
document.addEventListener('token-expired', () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
})
```

### Show Notification

```javascript
import { showNotification } from '../handlers/buttonHandlers'

showNotification('File saved successfully', 'success')
showNotification('Error saving file', 'error')
showNotification('Loading...', 'info')
```

## Event Listeners

```javascript
// File events
document.addEventListener('file-created', (e) => console.log(e.detail))
document.addEventListener('file-opened', (e) => console.log(e.detail))
document.addEventListener('file-saved', (e) => console.log(e.detail))

// Code events
document.addEventListener('code-executed', (e) => console.log(e.detail))
document.addEventListener('code-formatted', (e) => console.log(e.detail))
document.addEventListener('code-analyzed', (e) => console.log(e.detail))

// Auth events
document.addEventListener('user-logged-in', (e) => console.log(e.detail))
document.addEventListener('user-logged-out', (e) => console.log('Logged out'))
document.addEventListener('token-expired', () => console.log('Token expired'))

// UI events
document.addEventListener('toggle-sidebar', () => console.log('Sidebar toggled'))
document.addEventListener('theme-changed', (e) => console.log(e.detail.theme))
```

## Debugging

```javascript
// Enable debug mode
import { API_CONFIG } from '../config/api.config'
console.log('API Config:', API_CONFIG)

// Check token
console.log('Token:', localStorage.getItem('token'))

// Check user
console.log('User:', JSON.parse(localStorage.getItem('user')))

// Test API connection
import { healthAPI } from '../utils/apiClient'
await healthAPI.getStatus().then(console.log)
```

## Troubleshooting Commands

```bash
# Validate environment
node renderer/src/utils/envValidator.js

# Check if server is running
curl http://localhost:3000/api/health

# Restart dev server
npm run dev

# Check logs
npm run dev 2>&1 | grep -i error
```

---

**Last Updated:** March 28, 2026  
**Version:** 1.0.0
