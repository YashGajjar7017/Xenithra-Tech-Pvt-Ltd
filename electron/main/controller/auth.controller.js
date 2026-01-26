// Try to load dependencies
let User, jwt, bcryptjs
let dependenciesAvailable = false

// Initialize dependencies asynchronously
export const initDependencies = async () => {
  try {
    // Initialize User model first
    const userModule = await import('../../Database/models/user.model.js')
    if (userModule.initUserModel) {
      User = await userModule.initUserModel()
    } else {
      User = userModule.default || userModule
    }
    
    const jwtModule = await import('jsonwebtoken')
    jwt = jwtModule.default || jwtModule
    
    const bcryptModule = await import('bcryptjs')
    bcryptjs = bcryptModule.default || bcryptModule
    
    dependenciesAvailable = true
    console.log('✅ Auth dependencies loaded successfully')
  } catch (error) {
    console.warn('⚠️  Auth dependencies not available:', error.message)
    dependenciesAvailable = false
  }
}

// Generate JWT Tokens
const generateTokens = (userId) => {
  if (!jwt) {
    throw new Error('JWT library not available')
  }
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h'
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  })
  return { accessToken, refreshToken }
}

// Helper for unavailable dependencies
const notAvailableError = (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Authentication service not available. Please install required dependencies: npm install mongoose bcryptjs jsonwebtoken'
  })
}

// User Signup
export const signup = async (req, res) => {
  if (!dependenciesAvailable) {
    return notAvailableError(req, res)
  }
  try {
    const { username, email, password, confirmPassword, fullName } = req.body

    // Validation
    if (!username || !email || !password || !confirmPassword || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username'
      })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create new user
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      avatar: 'https://via.placeholder.com/150', // Default avatar
      coverImage: ''
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id)

    // Update refresh token in DB
    newUser.refreshToken = refreshToken
    await newUser.save()

    // Return user without password
    const userResponse = newUser.toObject()
    delete userResponse.password
    delete userResponse.refreshToken

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken
      }
    })
  } catch (error) {
    console.error('Signup Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

// User Login
export const login = async (req, res) => {
  if (!dependenciesAvailable) {
    return notAvailableError(req, res)
  }
  try {
    const { username, email, password, rememberMe } = req.body

    // Validation
    if (!password || (!username && !email)) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required'
      })
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id)

    // Update refresh token
    user.refreshToken = refreshToken
    await user.save()

    // Return user without sensitive data
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.refreshToken

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        rememberMe: rememberMe || false
      }
    })
  } catch (error) {
    console.error('Login Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

// Refresh Token
export const refreshAccessToken = async (req, res) => {
  if (!dependenciesAvailable) {
    return notAvailableError(req, res)
  }
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(decoded.userId)

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user._id)

    user.refreshToken = newRefreshToken
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('Refresh Token Error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
}

// Logout
export const logout = async (req, res) => {
  if (!dependenciesAvailable) {
    return notAvailableError(req, res)
  }
  try {
    const userId = req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    // Clear refresh token
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 }
    })

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

// Get Current User
export const getCurrentUser = async (req, res) => {
  if (!dependenciesAvailable) {
    return notAvailableError(req, res)
  }
  try {
    const userId = req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const user = await User.findById(userId).select('-password -refreshToken')

    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get Current User Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
