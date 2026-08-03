# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     XENITHRA TECHNOLOGIES                       │
└─────────────────────────────────────────────────────────────────┘

                          USER BROWSER
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │  React  │    │  Router │    │ Local   │
         │  App    │    │  DOM    │    │ Storage │
         └────┬────┘    └────┬────┘    └────┬────┘
              │              │              │
              └──────────────┴──────────────┘
                      │ HTTP/CORS
                      ▼
         ┌────────────────────────────────┐
         │   EXPRESS.JS BACKEND           │
         │  (Port 5000)                   │
         ├────────────────────────────────┤
         │ Routes:                        │
         │ • POST /api/signup             │
         │ • POST /api/login              │
         │ • POST /api/logout             │
         │ • GET /api/me                  │
         └────────┬───────────────────────┘
                  │
         ┌────────▼──────────────┐
         │ Controllers:          │
         │ • auth.controller.js  │
         └────────┬──────────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │   MONGOOSE/MONGODB       │
      │  (Database Connection)   │
      ├──────────────────────────┤
      │ Collections:             │
      │ • Users                  │
      │ • Sessions (optional)    │
      └──────────────────────────┘
```

## Data Flow Diagram

### Signup Flow

```
User Input
    │
    ▼
[Signup Form] → Validation
    │
    ▼
POST /api/signup
    │
    ├─► Hash Password (bcryptjs)
    │
    ├─► Check if user exists
    │
    ├─► Create user in MongoDB
    │
    └─► Generate JWT Token
         │
         ▼
    Response: {user, token}
         │
         ▼
    Store in localStorage
         │
         ▼
    Redirect to /dashboard
```

### Login Flow

```
User Input
    │
    ▼
[Login Form] → Validation
    │
    ▼
POST /api/login
    │
    ├─► Find user in MongoDB
    │
    ├─► Compare password (bcryptjs)
    │
    ├─► If valid: Generate JWT Token
    │
    └─► If invalid: Return error
         │
         ▼
    Response: {user, token}
         │
         ▼
    Store in localStorage
         │
         ▼
    Redirect to /dashboard
```

## Frontend Architecture

```
┌──────────────────────────────────────────┐
│        React Application                 │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Beta_Index (Main App)         │ │
│  │     • Code Studio                  │ │
│  │     • Navigation                   │ │
│  │     • Menu & Sidebar               │ │
│  └──────┬───────────────────────────┬─┘ │
│         │                           │    │
│    ┌────▼────┐              ┌──────▼──┐ │
│    │  Login  │              │ Signup  │ │
│    │  Page   │              │  Page   │ │
│    └─────────┘              └─────────┘ │
│                                         │
│    ┌─────────────────────────────────┐ │
│    │    Dashboard (Protected)        │ │
│    │    • User Info                  │ │
│    │    • Stats                      │ │
│    │    • Options                    │ │
│    └─────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │    Services (API Wrapper)        │ │
│  │  • authAPI.js                    │ │
│  │    - login()                     │ │
│  │    - signup()                    │ │
│  │    - logout()                    │ │
│  │    - getCurrentUser()            │ │
│  └──────────────────────────────────┘ │
│                                        │
└──────────────────────────────────────────┘
```

## Backend Architecture

```
┌──────────────────────────────────────────┐
│     Express.js Server                    │
│     (electron/main/server.js)            │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Middleware                    │ │
│  │  • CORS                            │ │
│  │  • express.json()                  │ │
│  │  • express.urlencoded()            │ │
│  │  • cookieParser()                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Routes                        │ │
│  │  • /api/signup   (POST)            │ │
│  │  • /api/login    (POST)            │ │
│  │  • /api/logout   (POST)            │ │
│  │  • /api/refresh-token (POST)       │ │
│  │  • /api/me       (GET)             │ │
│  │  • /api/health   (GET)             │ │
│  └─────────┬────────────────────────┬─┘ │
│            │                        │    │
│  ┌─────────▼──────┐       ┌────────▼──┐ │
│  │   Controllers  │       │ Validators│ │
│  │ • auth.js      │       │ • Input   │ │
│  │   - signup()   │       │ • Auth    │ │
│  │   - login()    │       │           │ │
│  │   - logout()   │       └───────────┘ │
│  └─────────┬──────┘                     │
│            │                            │
│  ┌─────────▼──────────────────────────┐ │
│  │      Database Layer                │ │
│  │ • Models (Mongoose)                │ │
│  │   - User Model                     │ │
│  │   - Schema Validation              │ │
│  │   - Hooks                          │ │
│  └─────────┬──────────────────────────┘ │
│            │                            │
└────────────┼────────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │   MongoDB           │
    │   Database          │
    │                     │
    │ Collections:        │
    │ • users             │
    │ • sessions          │
    │ • logs              │
    └─────────────────────┘
