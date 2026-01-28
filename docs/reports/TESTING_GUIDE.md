# Testing Guide - Login & Signup

## ✅ Verification Checklist

### 1. Backend Server Start
- [ ] npm run dev starts without errors
- [ ] Server shows "✅ MongoDB Connected Successfully" (or continues without DB)
- [ ] "🚀 Server running at http://localhost:5000" appears in console
- [ ] Renderer shows "dev server running at http://localhost:3000"

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{"status": "OK", "message": "Server is running"}
```

### 3. Test Signup Endpoint

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "fullName": "Test User"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "xxx",
      "username": "testuser123",
      "email": "test@example.com",
      "fullName": "Test User",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-25T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Test Cases:**
- ❌ Missing fields → Error: "All fields are required"
- ❌ Passwords don't match → Error: "Passwords do not match"
- ❌ User exists → Error: "User already exists..."
- ❌ Password < 6 chars → Error: "Password must be at least 6 characters"

### 4. Test Login Endpoint

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "Test123!@#",
    "rememberMe": false
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "xxx",
      "username": "testuser123",
      "email": "test@example.com",
      "fullName": "Test User"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "rememberMe": false
  }
}
```

**Test Cases:**
- ❌ Wrong password → Error: "Invalid credentials"
- ❌ User not found → Error: "Invalid credentials"
- ❌ Missing fields → Error: "Username/Email and password are required"

### 5. Test Frontend - Signup Page

1. Navigate to `http://localhost:3000/signup`
2. Fill in the form:
   - Full Name: John Doe
   - Username: johndoe
   - Email: john@example.com
   - Password: Test123!@#
   - Confirm Password: Test123!@#
3. Click "Sign Up"
4. Expected: Should navigate to `/dashboard` and store user in localStorage

**Verify with DevTools:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('user'))
// Should show: { id: "...", username: "johndoe", email: "john@example.com", token: "..." }
```

### 6. Test Frontend - Login Page

1. Navigate to `http://localhost:3000/login`
2. Use credentials from signup:
   - Username: johndoe
   - Password: Test123!@#
   - Check "Remember me" (optional)
3. Click "Login"
4. Expected: Should navigate to `/dashboard` and store user in localStorage

### 7. Test Beta_Index Navigation

1. Go to main app (`http://localhost:3000/`)
2. Click on account circle (👤) in menu bar
3. If not logged in: Should show Login and Signup buttons
4. If logged in: Should show user info and logout button
5. Test navigation to:
   - Dashboard
   - Logout
   - Other menu items

### 8. localStorage Verification

After successful login/signup, check:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'))
console.log(user)

// Should output:
{
  id: "...",
  username: "...",
  email: "...",
  token: "..."
}
```

## 🔍 Common Issues & Solutions

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: CORS is enabled in server.js. Clear browser cache and hard refresh.

### Issue: 404 Not Found
```
GET http://localhost:5000/api/login 404 (Not Found)
```
**Solution**: Make sure:
- Server is running (`npm run dev`)
- API base URL is correct (http://localhost:5000)
- Route path is correct (/api/login, not /api/auth/login)

### Issue: Network Error
```
Network error. Please try again.
```
**Solution**:
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check if port 5000 is open
- Check browser console for detailed error

### Issue: Mongoose Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Install MongoDB locally OR
- Use MongoDB Atlas and update MONGODB_URI in .env
- Server will continue without database (for testing)

## 📊 Test Scenarios

### Scenario 1: New User Signup Flow
1. User navigates to `/signup`
2. Fills form and submits
3. Backend validates and hashes password
4. User created in database
5. JWT token generated
6. Token stored in localStorage
7. User redirected to `/dashboard`
✅ **Result**: Should see dashboard with user info

### Scenario 2: Returning User Login Flow
1. User navigates to `/login`
2. Enters credentials
3. Backend validates credentials
4. JWT token generated
5. Token stored in localStorage
6. User redirected to `/dashboard`
✅ **Result**: Should see dashboard with user info

### Scenario 3: Invalid Credentials
1. User attempts login with wrong password
2. Backend returns "Invalid credentials" error
3. Error shown on login page
4. User remains on login page
✅ **Result**: Error message displays, can retry

### Scenario 4: Duplicate Username
1. User tries to signup with existing username
2. Backend returns error
3. User sees error message
4. User can try different username
✅ **Result**: Error handled gracefully

## 🎯 Performance Testing

### Load Testing
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:5000/api/health

# Should handle requests without crashing
```

### Response Time
- Expected: < 200ms for most endpoints
- With DB query: < 500ms

## ✨ Success Criteria

- ✅ Signup creates user in database
- ✅ Passwords are hashed (not plaintext)
- ✅ Login validates credentials correctly
- ✅ JWT tokens are generated and stored
- ✅ Tokens persist in localStorage
- ✅ Navigation works after login
- ✅ Error messages display clearly
- ✅ Form validation works
- ✅ CORS is handled properly
- ✅ All endpoints respond correctly

---

**Ready to test! 🚀**
