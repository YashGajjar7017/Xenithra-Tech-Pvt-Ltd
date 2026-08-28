import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../temp/users_db.json')

// Mongoose User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth
  createdAt: { type: Date, default: Date.now }
})

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema)

let mongoConnected = false

const connectMongo = async () => {
  if (mongoConnected) return true
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xenithra'
    // Set 3 second timeout so it doesn't block Electron startup for too long if MongoDB isn't running
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
    mongoConnected = true
    console.log('[db.service] MongoDB connected successfully')
    return true
  } catch (err) {
    console.warn('[db.service] MongoDB connection failed, using JSON file fallback:', err.message)
    mongoConnected = false
    return false
  }
}

// Initial connection attempt
connectMongo()

// Ensure temp directory exists for JSON fallback
const ensureTempDir = () => {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Read users from the JSON file
export const readUsers = () => {
  ensureTempDir()
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([]))
      return []
    }
    const data = fs.readFileSync(dbPath, 'utf8')
    if (!data || data.trim() === '') {
      return []
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users database, resetting to empty array:', error.message)
    try {
      if (fs.existsSync(dbPath)) {
        fs.renameSync(dbPath, dbPath + '.bak_' + Date.now())
      }
      fs.writeFileSync(dbPath, JSON.stringify([]))
    } catch (e) {
      // Ignored
    }
    return []
  }
}

// Write users back to the JSON file
export const writeUsers = (users) => {
  ensureTempDir()
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing to users database:', error.message)
    return false
  }
}

// Find user by email or username
export const findUser = async (usernameOrEmail) => {
  const isConnected = await connectMongo()
  const lookup = usernameOrEmail.toLowerCase()
  if (isConnected) {
    try {
      const user = await MongoUser.findOne({
        $or: [
          { username: { $regex: new RegExp('^' + usernameOrEmail + '$', 'i') } },
          { email: { $regex: new RegExp('^' + usernameOrEmail + '$', 'i') } }
        ]
      })
      if (user) {
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt
        }
      }
    } catch (err) {
      console.error('[db.service] MongoDB findUser error:', err.message)
    }
  }

  // Fallback
  const users = readUsers()
  return users.find((u) => u.username.toLowerCase() === lookup || u.email.toLowerCase() === lookup)
}

// Sign up / Create a new user
export const signUpUser = async (username, email, password) => {
  const cleanUsername = username.trim()
  const cleanEmail = email.trim()

  const isConnected = await connectMongo()
  if (isConnected) {
    try {
      // Check if exists
      const exists = await MongoUser.findOne({
        $or: [
          { username: { $regex: new RegExp('^' + cleanUsername + '$', 'i') } },
          { email: { $regex: new RegExp('^' + cleanEmail + '$', 'i') } }
        ]
      })
      if (exists) {
        throw new Error('User with this username or email already exists')
      }

      let hashedPassword = null
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10)
      }

      const newUser = await MongoUser.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword
      })

      return {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    } catch (err) {
      if (err.message.includes('exists')) throw err
      console.error('[db.service] MongoDB signUpUser error, falling back:', err.message)
    }
  }

  // Fallback JSON implementation
  const users = readUsers()
  const exists = users.find(
    (u) =>
      u.username.toLowerCase() === cleanUsername.toLowerCase() ||
      u.email.toLowerCase() === cleanEmail.toLowerCase()
  )
  if (exists) {
    throw new Error('User with this username or email already exists')
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  writeUsers(users)

  const { password: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

// Authenticate user
export const authenticateUser = async (usernameOrEmail, password) => {
  const user = await findUser(usernameOrEmail)
  if (!user) {
    return null
  }

  if (!user.password) {
    // Registered via OAuth and has no password set
    return null
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
