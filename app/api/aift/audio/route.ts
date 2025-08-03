import { NextRequest, NextResponse } from 'next/server'
import { AIFTService } from '@/lib/aift-service'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'

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

    const audioFile = formData.get('audio') as File
    const question = formData.get('question') as string
    const apiKey = formData.get('apiKey') as string
    const sessionid = formData.get('sessionid') as string || 'default-session'
    const context = formData.get('context') as string || ''
    const temperature = parseFloat(formData.get('temperature') as string || '0.7')
    const return_json = formData.get('return_json') === 'true'

    // Validate audio file
    if (!audioFile || audioFile.size === 0) {
      return ApiErrorHandler.handleValidationError('audio', 'Audio file is required')
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    if (!allowedTypes.includes(audioFile.type)) {
      return ApiErrorHandler.handleValidationError('audio', 'Invalid audio file type')
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return ApiErrorHandler.handleValidationError('audio', 'Audio file too large (max 10MB)')
    }

    // Validate question
    const questionValidation = ValidationUtils.validateMessage(question)
    const questionError = handleValidationError(questionValidation)
    if (questionError) {
      return questionError
    }

    // Initialize AIFT service
    AIFTService.initialize({
      apiKey: apiKey || process.env.AIFT_API_KEY || '',
      model: formData.get('model') as string || 'default'
    })

    // Generate response
    let response: string
    try {
      response = await AIFTService.audioqa(audioFile, question, {
        sessionid,
        context,
        temperature,
        return_json
      })
    } catch (error) {
      ApiErrorHandler.logError(error, 'AIFT audio QA failed')
      return ApiErrorHandler.handleAIError(error)
    }

    const apiResponse = NextResponse.json({
      success: true,
      answer: response,
      question,
      sessionid,
      context,
      temperature,
      return_json,
      filename: audioFile.name,
      timestamp: new Date().toISOString()
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.upload.checkLimit(request)
    return addRateLimitHeaders(apiResponse, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'AIFT audio QA operation')
  }
} 