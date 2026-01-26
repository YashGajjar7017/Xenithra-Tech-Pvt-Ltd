// User Model - Placeholder that will be initialized when mongoose is available
let User = null

export const initUserModel = async () => {
  try {
    const mongooseModule = await import('mongoose')
    const mongoose = mongooseModule.default || mongooseModule
    const { Schema } = mongoose

    const jwtModule = await import('jsonwebtoken')
    const jwt = jwtModule.default || jwtModule

    const bcryptModule = await import('bcryptjs')
    const bcrypt = bcryptModule.default || bcryptModule

    const userSchema = new Schema(
      {
        username: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
          index: true
        },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true
        },
        fullName: {
          type: String,
          required: true,
          trim: true,
          index: true
        },
        avatar: {
          type: String,
          required: true
        },
        coverImage: {
          type: String
        },
        password: {
          type: String,
          required: true
        },
        refreshToken: {
          type: String
        }
      },
      { timestamps: true }
    )

    // Pre-Hook (middleware) for password hashing
    userSchema.pre('save', async function (next) {
      if (!this.isModified('password')) {
        return next()
      }
      this.password = await bcrypt.hash(this.password, 10)
      next()
    })

    // Custom method to check password
    userSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password, this.password)
    }

    // Generate access token
    userSchema.methods.generateAccessToken = function () {
      return jwt.sign(
        {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET || 'secret',
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
      )
    }

    // Generate refresh token
    userSchema.methods.generateRefreshToken = function () {
      return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET || 'secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
      )
    }

    User = mongoose.model('User', userSchema)
    return User
  } catch (error) {
    console.warn('⚠️  Could not initialize User model:', error.message)
    return null
  }
}

// Export mock/placeholder for when mongoose is not available
export default User || {
  findOne: () => Promise.reject(new Error('User model not available')),
  create: () => Promise.reject(new Error('User model not available')),
  findById: () => Promise.reject(new Error('User model not available'))
}
