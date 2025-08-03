import { NextRequest, NextResponse } from 'next/server'
import { ValidationUtils, handleValidationError } from '@/lib/validation'
import { ApiErrorHandler } from '@/lib/error-handler'
import { checkRateLimit, addRateLimitHeaders, rateLimiters } from '@/lib/rate-limiter'
import { AIFTStandalone } from '@/lib/aift-standalone'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, 'aift')
    if (rateLimitError) {
      return ApiErrorHandler.sendErrorResponse(rateLimitError)
    }

    console.log('=== Starting AIFT Image API request processing ===')
    
    // Check if this is a multipart form data request
    const contentType = request.headers.get('content-type') || ''
    console.log('Request content type:', contentType)
    
    if (!contentType.includes('multipart/form-data')) {
      return ApiErrorHandler.handleValidationError('content-type', 'Multipart form data required')
    }
    
    try {
      // Parse form data
      const formData = await request.formData()
      console.log('FormData parsed successfully')
      
      const imageFile = formData.get('image') as File
      const question = formData.get('question') as string
      const sessionid = formData.get('sessionid') as string || 'web-image'
      const context = formData.get('context') as string || ''
      const temperature = parseFloat(formData.get('temperature') as string) || 0.2
      
      console.log('Image analysis request:', { 
        fileName: imageFile?.name, 
        fileSize: imageFile?.size,
        question,
        sessionid,
        context,
        temperature
      })
      
      // Validate image file
      if (!imageFile || imageFile.size === 0) {
        return ApiErrorHandler.handleValidationError('image', 'Image file is required')
      }
      
      // Validate question
      const questionValidation = ValidationUtils.validateMessage(question)
      const questionValidationError = handleValidationError(questionValidation)
      if (questionValidationError) {
        return questionValidationError
      }
      
      // Check file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validImageTypes.includes(imageFile.type)) {
        return ApiErrorHandler.handleValidationError('image', 'Invalid image file type. Supported: JPEG, PNG, GIF, WebP')
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024
      if (imageFile.size > maxSize) {
        return ApiErrorHandler.handleValidationError('image', 'Image file too large. Maximum size: 10MB')
      }
      
      console.log('Processing image analysis:', { question, filename: imageFile.name })
      
      // Generate AI response for image analysis using Python scripts
      let aiResponse: string
      try {
        aiResponse = await AIFTStandalone.imageqa(imageFile, question, {
          sessionid,
          context,
          temperature,
          return_json: false
        })
        console.log('AIFT image analysis response received, length:', aiResponse.length)
      } catch (aiError) {
        console.error('AIFT standalone image service failed:', aiError)
        return ApiErrorHandler.handleAIError(aiError)
      }
      
      const response = NextResponse.json({
        success: true,
        message: aiResponse,
        filename: imageFile.name,
        question,
        sessionid
      })

      // Add rate limit headers
      const rateLimitResult = rateLimiters.aift.checkLimit(request)
      return addRateLimitHeaders(response, rateLimitResult)
      
    } catch (formDataError) {
      return ApiErrorHandler.handleFileError('process form data', formDataError)
    }
    
  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'AIFT Image API processing')
  }
} 