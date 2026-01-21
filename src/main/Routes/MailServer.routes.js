const express = require('express')
const nodemailer = require('nodemailer')
const rateLimit = require('express-rate-limit')

const app = express.Router()

// Rate limiting for email endpoints
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 email requests per windowMs
  message: {
    error: 'Too many email requests, please try again later.'
  }
})

// Input validation middleware
const validateEmailRequest = (req, res, next) => {
  const { to, subject, text, html } = req.body

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['to', 'subject', 'text or html']
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      error: 'Invalid email address'
    })
  }

  next()
}

// Create transporter with environment variables
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Send email endpoint
app.post('/send', emailLimiter, validateEmailRequest, async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body

    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments || []
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', info.messageId)

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    })
  } catch (error) {
    console.error('Email sending failed:', error)
    res.status(500).json({
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Test email endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/test', emailLimiter, async (req, res) => {
    try {
      const transporter = createTransporter()

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Test Email from Node Compiler',
        text: 'This is a test email to verify email configuration.',
        html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
      }

      const info = await transporter.sendMail(mailOptions)

      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: info.messageId
      })
    } catch (error) {
      console.error('Test email failed:', error)
      res.status(500).json({
        error: 'Test email failed',
        details: error.message
      })
    }
  })
}

// Email templates endpoint
app.get('/templates', (req, res) => {
  const templates = {
    welcome: {
      subject: 'Welcome to Node Compiler!',
      text: 'Welcome to our coding platform. Start compiling your code today!',
      html: '<h1>Welcome!</h1><p>Welcome to our coding platform. Start compiling your code today!</p>'
    },
    passwordReset: {
      subject: 'Password Reset Request',
      text: 'Click the link to reset your password: {{resetLink}}',
      html: '<h1>Password Reset</h1><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>'
    },
    verification: {
      subject: 'Email Verification',
      text: 'Your verification code is: {{code}}',
      html: '<h1>Verification Code</h1><p>Your verification code is: <strong>{{code}}</strong></p>'
    }
  }

  res.json({
    success: true,
    templates: templates
  })
})

module.exports = app
