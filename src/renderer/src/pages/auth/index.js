/**
 * Auth Pages Index
 * Export all authentication page components
 */

export { default as OTP } from './OTP'
export { default as Login } from './Login'
export { default as Signup } from './Signup'
export { default as ForgotPassword } from './ForgotPassword'
export { default as ResetPassword } from './ResetPassword'

// Component usage examples:
/*
import { OTP, Login, Signup, ForgotPassword, ResetPassword } from './pages/auth'

// In your router:
// <Route path="/Account/otp" element={<OTP />} />
// <Route path="/Account/login" element={<Login />} />
// <Route path="/Account/Signup" element={<Signup />} />
// <Route path="/Account/forgotPassword" element={<ForgotPassword />} />
// <Route path="/Account/resetPassword" element={<ResetPassword />} />
*/

