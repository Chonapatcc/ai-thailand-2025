import { getAuthHeader } from '@/lib/config'

export interface SimilarityScore {
  score: number
  explanation: string
  summary: string
}

export async function calculateSimilarityScore(
  paperContent: string,
  searchQuery: string,
  context?: string
): Promise<SimilarityScore> {
  try {
    const systemPrompt = `You are an expert research analyst. Analyze the similarity between a research paper and a search query. 
    
    Provide:
    1. A similarity score (0-100) based on relevance
    2. A brief explanation of why this score was given
    3. A concise summary of the paper's key findings and methodology
    
    Be objective and thorough in your analysis.`

    const userPrompt = `Paper Content: ${paperContent.substring(0, 4000)}
    
    Search Query: ${searchQuery}
    
    ${context ? `Context: ${context}` : ''}
    
    Please provide:
    - Similarity Score (0-100)
    - Brief explanation
    - Paper summary (2-3 sentences)`

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]

    // Use fallback similarity calculation since OpenRouter is removed
    return calculateFallbackSimilarity(paperContent, searchQuery);
  } catch (error) {
    console.error('Error calculating similarity score:', error);
    return {
      score: 50,
      explanation: 'Unable to calculate similarity score due to processing error',
      summary: 'Paper content analysis unavailable'
    };
  }
}

function calculateFallbackSimilarity(paperContent: string, searchQuery: string): SimilarityScore {
  const paperLower = paperContent.toLowerCase()
  const queryLower = searchQuery.toLowerCase()
  
  // Simple keyword matching
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2)
  let matchCount = 0
  
  queryWords.forEach(word => {
    if (paperLower.includes(word)) {
      matchCount++
    }
  })
  
  const score = Math.min(100, Math.round((matchCount / queryWords.length) * 100))
  
  return {
    score: score || 25, // Minimum 25% if no matches
    explanation: `Fallback calculation: ${matchCount}/${queryWords.length} keywords matched`,
    summary: 'Paper content analyzed using keyword matching'
  }
}

export async function calculateHistoricalSimilarity(
  paperContent: string,
  recentQueries: string[]
): Promise<SimilarityScore> {
  try {
    const systemPrompt = `You are an expert research analyst. Analyze how well a research paper matches recent search patterns and interests.
    
    Consider:
    - Relevance to recent search queries
    - Alignment with user's research interests
    - Potential value based on search history
    
    Provide:
    1. A relevance score (0-100)
    2. Explanation of the score
    3. Brief summary of the paper's key contributions`

    const userPrompt = `Paper Content: ${paperContent.substring(0, 4000)}
    
    Recent Search Queries: ${recentQueries.join(', ')}
    
    Please provide:
    - Relevance Score (0-100)
    - Brief explanation
    - Paper summary (2-3 sentences)`

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]

    // Use fallback historical similarity calculation since OpenRouter is removed
    return calculateFallbackHistoricalSimilarity(paperContent, recentQueries);
  } catch (error) {
    console.error('Error calculating historical similarity:', error);
    return {
      score: 50,
      explanation: 'Unable to calculate relevance score due to processing error',
      summary: 'Paper content analysis unavailable'
    };
  }
}

function calculateFallbackHistoricalSimilarity(paperContent: string, recentQueries: string[]): SimilarityScore {
  const paperLower = paperContent.toLowerCase()
  let totalScore = 0
  let queryCount = 0
  
  recentQueries.forEach(query => {
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2)
    let matchCount = 0
    
    queryWords.forEach(word => {
      if (paperLower.includes(word)) {
        matchCount++
      }
    })
    
    if (queryWords.length > 0) {
      totalScore += (matchCount / queryWords.length) * 100
      queryCount++
    }
  })
  
  const averageScore = queryCount > 0 ? Math.round(totalScore / queryCount) : 25
  
  return {
    score: Math.min(100, averageScore),
    explanation: `Fallback calculation: Average relevance across ${queryCount} recent queries`,
    summary: 'Paper content analyzed using keyword matching against recent queries'
  }
}

function parseSimilarityResponse(response: string): { score: number; explanation: string; summary: string } {
  try {
    // Try to extract score from response
    const scoreMatch = response.match(/(?:score|similarity|relevance)[:\s]*(\d+)/i)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50

    // Split response into parts
    const parts = response.split('\n').filter(part => part.trim())
    
    let explanation = 'Similarity analysis completed'
    let summary = 'Paper content analyzed'

    if (parts.length >= 2) {
      explanation = parts[0] || explanation
      summary = parts[1] || summary
    } else if (parts.length === 1) {
      explanation = parts[0] || explanation
    }

    return { score, explanation, summary }
  } catch (error) {
    console.error('Error parsing similarity response:', error)
    return {
      score: 50,
      explanation: 'Similarity analysis completed',
      summary: 'Paper content analyzed'
    }
  }
} 