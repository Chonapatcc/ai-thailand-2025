import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { vectorDB } from '@/lib/rag-utils'
import { extractTextFromPDF, generatePDFSummary, validatePDFFile } from '@/lib/pdf-utils'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'upload')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    // Validate content type
    const contentTypeValidation = ValidationUtils.validateRequestContentType(request, 'multipart/form-data')
    const contentTypeError = handleValidationError(contentTypeValidation)
    if (contentTypeError) {
      return contentTypeError
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      return ApiErrorHandler.handleValidationError('formData', 'Failed to parse form data')
    }

    const file = formData.get('file') as File
    const message = formData.get('message') as string
    const sourceUrl = formData.get('sourceUrl') as string

    // Validate file upload
    const fileValidation = ValidationUtils.validateFileUpload(file)
    const fileError = handleValidationError(fileValidation)
    if (fileError) {
      return fileError
    }

    // Validate message
    const messageValidation = ValidationUtils.validateMessage(message)
    const messageError = handleValidationError(messageValidation)
    if (messageError) {
      return messageError
    }

    // Validate PDF file specifically
    if (!validatePDFFile(file)) {
      return ApiErrorHandler.handleValidationError('file', 'Invalid PDF file')
    }

    const sanitizedMessage = ValidationUtils.sanitizeString(message)
    const sanitizedSourceUrl = sourceUrl ? ValidationUtils.sanitizeString(sourceUrl) : undefined

    // Extract text and metadata from PDF
    let pdfContent
    try {
      pdfContent = await extractTextFromPDF(file)
    } catch (error) {
      ApiErrorHandler.logError(error, 'PDF text extraction failed')
      return ApiErrorHandler.handleFileError('extract PDF text', error)
    }

    // Check if content is empty
    if (!pdfContent.text || pdfContent.text.trim().length === 0) {
      return ApiErrorHandler.handleValidationError('file', 'PDF appears to be empty or contains no extractable text')
    }

    // Generate AI summary
    let summary: string
    try {
      summary = await generatePDFSummary(pdfContent, sanitizedMessage)
    } catch (error) {
      ApiErrorHandler.logError(error, 'Summary generation failed')
      summary = 'Summary generation failed'
    }

    // Save file to storage
    let savedFile
    try {
      savedFile = await fileStorage.saveFile(file, {
        message: sanitizedMessage,
        sourceUrl: sanitizedSourceUrl,
        summary,
        headers: pdfContent.headers,
        metadata: pdfContent.metadata
      })
    } catch (error) {
      ApiErrorHandler.logError(error, 'File storage failed')
      return ApiErrorHandler.handleFileError('save file', error)
    }

    // Store in vector database
    try {
      await vectorDB.addDocument(savedFile.id, pdfContent.text, {
        filename: savedFile.originalName,
        uploadDate: savedFile.uploadDate,
        tags: savedFile.tags || [],
        summary,
        sourceUrl: sanitizedSourceUrl,
        headers: pdfContent.headers
      })
    } catch (error) {
      ApiErrorHandler.logError(error, 'Vector database storage failed')
      // Continue without vector storage - file is still saved
    }

    const response = NextResponse.json({
      success: true,
      file: {
        id: savedFile.id,
        filename: savedFile.originalName,
        size: savedFile.size,
        uploadDate: savedFile.uploadDate,
        summary,
        headers: pdfContent.headers,
        metadata: pdfContent.metadata,
        tags: savedFile.tags
      },
      message: 'File uploaded and processed successfully'
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.upload.checkLimit(request)
    return addRateLimitHeaders(response, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'File upload operation')
  }
} 