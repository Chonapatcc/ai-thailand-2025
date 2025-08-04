import { ApiErrorHandler } from './error-handler'

export interface VectorDocument {
  id: string
  content: string
  metadata: {
    filename: string
    uploadDate: string
    tags: string[]
    summary?: string
    sourceUrl?: string
    headers?: string[]
  }
}

export interface SearchResult {
  id: string
  content: string
  metadata: any
  score: number
}

class VectorDatabase {
  private documents: Map<string, VectorDocument> = new Map()
  private embeddings: Map<string, number[]> = new Map()

  async addDocument(id: string, content: string, metadata: any): Promise<void> {
    try {
      // Store document
      this.documents.set(id, {
        id,
        content,
        metadata: {
          filename: metadata.filename || 'Unknown',
          uploadDate: metadata.uploadDate || new Date().toISOString(),
          tags: metadata.tags || [],
          summary: metadata.summary,
          sourceUrl: metadata.sourceUrl,
          headers: metadata.headers || []
        }
      })

      // Generate embedding with error handling
      try {
        const embedding = await this.generateEmbedding(content)
        this.embeddings.set(id, embedding)
      } catch (embeddingError) {
        ApiErrorHandler.logError(embeddingError, 'BGE embedding failed, storing document without embedding')
        // Store document without embedding - it can still be searched by text
      }
    } catch (error) {
      ApiErrorHandler.logError(error, 'Failed to add document to vector database')
      throw new Error('Failed to store document')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use a fallback embedding service if BGE fails
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: text.substring(0, 8000), // Limit text length
          model: 'text-embedding-ada-002'
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      // Fallback to simple text-based similarity
      ApiErrorHandler.logError(error, 'Embedding generation failed, using fallback')
      return this.generateSimpleEmbedding(text)
    }
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple fallback embedding based on character frequency
    const embedding = new Array(384).fill(0)
    const chars = text.toLowerCase().split('')
    
    for (let i = 0; i < chars.length && i < 384; i++) {
      const charCode = chars[i].charCodeAt(0)
      embedding[i % 384] += charCode / 255
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  async searchDocuments(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = []
      
      // Try vector search first
      try {
        const queryEmbedding = await this.generateEmbedding(query)
        
        for (const [id, doc] of this.documents) {
          const docEmbedding = this.embeddings.get(id)
          if (docEmbedding) {
            const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding)
            results.push({
              id,
              content: doc.content,
              metadata: doc.metadata,
              score: similarity
            })
          }
        }
        
        // Sort by similarity score
        results.sort((a, b) => b.score - a.score)
        
        if (results.length > 0) {
          return results.slice(0, limit)
        }
      } catch (vectorError) {
        ApiErrorHandler.logError(vectorError, 'Vector search failed, falling back to text search')
      }
      
      // Fallback to text-based search
      return this.textSearch(query, limit)
      
    } catch (error) {
      ApiErrorHandler.logError(error, 'Document search failed')
      return []
    }
  }

  private textSearch(query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()
    
    for (const [id, doc] of this.documents) {
      const contentLower = doc.content.toLowerCase()
      const titleLower = doc.metadata.filename.toLowerCase()
      
      // Calculate text similarity
      let score = 0
      
      // Exact matches get higher scores
      if (contentLower.includes(queryLower)) score += 0.8
      if (titleLower.includes(queryLower)) score += 0.9
      
      // Partial word matches
      const queryWords = queryLower.split(' ').filter(word => word.length > 2)
      for (const word of queryWords) {
        if (contentLower.includes(word)) score += 0.3
        if (titleLower.includes(word)) score += 0.4
      }
      
      if (score > 0) {
        results.push({
          id,
          content: doc.content,
          metadata: doc.metadata,
          score: Math.min(score, 1.0)
        })
      }
    }
    
    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id)
    this.embeddings.delete(id)
  }

  async getAllDocuments(): Promise<VectorDocument[]> {
    return Array.from(this.documents.values())
  }

  async getDocument(id: string): Promise<VectorDocument | null> {
    return this.documents.get(id) || null
  }
}

export const vectorDB = new VectorDatabase() 