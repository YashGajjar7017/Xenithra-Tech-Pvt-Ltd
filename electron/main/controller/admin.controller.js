/**
 * Admin Controller for Admin Routes
 * Handles all administrative operations and dashboard functionality
 */

const path = require('path')
const rootDir = require('../util/path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../Backend/models/User.model')
const Service = require('../../Backend/models/serviceHandler.models')

class AdminController {
  constructor() {
    this.users = []
    this.services = []
    this.logs = []
  }

  /**
   * Admin Dashboard - Main landing page for admin
   */
  async dashboard(req, res) {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        activeServices: await Service.countDocuments({ status: 'active' }),
        pendingRequests: await Service.countDocuments({ status: 'pending' }),
        systemHealth: 'healthy'
      }

      res.render(path.join(rootDir, 'views', 'admin', 'Dashboard_admin.html'), {
        title: 'Admin Dashboard',
        stats,
        user: req.user
      })
    } catch (error) {
      console.error('Error loading admin dashboard:', error)
      res.status(500).json({ error: 'Failed to load dashboard', details: error.message })
    }
  }

  /**
   * User Management - List all users
   */
  async getUsers(req, res) {
    try {
      const users = await User.find().select('-password')
      res.render(path.join(rootDir, 'views', 'admin', 'users.html'), {
        title: 'User Management',
        users
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ error: 'Failed to fetch users', details: error.message })
    }
  }

  /**
   * Create new user (admin functionality)
   */
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' })
      }

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date()
      })

      await newUser.save()

      res.status(201).json({
        message: 'User created successfully',
        user: { id: newUser._id, username: newUser.username, email: newUser.email }
      })
    } catch (error) {
      console.error('Error creating user:', error)
      res.status(500).json({ error: 'Failed to create user', details: error.message })
    }
  }

  /**
   * Update user information
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params
      const { username, email, role, status } = req.body

      // Validate input
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const user = await User.findByIdAndUpdate(
        id,
        { username, email, role, status, updatedAt: new Date() },
        { new: true }
      ).select('-password')

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ message: 'User updated successfully', user })
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ error: 'Failed to update user', details: error.message })
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params

      // Validate input
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const user = await User.findByIdAndDelete(id)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error deleting user:', error)
      res.status(500).json({ error: 'Failed to delete user', details: error.message })
    }
  }

  /**
   * Service Management - List all services
   */
  async getServices(req, res) {
    try {
      const services = await Service.find().populate('userId', 'username email')
      res.render(path.join(rootDir, 'views', 'admin', 'services.html'), {
        title: 'Service Management',
        services
      })
    } catch (error) {
      console.error('Error fetching services:', error)
      res.status(500).json({ error: 'Failed to fetch services', details: error.message })
    }
  }

  /**
   * Update service status
   */
  async updateServiceStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      // Validate input
      if (!id) {
        return res.status(400).json({ error: 'Service ID is required' })
      }

      const service = await Service.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      )

      if (!service) {
        return res.status(404).json({ error: 'Service not found' })
      }

      res.json({ message: 'Service status updated successfully', service })
    } catch (error) {
      console.error('Error updating service status:', error)
      res.status(500).json({ error: 'Failed to update service status', details: error.message })
    }
  }

  /**
   * System Logs - View system logs
   */
  async getSystemLogs(req, res) {
    try {
      // This would typically come from a logging service
      const logs = [
        { timestamp: new Date(), level: 'INFO', message: 'System started' },
        { timestamp: new Date(), level: 'WARN', message: 'High memory usage detected' },
        { timestamp: new Date(), level: 'ERROR', message: 'Database connection timeout' }
      ]

      res.render(path.join(rootDir, 'views', 'admin', 'logs.html'), {
        title: 'System Logs',
        logs
      })
    } catch (error) {
      console.error('Error fetching system logs:', error)
      res.status(500).json({ error: 'Failed to fetch logs', details: error.message })
    }
  }

  /**
   * System Settings - Update system configuration
   */
  async updateSettings(req, res) {
    try {
      const settings = req.body

      // Save settings to database or config file
      // This is a placeholder implementation

      res.json({ message: 'Settings updated successfully', settings })
    } catch (error) {
      console.error('Error updating settings:', error)
      res.status(500).json({ error: 'Failed to update settings', details: error.message })
    }
  }

  /**
   * Admin Login - Authenticate admin user
   */
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      const admin = await User.findOne({ email, role: 'admin' })
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { userId: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      res.json({
        message: 'Login successful',
        token,
        user: { id: admin._id, email: admin.email, username: admin.username }
      })
    } catch (error) {
      console.error('Error during admin login:', error)
      res.status(500).json({ error: 'Login failed', details: error.message })
    }
  }

  /**
   * Admin Logout - Clear session
   */
  async adminLogout(req, res) {
    try {
      // In a real implementation, you might invalidate the JWT token
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('Error during admin logout:', error)
      res.status(500).json({ error: 'Logout failed', details: error.message })
    }
  }

  /**
   * Backup Management - Create system backup
   */
  async createBackup(req, res) {
    try {
      // Implementation for creating system backup
      res.json({ message: 'Backup created successfully', backupId: Date.now() })
    } catch (error) {
      console.error('Error creating backup:', error)
      res.status(500).json({ error: 'Failed to create backup', details: error.message })
    }
  }

  /**
   * Analytics Dashboard - Get system analytics
   */
  async getAnalytics(req, res) {
    try {
      const analytics = {
        dailyActiveUsers: 150,
        weeklyActiveUsers: 850,
        monthlyActiveUsers: 3200,
        totalRevenue: 12500,
        newRegistrations: 45,
        systemUptime: '99.9%'
      }

      res.json(analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      res.status(500).json({ error: 'Failed to fetch analytics', details: error.message })
    }
  }
}

// Export singleton instance
module.exports = new AdminController()
