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

    // Try vector database search first
    try {
      const vectorResults = await vectorDB.searchDocuments(sanitizedQuery, 10)
      
      if (vectorResults.length > 0) {
        searchType = 'vector'
        files = vectorResults.map(result => ({
          id: result.id,
          filename: result.metadata.filename,
          originalName: result.metadata.filename,
          size: 0, // Size not available in vector results
          uploadDate: result.metadata.uploadDate,
          content: result.content,
          tags: result.metadata.tags || [],
          summary: result.metadata.summary,
          sourceUrl: result.metadata.sourceUrl,
          similarityScore: result.score // This is now a percentage (0-100)
        }))
      }
    } catch (vectorError) {
      ApiErrorHandler.logError(vectorError, 'Vector search failed, falling back to text search')
      // Continue to text search fallback
    }

    // Fallback to text-based search if vector search failed or returned no results
    if (files.length === 0) {
      try {
        const textResults = await fileStorage.searchFiles(sanitizedQuery)
        files = textResults.map(file => ({
          id: file.id,
          filename: file.originalName,
          size: file.size,
          uploadDate: file.uploadDate,
          summary: file.summary,
          tags: file.tags,
          content: file.content.substring(0, 500) // Include first 500 chars for preview
        }))
      } catch (textSearchError) {
        ApiErrorHandler.logError(textSearchError, 'Text search failed')
        return ApiErrorHandler.handleDatabaseError('search files', textSearchError)
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
    return ApiErrorHandler.handleUnknownError(error, 'File search operation')
  }
} 