import { NextRequest, NextResponse } from 'next/server'
import { encodeText } from '@/lib/rag-utils'

export async function POST(request: NextRequest) {
  try {
    const { text1, text2 } = await request.json()
    
    if (!text1 || !text2) {
      return NextResponse.json({ error: 'Both text1 and text2 are required' }, { status: 400 })
    }
    
    console.log('Testing cosine similarity with BGE API...')
    console.log('Text 1:', text1.substring(0, 100) + '...')
    console.log('Text 2:', text2.substring(0, 100) + '...')
    
    // Encode both texts using BGE API
    const embedding1 = await encodeText(text1)
    const embedding2 = await encodeText(text2)
    
    console.log('Embedding 1 length:', embedding1.length)
    console.log('Embedding 2 length:', embedding2.length)
    
    // Calculate cosine similarity
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      normA += embedding1[i] * embedding1[i]
      normB += embedding2[i] * embedding2[i]
    }
    
    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)
    
    let similarity = 0
    if (normA !== 0 && normB !== 0) {
      similarity = dotProduct / (normA * normB)
      similarity = Math.max(0, Math.min(1, similarity)) // Ensure between 0 and 1
    }
    
    const percentage = Math.round(similarity * 100)
    
    console.log('Cosine similarity:', similarity)
    console.log('Percentage:', percentage + '%')
    
    return NextResponse.json({
      success: true,
      similarity: similarity,
      percentage: percentage,
      embedding1Length: embedding1.length,
      embedding2Length: embedding2.length
    })
    
  } catch (error) {
    console.error('Similarity test failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  }
} 