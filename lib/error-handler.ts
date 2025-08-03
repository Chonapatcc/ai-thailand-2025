import { NextResponse } from 'next/server'

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class ApiErrorHandler {
  static createError(code: string, message: string, statusCode: number = 500, details?: any): ApiError {
    return {
      code,
      message,
      details,
      statusCode
    }
  }

  static logError(error: any, context: string) {
    const timestamp = new Date().toISOString()
    const errorInfo = {
      timestamp,
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }
    
    console.error(`[${timestamp}] ${context}:`, JSON.stringify(errorInfo, null, 2))
  }

  static sendErrorResponse(error: ApiError): NextResponse {
    const response = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      }
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  static handleValidationError(field: string, message: string): NextResponse {
    const error = this.createError(
      'VALIDATION_ERROR',
      `Validation failed for ${field}: ${message}`,
      400
    )
    return this.sendErrorResponse(error)
  }

  static handleFileError(operation: string, error: any): NextResponse {
    this.logError(error, `File operation failed: ${operation}`)
    
    const apiError = this.createError(
      'FILE_OPERATION_ERROR',
      `Failed to ${operation}`,
      500,
      { operation }
    )
    
    return this.sendErrorResponse(apiError)
  }

  static handleAIError(error: any): NextResponse {
    this.logError(error, 'AI API error')
    
    const apiError = this.createError(
      'AI_SERVICE_ERROR',
      'AI service temporarily unavailable',
      503
    )
    
    return this.sendErrorResponse(apiError)
  }

  static handleDatabaseError(operation: string, error: any): NextResponse {
    this.logError(error, `Database operation failed: ${operation}`)
    
    const apiError = this.createError(
      'DATABASE_ERROR',
      `Database operation failed: ${operation}`,
      500,
      { operation }
    )
    
    return this.sendErrorResponse(apiError)
  }

  static handleUnknownError(error: any, context: string): NextResponse {
    this.logError(error, context)
    
    const apiError = this.createError(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      500
    )
    
    return this.sendErrorResponse(apiError)
  }
}

// Common error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VECTOR_DB_ERROR: 'VECTOR_DB_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const 