import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cloudDbPath = path.join(__dirname, '../../temp/cloud_storage.json')

// Ensure cloud db folder and file exist
const ensureCloudDb = () => {
  const dir = path.dirname(cloudDbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(cloudDbPath)) {
    const initialData = {
      users: {
        'dev@gmail.com': {
          provider: 'google',
          files: [
            { name: 'hello_google_cloud.py', content: "print('Hello from Google Drive Cloud storage!')", path: 'cloud/hello_google_cloud.py', time: new Date().toISOString() }
          ],
          settings: {
            theme: 'github-dark',
            fontSize: 14,
            selectedLanguage: 'Python 3'
          }
        },
        'dev@github.com': {
          provider: 'github',
          files: [
            { name: 'gist_example.js', content: "console.log('Synchronized via GitHub Gist Cloud');", path: 'cloud/gist_example.js', time: new Date().toISOString() }
          ],
          settings: {
            theme: 'github-dark',
            fontSize: 15,
            selectedLanguage: 'Node.js'
          }
        }
      }
    }
    fs.writeFileSync(cloudDbPath, JSON.stringify(initialData, null, 2), 'utf8')
  }
}

const readCloudDb = () => {
  ensureCloudDb()
  try {
    const data = fs.readFileSync(cloudDbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Cloud Storage] Error reading cloud storage:', error)
    return { users: {} }
  }
}

const writeCloudDb = (data) => {
  ensureCloudDb()
  try {
    fs.writeFileSync(cloudDbPath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('[Cloud Storage] Error writing cloud storage:', error)
    return false
  }
}

/**
 * Saves a file to user's cloud drive
 */
export async function saveToCloudDrive(email, provider, filename, content, filepath = '') {
  const db = readCloudDb()
  if (!db.users[email]) {
    db.users[email] = { provider, files: [], settings: {} }
  }
  
  const userFiles = db.users[email].files || []
  const existingIdx = userFiles.findIndex(f => f.name === filename)
  
  const newFile = {
    name: filename,
    content: content,
    path: filepath || `cloud/${filename}`,
    time: new Date().toISOString()
  }

  if (existingIdx !== -1) {
    userFiles[existingIdx] = newFile
  } else {
    userFiles.push(newFile)
  }

  db.users[email].files = userFiles
  writeCloudDb(db)
  console.log(`[Cloud Storage] Saved file ${filename} for user ${email} to ${provider} Drive.`)
  return { success: true, file: newFile }
}

/**
 * Loads a file from user's cloud drive
 */
export async function loadFromCloudDrive(email, filename) {
  const db = readCloudDb()
  const user = db.users[email]
  if (!user || !user.files) return null
  const file = user.files.find(f => f.name === filename)
  return file || null
}

/**
 * List files in cloud drive
 */
export async function listCloudFiles(email) {
  const db = readCloudDb()
  const user = db.users[email]
  if (!user) return []
  return user.files || []
}

/**
 * Save user workspace settings to cloud
 */
export async function saveCloudSettings(email, provider, settings) {
  const db = readCloudDb()
  if (!db.users[email]) {
    db.users[email] = { provider, files: [], settings: {} }
  }
  db.users[email].settings = {
    ...db.users[email].settings,
    ...settings
  }
  writeCloudDb(db)
  return { success: true, settings: db.users[email].settings }
}

/**
 * Load user workspace settings from cloud
 */
export async function loadCloudSettings(email) {
  const db = readCloudDb()
  const user = db.users[email]
  if (!user) return null
  return user.settings || null
}
