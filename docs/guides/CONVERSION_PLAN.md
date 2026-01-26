# Project Conversion Plan: HTML to JSX

## Overview

Convert all HTML authentication pages to React JSX components with a scalable component architecture.

## Files to Convert

1. `otp.html` â†’ `OTP.jsx` - OTP verification page
2. `login_1.html` â†’ `Login.jsx` - Login page
3. `Signup.html` â†’ `Signup.jsx` - Signup page
4. `forgotPassword.html` â†’ `ForgotPassword.jsx` - Forgot password page
5. `resetPassword.html` â†’ `ResetPassword.jsx` - Reset password page

## Component Architecture

```
src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”œâ”€â”€ Button.jsx          # Reusable button component
â”‚   â”‚   â”œâ”€â”€ Input.jsx           # Reusable input component
â”‚   â”‚   â”œâ”€â”€ Form.jsx            # Reusable form wrapper
â”‚   â”‚   â””â”€â”€ Card.jsx            # Reusable card container
â”‚   â””â”€â”€ auth/
â”‚       â”œâ”€â”€ AuthLayout.jsx      # Auth pages layout wrapper
â”‚       â”œâ”€â”€ PasswordStrength.jsx # Password strength indicator
â”‚       â””â”€â”€ OTPDigitInput.jsx    # OTP digit input component
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ useAuth.js              # Authentication hooks
â”‚   â”œâ”€â”€ useForm.js              # Form handling hooks
â”‚   â””â”€â”€ usePasswordValidation.js # Password validation logic
â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ validators.js           # Form validation utilities
â”‚   â””â”€â”€ api.js                  # API call utilities
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ Login.jsx
â”‚   â”‚   â”œâ”€â”€ Signup.jsx
â”‚   â”‚   â”œâ”€â”€ OTP.jsx
â”‚   â”‚   â”œâ”€â”€ ForgotPassword.jsx
â”‚   â”‚   â””â”€â”€ ResetPassword.jsx
â”‚   â””â”€â”€ index.js                # Export all auth pages
â””â”€â”€ styles/
    â”œâ”€â”€ auth.css                # Shared auth styles
    â””â”€â”€ variables.css           # CSS variables
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

âœ… All existing functionality
âœ… Bootstrap styling compatibility
âœ… API integrations
âœ… Form validation
âœ… Error handling
âœ… Loading states
âœ… Token storage (localStorage/cookies)
âœ… Page redirects

## Success Criteria

- All HTML pages converted to JSX
- Components are reusable and follow React best practices
- Proper state management with hooks
- Consistent styling approach
- Maintainable file structure
