const jsPDF = require('jspdf')
const express = require('express')
const WebHandler = require('../controller/engine.controller')

const router = express.Router()

// === FILE MANAGEMENT ROUTES ===
router.get('/update/:fileName', WebHandler.fileupload)
router.post('/upload', WebHandler.uploadFile)

router.get('/DataSave/pdf', (req, res, next) => {
  const PDFData = req.body
  const doc = new jsPDF({
    data: PDFData,
    orientation: 'portrait',
    unit: 'px',
    format: 'a4'
  })

  doc.save('test')
})

module.exports = router
