import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { vectorDB } from '@/lib/rag-utils'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'search')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    // Validate search query
    const validationResult = ValidationUtils.validateSearchQuery(query)
    const validationError = handleValidationError(validationResult)
    if (validationError) {
      return validationError
    }

    const sanitizedQuery = ValidationUtils.sanitizeString(query!)

    // Check for empty query after sanitization
    if (!sanitizedQuery.trim()) {
      return NextResponse.json({
        success: true,
        files: [],
        searchType: 'none',
        query: sanitizedQuery
      })
    }

    let searchType = 'text'
    let files: any[] = []

    // Try text-based search first (more reliable)
    try {
      const textResults = await fileStorage.searchFiles(sanitizedQuery)
      files = textResults.map(file => ({
        id: file.id,
        filename: file.originalName,
        size: file.size,
        uploadDate: file.uploadDate,
        summary: file.summary,
        tags: file.tags,
        content: file.content.substring(0, 500), // Include first 500 chars for preview
        sourceUrl: file.sourceUrl
      }))
    } catch (textSearchError) {
      console.error('Text search failed:', textSearchError)
      // Return empty results instead of error
      files = []
    }

    // Try vector database search as enhancement if text search found results
    if (files.length > 0) {
      try {
        const vectorResults = await vectorDB.searchDocuments(sanitizedQuery, 10)
        if (vectorResults.length > 0) {
          searchType = 'vector'
          // Enhance existing results with vector scores
          const vectorMap = new Map(vectorResults.map(result => [result.id, result.score]))
          files = files.map(file => ({
            ...file,
            similarityScore: vectorMap.get(file.id) || 75 // Default score if not in vector results
          }))
        }
      } catch (vectorError) {
        console.error('Vector search failed:', vectorError)
        // Continue with text search results
      }
    }

    const response = NextResponse.json({
      success: true,
      files,
      searchType,
      query: sanitizedQuery,
      totalResults: files.length
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.search.checkLimit(request)
    return addRateLimitHeaders(response, rateLimitResult)

  } catch (error) {
    console.error('Search API error:', error)
    // Return empty results instead of error
    return NextResponse.json({
      success: true,
      files: [],
      searchType: 'error',
      query: searchParams.get('q') || '',
      totalResults: 0
    })
  }
} 