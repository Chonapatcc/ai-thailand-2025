import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'api')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    // Validate content type
    const contentTypeValidation = ValidationUtils.validateRequestContentType(request, 'application/json')
    const contentTypeError = handleValidationError(contentTypeValidation)
    if (contentTypeError) {
      return contentTypeError
    }

    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return ApiErrorHandler.handleValidationError('request body', 'Invalid JSON format')
    }

    const { fileIds } = body

    // Validate file IDs
    const fileIdsValidation = ValidationUtils.validateFileIds(fileIds)
    const fileIdsError = handleValidationError(fileIdsValidation)
    if (fileIdsError) {
      return fileIdsError
    }

    // Get all files
    let allFiles
    try {
      allFiles = await fileStorage.getAllFiles()
    } catch (storageError) {
      return ApiErrorHandler.handleDatabaseError('retrieve files', storageError)
    }

    const selectedFiles = allFiles.filter(file => fileIds.includes(file.id))

    if (selectedFiles.length === 0) {
      return ApiErrorHandler.createError(
        'FILE_NOT_FOUND',
        'No files found with the provided IDs',
        404
      )
    }

    // Validate that all requested files exist
    const foundIds = selectedFiles.map(file => file.id)
    const missingIds = fileIds.filter(id => !foundIds.includes(id))
    
    if (missingIds.length > 0) {
      return ApiErrorHandler.createError(
        'FILE_NOT_FOUND',
        `Some files not found: ${missingIds.join(', ')}`,
        404,
        { missingIds }
      )
    }

    // Create archive
    let archiveBuffer: Buffer
    try {
      archiveBuffer = await fileStorage.createArchive(selectedFiles)
    } catch (archiveError) {
      return ApiErrorHandler.handleFileError('create archive', archiveError)
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `research_papers_${timestamp}.zip`

    const response = new NextResponse(archiveBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': archiveBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.api.checkLimit(request)
    return addRateLimitHeaders(response, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'File download operation')
  }
} 