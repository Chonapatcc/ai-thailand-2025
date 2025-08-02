// Centralized configuration for API settings
export const OPENROUTER_CONFIG = {
  API_KEY: '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',
  URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'qwen/qwen3-235b-a22b:free',
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  HEADERS: {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://your-app-domain.com',
    'X-Title': 'Research AI Assistant'
  }
}

// Helper function to get authorization header
export const getAuthHeader = () => ({
  'Authorization': `Bearer ${OPENROUTER_CONFIG.API_KEY}`
}) 