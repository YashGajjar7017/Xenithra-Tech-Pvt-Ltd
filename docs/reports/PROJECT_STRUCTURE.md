# Xenithra Technologies - Project Structure

## 📁 Directory Organization

The project follows a **component-based architecture** with clear separation of concerns:

```
xenithra-technologies/
├── electron/                    # Electron main process
│   ├── main/
│   │   ├── index.ts            # Main electron entry point
│   │   ├── api.js              # Backend APIs
│   │   ├── controller/         # Business logic controllers
│   │   ├── Routes/             # Express routes
│   │   ├── middlewares/        # Express middlewares
│   │   ├── Services/           # Service utilities
│   │   └── Database/           # Database models
│   └── preload/
│       ├── index.ts            # Preload script entry point
│       └── util/               # Preload utilities
│
├── renderer/                    # Frontend (React + Vite)
│   ├── index.html              # Main HTML file
│   ├── public/                 # Static assets
│   │   └── images/
│   └── src/
│       ├── main.jsx            # React app entry point
│       ├── App.jsx             # Root component
│       ├── components/         # Reusable UI components
│       │   ├── Header.jsx
│       │   └── Footer.jsx
│       ├── pages/              # Page components (routes)
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── layouts/            # Layout components
│       │   └── MainLayout.jsx
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API/backend services
│       ├── stores/             # State management (Redux, Zustand, etc.)
│       ├── utils/              # Utility functions
│       ├── assets/             # Images, fonts, etc.
│       └── styles/             # Global and component styles
│           ├── index.css
│           ├── App.css
│           ├── Header.css
│           ├── Footer.css
│           ├── Layout.css
│           └── Pages.css
│
├── electron.vite.config.mjs    # Vite config for electron
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Build for Specific Platform

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

## 📦 Component Structure

Each component follows this pattern:

```
components/
├── Header/
│   ├── Header.jsx          # Component file
│   ├── Header.module.css   # Scoped styles (optional)
│   └── index.js            # Barrel export
```

## 🏗️ Architecture Benefits

- **Scalability**: Easy to add new features
- **Maintainability**: Clear folder structure
- **Reusability**: Component-based design
- **Separation of Concerns**: Each folder has a specific purpose
- **Ease of Testing**: Components are isolated

## 📝 Configuration

### Electron Vite Config

- **Main Entry**: `electron/main/index.ts`
- **Preload Entry**: `electron/preload/index.ts`
- **Renderer Root**: `renderer/`
- **Renderer Entry**: `renderer/index.html`

### Path Aliases (in electron.vite.config.mjs)

```javascript
'@': 'renderer/src'
'@components': 'renderer/src/components'
'@hooks': 'renderer/src/hooks'
'@pages': 'renderer/src/pages'
'@services': 'renderer/src/services'
'@stores': 'renderer/src/stores'
'@utils': 'renderer/src/utils'
'@assets': 'renderer/src/assets'
'@styles': 'renderer/src/styles'
```

## 🔧 Development

### Adding a New Page

1. Create a new component in `renderer/src/pages/`
2. Add the route in `renderer/src/App.jsx`
3. Create styles in `renderer/src/styles/`

### Adding a New Component

1. Create component in `renderer/src/components/`
2. Add corresponding styles in `renderer/src/styles/`
3. Export from component's `index.js` (barrel export)

### Adding Backend Routes

1. Create new route file in `electron/main/Routes/`
2. Import and use in `electron/main/api.js`
3. Define controller logic in `electron/main/controller/`

## 📚 Technologies

- **Electron**: Desktop app framework
- **Vite**: Build tool and dev server
- **React**: UI library
- **React Router**: Client-side routing
- **Express** (optional): Backend API server
- **Bootstrap**: CSS framework (optional)

## 🎯 Best Practices

1. Keep components small and focused
2. Use functional components with hooks
3. Separate styles from logic
4. Use path aliases for clean imports
5. Keep API calls in service files
6. Use custom hooks for shared logic
7. Maintain consistent naming conventions
