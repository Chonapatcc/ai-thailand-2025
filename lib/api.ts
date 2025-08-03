export interface ChatMessage {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: Date
  attachedPaper?: string
  attachedImage?: File | null
  attachedVoice?: File | null
}

export interface ChatRequest {
  message: string
  context?: string[]
  history?: ChatMessage[]
}

export interface ChatResponse {
  message: string
  error?: string
}

// Use local Next.js API routes
const API_BASE_URL = '/api'

export class ChatAPI {
  private static async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      console.log('Making API request to:', `${API_BASE_URL}${endpoint}`)
      console.log('Request data:', data)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers here
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      // Get raw text from server instead of checking response.ok
      const rawText = await response.text()
      console.log('Raw response text:', rawText)
      
      // Use AIFT standalone function for Thai responses
      const { AIFTStandalone } = await import('./aift-standalone')
      
      // Check if the message contains Thai text
      const message = data.message || ''
      const hasThaiText = /[\u0E00-\u0E7F]/.test(message)
      
      if (hasThaiText) {
        console.log('Thai text detected, using AIFT standalone function')
        const thaiResponse = await AIFTStandalone.textqa(message, {
          sessionid: 'api-chat',
          context: data.context ? data.context.join(', ') : '',
          temperature: 0.7,
          return_json: false
        })
        
        return {
          message: thaiResponse,
          success: true
        }
      }
      
      // For non-Thai text, try to parse JSON response
      try {
        const result = JSON.parse(rawText)
        console.log('API response result:', result)
        return result
      } catch (parseError) {
        console.log('Failed to parse JSON, returning raw text')
        return {
          message: rawText,
          success: true
        }
      }
      
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const result = await this.makeRequest('/chat', request)
    
    // Handle the new response format
    if (result.success && result.message) {
      return {
        message: result.message
      }
    }
    
    return result
  }

  static async analyzePapers(papers: string[], question: string): Promise<ChatResponse> {
    return this.makeRequest('/chat', {
      message: question,
      context: papers,
    })
  }

  static async summarizePapers(papers: string[]): Promise<ChatResponse> {
    return this.makeRequest('/summarize', {
      papers,
    })
  }

  static async compareMethodologies(papers: string[]): Promise<ChatResponse> {
    return this.makeRequest('/compare', {
      papers,
      type: 'methodology',
    })
  }

  static async identifyResearchGaps(papers: string[]): Promise<ChatResponse> {
    return this.makeRequest('/gaps', {
      papers,
    })
  }

  static async suggestFutureWork(papers: string[]): Promise<ChatResponse> {
    return this.makeRequest('/suggest', {
      papers,
    })
  }
}

// Fallback mock responses for development/testing
export const getMockResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes("summarize")) {
    return "Based on the papers you've shared, here are the key findings:\n\n1. **Novel Architecture**: The transformer-based approach shows significant improvements over traditional RNN models\n2. **Performance Gains**: 15-20% improvement in accuracy across multiple benchmarks\n3. **Computational Efficiency**: Reduced training time while maintaining model quality\n\nWould you like me to elaborate on any of these points?"
  }

  if (lowerMessage.includes("methodology") || lowerMessage.includes("method")) {
    return "The methodologies in these papers share some common approaches:\n\n**Similarities:**\n- Both use attention mechanisms as core components\n- Similar preprocessing techniques for data preparation\n- Comparable evaluation metrics\n\n**Key Differences:**\n- Paper A uses multi-head attention while Paper B employs single-head with different scaling\n- Different optimization strategies (Adam vs. AdamW)\n\nWhich specific aspect of the methodology would you like to explore further?"
  }

  if (lowerMessage.includes("gap") || lowerMessage.includes("research gap")) {
    return "Based on my analysis of the papers, I've identified several research gaps:\n\n1. **Limited Cross-Domain Evaluation**: Most studies focus on specific domains\n2. **Scalability Concerns**: Large-scale deployment challenges remain\n3. **Interpretability**: Need for better model interpretability methods\n\nWould you like me to elaborate on any of these areas?"
  }

  if (lowerMessage.includes("future") || lowerMessage.includes("suggest")) {
    return "Here are some promising future research directions:\n\n1. **Multi-modal Integration**: Combining text with other data types\n2. **Efficient Training**: Reducing computational requirements\n3. **Real-world Applications**: Testing in production environments\n\nWhich direction interests you most?"
  }

  return "That's an interesting question! Based on the research papers in our conversation, I can provide insights on various aspects including methodologies, results, limitations, and potential future directions. Could you be more specific about what you'd like to know?"
} 