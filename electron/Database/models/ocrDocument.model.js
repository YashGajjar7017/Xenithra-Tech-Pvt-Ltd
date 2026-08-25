// OcrDocument Model - Dynamically loaded when mongoose is available
let OcrDocument = null

export const initOcrDocumentModel = async () => {
  try {
    const mongooseModule = await import('mongoose')
    const mongoose = mongooseModule.default || mongooseModule
    const { Schema } = mongoose

    const ocrDocumentSchema = new Schema(
      {
        filename: {
          type: String,
          required: true,
          trim: true
        },
        fileSize: {
          type: Number,
          required: true
        },
        rawText: {
          type: String,
          required: true
        },
        encodingFormat: {
          type: String,
          required: true,
          enum: ['Base64', 'JSON', 'HEX', 'ROT13', 'XML']
        },
        encodedText: {
          type: String,
          required: true
        },
        confidence: {
          type: Number,
          required: true,
          default: 100
        },
        language: {
          type: String,
          required: true,
          default: 'English'
        },
        mimeType: {
          type: String,
          default: 'image/png'
        }
      },
      { timestamps: true }
    )

    // Check if model already exists to prevent OverwriteModelError
    if (mongoose.models.OcrDocument) {
      OcrDocument = mongoose.models.OcrDocument
    } else {
      OcrDocument = mongoose.model('OcrDocument', ocrDocumentSchema)
    }
    return OcrDocument
  } catch (error) {
    console.warn('⚠️  Could not initialize OcrDocument model:', error.message)
    return null
  }
}

export default OcrDocument || {
  find: () => Promise.reject(new Error('OcrDocument model not available')),
  create: () => Promise.reject(new Error('OcrDocument model not available')),
  findByIdAndDelete: () => Promise.reject(new Error('OcrDocument model not available'))
}
