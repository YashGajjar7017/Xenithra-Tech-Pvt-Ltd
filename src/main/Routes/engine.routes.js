const express = require('express')
const WebHandler = require('../controller/engine.controller')

const router = express.Router()

// .env config
require('dotenv').config()

// express.json import
router.use(express.json())

// === MAIN ROUTES ===
router.get('/', WebHandler.ComplierPage)
router.get('/start', WebHandler.startPage)
router.get('/features', WebHandler.features)

// === GLOBAL ERROR HANDLER ===
router.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  })
})

// === ERROR HANDLING ===
// router.use((req, res) => {
//     res.status(404).json({
//         error: 'Route not found',
//         message: `Cannot ${req.method} ${req.path}`
//     });
// });

module.exports = router
