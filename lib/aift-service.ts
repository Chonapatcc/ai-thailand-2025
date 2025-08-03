import { ApiErrorHandler } from './error-handler'

export interface AIFTConfig {
  apiKey: string
  model?: string
}

export interface AIFTChatParams {
  sessionid?: string
  context?: string
  temperature?: number
  return_json?: boolean
}

export class AIFTService {
  private static config: AIFTConfig
  private static sessions: Map<string, string[]> = new Map()

  static initialize(config: AIFTConfig) {
    this.config = config
  }

  static async textqa(question: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT textqa with:', { question, params })
      
      // Use AIFT standalone service (Python scripts)
      const { AIFTStandalone } = await import('./aift-standalone')
      const response = await AIFTStandalone.textqa(question, params)
      
      console.log('AIFT standalone success response:', { content: response })
      
      if (params.return_json) {
        return JSON.stringify({
          instruction: question,
          system_prompt: 'Python AIFT function call',
          content: response,
          temperature: params.temperature || 0.4,
          max_new_tokens: 256,
          execution_time: '0.04'
        })
      } else {
        return response
      }
    } catch (error) {
      console.error('AIFT textqa error:', error)
      ApiErrorHandler.logError(error, 'AIFT textqa failed')
      throw new Error('AIFT service temporarily unavailable')
    }
  }

  static async chat(message: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT chat with:', { message, params })
      
      const sessionid = params.sessionid || 'default-session'
      const context = params.context || ''
      
      // Get or create session history
      if (!this.sessions.has(sessionid)) {
        this.sessions.set(sessionid, [])
      }
      const sessionHistory = this.sessions.get(sessionid)!
      
      // Add context and message to history
      if (context) {
        sessionHistory.push(`Context: ${context}`)
      }
      sessionHistory.push(`User: ${message}`)
      
      // Use AIFT standalone service (Python scripts)
      const { AIFTStandalone } = await import('./aift-standalone')
      const response = await AIFTStandalone.chat(message, params)
      
      // Add response to session history
      sessionHistory.push(`Assistant: ${response}`)
      
      // Keep only last 10 messages to prevent memory issues
      if (sessionHistory.length > 10) {
        sessionHistory.splice(0, sessionHistory.length - 10)
      }
      
      console.log('AIFT standalone chat success response:', { content: response })
      
      if (params.return_json) {
        return JSON.stringify({
          message,
          sessionid,
          context,
          content: response,
          temperature: params.temperature || 0.4,
          execution_time: '0.04'
        })
      } else {
        return response
      }
    } catch (error) {
      console.error('AIFT chat error:', error)
      ApiErrorHandler.logError(error, 'AIFT chat failed')
      throw new Error('AIFT chat service temporarily unavailable')
    }
  }

  static async audioqa(audioFile: File, question: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT audioqa with:', { question, filename: audioFile.name, params })
      
      // Use AIFT standalone service (Python scripts) for audio analysis
      const { AIFTStandalone } = await import('./aift-standalone')
      const response = await AIFTStandalone.voiceqa(audioFile, question, params)
      console.log('AIFT standalone audioqa success response:', { content: response })
      return response
    } catch (error) {
      ApiErrorHandler.logError(error, 'AIFT audioqa failed')
      throw new Error('AIFT audio service temporarily unavailable')
    }
  }

  static async vqa(imageFile: File, question: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT vqa with:', { question, filename: imageFile.name, params })
      
      // Use AIFT standalone service (Python scripts) for image analysis
      const { AIFTStandalone } = await import('./aift-standalone')
      const response = await AIFTStandalone.imageqa(imageFile, question, params)
      console.log('AIFT standalone vqa success response:', { content: response })
      return response
    } catch (error) {
      ApiErrorHandler.logError(error, 'AIFT vqa failed')
      throw new Error('AIFT visual service temporarily unavailable')
    }
  }

  // Convenience methods for backward compatibility
  static async textQA(question: string, return_json: boolean = false): Promise<string> {
    return this.textqa(question, { return_json })
  }

  static async audioQA(audioFile: File, question: string): Promise<string> {
    return this.audioqa(audioFile, question)
  }

  static async visualQA(imageFile: File, question: string): Promise<string> {
    return this.vqa(imageFile, question)
  }

  // Method to clear session history
  static clearSession(sessionid: string): void {
    this.sessions.delete(sessionid)
  }

  // Method to get session history
  static getSessionHistory(sessionid: string): string[] {
    return this.sessions.get(sessionid) || []
  }
}

// Keep PathummaService for backward compatibility
export class PathummaService extends AIFTService {} 