import { NextRequest, NextResponse } from 'next/server'
import { AIFTService } from '@/lib/aift-service'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'chat')
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
    } catch (error) {
      return ApiErrorHandler.handleValidationError('body', 'Invalid JSON body')
    }

    const { 
      message, 
      apiKey, 
      return_json = false,
      sessionid = 'default-session',
      context = '',
      temperature = 0.7
    } = body

    // Validate message
    const messageValidation = ValidationUtils.validateMessage(message)
    const messageError = handleValidationError(messageValidation)
    if (messageError) {
      return messageError
    }

    // Initialize AIFT service
    AIFTService.initialize({
      apiKey: apiKey || process.env.AIFT_API_KEY || '',
      model: body.model || 'default'
    })

    // Generate response using chat
    let response: string
    try {
      response = await AIFTService.chat(message, {
        sessionid,
        context,
        temperature,
        return_json
      })
    } catch (error) {
      ApiErrorHandler.logError(error, 'AIFT chat failed')
      return ApiErrorHandler.handleAIError(error)
    }

    const apiResponse = NextResponse.json({
      success: true,
      answer: response,
      message,
      sessionid,
      context,
      temperature,
      return_json,
      timestamp: new Date().toISOString()
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.chat.checkLimit(request)
    return addRateLimitHeaders(apiResponse, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'AIFT chat operation')
  }
} 