import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'api')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy') || 'uploadDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Validate pagination parameters
    const paginationValidation = ValidationUtils.validatePaginationParams(page, limit)
    const paginationError = handleValidationError(paginationValidation)
    if (paginationError) {
      return paginationError
    }

    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 20

    // Validate sort parameters
    const validSortFields = ['uploadDate', 'filename', 'size', 'originalName']
    const validSortOrders = ['asc', 'desc']
    
    if (!validSortFields.includes(sortBy)) {
      return ApiErrorHandler.handleValidationError('sortBy', 'Invalid sort field')
    }
    
    if (!validSortOrders.includes(sortOrder)) {
      return ApiErrorHandler.handleValidationError('sortOrder', 'Invalid sort order')
    }

    let files
    try {
      files = await fileStorage.getAllFiles()
    } catch (storageError) {
      return ApiErrorHandler.handleDatabaseError('retrieve files', storageError)
    }

    // Sort files
    files.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'uploadDate':
          aValue = new Date(a.uploadDate).getTime()
          bValue = new Date(b.uploadDate).getTime()
          break
        case 'filename':
        case 'originalName':
          aValue = a.originalName.toLowerCase()
          bValue = b.originalName.toLowerCase()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        default:
          aValue = new Date(a.uploadDate).getTime()
          bValue = new Date(b.uploadDate).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedFiles = files.slice(startIndex, endIndex)

    const response = NextResponse.json({
      success: true,
      files: paginatedFiles.map(file => ({
        id: file.id,
        filename: file.originalName,
        size: file.size,
        uploadDate: file.uploadDate,
        summary: file.summary,
        tags: file.tags,
        sourceUrl: file.sourceUrl,
        fileType: file.fileType,
        frontendPath: file.frontendPath,
        backendPath: file.backendPath,
        content: file.content
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: files.length,
        totalPages: Math.ceil(files.length / limitNum),
        hasNext: endIndex < files.length,
        hasPrev: pageNum > 1
      },
      sorting: {
        sortBy,
        sortOrder
      }
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.api.checkLimit(request)
    return addRateLimitHeaders(response, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'File listing operation')
  }
} 