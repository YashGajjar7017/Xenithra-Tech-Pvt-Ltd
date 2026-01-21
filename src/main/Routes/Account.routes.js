const express = require('express')
const WebHandler = require('../controller/engine.controller')

const router = express.Router()

// .env config
require('dotenv').config()

// express.json import
router.use(express.json())

// === ACCOUNT ROUTES ===
router.get('/Account', WebHandler.account)
router.get('/Account/:userState/:NO', WebHandler.accountNumber)
router.get('/Account/user/:userState/:NO', WebHandler.accountNumber)
router.get('/Account/complier/user/:NO', WebHandler.ComplierPage)

module.exports = router
