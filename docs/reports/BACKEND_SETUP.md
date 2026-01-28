# Xenithra Technologies - Backend & Authentication Setup Guide

## 📋 Overview

This project now includes:
- ✅ Component-based React frontend (Beta_Index as main app)
- ✅ Express.js backend with proper routing
- ✅ MongoDB database connection
- ✅ Authentication system (Login/Signup)
- ✅ JWT token management
- ✅ Bcrypt password hashing

## 🗂️ Project Structure

```
electron/main/
├── index.ts                 # Electron main process entry
├── server.js               # Express server setup
├── config/
│   └── database.js        # MongoDB connection
├── controller/
│   ├── auth.controller.js # Authentication logic
│   └── [other controllers]
├── Routes/
│   ├── auth.routes.js     # Auth endpoints
│   └── [other routes]
└── Database/
    └── models/
        └── user.model.js  # User schema

renderer/renderer/src/
├── Beta_Index.jsx          # Main app component
├── Login.jsx              # Login page
├── Signup.jsx             # Signup page
├── Dashboard_User.jsx     # User dashboard
├── services/
│   └── authAPI.js         # API wrapper for auth
└── [other components]
```

## 🔧 Configuration

### 1. Environment Variables (.env)
Create a `.env` file in the project root:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/xenithra_db
DB_HOST=localhost
DB_PORT=27017
DB_NAME=xenithra_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# API Configuration
API_URL=http://localhost:5000
RENDERER_PORT=3000
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xenithra_db?retryWrites=true&w=majority
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Electron App**: Native desktop app

### 3. Build for Production
```bash
npm run build
```

### 4. Build for Specific Platform
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🔐 Authentication Flow

### Signup
```
POST /api/signup
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "fullName": "John Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_token_here"
  }
}
```

### Login
```
POST /api/login
{
  "username": "john_doe",
  "password": "securePassword123",
  "rememberMe": false
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_token_here"
  }
}
```

### Refresh Token
```
POST /api/refresh-token
{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

## 📱 Frontend Integration

### Using the API Service

```javascript
import { authAPI } from './services/authAPI'

// Signup
const result = await authAPI.signup({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securePassword123',
  confirmPassword: 'securePassword123',
  fullName: 'John Doe'
})

// Login
const result = await authAPI.login({
  username: 'john_doe',
  password: 'securePassword123',
  rememberMe: false
})

// Get current user
const user = await authAPI.getCurrentUser()

// Logout
await authAPI.logout()

// Refresh token
const tokens = await authAPI.refreshToken(refreshToken)
```

### Storing User Data

```javascript
// After successful login/signup
localStorage.setItem('user', JSON.stringify({
  id: user._id,
  username: user.username,
  email: user.email,
  token: accessToken
}))

// Retrieving user data
const user = JSON.parse(localStorage.getItem('user'))

// Clearing user data on logout
localStorage.removeItem('user')
```

## 🛣️ API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/signup` | Create new account | No |
| POST | `/api/login` | User login | No |
| POST | `/api/logout` | User logout | Yes |
| POST | `/api/refresh-token` | Refresh access token | No |
| GET | `/api/me` | Get current user | Yes |
| GET | `/api/health` | Health check | No |

## 🎨 Available Routes in App

- `/` - Main page (Beta_Index)
- `/playground` - Code playground
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - User dashboard
- `/classroom` - Classroom page
- `/maintenance` - Maintenance page
- `*` - 404 Not found

## 💾 Database Models

### User Model
```javascript
{
  username: String (unique, lowercase),
  email: String (unique, lowercase),
  fullName: String,
  password: String (hashed),
  avatar: String,
  coverImage: String,
  watchHistory: [ObjectId],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ Error handling

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
mongod  # Start MongoDB service
```

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill process on that port or change PORT in .env

### CORS Error
```
❌ No 'Access-Control-Allow-Origin' header
```
**Solution**: Ensure CORS is configured in server.js (already done)

### Authentication Failed
- Verify credentials in database
- Check JWT_SECRET is consistent
- Ensure token is sent in Authorization header

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Guide](https://jwt.io/)
- [React Router Documentation](https://reactrouter.com/)

## 🚦 Next Steps

1. ✅ Set up MongoDB connection
2. ✅ Test signup endpoint
3. ✅ Test login endpoint
4. ✅ Verify tokens are stored in localStorage
5. ✅ Test protected routes
6. Add email verification
7. Add password reset functionality
8. Add role-based access control (RBAC)
9. Add user profile management
10. Add additional features

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages carefully
3. Check browser console and server logs
4. Verify database connection

---

**Happy Coding! 🚀**
