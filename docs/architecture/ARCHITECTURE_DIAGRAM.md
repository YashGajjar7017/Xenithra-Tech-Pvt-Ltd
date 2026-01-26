# Architecture Diagram & Component Relationships

## 🏗️ Overall Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html (38 lines)                   │
│                    • Minimal HTML structure                       │
│                    • Root div for React                           │
│                    • Global CSS styles                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Application                           │
│                    (main.jsx entry point)                        │
│                    • BrowserRouter setup                         │
│                    • Route definitions                           │
│                    • Provider wrappers                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    App.jsx Router Setup                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ /login       │  │ /signup      │  │ /dashboard   │  ...       │
│  │ Login.jsx    │  │ Signup.jsx   │  │ Dashboard.jsx│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Component Hierarchy Tree

```
App
│
├── BrowserRouter
│   └── Routes
│       ├── Route path="/login"
│       │   └── Login
│       │       └── Card
│       │           ├── Input
│       │           └── Button
│       │
│       ├── Route path="/signup"
│       │   └── Signup
│       │       └── Card
│       │           ├── Input
│       │           ├── Select
│       │           └── Button
│       │
│       ├── Route path="/dashboard"
│       │   └── Layout
│       │       ├── Sidebar
│       │       │   ├── Logo
│       │       │   ├── MenuItems
│       │       │   │   └── Button (multiple)
│       │       │   └── UserSection
│       │       ├── Topbar
│       │       │   ├── Button (Run)
│       │       │   ├── Button (Format)
│       │       │   ├── Button (Save)
│       │       │   └── Dropdown (Language)
│       │       └── Content
│       │           └── Dashboard Component
│       │
│       ├── Route path="/classroom"
│       │   └── Layout
│       │       └── Classroom Component
│       │
│       └── Route path="*"
│           └── NotFound
│
└── Global UI Components Library
    ├── Button
    ├── Input
    ├── Card
    ├── Layout
    ├── Sidebar
    └── Topbar
```

## 📦 Component Dependency Graph

```
Components with No Dependencies (Base)
├── Button (uses internal state)
├── Input (uses internal state)
└── Card (presentational)

Components with Dependencies
├── Sidebar
│   └── Requires: (none, standalone)
│
├── Topbar
│   └── Requires: useState (internal state)
│
├── Layout
│   ├── Requires: Sidebar
│   ├── Requires: Topbar
│   └── Requires: useState (sidebar state)
│
├── Login
│   ├── Requires: Card
│   ├── Requires: Input
│   ├── Requires: Button
│   └── Requires: useState, useNavigate
│
├── Signup
│   ├── Requires: Card
│   ├── Requires: Input
│   ├── Requires: Button
│   └── Requires: useState, useNavigate
│
└── Dashboard (future)
    └── Requires: Layout
```

## 🎨 Styling Architecture

