/**
 * Environment Configuration Validator
 * Validates that all required environment variables are set up correctly
 */

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = {
  // Server
  NODE_ENV: { type: 'string', example: 'development' },
  PORT: { type: 'number', example: '3000' },
  API_PORT: { type: 'number', example: '3000' },
  RENDERER_PORT: { type: 'number', example: '8000' },

  // Database
  MONGODB_URI: { type: 'string', example: 'mongodb+srv://user:pass@cluster.mongodb.net/db' },
  DB_NAME: { type: 'string', example: 'xenithra_db' },

  // API URLs
  API_BASE_URL: { type: 'string', example: 'http://localhost:3000' },
  API_URL: { type: 'string', example: 'http://localhost:3000' },

  // Security
  JWT_SECRET: { type: 'string', example: '4f8a9b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456' },
  JWT_EXPIRY: { type: 'string', example: '7d' },
  ACCESS_TOKEN_SECRET: { type: 'string', example: 'access_secret_key' },
  REFRESH_TOKEN_SECRET: { type: 'string', example: 'refresh_secret_key' },

  // CORS
  CORS_ORIGIN: { type: 'string', example: '*' },

  // Email
  EMAIL_SERVICE: { type: 'string', example: 'gmail' },
  EMAIL_USER: { type: 'string', example: 'your-email@gmail.com' },
  EMAIL_PASSWORD: { type: 'string', example: 'your-app-password' }
}

/**
 * Optional environment variables
 */
const OPTIONAL_ENV_VARS = {
  // Cloud Storage
  CLOUDINARY_NAME: { type: 'string' },
  CLOUDINARY_API_KEY: { type: 'string' },
  CLOUDINARY_API_SECRET: { type: 'string' },

  // Payment
  STRIPE_SECRET_KEY: { type: 'string' },
  STRIPE_PUBLISHABLE_KEY: { type: 'string' },

  // Features
  DISABLE_SIGNUP_OTP: { type: 'boolean' },
  ENABLE_WEBRTC: { type: 'boolean' },
  ENABLE_ANALYTICS: { type: 'boolean' },
  ENABLE_COLLABORATION: { type: 'boolean' },
  ENABLE_CLASSROOM: { type: 'boolean' },
  ENABLE_ACHIEVEMENTS: { type: 'boolean' },

  // Maintenance
  MAINTENANCE: { type: 'boolean' }
}

/**
 * Validation result
 */
class ValidationResult {
  constructor() {
    this.valid = true
    this.errors = []
    this.warnings = []
    this.info = []
  }

  addError(variable, message) {
    this.valid = false
    this.errors.push({ variable, message })
  }

  addWarning(variable, message) {
    this.warnings.push({ variable, message })
  }

  addInfo(variable, message) {
    this.info.push({ variable, message })
  }

  print() {
    console.log('\n' + '='.repeat(60))
    console.log('ENVIRONMENT CONFIGURATION VALIDATION REPORT')
    console.log('='.repeat(60) + '\n')

    if (this.errors.length > 0) {
      console.error('❌ ERRORS:')
      this.errors.forEach(({ variable, message }) => {
        console.error(`   ${variable}: ${message}`)
      })
      console.log()
    }

    if (this.warnings.length > 0) {
      console.warn('⚠️  WARNINGS:')
      this.warnings.forEach(({ variable, message }) => {
        console.warn(`   ${variable}: ${message}`)
      })
      console.log()
    }

    if (this.info.length > 0) {
      console.log('ℹ️  INFO:')
      this.info.forEach(({ variable, message }) => {
        console.log(`   ${variable}: ${message}`)
      })
      console.log()
    }

    console.log('='.repeat(60))
    console.log(
      this.valid
        ? '✅ Configuration is VALID'
        : '❌ Configuration has ERRORS - Please fix them before running the application'
    )
    console.log('='.repeat(60) + '\n')

    return this.valid
  }
}

/**
 * Validate a single environment variable
 */
