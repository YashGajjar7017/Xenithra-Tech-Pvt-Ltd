# 🚀 Quick Start Guide

## One-Command Setup

```bash
npm install && npm run dev
```

## URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Main App**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Dashboard**: http://localhost:3000/dashboard

## Test Credentials (After Signup)

### Signup First
1. Go to http://localhost:3000/signup
2. Fill form:
   - Full Name: John Doe
   - Username: johndoe
   - Email: john@example.com
   - Password: Test123!@#
   - Confirm: Test123!@#
3. Click "Sign Up" → Redirects to dashboard

### Then Login
1. Go to http://localhost:3000/login
2. Use:
   - Username: johndoe
   - Password: Test123!@#
3. Click "Login" → Redirects to dashboard

## Key Features

| Feature | Status |
|---------|--------|
| Signup | ✅ Working |
| Login | ✅ Working |
| JWT Tokens | ✅ Working |
| Password Hashing | ✅ Working |
| MongoDB | ✅ Connected |
| Beta_Index App | ✅ Running |
| Routing | ✅ Configured |
| API Service | ✅ Ready |

## File Locations

**Authentication**
- Controller: `electron/main/controller/auth.controller.js`
- Routes: `electron/main/Routes/auth.routes.js`
- API Wrapper: `renderer/renderer/src/services/authAPI.js`

**Pages**
- Login: `renderer/renderer/src/Login.jsx`
- Signup: `renderer/renderer/src/Signup.jsx`
- Main App: `renderer/renderer/src/Beta_Index.jsx`
- Dashboard: `renderer/renderer/src/Dashboard_User.jsx`

**Config**
- Backend: `electron/main/server.js`
- Database: `electron/main/config/database.js`
- Environment: `.env`
- Vite: `electron.vite.config.mjs`

## Command Reference

```bash
# Start development
npm run dev

# Build for production
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Format code
npm run format

# Lint code
npm run lint
```

## Useful cURL Commands

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","confirmPassword":"Test123!","fullName":"Test"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
```

## Environment Setup

### MongoDB Local
```bash
mongod
```

### MongoDB Atlas
1. Create cluster at https://mongodb.com/cloud/atlas
2. Update `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

## Troubleshoot

| Error | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| MongoDB failed | Run `mongod` or update MONGODB_URI |
| Blank page | Hard refresh: Ctrl+Shift+R |
| Network error | Check backend: http://localhost:5000/api/health |
| CORS error | Clear browser cache and reload |

## Browser Console Check

```javascript
// Check user stored
JSON.parse(localStorage.getItem('user'))

// Clear user
localStorage.removeItem('user')

// Check token
const user = JSON.parse(localStorage.getItem('user'))
console.log(user.token)
```

## Next Actions

1. ✅ Start app: `npm run dev`
2. ✅ Test signup: http://localhost:3000/signup
3. ✅ Test login: http://localhost:3000/login
4. ✅ Verify dashboard: http://localhost:3000/dashboard
5. ✅ Check database for users

## API Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {"_id":"...","username":"..."},
    "accessToken": "eyJ..."
  }
}
```

### Error (400/401/500)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Notes

- Tokens stored in localStorage persist across page refreshes
- Tokens expire in 1 hour (set in JWT_SECRET)
- Refresh tokens valid for 7 days
- All passwords automatically hashed with bcrypt
- CORS enabled for localhost:3000

---

**Status: 🟢 READY TO TEST**

Questions? Check:
- BACKEND_SETUP.md - Detailed backend guide
- TESTING_GUIDE.md - Full testing procedures
- IMPLEMENTATION_COMPLETE.md - Complete summary
