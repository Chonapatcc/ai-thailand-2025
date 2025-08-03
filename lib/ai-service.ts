import { PATHUMMA_CONFIG, getAuthHeader } from './config'
import { ApiErrorHandler } from './error-handler'

export interface AIRequestConfig {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userPrompt: string
  retryAttempts?: number
  timeout?: number
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

export class AIService {
  private static readonly DEFAULT_TIMEOUT = 30000 // 30 seconds
  private static readonly DEFAULT_RETRY_ATTEMPTS = 2

  static async generateResponse(config: AIRequestConfig): Promise<AIResponse> {
    const {
      model = PATHUMMA_CONFIG.MODELS.TEXT,
      maxTokens = PATHUMMA_CONFIG.DEFAULT_MAX_TOKENS,
      temperature = PATHUMMA_CONFIG.DEFAULT_TEMPERATURE,
      systemPrompt = "You are a helpful AI assistant.",
      userPrompt,
      retryAttempts = this.DEFAULT_RETRY_ATTEMPTS,
      timeout = this.DEFAULT_TIMEOUT
    } = config

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]

    const requestBody = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(`${PATHUMMA_CONFIG.BASE_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            ...PATHUMMA_CONFIG.HEADERS,
            ...getAuthHeader()
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Pathumma API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from Pathumma API')
        }

        return {
          content: data.choices[0].message.content,
          usage: data.usage,
          model: data.model || model
        }

      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout')
          }

          if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('Authentication failed')
          }

          if (error.message.includes('429')) {
            throw new Error('Rate limit exceeded')
          }
        }

        // Log retry attempt
        if (attempt < retryAttempts) {
          console.warn(`Pathumma API attempt ${attempt + 1} failed, retrying...`, error)
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }
      }
    }

    // All retries failed
    throw lastError || new Error('AI service unavailable')
  }

  static async generateSummary(content: string, message: string): Promise<string> {
    try {
      const systemPrompt = `You are a research assistant. Provide a concise summary of the key findings, methodology, and contributions from this research paper.`

      // Limit content sent to AI to prevent excessive processing
      const maxContentLength = 8000 // 8k characters max for AI processing
      const limitedContent = content.length > maxContentLength
        ? content.substring(0, maxContentLength) + '... [Content truncated for AI processing]'
        : content

      const response = await this.generateResponse({
        systemPrompt,
        userPrompt: `${message}\n\nPaper content:\n${limitedContent}`,
        maxTokens: 500,
        temperature: 0.7,
        model: PATHUMMA_CONFIG.MODELS.TEXT
      })

      return response.content

    } catch (error) {
      ApiErrorHandler.logError(error, 'Summary generation failed')
      return 'Summary generation failed'
    }
  }

  static async generateChatResponse(message: string, context?: string[], history?: any[]): Promise<string> {
    try {
      const systemPrompt = `You are an expert AI research assistant specializing in artificial intelligence, machine learning, and computer science research.

Your capabilities include:
- Analyzing research papers and technical documents
- Explaining complex AI concepts in simple terms
- Providing insights on research methodologies
- Suggesting research directions and improvements
- Comparing different approaches and techniques

Be helpful, accurate, and provide detailed explanations when appropriate.`

      const userPrompt = `User Message: ${message}

${context && context.length > 0 ? `Context Papers: ${context.join(', ')}` : ''}

${history && history.length > 0 ? `Recent Conversation History: ${JSON.stringify(history.slice(-5))}` : ''}

Please provide a helpful and informative response.`

      const response = await this.generateResponse({
        systemPrompt,
        userPrompt,
        maxTokens: 1500,
        temperature: 0.7,
        model: PATHUMMA_CONFIG.MODELS.TEXT
      })

      return response.content

    } catch (error) {
      ApiErrorHandler.logError(error, 'Chat response generation failed')
      throw error
    }
  }

  static async generatePaperAnalysis(content: string, message: string, context?: string[]): Promise<string> {
    try {
      const systemPrompt = `You are an expert research analyst specializing in academic paper analysis and summarization.

Your task is to:
1. Analyze the provided research paper content
2. Provide a comprehensive summary of key findings
3. Identify main methodologies and results
4. Highlight significant contributions to the field
5. Answer any specific questions about the paper

Be thorough, accurate, and academic in your analysis.`

      const maxContentLength = 6000 // 6k characters max for analysis
      const limitedContent = content.length > maxContentLength
        ? content.substring(0, maxContentLength) + '... [Content truncated for analysis]'
        : content

      const userPrompt = `Research Paper Content:
${limitedContent}

User Question: ${message}

${context && context.length > 0 ? `Context Papers: ${context.join(', ')}` : ''}

Please provide:
1. A comprehensive summary of the paper
2. Key findings and contributions
3. Methodology overview
4. Significance and implications
5. Answer to the user's specific question

Format your response clearly with sections and bullet points where appropriate.`

      const response = await this.generateResponse({
        systemPrompt,
        userPrompt,
        maxTokens: 2000,
        temperature: 0.3,
        model: PATHUMMA_CONFIG.MODELS.TEXT
      })

      return response.content

    } catch (error) {
      ApiErrorHandler.logError(error, 'Paper analysis generation failed')
      throw error
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 