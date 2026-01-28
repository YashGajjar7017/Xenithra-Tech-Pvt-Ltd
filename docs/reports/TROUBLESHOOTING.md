# Troubleshooting Guide - Common Issues & Solutions

## Issue 1: "Failed to load resource: net::ERR_FILE_NOT_FOUND main.jsx:1"

### ✅ STATUS: FIXED

### What Caused It
- Missing or incorrectly configured main.jsx file
- Path resolution issue in electron.vite.config.mjs
- Incorrect script tag in index.html

### How It Was Fixed
1. Verified main.jsx exists in: `renderer/src/main.jsx`
2. Confirmed correct React 19.x API usage (createRoot)
3. Verified electron.vite.config.mjs paths
4. Confirmed index.html script tag: `<script type="module" src="/src/main.jsx"></script>`

### Verification
```bash
# Check file exists
ls -la renderer/src/main.jsx

# Should output:
# -rw-r--r-- ... main.jsx
```

---

## Issue 2: Component Imports Not Working

### Problem
```
Module not found: Can't resolve './components/Sidebar'
```

### Solution
Use path aliases defined in electron.vite.config.mjs:

```jsx
// ❌ WRONG
import Sidebar from './components/Sidebar'

// ✅ CORRECT
import Sidebar from '@components/Sidebar'
```

### Configure Aliases
The following aliases are already configured:
- `@` → `renderer/src`
- `@components` → `renderer/src/components`
- `@pages` → `renderer/src/pages`
- `@layouts` → `renderer/src/layouts`
- `@styles` → `renderer/src/styles`
- `@services` → `renderer/src/services`
- `@stores` → `renderer/src/stores`
- `@utils` → `renderer/src/utils`

---

## Issue 3: CSS Not Loading

### Problem
```
Styles are not applied to components
```

### Solution 1: Check Import Path
```jsx
// ✅ Correct
import '../styles/Sidebar.css'

// ❌ Wrong
import './styles/Sidebar.css'
```

### Solution 2: Check CSS File Exists
```bash
# Verify file location
ls renderer/src/styles/Sidebar.css
```

### Solution 3: Check CSS Class Names
```jsx
// HTML
<div className="sidebar">

// CSS
.sidebar {
  /* styles */
}
```

### Solution 4: Clear Browser Cache
1. Press `Ctrl+Shift+Delete` (Chrome) or `Cmd+Shift+Delete` (Safari)
2. Select "All Time" and "Cached images and files"
3. Click "Clear data"
4. Refresh the page

---

## Issue 4: Component Not Displaying

### Problem
Component renders but doesn't appear on page

### Checklist
```
□ Component is exported: export default ComponentName
□ Component is imported: import ComponentName from '...'
□ Component is used in JSX: <ComponentName />
□ Component has return statement
□ Return statement has valid JSX
□ CSS file is imported in component
□ CSS selectors match element className
□ No TypeScript errors (check console)
□ Element has proper width/height
□ Element is not hidden: display: none; or visibility: hidden;
```

### Example Fix
```jsx
// ❌ WRONG - Not exported
function Sidebar() {
  return <div>Sidebar</div>
}

// ✅ CORRECT - Properly exported
function Sidebar() {
  return <div>Sidebar</div>
}
export default Sidebar
```

---

## Issue 5: State Not Updating

### Problem
Clicking button doesn't update state

### Checklist
```
□ Using const [state, setState] = useState(initial)
□ Calling setState correctly: setState(newValue)
□ Not mutating state directly: state.prop = newValue ❌
□ Event handler is bound: onClick={() => setState(...)}
□ Component re-renders after state change
```

### Example Fix
```jsx
// ❌ WRONG - Direct mutation
const handleClick = () => {
  items[0] = 'new value'  // Won't work
}

// ✅ CORRECT - Create new array
const handleClick = () => {
  setItems([...items, 'new item'])
}
```

---

## Issue 6: React Router Not Working

### Problem
Routes not rendering correctly

### Checklist
```
□ BrowserRouter wraps Routes
□ Route paths are correct
□ Component imports are correct
□ Link and useNavigate are from react-router-dom
□ Route elements are lowercase: <route>, not <Route>... wait, actually <Route> is correct!
```

### Example Correct Setup
```jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  )
}
```

---

## Issue 7: Editor Textarea Not Accepting Input

### Problem
Can't type in the code editor

### Solution 1: Check onChange Handler
```jsx
// ✅ CORRECT
<textarea
  value={code}
  onChange={(e) => setCode(e.target.value)}
/>

// ❌ WRONG - No change handler
<textarea value={code} />
```

### Solution 2: Check for ReadOnly
```jsx
// Remove readonly attribute if present
<textarea readOnly /> ❌

// Should be editable
<textarea onChange={...} />  ✅
```

### Solution 3: Check CSS Overflow
```css
/* Make sure textarea is visible */
.code-editor {
  width: 100%;        ✅
  height: 100%;       ✅
  overflow: auto;     ✅
  resize: none;       ✅
}
```

