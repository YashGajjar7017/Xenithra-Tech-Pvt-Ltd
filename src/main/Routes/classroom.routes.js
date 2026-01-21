const express = require('express')
const classroom = require('../controller/classroom.controller')

// express
const app = express.Router()

app.get('/', classroom.classID)
app.get('/:classroom', classroom.classroom)
app.get('/classValidation/:classroom', classroom.classroomVerify)
app.get('/classID/:classID', classroom.Class)

module.exports = app
