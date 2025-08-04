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

    const sanitizedMessage = ValidationUtils.sanitizeString(message)
    const sanitizedSourceUrl = sourceUrl ? ValidationUtils.sanitizeString(sourceUrl) : undefined

    // Process file based on type
    let fileContent = ''
    let summary = ''
    let metadata = {}
    let headers: string[] = []

    // Check if it's a PDF file
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Validate PDF file specifically
      if (!validatePDFFile(file)) {
        return ApiErrorHandler.handleValidationError('file', 'Invalid PDF file')
      }

      // Extract text and metadata from PDF
      let pdfContent
      try {
        pdfContent = await extractTextFromPDF(file)
        fileContent = pdfContent.text
        metadata = pdfContent.metadata
        headers = pdfContent.headers
      } catch (error) {
        ApiErrorHandler.logError(error, 'PDF text extraction failed')
        return ApiErrorHandler.handleFileError('extract PDF text', error)
      }

      // Check if content is empty
      if (!fileContent || fileContent.trim().length === 0) {
        return ApiErrorHandler.handleValidationError('file', 'PDF appears to be empty or contains no extractable text')
      }

      // Generate AI summary for PDFs
      try {
        summary = await generatePDFSummary(pdfContent, sanitizedMessage)
      } catch (error) {
        ApiErrorHandler.logError(error, 'Summary generation failed')
        summary = 'Summary generation failed'
      }
    } else {
      // For non-PDF files, use filename as content and generate basic summary
      fileContent = `File: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes`
      summary = `Uploaded ${file.name} (${file.type})`
      metadata = {
        title: file.name,
        author: 'Unknown',
        pageCount: 1
      }
    }

    // Save file to storage
    let savedFile
    try {
      savedFile = await fileStorage.saveFile(file, fileContent, summary, sanitizedSourceUrl)
    } catch (error) {
      ApiErrorHandler.logError(error, 'File storage failed')
      return ApiErrorHandler.handleFileError('save file', error)
    }

    // Store in vector database (only for PDFs with text content)
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        await vectorDB.addDocument(savedFile.id, fileContent, {
          filename: savedFile.originalName,
          uploadDate: savedFile.uploadDate,
          tags: savedFile.tags || [],
          summary,
          sourceUrl: sanitizedSourceUrl,
          headers
        })
      } catch (error) {
        ApiErrorHandler.logError(error, 'Vector database storage failed')
        // Continue without vector storage - file is still saved
      }
    }

    const response = NextResponse.json({
      success: true,
      file: {
        id: savedFile.id,
        filename: savedFile.originalName,
        size: savedFile.size,
        uploadDate: savedFile.uploadDate,
        summary,
        headers,
        metadata,
        tags: savedFile.tags,
        fileType: savedFile.fileType,
        frontendPath: savedFile.frontendPath,
        backendPath: savedFile.backendPath
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