---

## Issue 8: Terminal Input Not Working

### Problem
Can't type commands in terminal

### Solution
Ensure event handler is correct:

```jsx
// ✅ CORRECT
<input
  type="text"
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      setLogs([...logs, e.target.value, '> '])
      e.target.value = ''
    }
  }}
/>
```

---

## Issue 9: Sidebar Not Collapsing

### Problem
Sidebar width doesn't change

### Solution
Check state management:

```jsx
// Component needs state
const [collapsed, setCollapsed] = useState(false)

// Width should change based on state
<div style={{
  width: collapsed ? '60px' : '230px'
}}>
  ...
</div>
```

---

## Issue 10: Dev Server Not Starting

### Problem
```
ERROR: ENOENT: no such file or directory
```

### Solution 1: Check Node Modules
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Solution 2: Check File Exists
```bash
# Verify main.jsx exists
ls renderer/src/main.jsx

# Verify package.json exists
ls package.json
```

### Solution 3: Check Electron Config
```bash
# Verify electron.vite.config.mjs exists
ls electron.vite.config.mjs
```

### Solution 4: Kill Existing Process
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Issue 11: Styles Conflict

### Problem
Multiple components have same class names causing conflicts

### Solution: Use BEM Naming Convention
```css
/* ✅ CORRECT - Component scoped */
.sidebar { }
.sidebar__header { }
.sidebar__nav { }
.sidebar__item { }

/* ❌ WRONG - Too generic */
.container { }
.header { }
.item { }
```

---

## Issue 12: TypeScript Errors (if using TS)

### Current Status
The project uses **JSX only**, no TypeScript needed.

If you want to add TypeScript later:
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

Rename files: `.jsx` → `.tsx`

---

## Issue 13: Build Fails

### Problem
```
npm run build fails with errors
```

### Solutions
```bash
# 1. Check for syntax errors
npm run lint

# 2. Clear build folder
rm -rf out/

# 3. Reinstall dependencies
npm install

# 4. Check electron.vite.config.mjs
cat electron.vite.config.mjs
```

---

## Issue 14: Blank Page After Build

### Problem
App builds but shows blank page

### Checklist
```
□ #root div exists in index.html
□ main.jsx imports App
□ App component has valid JSX
□ No console errors (F12 → Console)
□ Check Network tab for failed requests
□ Clear browser cache (Ctrl+Shift+Delete)
```

---

## Issue 15: Component Memory Leak

### Problem
Console warning: "Can't perform a React state update on an unmounted component"

### Solution: Add Cleanup
```jsx
useEffect(() => {
  const timer = setInterval(() => {
    // ...
  }, 1000)

  // ✅ Cleanup function
  return () => clearInterval(timer)
}, [])
```

---

## Debug Checklist

When something doesn't work:

### 1. Check Console (F12)
```
✓ No errors?
✓ No warnings?
✓ Custom logs present?
```

### 2. Check Network Tab
```
✓ All files loading (200 status)?
✓ No 404 errors?
✓ JavaScript bundle loading?
✓ CSS files loading?
```

### 3. Check React DevTools
```
✓ Components mounted?
✓ Props correct?
✓ State correct?
✓ Re-renders expected?
```

### 4. Check File System
```
✓ File exists in editor?
✓ File path correct?
✓ File content saved?
✓ No unsaved changes?
```

### 5. Check Configuration
```
✓ electron.vite.config.mjs correct?
✓ package.json has dependencies?
✓ index.html script tag correct?
✓ main.jsx imports correct?
```

---

## Performance Issues

### Problem: App Slow/Laggy

### Solutions
1. **Reduce Re-renders**
   ```jsx
   // Use useCallback for handlers
   const handleClick = useCallback(() => {
     setCount(c => c + 1)
   }, [])
   ```

2. **Optimize CSS**
   - Remove unused styles
   - Use CSS variables instead of inline styles
   - Move animations to GPU (transform, opacity)

3. **Check Bundle Size**
   ```bash
   npm run build
   # Check size of out/ folder
   ```

4. **Use DevTools Profiler**
   - Open React DevTools Profiler
   - Record interaction
   - Check which components re-render

---

## Getting Help

### Documentation Files
- `COMPONENT_SETUP_SUMMARY.md` - Detailed setup guide
- `QUICK_REFERENCE.md` - Quick start guide
- `ARCHITECTURE_VISUAL_GUIDE.md` - Visual architecture
- `VERIFICATION_CHECKLIST.md` - Complete checklist

### Browser Console
```javascript
// Debug component state
console.log('State:', state)

// Debug props
console.log('Props:', props)

// Debug events
console.log('Event:', event)
```

### React DevTools
```
1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to "Components" tab
4. Inspect component tree
5. View props and state in real-time
```

---

**Last Updated**: January 26, 2026
**Status**: ✅ COMPLETE
