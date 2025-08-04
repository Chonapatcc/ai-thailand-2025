import { NextRequest } from 'next/server'
import { ApiErrorHandler } from './error-handler'

export interface ValidationResult {
  isValid: boolean
  error?: string
  field?: string
}

export class ValidationUtils {
  static validateFileUpload(file: File | null): ValidationResult {
    if (!file) {
      return {
        isValid: false,
        error: 'No file provided',
        field: 'file'
      }
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 50MB limit',
        field: 'file'
      }
    }

    // Check file type
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.ts', '.mp3', '.wav', '.ogg', '.m4a', '.flac']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File type not supported. Supported types: PDF, Images (JPG, PNG, GIF, etc.), Audio (MP3, WAV, etc.), Text files',
        field: 'file'
      }
    }

    return { isValid: true }
  }

  static validateSearchQuery(query: string | null): ValidationResult {
    if (!query || typeof query !== 'string') {
      return {
        isValid: false,
        error: 'Search query is required',
        field: 'query'
      }
    }

    if (query.trim().length === 0) {
      return {
        isValid: false,
        error: 'Search query cannot be empty',
        field: 'query'
      }
    }

    if (query.length > 500) {
      return {
        isValid: false,
        error: 'Search query too long (max 500 characters)',
        field: 'query'
      }
    }

    return { isValid: true }
  }

  static validateMessage(message: string | null): ValidationResult {
    if (!message || typeof message !== 'string') {
      return {
        isValid: false,
        error: 'Message is required',
        field: 'message'
      }
    }

    if (message.trim().length === 0) {
      return {
        isValid: false,
        error: 'Message cannot be empty',
        field: 'message'
      }
    }

    if (message.length > 2000) {
      return {
        isValid: false,
        error: 'Message too long (max 2000 characters)',
        field: 'message'
      }
    }

    return { isValid: true }
  }

  static validateFileIds(fileIds: any): ValidationResult {
    if (!fileIds || !Array.isArray(fileIds)) {
      return {
        isValid: false,
        error: 'File IDs must be an array',
        field: 'fileIds'
      }
    }

    if (fileIds.length === 0) {
      return {
        isValid: false,
        error: 'At least one file ID is required',
        field: 'fileIds'
      }
    }

    if (fileIds.length > 50) {
      return {
        isValid: false,
        error: 'Too many files selected (max 50)',
        field: 'fileIds'
      }
    }

    // Validate each file ID
    for (const id of fileIds) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        return {
          isValid: false,
          error: 'Invalid file ID format',
          field: 'fileIds'
        }
      }
    }

    return { isValid: true }
  }

  static validatePaginationParams(page?: string, limit?: string): ValidationResult {
    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 20

    if (isNaN(pageNum) || pageNum < 1) {
      return {
        isValid: false,
        error: 'Page number must be a positive integer',
        field: 'page'
      }
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return {
        isValid: false,
        error: 'Limit must be between 1 and 100',
        field: 'limit'
      }
    }

    return { isValid: true }
  }

  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000) // Limit length
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 255) // Limit filename length
  }

  static validateRequestContentType(request: NextRequest, expectedType: string): ValidationResult {
    const contentType = request.headers.get('content-type') || ''
    
    if (!contentType.includes(expectedType)) {
      return {
        isValid: false,
        error: `Expected content type: ${expectedType}`,
        field: 'content-type'
      }
    }

    return { isValid: true }
  }
}

// Helper function to handle validation errors
export function handleValidationError(result: ValidationResult) {
  if (!result.isValid) {
    return ApiErrorHandler.handleValidationError(
      result.field || 'unknown',
      result.error || 'Validation failed'
    )
  }
  return null
} 