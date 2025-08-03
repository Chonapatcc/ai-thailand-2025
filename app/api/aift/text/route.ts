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
      question, 
      apiKey, 
      return_json = false,
      sessionid = 'default-session',
      context = '',
      temperature = 0.7,
      useChat = false
    } = body

    // Validate question
    const questionValidation = ValidationUtils.validateMessage(question)
    const questionError = handleValidationError(questionValidation)
    if (questionError) {
      return questionError
    }

    // Initialize AIFT service
    AIFTService.initialize({
      apiKey: apiKey || process.env.AIFT_API_KEY || '',
      model: body.model || 'default'
    })

    // Generate response
    let response: string
    try {
      if (useChat) {
        // Use chat functionality
        response = await AIFTService.chat(question, {
          sessionid,
          context,
          temperature,
          return_json
        })
      } else {
        // Use textqa functionality
        response = await AIFTService.textqa(question, {
          sessionid,
          context,
          temperature,
          return_json
        })
      }
    } catch (error) {
      ApiErrorHandler.logError(error, 'AIFT text QA failed')
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
      useChat,
      timestamp: new Date().toISOString()
    })

    // Add rate limit headers
    const rateLimitResult = rateLimiters.chat.checkLimit(request)
    return addRateLimitHeaders(apiResponse, rateLimitResult)

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'AIFT text QA operation')
  }
} 