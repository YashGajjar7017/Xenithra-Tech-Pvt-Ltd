# Xenithra Technologies - Frontend Button Logic & API Setup Guide

## Overview

This guide explains how to use the complete frontend button logic system and API configuration that has been set up for your Electron application.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Configuration](#api-configuration)
3. [Button Logic System](#button-logic-system)
4. [API Client Usage](#api-client-usage)
5. [Implementation Examples](#implementation-examples)
6. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### 1. Environment Variables (`.env`)

All environment variables are configured in the `.env` file at the root of your project:

**Key Variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_PORT=3000
RENDERER_PORT=8000

# API URLs
API_BASE_URL=http://localhost:3000
API_URL=http://localhost:3000
FRONTEND_API_URL=http://localhost:3000/api

# Database
MONGODB_URI=mongodb+srv://your-connection-string
DB_NAME=xenithra_db

# Security
JWT_SECRET=your-jwt-secret
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Validate Environment Configuration

Run the environment validator to check if all required variables are set:

```bash
# In your terminal
node renderer/src/utils/envValidator.js
```

The validator will:
- ✅ Check all required variables are configured
- ⚠️ Warn about missing optional variables
- ❌ Report any configuration errors

---

## API Configuration

### 1. API Configuration File

All API endpoints are centralized in:
```
renderer/src/config/api.config.js
```

**Structure:**

```javascript
import { API_CONFIG } from '../config/api.config'

// Access API endpoints
console.log(API_CONFIG.auth.login)        // http://localhost:3000/api/login
console.log(API_CONFIG.auth.signup)       // http://localhost:3000/api/signup
console.log(API_CONFIG.files.list)        // http://localhost:3000/api/files
console.log(API_CONFIG.compiler.execute)  // http://localhost:3000/api/compiler/execute
```

### 2. Endpoint Categories

The API configuration includes these endpoint categories:

- **Auth**: `login`, `signup`, `logout`, `refresh`, `verify-otp`, `2fa`, etc.
- **Users**: CRUD operations, profile, settings, search, etc.
- **Compiler**: compile, execute, format, analyze, lint, etc.
- **Files**: create, update, delete, upload, download, share, etc.
- **Sessions**: create, join, leave, history, export, etc.
- **Classroom**: create class, join, manage members, assignments, etc.
- **Achievements**: track achievements, leaderboard, progress, etc.
- **Analytics**: dashboard, stats, user analytics, system analytics, etc.
- **Admin**: user management, system health, logs, maintenance, etc.
- **Notifications**: get, mark as read, delete, etc.

---

## Button Logic System

### 1. Button Handlers Module

All button click handlers are centralized in:
```
renderer/src/handlers/buttonHandlers.js
```

### 2. Available Handler Groups

#### File Menu
```javascript
import { fileMenuHandlers } from '../handlers/buttonHandlers'

fileMenuHandlers.new()          // Create new file
fileMenuHandlers.open()         // Open file dialog
fileMenuHandlers.save()         // Save current file
fileMenuHandlers.saveAs()       // Save as new file
fileMenuHandlers.export('json') // Export file
fileMenuHandlers.exit()         // Close application
```

#### Edit Menu
```javascript
import { editMenuHandlers } from '../handlers/buttonHandlers'

editMenuHandlers.undo()         // Undo last action
editMenuHandlers.redo()         // Redo action
editMenuHandlers.cut()          // Cut selected text
editMenuHandlers.copy()         // Copy selected text
editMenuHandlers.paste()        // Paste from clipboard
editMenuHandlers.selectAll()    // Select all text
editMenuHandlers.delete()       // Delete selected text
```

#### View Menu
```javascript
import { viewMenuHandlers } from '../handlers/buttonHandlers'

viewMenuHandlers.zoomIn()           // Increase zoom level
viewMenuHandlers.zoomOut()          // Decrease zoom level
viewMenuHandlers.resetZoom()        // Reset zoom to 100%
viewMenuHandlers.toggleSidebar()    // Toggle sidebar visibility
viewMenuHandlers.toggleFullscreen() // Toggle fullscreen mode
viewMenuHandlers.toggleDarkMode()   // Toggle dark mode
```

#### Compiler
```javascript
import { compilerHandlers } from '../handlers/buttonHandlers'

compilerHandlers.run()      // Execute code
compilerHandlers.debug()    // Start debugger
compilerHandlers.stop()     // Stop execution
compilerHandlers.format()   // Format code
compilerHandlers.analyze()  // Analyze code
```

#### Authentication
```javascript
import { authHandlers } from '../handlers/buttonHandlers'

authHandlers.login(credentials)      // Login user
authHandlers.signup(credentials)     // Register new user
authHandlers.logout()                // Logout user
authHandlers.github()                // GitHub OAuth login
```

#### Collaboration
```javascript
import { collaborationHandlers } from '../handlers/buttonHandlers'

collaborationHandlers.share(fileId)         // Share file with user
collaborationHandlers.invite(sessionId)     // Invite collaborators
```

#### Classroom
```javascript
import { classroomHandlers } from '../handlers/buttonHandlers'

classroomHandlers.create()  // Create new class
classroomHandlers.join()    // Join existing class
```

#### Admin
```javascript
import { adminHandlers } from '../handlers/buttonHandlers'

adminHandlers.refreshDashboard()    // Refresh admin dashboard
adminHandlers.deleteUser(userId)    // Delete user account
```

### 3. Using Button Handlers in React Components

```jsx
import React, { useState } from 'react'
import { fileMenuHandlers, compilerHandlers } from '../handlers/buttonHandlers'

function EditorComponent() {
  const handleSaveClick = async () => {
    try {
      await fileMenuHandlers.save()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleRunClick = async () => {
    try {
      await compilerHandlers.run()
    } catch (error) {
      console.error('Execution failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSaveClick}>Save</button>
      <button onClick={handleRunClick}>Run Code</button>
    </div>
  )
}

export default EditorComponent
```

---

## API Client Usage

### 1. API Client Module

All API functions are in:
```
renderer/src/utils/apiClient.js
```

### 2. Making API Calls

```javascript
import { authAPI, fileAPI, compilerAPI, userAPI } from '../utils/apiClient'

// Login
const loginResponse = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const user = await authAPI.getCurrentUser()

// Upload file
const file = document.querySelector('input[type="file"]').files[0]
const fileResponse = await fileAPI.upload(file)

// Compile code
const result = await compilerAPI.compile(
  'console.log("Hello")',
  'javascript'
)

// Update profile
await userAPI.updateProfile({
  name: 'New Name',
  bio: 'My bio'
})
```

### 3. Error Handling

```javascript
import { authAPI, UnauthorizedError, APIError } from '../utils/apiClient'

try {
  const response = await authAPI.login(credentials)
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.error('Token expired - redirecting to login')
    // Redirect to login page
  } else if (error instanceof APIError) {
    console.error(`API Error: ${error.message}`)
  } else {
    console.error('Unknown error:', error)
  }
}
```

---

## Implementation Examples

### Example 1: Complete Login Flow

```jsx
import React, { useState } from 'react'
import { authHandlers } from '../handlers/buttonHandlers'
import { authAPI } from '../utils/apiClient'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await authAPI.login({ email, password })
      console.log('Login successful:', result)
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginPage
```

### Example 2: Code Editor with Run Button

```jsx
import React, { useState } from 'react'
import { compilerAPI } from '../utils/apiClient'

function CodeEditor() {
  const [code, setCode] = useState('console.log("Hello World")')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    setRunning(true)
    try {
      const result = await compilerAPI.execute(code, language)
      setOutput(result.output)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
      </select>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="10"
        cols="50"
      />

      <button onClick={handleRun} disabled={running}>
        {running ? 'Running...' : 'Run Code'}
      </button>

      {output && <pre>{output}</pre>}
    </div>
  )
}

export default CodeEditor
```

### Example 3: File Management

```jsx
import React, { useState, useEffect } from 'react'
import { fileAPI } from '../utils/apiClient'

function FileManager() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fileAPI.list(1)
      setFiles(response.data || [])
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure?')) return

    try {
      await fileAPI.delete(fileId)
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  return (
    <div>
      <h2>My Files</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {files.map(file => (
            <li key={file.id}>
              {file.name}
              <button onClick={() => handleDelete(file.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileManager
```

---

## Troubleshooting

### Issue: API calls returning 401 Unauthorized

**Solution:**
- Check if token is stored in localStorage: `localStorage.getItem('token')`
- Verify token is not expired
- Re-login if token is invalid

```javascript
// Check token status
const token = localStorage.getItem('token')
if (!token) {
  console.log('No token found - user needs to login')
  window.location.href = '/login'
}
```

### Issue: CORS errors

**Solution:**
- Ensure `CORS_ORIGIN=*` in `.env` or configure with specific origins
- Verify API base URL matches the backend server

```javascript
// Check API configuration
import { API_CONFIG } from '../config/api.config'
console.log('API Base URL:', API_CONFIG.baseURL)
```

### Issue: Button handlers not working

**Solution:**
- Import handlers correctly from `../handlers/buttonHandlers`
- Ensure you're calling them as functions: `handler()` not `handler`
- Check console for error messages

```javascript
// Correct usage
import { fileMenuHandlers } from '../handlers/buttonHandlers'

// ✅ Correct
fileMenuHandlers.save()

// ❌ Wrong
const save = fileMenuHandlers.save
save() // May not work as 'this' context is lost
```

### Issue: Environment variables not loading

**Solution:**
- Create `.env` file in project root
- Run validator: `node renderer/src/utils/envValidator.js`
- Restart development server after changing `.env`

---

## Next Steps

1. **Test the setup**: Run the environment validator
2. **Try a sample API call**: Test login or file upload
3. **Integrate with UI**: Connect button handlers to your components
4. **Set up error handling**: Implement user-friendly error messages
5. **Add notifications**: Use the showNotification utility for user feedback

---

## Quick Reference

### Import Patterns

```javascript
// Button handlers
import { 
  fileMenuHandlers, 
  editMenuHandlers, 
  compilerHandlers,
  authHandlers 
} from '../handlers/buttonHandlers'

// API functions
import { 
  authAPI, 
  fileAPI, 
  compilerAPI, 
  userAPI 
} from '../utils/apiClient'

// Configuration
import { API_CONFIG } from '../config/api.config'

// Validation
import { validateEnvironment } from '../utils/envValidator'
```

### Common Operations

```javascript
// Login
await authAPI.login({ email, password })

// Get files
await fileAPI.list()

// Run code
await compilerAPI.execute(code, language)

// Get achievements
await achievementAPI.getAll()

// Admin dashboard
await adminAPI.getDashboard()
```

---

## Support

For issues or questions:
1. Check the console for error messages
2. Run the environment validator
3. Review the API documentation in [api.config.js](./renderer/src/config/api.config.js)
4. Check the handler implementations in [buttonHandlers.js](./renderer/src/handlers/buttonHandlers.js)

---

**Last Updated:** March 28, 2026  
**Version:** 1.0.0
