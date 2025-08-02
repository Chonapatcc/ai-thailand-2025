const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface ChatMessage {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: Date
  attachedPaper?: string
}

export interface ChatRequest {
  message: string
  attachedPapers?: string[]
  conversationHistory?: ChatMessage[]
}

export interface ChatResponse {
  message: string
  timestamp: Date
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const chatApi = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        message: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Failed to send message')
    }
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Failed to fetch chat history')
    }
  },
} 