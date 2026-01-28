import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

let mongooseConnected = false

// Database Connection (optional)
const connectDatabase = async () => {
  try {
    const mongoose = await import('mongoose')
    const mongooseDefault = mongoose.default || mongoose
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xenithra_db'
    await mongooseDefault.connect(mongoUri)
    console.log('MongoDB Connected Successfully')
    mongooseConnected = true
    return true
  } catch (error) {
    console.warn('~ MongoDB Connection Error:', (error).message)
    console.warn('~ Running without database - use npm install mongoose to enable')
    return false
  }
}

// Load routes if available
const loadRoutes = async () => {
  try {
    const authModule = await import('./Routes/auth.routes.js')
    const authRoutes = authModule.default || authModule
    if (authRoutes) {
      app.use('/api', authRoutes)
      console.log('Auth routes loaded')
    }
  } catch (error) {
    console.warn('~ Could not load auth routes:', (error).message)
  }
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    database: mongooseConnected ? 'Connected' : 'Not connected'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// Start server
const startServer = async () => {
  try {
    // Try to connect to database
    await connectDatabase()
  } catch (error) {
    console.warn('Database connection failed:', (error).message)
  }

  try {
    // Load routes
    await loadRoutes()
  } catch (error) {
    console.warn('Failed to load routes:', (error).message)
  }

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
      resolve(null)
    })
  })
}

export default startServer
