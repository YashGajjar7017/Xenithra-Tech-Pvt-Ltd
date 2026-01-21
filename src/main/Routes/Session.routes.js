const express = require('express')
const WebHandler = require('../controller/engine.controller')

const router = express.Router()

// .env config
require('dotenv').config()

// express.json import
router.use(express.json())

// === SESSION ROUTES ===
router.get('/session', WebHandler.session)
router.post('/session/join/token=*', WebHandler.sessionToken)
router.post('/session/share', WebHandler.sessionShare)
router.get('/sessionToken', WebHandler.sessionToken)

module.exports = router
