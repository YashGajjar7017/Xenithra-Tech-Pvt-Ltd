import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../temp/users_db.json')

// Ensure temp directory exists
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
export const findUser = (usernameOrEmail) => {
  const users = readUsers()
  const lookup = usernameOrEmail.toLowerCase()
  return users.find(u => u.username.toLowerCase() === lookup || u.email.toLowerCase() === lookup)
}

// Sign up / Create a new user
export const signUpUser = async (username, email, password) => {
  const users = readUsers()
  const cleanUsername = username.trim()
  const cleanEmail = email.trim()

  const exists = users.find(
    u => u.username.toLowerCase() === cleanUsername.toLowerCase() || 
         u.email.toLowerCase() === cleanEmail.toLowerCase()
  )
  if (exists) {
    throw new Error('User with this username or email already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

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
  const user = findUser(usernameOrEmail)
  if (!user) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