```
┌─────────────────────────────────────────────────┐
│           CSS-in-JS Styling System              │
├─────────────────────────────────────────────────┤
│                                                 │
│  layoutStyles.js                                │
│  ├── Global CSS (keyframes)                     │
│  ├── Container styles                          │
│  ├── App layout styles                         │
│  └── Border/gradient styles                    │
│                                                 │
│  sidebarStyles.js                               │
│  ├── Sidebar container                         │
│  ├── Logo styles                               │
│  ├── Button styles                             │
│  ├── User section styles                       │
│  └── Collapsed icon styles                     │
│                                                 │
│  topbarStyles.js                                │
│  ├── Topbar container                          │
│  ├── Button styles                             │
│  ├── Dropdown styles                           │
│  └── Language selector styles                  │
│                                                 │
│  Component Internal Styles                      │
│  ├── Button.jsx (variant styles)               │
│  ├── Input.jsx (focus/error styles)            │
│  ├── Card.jsx (card styles)                    │
│  ├── Login.jsx (form styles)                   │
│  └── Signup.jsx (form styles)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│         State Management Flow               │
├─────────────────────────────────────────────┤
│                                             │
│  Local Component State (useState)           │
│  ├── Login                                  │
│  │   ├── username state                     │
│  │   ├── password state                     │
│  │   ├── rememberMe state                   │
│  │   ├── error state                        │
│  │   └── loading state                      │
│  │                                          │
│  ├── Signup                                 │
│  │   ├── username, email, password states   │
│  │   ├── role state                         │
│  │   ├── error state                        │
│  │   └── loading state                      │
│  │                                          │
│  ├── Layout                                 │
│  │   └── sidebarCollapsed state             │
│  │                                          │
│  ├── Topbar                                 │
│  │   ├── dropdownOpen state                 │
│  │   └── selectedLang state                 │
│  │                                          │
│  └── Sidebar                                │
│      └── activeItem state                   │
│                                             │
│  Global State (localStorage)                │
│  └── user data (after login)                │
│      ├── id                                 │
│      ├── username                           │
│      └── token                              │
│                                             │
│  Router State (React Router)                │
│  ├── current route                          │
│  ├── route params                           │
│  └── navigation functions                   │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎯 Event Flow Architecture

```
User Interactions
│
├── Button Click
│   ├── Run Button → Executes code
│   ├── Login Button → Navigates to /login
│   ├── Menu Button → Toggles menu
│   └── Format Button → Formats code
│
├── Input Change
│   ├── Username input → Updates state
│   ├── Password input → Updates state
│   └── Email input → Updates state
│
├── Form Submit
│   ├── Login form → API call → Navigate
│   └── Signup form → API call → Navigate
│
├── Sidebar Toggle
│   ├── Click toggle → Updates state
│   └── Triggers sidebar collapse/expand
│
└── Dropdown Selection
    ├── Language selector → Updates language
    └── Menu dropdown → Shows/hides options
