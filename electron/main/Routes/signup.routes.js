const express = require('express')
const signUpController = require('../controller/signup.controller')
const bodyParser = require('body-parser')

const router = express.Router()
router.use(bodyParser.json())

// express.json import
router.use(express.json())

// SignUP handler - aligned with backend routes
router.get('/Signup', signUpController.SignUpToken)
router.get('/Account/Signup', (req, res) => {
  // Redirect to signup token generation
  res.redirect('/Signup')
})
router.get('/Signup/:SignUpToken', signUpController.signUp)

// POST signup - handle new user registration
router.post('/Signup', signUpController.handleSignup)
router.post('/Account/Signup', signUpController.handleSignup)

// OTP Handler - aligned with backend routes
router.get('/sendOTP', signUpController.OTP)
router.post('/verifyOTP', signUpController.PostOTP)
router.post('/sendOTP', signUpController.sendOTP)

module.exports = router
