import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initOcrDocumentModel } from '../../Database/models/ocrDocument.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localDbPath = path.join(__dirname, '../temp/ocr_documents_db.json')

// Ensure temp directory exists
const ensureTempDir = () => {
  const dir = path.dirname(localDbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Read from JSON database
const readLocalDb = () => {
  ensureTempDir()
  try {
    if (!fs.existsSync(localDbPath)) {
      fs.writeFileSync(localDbPath, JSON.stringify([]))
      return []
    }
    const data = fs.readFileSync(localDbPath, 'utf8')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading OCR local DB:', error.message)
    return []
  }
}

// Write to JSON database
const writeLocalDb = (data) => {
  ensureTempDir()
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing OCR local DB:', error.message)
    return false
  }
}

// OCR Decoding Mock Templates for realistic scans
const OCR_TEMPLATES = [
  {
    keywords: ['invoice', 'bill', 'receipt'],
    text: `XENITHRA TECHNOLOGIES PVT LTD\nINVOICE #INV-2026-089\nDate: August 26, 2026\nDue Date: September 26, 2026\n\nBILL TO:\nClient: Yash Gajjar\nEmail: yash@xenithra.com\n\nDESCRIPTION               QTY    RATE       AMOUNT\n-------------------------------------------------\nNovaGlass IDE Enterprise    1    $599.00    $599.00\nCloud Sync Add-on           1    $149.00    $149.00\nConsulting & Setup          5    $100.00    $500.00\n\n-------------------------------------------------\nSUBTOTAL                                 $1248.00\nTAX (18% GST)                            $224.64\nTOTAL DUE                                $1472.64\n\nThank you for your business!`,
    confidence: 99.4,
    language: 'English',
    blocks: [
      { text: 'XENITHRA TECHNOLOGIES PVT LTD', x: 20, y: 30, w: 250, h: 25, confidence: 99.9 },
      { text: 'INVOICE #INV-2026-089', x: 380, y: 30, w: 180, h: 20, confidence: 99.7 },
      { text: 'Date: August 26, 2026', x: 380, y: 55, w: 150, h: 15, confidence: 99.8 },
      { text: 'BILL TO:', x: 20, y: 100, w: 70, h: 18, confidence: 99.5 },
      { text: 'Client: Yash Gajjar', x: 20, y: 125, w: 120, h: 15, confidence: 99.1 },
      { text: 'NovaGlass IDE Enterprise', x: 20, y: 195, w: 180, h: 15, confidence: 99.6 },
      { text: 'TOTAL DUE: $1472.64', x: 380, y: 280, w: 160, h: 22, confidence: 99.9 }
    ]
  },
  {
    keywords: ['resume', 'cv', 'profile', 'experience'],
    text: `YASH GAJJAR\nLead Software Engineer & Architect\nEmail: yash@xenithra.com | Web: xenithra.com\n\nSUMMARY:\nHighly skilled developer with 8+ years of experience building modern desktop apps, compiler utilities, and high-performance Electron modules.\n\nEXPERIENCE:\n- Lead Developer @ Xenithra Technologies (2022 - Present)\n  Designed NovaGlass IDE architecture, database syncing protocols, and Docker modules.\n- Senior Frontend Engineer @ Tech Solutions (2018 - 2022)\n  Built complex React applications, state libraries, and responsive dashboards.\n\nEDUCATION:\n- B.Tech in Computer Science, Gujarat Technological University\n\nSKILLS:\nJavaScript, TypeScript, React, Electron, Node.js, WebRTC, Docker, MongoDB`,
    confidence: 98.7,
    language: 'English',
    blocks: [
      { text: 'YASH GAJJAR', x: 200, y: 20, w: 160, h: 30, confidence: 99.9 },
      {
        text: 'Lead Software Engineer & Architect',
        x: 140,
        y: 55,
        w: 280,
        h: 18,
        confidence: 99.5
      },
      { text: 'SUMMARY:', x: 20, y: 95, w: 80, h: 16, confidence: 98.9 },
      {
        text: 'Lead Developer @ Xenithra Technologies',
        x: 20,
        y: 180,
        w: 320,
        h: 15,
        confidence: 99.2
      },
      {
        text: 'SKILLS: JavaScript, TypeScript, React, Electron',
        x: 20,
        y: 310,
        w: 420,
        h: 15,
        confidence: 98.4
      }
    ]
  },
  {
    keywords: ['code', 'function', 'class', 'import'],
    text: `import React, { useState, useEffect } from 'react';\n\nexport const Counter = () => {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    console.log(\`Count changed: \${count}\`);\n  }, [count]);\n\n  return (\n    <div className="counter-container">\n      <p>Current count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n};`,
    confidence: 97.5,
    language: 'JavaScript',
    blocks: [
      {
        text: "import React, { useState } from 'react'",
        x: 10,
        y: 20,
        w: 290,
        h: 15,
        confidence: 98.5
      },
      { text: 'export const Counter = () => {', x: 10, y: 50, w: 220, h: 15, confidence: 99.1 },
      {
        text: 'const [count, setCount] = useState(0);',
        x: 30,
        y: 70,
        w: 280,
        h: 15,
        confidence: 96.8
      },
      { text: 'return (', x: 30, y: 150, w: 70, h: 15, confidence: 99.5 }
    ]
  }
]

// Text encoders
export const encodeText = (text, format) => {
  if (!text) return ''
  switch (format) {
    case 'Base64':
      return Buffer.from(text).toString('base64')
    case 'JSON':
      return JSON.stringify(
        {
          documentText: text,
          length: text.length,
          lines: text.split('\n').length,
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    case 'HEX':
      return (
        Buffer.from(text)
          .toString('hex')
          .match(/.{1,2}/g)
          ?.join(' ') || ''
      )
    case 'ROT13':
      return text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
      })
    case 'XML':
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
      return `<?xml version="1.0" encoding="UTF-8"?>\n<ocrDocument>\n  <metadata>\n    <timestamp>${new Date().toISOString()}</timestamp>\n    <charCount>${text.length}</charCount>\n  </metadata>\n  <content>\n${escaped
        .split('\n')
        .map((line) => `    <line>${line}</line>`)
        .join('\n')}\n  </content>\n</ocrDocument>`
    default:
      return text
  }
}

// Perform simulated OCR Decode
export const decodeOcrDocument = async (filename, fileSize, fileContentBase64 = '') => {
  // If we have actual file content (like text files/logs), we can decode them
  let text = ''
  let confidence = 95.0
  let language = 'English'
  let blocks = []

  const lowerName = filename.toLowerCase()

  // Match keyword templates for realistic simulation
  const matchedTemplate = OCR_TEMPLATES.find((t) => t.keywords.some((kw) => lowerName.includes(kw)))

  if (matchedTemplate) {
    text = matchedTemplate.text
    confidence = matchedTemplate.confidence
    language = matchedTemplate.language
    blocks = matchedTemplate.blocks
  } else {
    // Generate generic text block OCR
    text = `DOCUMENT SCANNED: ${filename}\nFile Size: ${(fileSize / 1024).toFixed(2)} KB\nScan Date: ${new Date().toLocaleString()}\n\nThis is a simulated OCR result for the uploaded file.\nThe layout has been analyzed and segmented into paragraph blocks.\nYou can edit this raw extracted text in the editor panel to the right, which will automatically re-encode the output into Base64, Hexadecimal, JSON, XML, or ROT13 format.`
    confidence = parseFloat((92 + Math.random() * 7).toFixed(1))
    language = 'English'
    blocks = [
      { text: `DOCUMENT SCANNED: ${filename}`, x: 30, y: 40, w: 320, h: 22, confidence: 99.1 },
      {
        text: `File Size: ${(fileSize / 1024).toFixed(2)} KB`,
        x: 30,
        y: 75,
        w: 180,
        h: 14,
        confidence: 98.7
      },
      { text: 'This is a simulated OCR result', x: 30, y: 120, w: 280, h: 15, confidence: 96.5 },
      {
        text: 'You can edit this raw extracted text',
        x: 30,
        y: 150,
        w: 310,
        h: 15,
        confidence: 94.2
      }
    ]
  }

  // Adjust coordinates slightly for variety
  blocks = blocks.map((b) => ({
    ...b,
    x: Math.round(b.x + (Math.random() * 4 - 2)),
    y: Math.round(b.y + (Math.random() * 4 - 2))
  }))

  return {
    filename,
    fileSize,
    rawText: text,
    confidence,
    language,
    blocks
  }
}

// Save OCR scanned document
export const saveOcrDocument = async (docData) => {
  const { filename, fileSize, rawText, encodingFormat, confidence, language, mimeType } = docData
  const encodedText = encodeText(rawText, encodingFormat)

  const newDoc = {
    id: 'ocr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    filename,
    fileSize,
    rawText,
    encodingFormat,
    encodedText,
    confidence,
    language,
    mimeType: mimeType || 'image/png',
    createdAt: new Date().toISOString()
  }

  // Save to JSON fallback DB
  const localDb = readLocalDb()
  localDb.unshift(newDoc)
  writeLocalDb(localDb)

  // Save to MongoDB if online
  try {
    const OcrDocumentModel = await initOcrDocumentModel()
    if (OcrDocumentModel && typeof OcrDocumentModel.create === 'function') {
      await OcrDocumentModel.create(newDoc)
      console.log('Saved OCR Document to MongoDB')
    }
  } catch (error) {
    console.warn('MongoDB OCR Save bypassed:', error.message)
  }

  return { success: true, document: newDoc }
}

// Fetch OCR history list
export const getOcrHistory = async () => {
  // Read local DB
  const localDb = readLocalDb()

  // Try reading MongoDB to sync / fetch freshest
  try {
    const OcrDocumentModel = await initOcrDocumentModel()
    if (OcrDocumentModel && typeof OcrDocumentModel.find === 'function') {
      const dbDocs = await OcrDocumentModel.find({}).sort({ createdAt: -1 })
      if (dbDocs && dbDocs.length > 0) {
        // Return DB records if available
        return dbDocs.map((d) => (d.toObject ? d.toObject() : d))
      }
    }
  } catch (error) {
    console.warn('MongoDB OCR Fetch bypassed, using local JSON DB:', error.message)
  }

  return localDb
}

// Delete OCR document
export const deleteOcrDocument = async (docId) => {
  // Delete from local DB
  const localDb = readLocalDb()
  const updatedDb = localDb.filter((d) => d.id !== docId && d._id !== docId)
  writeLocalDb(updatedDb)

  // Delete from MongoDB if available
  try {
    const OcrDocumentModel = await initOcrDocumentModel()
    if (OcrDocumentModel && typeof OcrDocumentModel.findByIdAndDelete === 'function') {
      await OcrDocumentModel.findByIdAndDelete(docId)
      console.log('Deleted OCR Document from MongoDB')
    }
  } catch (error) {
    console.warn('MongoDB OCR Delete bypassed:', error.message)
  }

  return { success: true }
}
