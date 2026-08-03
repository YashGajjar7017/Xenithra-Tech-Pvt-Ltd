# Project Structure Overview - Visual Guide

## Complete File Tree

```
Xenithra-Tech-Pvt-Ltd/
├── 📁 electron/
│   ├── 📁 Database/
│   ├── 📁 main/
│   ├── 📁 preload/
│   └── ...
│
├── 📁 renderer/                     ← Main React Application
│   ├── 📄 index.html
│   ├── 📁 public/
│   └── 📁 src/                      ← ✅ ALL COMPONENTS HERE
│       ├── 📄 main.jsx              ← Entry point ✅
│       ├── 📄 App.jsx               ← Router ✅
│       │
│       ├── 📁 components/           ← ✅ COMPONENT-BASED
│       │   ├── 📄 Header.jsx        ✅
│       │   ├── 📄 Footer.jsx        ✅
│       │   ├── 📄 Sidebar.jsx       ✅ NEW
│       │   ├── 📄 Topbar.jsx        ✅ NEW
│       │   ├── 📄 Editor.jsx        ✅ NEW
│       │   ├── 📄 Terminal.jsx      ✅ NEW
│       │   └── 📄 Bottom.jsx        ✅ NEW
│       │
│       ├── 📁 pages/                ← ✅ PAGE COMPONENTS
│       │   ├── 📄 HomePage.jsx      ✅
│       │   ├── 📄 LoginPage.jsx     ✅
│       │   ├── 📄 DashboardPage.jsx ✅
│       │   ├── 📄 EditorPage.jsx    ✅ NEW
│       │   └── 📄 NotFoundPage.jsx  ✅
│       │
│       ├── 📁 layouts/              ← ✅ LAYOUT COMPONENTS
│       │   └── 📄 MainLayout.jsx    ✅
│       │
│       ├── 📁 styles/               ← ✅ ALL STYLES
│       │   ├── 📄 index.css
│       │   ├── 📄 App.css           ✅ UPDATED
│       │   ├── 📄 Header.css        ✅
│       │   ├── 📄 Footer.css        ✅
│       │   ├── 📄 Layout.css        ✅
│       │   ├── 📄 Pages.css         ✅
│       │   ├── 📄 Sidebar.css       ✅ NEW
│       │   ├── 📄 Topbar.css        ✅ NEW
│       │   ├── 📄 Editor.css        ✅ NEW
│       │   ├── 📄 Terminal.css      ✅ NEW
│       │   ├── 📄 Bottom.css        ✅ NEW
│       │   └── 📄 EditorLayout.css  ✅ NEW
│       │
│       ├── 📁 hooks/
│       ├── 📁 services/
│       ├── 📁 stores/
│       ├── 📁 utils/
│       └── 📁 assets/
│
├── 📁 docs/
├── 📁 scripts/
├── 📁 tests/
│
├── 📄 package.json
├── 📄 electron.vite.config.mjs
├── 📄 electron-builder.yml
├── 📄 eslint.config.mjs
│
├── 📄 COMPONENT_SETUP_SUMMARY.md   ← Detailed documentation ✅ NEW
├── 📄 QUICK_REFERENCE.md           ← Quick start guide ✅ NEW
├── 📄 VERIFICATION_CHECKLIST.md    ← Complete checklist ✅ NEW
│
└── 📄 README.md
```

## Component Hierarchy

```
App.jsx (Router)
│
├─ EditorPage
│  ├─ Sidebar
│  ├─ Topbar
│  ├─ Editor
│  ├─ Terminal
│  └─ Bottom
│
├─ MainLayout
│  ├─ Header
│  ├─ Outlet (Routes)
│  │  ├─ HomePage
│  │  ├─ LoginPage
│  │  ├─ DashboardPage
│  │  └─ NotFoundPage
│  └─ Footer
│
└─ 404 Page
```

## Data Flow

