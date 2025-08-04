import { NextRequest } from 'next/server'
import { ApiErrorHandler } from './error-handler'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private getKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request)
    }
    
    // Default: use IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    return ip
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  checkLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    
    const key = this.getKey(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    const entry = this.store.get(key)
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }
    
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }
    
    // Increment count
    entry.count++
    this.store.set(key, entry)
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),
  
  // File upload rate limiting
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  }),
  
  // Search rate limiting
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  }),
  
  // AI chat rate limiting
  chat: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  }),
  
  // Search rate limiting
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  })
}

export function checkRateLimit(request: NextRequest, limiterType: keyof typeof rateLimiters) {
  const limiter = rateLimiters[limiterType]
  const result = limiter.checkLimit(request)
  
  if (!result.allowed) {
    return ApiErrorHandler.createError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.',
      429,
      {
        resetTime: result.resetTime,
        windowMs: limiter['config'].windowMs
      }
    )
  }
  
  return null
}

export function addRateLimitHeaders(response: Response, result: { remaining: number; resetTime: number }) {
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  return response
} 