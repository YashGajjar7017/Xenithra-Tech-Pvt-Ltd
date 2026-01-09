# Project Conversion Plan: HTML to JSX

## Overview

Convert all HTML authentication pages to React JSX components with a scalable component architecture.

## Files to Convert

1. `otp.html` → `OTP.jsx` - OTP verification page
2. `login_1.html` → `Login.jsx` - Login page
3. `Signup.html` → `Signup.jsx` - Signup page
4. `forgotPassword.html` → `ForgotPassword.jsx` - Forgot password page
5. `resetPassword.html` → `ResetPassword.jsx` - Reset password page

## Component Architecture

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx          # Reusable button component
│   │   ├── Input.jsx           # Reusable input component
│   │   ├── Form.jsx            # Reusable form wrapper
│   │   └── Card.jsx            # Reusable card container
│   └── auth/
│       ├── AuthLayout.jsx      # Auth pages layout wrapper
│       ├── PasswordStrength.jsx # Password strength indicator
│       └── OTPDigitInput.jsx    # OTP digit input component
├── hooks/
│   ├── useAuth.js              # Authentication hooks
│   ├── useForm.js              # Form handling hooks
│   └── usePasswordValidation.js # Password validation logic
├── utils/
│   ├── validators.js           # Form validation utilities
│   └── api.js                  # API call utilities
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── OTP.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   └── index.js                # Export all auth pages
└── styles/
    ├── auth.css                # Shared auth styles
    └── variables.css           # CSS variables
```

## Implementation Steps

### Step 1: Create Directory Structure

- Create `components/ui/`, `components/auth/`, `hooks/`, `utils/`, `pages/auth/`, `styles/`

### Step 2: Create Reusable UI Components

- Button.jsx - With loading state, variants
- Input.jsx - With label, error handling
- Card.jsx - Glassmorphism card container
- AuthLayout.jsx - Layout wrapper for auth pages

### Step 3: Create Custom Hooks

- useForm.js - Form state management
- useAuth.js - Authentication logic
- usePasswordValidation.js - Password strength validation

### Step 4: Create Utility Functions

- validators.js - Email, password validation
- api.js - Centralized API calls

### Step 5: Convert Each HTML to JSX

- OTP.jsx - 6-digit OTP input with auto-focus
- Login.jsx - Login form with validation
- Signup.jsx - Signup with role selection
- ForgotPassword.jsx - Email submission
- ResetPassword.jsx - Password reset with strength meter

## Key Features to Preserve

✅ All existing functionality
✅ Bootstrap styling compatibility
✅ API integrations
✅ Form validation
✅ Error handling
✅ Loading states
✅ Token storage (localStorage/cookies)
✅ Page redirects

## Success Criteria

- All HTML pages converted to JSX
- Components are reusable and follow React best practices
- Proper state management with hooks
- Consistent styling approach
- Maintainable file structure