```
renderer/
├─ index.html
└─ src/
   ├─ main.jsx (entry point)
   │  └─ ReactDOM.createRoot()
   │
   ├─ App.jsx (router)
   │  └─ BrowserRouter
   │     └─ Routes
   │        ├─ /editor → EditorPage
   │        ├─ / → HomePage (via MainLayout)
   │        ├─ /login → LoginPage (via MainLayout)
   │        ├─ /dashboard → DashboardPage (via MainLayout)
   │        └─ * → NotFoundPage (via MainLayout)
   │
   ├─ components/ (reusable)
   │  ├─ Sidebar (navigation)
   │  ├─ Topbar (header)
   │  ├─ Editor (code input)
   │  ├─ Terminal (output)
   │  ├─ Bottom (status)
   │  ├─ Header (layout)
   │  └─ Footer (layout)
   │
   ├─ pages/ (routes)
   │  ├─ EditorPage (IDE)
   │  ├─ HomePage (landing)
   │  ├─ LoginPage (auth)
   │  ├─ DashboardPage (dashboard)
   │  └─ NotFoundPage (error)
   │
   ├─ layouts/ (wrappers)
   │  └─ MainLayout (header + footer)
   │
   ├─ styles/ (CSS)
   │  └─ (all component styles)
   │
   └─ (hooks, services, stores, utils, assets)
```

## State Management

### Component-Level State

```
EditorPage
├─ Sidebar
│  └─ activeItem: 'home'
├─ Topbar
│  └─ isMenuOpen: false
├─ Editor
│  └─ code: string
├─ Terminal
│  └─ logs: array
└─ Bottom
   └─ (no state - displays info)

LoginPage
├─ email: string
└─ password: string
```

## Routing Map

```
HTTP Requests → Vite Dev Server (port 3000)
│
└─ renderer/src/main.jsx
   │
   └─ App.jsx (React Router)
      │
      ├─ GET /
      │  └─ MainLayout
      │     └─ HomePage
      │
      ├─ GET /login
      │  └─ MainLayout
      │     └─ LoginPage
      │
      ├─ GET /dashboard
      │  └─ MainLayout
      │     └─ DashboardPage
      │
      ├─ GET /editor
      │  └─ EditorPage (fullscreen IDE)
      │     ├─ Sidebar
      │     ├─ Topbar
      │     ├─ Editor
      │     ├─ Terminal
      │     └─ Bottom
      │
      └─ GET * (anything else)
         └─ MainLayout
            └─ NotFoundPage (404)
```

## Component Dependencies

```
Sidebar
  ├─ React (hooks: useState)
  ├─ Sidebar.css
  └─ No external dependencies

Topbar
  ├─ React (hooks: useState)
  ├─ Topbar.css
  └─ No external dependencies

Editor
  ├─ React (hooks: useState)
  ├─ Editor.css
  └─ Ready for: highlight.js, Prism.js

Terminal
  ├─ React (hooks: useState)
  ├─ Terminal.css
  └─ Ready for: WebSocket, APIs

Bottom
  ├─ React (no hooks needed)
  ├─ Bottom.css
  └─ No external dependencies

Header
  ├─ React
  ├─ React Router (Link)
  ├─ Header.css
  └─ No external dependencies

Footer
  ├─ React
  ├─ Footer.css
  └─ No external dependencies

EditorPage
  ├─ All above components
  ├─ EditorLayout.css
  └─ Combines: Sidebar + Topbar + Editor + Terminal + Bottom

MainLayout
  ├─ React Router (Outlet)
  ├─ Header
  ├─ Footer
  ├─ Layout.css
  └─ Wraps page content

HomePage
  ├─ React Router (Link)
  ├─ Pages.css
  └─ Basic page

LoginPage
  ├─ React (hooks: useState)
  ├─ Pages.css
  └─ Form handling

DashboardPage
  ├─ React
  ├─ Pages.css
  └─ Card components

NotFoundPage
  ├─ React Router (Link)
  ├─ Pages.css
  └─ Error page

App.jsx
  ├─ React Router (BrowserRouter, Routes, Route)
  ├─ All pages and layouts
  └─ App.css
```

