// Centralized configuration for API settings
export const PATHUMMA_CONFIG = {
  API_KEY: process.env.PATHUMMA_API_KEY || 'Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8',
  BASE_URL: process.env.PATHUMMA_BASE_URL || 'https://api.openai.com',
  MODELS: {
    TEXT: process.env.PATHUMMA_TEXT_MODEL || 'gpt-3.5-turbo',
    VOICE: process.env.PATHUMMA_VOICE_MODEL || 'whisper-1',
    VISION: process.env.PATHUMMA_VISION_MODEL || 'gpt-4-vision-preview'
  },
  DEFAULT_MAX_TOKENS: parseInt(process.env.PATHUMMA_MAX_TOKENS || '1000'),
  DEFAULT_TEMPERATURE: parseFloat(process.env.PATHUMMA_TEMPERATURE || '0.7'),
  HEADERS: {
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com',
    'X-Title': 'AI Thailand 2025 Research Assistant'
  }
}

// Helper function to get authorization header
export const getAuthHeader = () => ({
  'Authorization': `Bearer ${PATHUMMA_CONFIG.API_KEY}`
})

// Application configuration
export const APP_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
} 