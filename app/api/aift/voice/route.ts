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

    console.log('=== Starting AIFT Voice API request processing ===')
    
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
      
      const audioFile = formData.get('audio') as File
      const question = formData.get('question') as string
      const sessionid = formData.get('sessionid') as string || 'web-voice'
      const context = formData.get('context') as string || ''
      const temperature = parseFloat(formData.get('temperature') as string) || 0.2
      
      console.log('Voice analysis request:', { 
        fileName: audioFile?.name, 
        fileSize: audioFile?.size,
        question,
        sessionid,
        context,
        temperature
      })
      
      // Validate audio file
      if (!audioFile || audioFile.size === 0) {
        return ApiErrorHandler.handleValidationError('audio', 'Audio file is required')
      }
      
      // Validate question
      const questionValidation = ValidationUtils.validateMessage(question)
      const questionValidationError = handleValidationError(questionValidation)
      if (questionValidationError) {
        return questionValidationError
      }
      
      // Check file type
      const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a']
      if (!validAudioTypes.includes(audioFile.type)) {
        return ApiErrorHandler.handleValidationError('audio', 'Invalid audio file type. Supported: MP3, WAV, OGG, WebM, M4A')
      }
      
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024
      if (audioFile.size > maxSize) {
        return ApiErrorHandler.handleValidationError('audio', 'Audio file too large. Maximum size: 50MB')
      }
      
      console.log('Processing voice analysis:', { question, filename: audioFile.name })
      
      // Generate AI response for voice analysis
      let aiResponse: string
      try {
        aiResponse = await AIFTStandalone.voiceqa(audioFile, question, {
          sessionid,
          context,
          temperature,
          return_json: false
        })
        console.log('AIFT voice analysis response received, length:', aiResponse.length)
      } catch (aiError) {
        console.error('AIFT standalone voice service failed:', aiError)
        return ApiErrorHandler.handleAIError(aiError)
      }
      
      const response = NextResponse.json({
        success: true,
        message: aiResponse,
        filename: audioFile.name,
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
    return ApiErrorHandler.handleUnknownError(error, 'AIFT Voice API processing')
  }
} 