## CSS Architecture

```
styles/
│
├─ index.css (global defaults - imported by main.jsx)
│
├─ App.css
│  ├─ Global resets (*, html, body)
│  ├─ Root styling (#root)
│  ├─ Scrollbar styling
│  └─ Button/input resets
│
├─ Sidebar.css
│  ├─ .sidebar main container
│  ├─ .sidebar-header
│  ├─ .sidebar-nav
│  ├─ .nav-item (buttons)
│  ├─ Hover states
│  ├─ Active states
│  └─ Media queries
│
├─ Topbar.css
│  ├─ .topbar main container
│  ├─ .topbar-left (menu, title)
│  ├─ .topbar-right (buttons)
│  ├─ .btn-primary styling
│  ├─ .btn-secondary styling
│  └─ Media queries
│
├─ Editor.css
│  ├─ .editor-container
│  ├─ .editor-toolbar
│  ├─ .code-editor (textarea)
│  ├─ Syntax highlighting prep
│  ├─ .btn-success styling
│  └─ Media queries
│
├─ Terminal.css
│  ├─ .terminal-container
│  ├─ .terminal-header
│  ├─ .terminal-output
│  ├─ .terminal-input
│  ├─ Green text color scheme
│  ├─ Scrollbar styling
│  └─ Media queries
│
├─ Bottom.css
│  ├─ .bottom-bar
│  ├─ .status-info
│  ├─ .status-item
│  ├─ .status-actions
│  ├─ .status-btn
│  └─ Media queries
│
├─ EditorLayout.css
│  ├─ .editor-layout (flex container)
│  ├─ .editor-main (flex column)
│  ├─ .editor-body (flex split)
│  ├─ Responsive breakpoints
│  └─ Media queries
│
├─ Header.css
├─ Footer.css
├─ Layout.css
└─ Pages.css
```

## Styling System

### Color Palette

```
Primary Blue:       #6496ff (neon accent)
Success Green:      #22c55e (action buttons)
Dark Background:    #0f0f17 (page background)
Card Background:    #1a1a28 (component backgrounds)
Light Text:         #e5f2ff (primary text)
Muted Text:         #b0b0c0 (secondary text)
Border:             rgba(100, 150, 255, 0.2) (subtle)
```

### Design System

```
Spacing:
  - 4px (small padding)
  - 8px (standard padding)
  - 12px (component padding)
  - 16px (section padding)
  - 20px (large padding)

Border Radius:
  - 3px (small elements)
  - 4px (standard elements)
  - 10px (cards)

Transitions:
  - 0.3s ease (standard)
  - All transitions smooth and consistent

Box Shadows:
  - Subtle: rgba(0, 0, 0, 0.3)
  - Inset: for depth on panels
  - Glow: rgba(100, 150, 255, 0.3) for focus states

Fonts:
  - System fonts for UI
  - 'Courier New' or 'Fira Code' for code
  - Font sizes: 11px - 18px
  - Line heights: 1.5 for readability
```

## Performance Considerations

```
✅ Component Optimization:
  - Functional components (lighter than class components)
  - Minimal re-renders with proper state management
  - CSS-based animations (no JavaScript animations)
  - Lazy loading ready for routes

✅ CSS Optimization:
  - Single CSS file per component
  - Media queries for responsive design
  - No unused styles
  - Optimized for minification

✅ Bundle Size:
  - React 19.x (smaller bundle)
  - No external CSS frameworks (custom styles)
  - Tree-shakeable imports
  - Ready for code splitting
```

---

**Last Updated**: January 26, 2026
**Architecture Version**: 1.0
**Status**: ✅ COMPLETE & DOCUMENTED
