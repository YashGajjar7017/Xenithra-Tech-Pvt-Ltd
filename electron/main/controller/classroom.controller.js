const path = require('path')
const rootDir = require('../util/path')
const http = require('http')

// Functions are here
function generateClassId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let ID = ''
  for (let i = 0; i < length; i++) {
    ID += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return ID
}

// timeout
// const Timer = setTimeout(() => {
//     window.location.href('/classroom/classID')
// }, 2000);

// classID generator
const classID = function (req, res, next) {
  res.redirect(`/classroom/${generateClassId(25)}`)
}

// classLoader
const classroom = function (req, res, next) {
  const classID = req.params.classroom
  const method = req.method

  res.setHeader('Content-Type', 'Text/html')
  res.statusCode = 200
  if (classID.length == 25) {
    res.sendFile(path.join(rootDir, 'views', 'classroom.html'))
  } else {
    res.send('Something went wrong while connecting to classroom')
  }

  // res.write('<center><h2>You are enter into classroom</h2><br>Your Token is : <bold style="background-color:#444;color:#fff;padding:5px">9J2k2350lOP96KMHKSL</bold></center>');
  // next(res.redirect(`/classValidation=True`))
  // res.end()
}

const classroomVerify = function (req, res, next) {
  if (req.baseUrl == true) {
  } else {
    res._destroy()
    res.closed
  }
  res.set('Content-Type', 'text/html')
  res.statusCode = 200
  res.sendFile(path.join(rootDir, 'other', 'classroom.html'))
  next()
}

// classroom ID
const Class = function (req, res, next) {
  res.set('Content-Type', 'text/html')
  res.statusCode = 200
  res.send('<h1>Getting class ID</h1>')
  console.log('you ID is req')
  req.baseUrl()
}

module.exports = { classID, classroom, classroomVerify, Class }