```

## Component Hierarchy

```
                    App (main.jsx)
                        │
            ┌───────────┼───────────┐
            │           │           │
        Routes      Router       Provider
            │
        ┌───┴────────┬──────────┬──────────┬──────────────┐
        │            │          │          │              │
    Beta_Index    Login      Signup    Dashboard      Other Pages
        │            │          │          │              │
        ├─ Sidebar   Form       Form    Cards         Classroom
        ├─ Editor    Inputs     Inputs  Stats        Maintenance
        ├─ Terminal  Buttons    Buttons Links        NotFound
        ├─ TopBar
        └─ MenuBar
             │
             └─ Navigation (handleNavigation)
                  │
                  ├─ /login
                  ├─ /signup
                  ├─ /dashboard
                  ├─ /classroom
                  └─ /logout
```

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│            USER AUTHENTICATION FLOW                 │
└─────────────────────────────────────────────────────┘

SIGNUP PROCESS:
└─ User visits /signup
   └─ Fills: username, email, password, fullName
      └─ Validates (frontend)
         └─ POST /api/signup
            └─ Backend validates
               └─ Hash password (bcrypt 10 rounds)
                  └─ Create user in MongoDB
                     └─ Generate JWT token (1 hour)
                        └─ Return {user, token}
                           └─ Save to localStorage
                              └─ Redirect to /dashboard ✅

LOGIN PROCESS:
└─ User visits /login
   └─ Enters: username/email, password
      └─ Validates (frontend)
         └─ POST /api/login
            └─ Find user in MongoDB
               └─ Compare password (bcryptjs.compare)
                  ├─ Valid: Generate JWT
                  │         └─ Return {user, token}
                  │            └─ Save to localStorage
                  │               └─ Redirect to /dashboard ✅
                  └─ Invalid: Return error message
                              └─ Show on login page ❌

TOKEN USAGE:
└─ Request to protected endpoint
   └─ Get token from localStorage
      └─ Add to Authorization header
         └─ Send: Authorization: Bearer <token>
            └─ Backend validates token
               ├─ Valid: Process request
               └─ Invalid: Return 401 Unauthorized

LOGOUT:
└─ User clicks Logout
   └─ DELETE /api/logout
      └─ Clear token from backend
         └─ Clear localStorage
            └─ Redirect to /login ✅
```

## Database Schema

```
┌──────────────────────────────────────────┐
│         USERS COLLECTION                 │
├──────────────────────────────────────────┤
│                                          │
│  _id              ObjectId (PK)          │
│  username         String (Unique)        │
│  email            String (Unique)        │
│  fullName         String                 │
│  password         String (Hashed)        │
│  avatar           String (URL)           │
│  coverImage       String (URL)           │
│  watchHistory     [ObjectId] (Ref)       │
│  refreshToken     String                 │
│  createdAt        Date (Auto)            │
│  updatedAt        Date (Auto)            │
│                                          │
│  Indexes:                                │
│  • username (unique)                     │
│  • email (unique)                        │
│                                          │
│  Methods:                                │
│  • generateAccessToken()                 │
│  • generateRefreshToken()                │
│  • validatePassword()                    │
│                                          │
└──────────────────────────────────────────┘
```

## Environment Variables

```
┌──────────────────────────────────────┐
│     CONFIGURATION (.env)             │
├──────────────────────────────────────┤
│                                      │
│  DATABASE:                           │
│  MONGODB_URI = mongodb://...         │
│  DB_HOST = localhost                 │
│  DB_PORT = 27017                     │
│  DB_NAME = xenithra_db               │
│                                      │
│  SERVER:                             │
│  PORT = 5000                         │
│  NODE_ENV = development              │
│                                      │
│  SECURITY:                           │
│  JWT_SECRET = your_secret_key        │
│  JWT_EXPIRE = 7d                     │
│                                      │
│  CLIENT:                             │
│  API_URL = http://localhost:5000     │
│  RENDERER_PORT = 3000                │
│                                      │
└──────────────────────────────────────┘
```

## File Dependencies

```
┌─────────────────────────────────────────────────┐
│          DEPENDENCY GRAPH                       │
└─────────────────────────────────────────────────┘

main.jsx
  │
  ├─ React Router
  ├─ Beta_Index.jsx
  │   ├─ useNavigate
  │   ├─ CSS
  │   └─ Components
  │
  ├─ Login.jsx
  │   ├─ useNavigate
  │   ├─ authAPI
  │   └─ localStorage
  │
  ├─ Signup.jsx
  │   ├─ useNavigate
  │   ├─ authAPI
  │   └─ localStorage
  │
  └─ Dashboard_User.jsx
      ├─ useNavigate
      └─ localStorage

authAPI.js
  └─ Axios/Fetch
      └─ Backend API

electron/main/server.js
  │
  ├─ Express
  ├─ CORS
  ├─ auth.routes.js
  │   └─ auth.controller.js
  │       ├─ bcryptjs
  │       ├─ jsonwebtoken
  │       └─ User model
  │           └─ mongoose
  │
  └─ database.js
      └─ MongoDB connection
```

---

**System is fully integrated and ready for deployment! 🚀**
