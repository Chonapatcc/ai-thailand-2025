import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  // Log request information
  const logInfo = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    contentType: request.headers.get('content-type'),
    contentLength: request.headers.get('content-length')
  }

  console.log(`[${logInfo.timestamp}] ${logInfo.method} ${logInfo.url} - ${logInfo.ip}`)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  // Basic request validation
  const contentType = request.headers.get('content-type')
  if (request.method === 'POST' && !contentType) {
    return new NextResponse(
      JSON.stringify({ error: 'Content-Type header is required for POST requests' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Rate limiting check (basic implementation)
  const clientIP = logInfo.ip
  const rateLimitKey = `rate_limit_${clientIP}`
  
  // This is a simple in-memory rate limiter
  // In production, you'd want to use Redis or a similar service
  const currentTime = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  // Get existing rate limit data (this would be from Redis in production)
  const rateLimitData = globalThis[rateLimitKey] || { count: 0, resetTime: currentTime + windowMs }

  if (currentTime > rateLimitData.resetTime) {
    // Reset window
    rateLimitData.count = 1
    rateLimitData.resetTime = currentTime + windowMs
  } else {
    rateLimitData.count++
  }

  globalThis[rateLimitKey] = rateLimitData

  if (rateLimitData.count > maxRequests) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitData.resetTime - currentTime) / 1000)
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitData.resetTime - currentTime) / 1000).toString()
        } 
      }
    )
  }

  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimitData.count).toString())
  response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString())

  // Log response time
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 