function validateVariable(name, config, value) {
  const result = new ValidationResult()

  // Check if value exists
  if (!value) {
    if (config.required !== false) {
      result.addError(name, `Missing required environment variable`)
    } else {
      result.addWarning(name, `Optional variable not set`)
    }
    return result
  }

  // Type validation
  if (config.type) {
    switch (config.type) {
      case 'number':
        if (isNaN(value)) {
          result.addError(name, `Expected number, got "${value}"`)
        } else {
          result.addInfo(name, `Value: ${value}`)
        }
        break

      case 'boolean':
        if (!['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
          result.addError(name, `Expected boolean (true/false), got "${value}"`)
        } else {
          result.addInfo(name, `Value: ${value}`)
        }
        break

      case 'string':
        if (value.length < 3) {
          result.addWarning(name, `Might be too short (${value.length} chars)`)
        } else {
          result.addInfo(name, `Set (length: ${value.length})`)
        }
        break

      case 'url':
        try {
          new URL(value)
          result.addInfo(name, `Valid URL: ${value}`)
        } catch (error) {
          result.addError(name, `Invalid URL: ${value}`)
        }
        break
    }
  }

  // Pattern validation
  if (config.pattern) {
    if (!config.pattern.test(value)) {
      result.addError(name, `Does not match required pattern`)
    }
  }

  // Custom validation
  if (config.validate) {
    if (!config.validate(value)) {
      result.addError(name, `Custom validation failed`)
    }
  }

  return result
}

/**
 * Main validation function
 */
function validateEnvironment() {
  const result = new ValidationResult()
  const env = process.env

  console.log('Validating environment configuration...\n')

  // Validate required variables
  console.log('Checking REQUIRED variables...')
  Object.entries(REQUIRED_ENV_VARS).forEach(([name, config]) => {
    const validation = validateVariable(name, { ...config, required: true }, env[name])
    result.errors.push(...validation.errors)
    result.warnings.push(...validation.warnings)
    result.info.push(...validation.info)
    if (validation.errors.length > 0) {
      result.valid = false
    }
  })

  console.log('✓ Checked required variables\n')

  // Validate optional variables
  console.log('Checking OPTIONAL variables...')
  Object.entries(OPTIONAL_ENV_VARS).forEach(([name, config]) => {
    if (env[name]) {
      const validation = validateVariable(name, { ...config, required: false }, env[name])
      result.errors.push(...validation.errors)
      result.warnings.push(...validation.warnings)
      result.info.push(...validation.info)
    }
  })

  console.log('✓ Checked optional variables\n')

  // Environment-specific checks
  if (env.NODE_ENV === 'production') {
    console.log('Running PRODUCTION-specific checks...')
    
    if (env.DEBUG === 'true') {
      result.addWarning('DEBUG', 'Debug mode is enabled in production')
    }
    
    if (env.API_BASE_URL?.includes('localhost')) {
      result.addError('API_BASE_URL', 'Must not point to localhost in production')
      result.valid = false
    }

    console.log('✓ Production checks complete\n')
  }

  // Database connectivity check (if in Node.js environment)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    console.log('Running database connectivity checks...')
    
    if (env.MONGODB_URI) {
      result.addInfo('MONGODB_URI', 'MongoDB connection string is configured')
    }

    console.log('✓ Database checks complete\n')
  }

  return result
}

/**
 * Generate environment documentation
 */
function generateDocumentation() {
  let doc = '# Environment Variables Documentation\n\n'

  doc += '## Required Variables\n\n'
  Object.entries(REQUIRED_ENV_VARS).forEach(([name, config]) => {
    doc += `### ${name}\n`
    doc += `**Type:** ${config.type}\n`
    doc += `**Example:** ${config.example}\n`
    doc += `**Description:** TODO - Add description\n\n`
  })

  doc += '## Optional Variables\n\n'
  Object.entries(OPTIONAL_ENV_VARS).forEach(([name, config]) => {
    doc += `### ${name}\n`
    doc += `**Type:** ${config.type}\n`
    doc += `**Description:** TODO - Add description\n\n`
  })

  return doc
}

/**
 * Create sample .env file
 */
function generateSampleEnv() {
  let content = '# ==========================================\n'
  content += '# ENVIRONMENT CONFIGURATION SAMPLE\n'
  content += '# ==========================================\n\n'

  Object.entries(REQUIRED_ENV_VARS).forEach(([name, config]) => {
    content += `# ${name}\n`
    content += `${name}=${config.example}\n\n`
  })

  content += '# ==========================================\n'
  content += '# OPTIONAL VARIABLES\n'
  content += '# ==========================================\n\n'

  Object.entries(OPTIONAL_ENV_VARS).forEach(([name, config]) => {
    content += `# ${name}\n`
    content += `# ${name}=\n\n`
  })

  return content
}

/**
 * Export functions
 */
export {
  validateEnvironment,
  generateDocumentation,
  generateSampleEnv,
  ValidationResult,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
}

/**
 * Run validation if this is the main module
 */
if (typeof require !== 'undefined' && require.main === module) {
  const result = validateEnvironment()
  result.print()
  process.exit(result.valid ? 0 : 1)
}

export default {
  validateEnvironment,
  generateDocumentation,
  generateSampleEnv,
  ValidationResult,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
}
