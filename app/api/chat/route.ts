import { NextRequest, NextResponse } from 'next/server'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'
import { AIFTStandalone } from '@/lib/aift-standalone'

export async function POST(request: NextRequest) {
  let body: any
  
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'chat')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    console.log('=== Starting API request processing ===')
    
    // Check if this is a multipart form data request (file upload)
    const contentType = request.headers.get('content-type') || ''
    console.log('Request content type:', contentType)
    
    if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart form data request')
      
      try {
        // Validate content type
        const contentTypeValidation = ValidationUtils.validateRequestContentType(request, 'multipart/form-data')
        const contentTypeError = handleValidationError(contentTypeValidation)
        if (contentTypeError) {
          return contentTypeError
        }

        // Handle file upload
        let formData: FormData
        try {
          formData = await request.formData()
          console.log('FormData parsed successfully')
        } catch (formDataError) {
          return ApiErrorHandler.handleFileError('parse form data', formDataError)
        }
        
        const file = formData.get('file') as File
        const message = formData.get('message') as string
        const context = formData.get('context') as string
        const history = formData.get('history') as string
        
        console.log('File upload request:', { 
          fileName: file?.name, 
          fileSize: file?.size,
          message,
          context: context ? JSON.parse(context) : [],
          history: history ? JSON.parse(history) : []
        })
        
        // Validate file upload
        const fileValidation = ValidationUtils.validateFileUpload(file)
        const fileValidationError = handleValidationError(fileValidation)
        if (fileValidationError) {
          return fileValidationError
        }

        // Validate message
        const messageValidation = ValidationUtils.validateMessage(message)
        const messageValidationError = handleValidationError(messageValidation)
        if (messageValidationError) {
          return messageValidationError
        }
        
        // Prepare the message for AI processing using Python scripts
        const userMessage = message || 'Please summarize this research paper'
        const parsedContext = context ? JSON.parse(context) : []
        const parsedHistory = history ? JSON.parse(history) : []
        
        console.log('Preparing AI request with:', {
          message: userMessage,
          fileName: file.name,
          fileSize: file.size,
          contextLength: parsedContext.length,
          historyLength: parsedHistory.length
        })
        
        // Generate AI response for paper analysis using Python scripts
        let aiResponse: string
        try {
          // Use AIFT standalone service with Python scripts for PDF analysis
          aiResponse = await AIFTStandalone.pdfqa(file, userMessage, {
            sessionid: 'web-paper-analysis',   
            context: parsedContext.join(', '),
            temperature: 0.7,
            return_json: false
          })
          console.log('AIFT PDF analysis response received, length:', aiResponse.length)
        } catch (aiError) {
          console.error('AIFT standalone service failed:', aiError)
          return ApiErrorHandler.handleAIError(aiError)
        }
        
        const response = NextResponse.json({
          success: true,
          message: aiResponse,
          filename: file.name,
          contentLength: file.size
        })

        // Add rate limit headers
        const rateLimitResult = rateLimiters.chat.checkLimit(request)
        return addRateLimitHeaders(response, rateLimitResult)
        
      } catch (formDataError) {
        return ApiErrorHandler.handleFileError('process form data', formDataError)
      }
    } else {
      // Handle regular JSON request
      console.log('Processing JSON request')
      
      try {
        body = await request.json()
        console.log('Request body:', body)
      } catch (jsonError) {
        return ApiErrorHandler.handleValidationError('request body', 'Invalid JSON format')
      }

      const { message, context = [], history = [] } = body

      // Validate message
      const messageValidation = ValidationUtils.validateMessage(message)
      const messageValidationError = handleValidationError(messageValidation)
      if (messageValidationError) {
        return messageValidationError
      }

      console.log('Processing chat message:', { message, context, history })

      // Generate AI response for regular chat using Python scripts
      let aiResponse: string
      try {
        // Use AIFT standalone service for text-only chat (no external API needed)
        aiResponse = await AIFTStandalone.chat(message, {
          sessionid: 'web-chat',
          context: context.join(', '),
          temperature: 0.7,
          return_json: false
        })
        console.log('AIFT chat response received, length:', aiResponse.length)
      } catch (aiError) {
        console.error('AIFT standalone service failed:', aiError)
        return ApiErrorHandler.handleAIError(aiError)
      }
      
      const response = NextResponse.json({
        success: true,
        message: aiResponse
      })

      // Add rate limit headers
      const rateLimitResult = rateLimiters.chat.checkLimit(request)
      return addRateLimitHeaders(response, rateLimitResult)
    }
    
  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'Chat API processing')
  }
} 