```

## 🌐 API Integration Points

```
┌────────────────────────────────────────────┐
│         API Integration Architecture       │
├────────────────────────────────────────────┤
│                                            │
│  Authentication APIs                       │
│  ├── POST /api/login                       │
│  │   ├── Input: username, password         │
│  │   ├── Output: token, user data          │
│  │   └── Called from: Login.jsx            │
│  │                                         │
│  ├── POST /api/signup                      │
│  │   ├── Input: username, email, password  │
│  │   ├── Output: token, user data          │
│  │   └── Called from: Signup.jsx           │
│  │                                         │
│  └── GET /api/check-auth                   │
│      ├── Input: (headers with token)       │
│      ├── Output: authenticated status      │
│      └── Called from: Layout/App           │
│                                            │
│  Data Storage                              │
│  └── localStorage                          │
│      ├── Stores: user object               │
│      ├── Keys: 'user'                      │
│      └── Used for: Auth state              │
│                                            │
└────────────────────────────────────────────┘
```

## 🎨 Styling Flow

```
┌──────────────────────────────────────────────┐
│      CSS-in-JS Styling Implementation       │
├──────────────────────────────────────────────┤
│                                              │
│  Style Objects (JS)                          │
│  └── Define styles as JavaScript objects    │
│      {                                       │
│        button: {                            │
│          padding: '10px 20px',              │
│          background: '#667eea',             │
│          color: '#fff',                     │
│          ...                                │
│        }                                    │
│      }                                      │
│                                              │
│  Apply to Components                        │
│  └── <button style={styles.button}>         │
│      └── Pass as inline style prop         │
│                                              │
│  State-Based Styling                        │
│  └── Update styles based on state          │
│      const [isHovered, setIsHovered] = ... │
│      style={{                              │
│        background: isHovered ? '#...' : ...│
│      }}                                     │
│                                              │
│  Dynamic Effects                            │
│  ├── onMouseEnter → Update state            │
│  ├── onMouseLeave → Reset state             │
│  ├── onFocus → Apply focus styles           │
│  └── onBlur → Reset styles                  │
│                                              │
└──────────────────────────────────────────────┘
```

## 📱 Responsive Design Architecture

```
┌─────────────────────────────────────┐
│   Responsive Behavior (Current)      │
├─────────────────────────────────────┤
│                                     │
│  Sidebar                            │
│  ├── Desktop: 230px width           │
│  ├── Collapsed: 60px width          │
│  └── Mobile: (future) drawer mode   │
│                                     │
│  Layout                             │
│  ├── Desktop: flex row layout        │
│  ├── Content: flexible width         │
│  └── Mobile: (future) stack layout   │
│                                     │
│  Components                         │
│  ├── Buttons: 100% or auto width    │
│  ├── Inputs: 100% container width   │
│  ├── Cards: max-width: 480px        │
│  └── Mobile: (future) full width    │
│                                     │
└─────────────────────────────────────┘
```

## 🔒 Security Architecture

```
┌──────────────────────────────────────┐
│      Security Implementation         │
├──────────────────────────────────────┤
│                                      │
│  Authentication                      │
│  ├── Token-based (JWT)               │
│  ├── Stored in localStorage          │
│  ├── Sent in request headers         │
│  └── Verified by backend             │
│                                      │
│  Form Security                       │
│  ├── Password input (type=password)  │
│  ├── Email validation                │
│  ├── Client-side validation          │
│  └── Server-side validation          │
│                                      │
│  Data Protection                     │
│  ├── HTTPS for API calls             │
│  ├── Token refresh handling          │
│  ├── Logout clearing tokens          │
│  └── Secure session management       │
│                                      │
└──────────────────────────────────────┘
```

## 🚀 Performance Optimization Opportunities

```
┌────────────────────────────────────────┐
│    Performance Optimization Strategy   │
├────────────────────────────────────────┤
│                                        │
│  Current Optimizations                 │
│  ├── CSS-in-JS (no extra files)       │
│  ├── Minimal HTML                     │
│  └── Inline styles                    │
│                                        │
│  Future Optimizations                  │
│  ├── React.memo for components        │
│  ├── Code splitting with lazy()       │
│  ├── Component-level code splitting   │
│  ├── Image optimization               │
│  ├── Bundle analysis                  │
│  └── Production build optimization    │
│                                        │
│  Rendering Optimizations               │
│  ├── Avoid re-renders                 │
│  ├── Use useCallback for handlers      │
│  ├── Memoize expensive calculations   │
│  └── Virtual scrolling for lists      │
│                                        │
│  Asset Optimization                    │
│  ├── CSS minimization                 │
│  ├── JS minification                  │
│  ├── Font optimization                │
│  └── Image compression                │
│                                        │
└────────────────────────────────────────┘
```

## 📚 Development Workflow

```
┌──────────────────────────────────────────┐
│        Developer Workflow                │
├──────────────────────────────────────────┤
│                                          │
│  1. Create Component                     │
│     ├── Create ComponentName.jsx         │
│     ├── Define styles in component       │
│     └── Add useState/hooks as needed     │
│                                          │
│  2. Import Dependencies                  │
│     ├── Import UI components             │
│     ├── Import React hooks               │
│     └── Import navigation if needed      │
│                                          │
│  3. Build JSX                            │
│     ├── Use UI components                │
│     ├── Apply style objects              │
│     └── Add event handlers               │
│                                          │
│  4. Test Component                       │
│     ├── Visual testing in browser        │
│     ├── Functional testing               │
│     └── DevTools style inspection        │
│                                          │
│  5. Deploy                               │
│     ├── Commit to version control        │
│     ├── Build production bundle          │
│     └── Deploy to server                 │
│                                          │
└──────────────────────────────────────────┘
```

---

## Summary

This architecture provides:
- ✅ **Scalability**: Easy to add new pages and components
- ✅ **Maintainability**: Styles colocated with components
- ✅ **Reusability**: UI components library
- ✅ **Performance**: Optimized CSS delivery
- ✅ **Developer Experience**: Clear structure and patterns

**Total Components:** 8 (3 UI + 5 Layout/Page)
**Total Style Objects:** 6 (distributed across components)
**API Integration Points:** 3 main endpoints
**Routes Defined:** 8 major routes
