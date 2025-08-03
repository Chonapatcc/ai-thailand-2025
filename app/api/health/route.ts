import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { ApiErrorHandler } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Check storage system
    let storageStatus = 'healthy'
    let fileStats = null

    try {
      fileStats = await fileStorage.getFileStats()
    } catch (error) {
      storageStatus = 'unhealthy'
      ApiErrorHandler.logError(error, 'Storage health check failed')
    }

    // Check AI service (basic connectivity test)
    let aiStatus = 'healthy'
    try {
      const { PATHUMMA_CONFIG, getAuthHeader } = await import('@/lib/config')

      const response = await fetch(`${PATHUMMA_CONFIG.BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          ...PATHUMMA_CONFIG.HEADERS,
          ...getAuthHeader()
        },
        body: JSON.stringify({
          model: PATHUMMA_CONFIG.MODELS.TEXT,
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
          temperature: 0
        })
      })

      if (!response.ok) {
        aiStatus = 'unhealthy'
      }
    } catch (error) {
      aiStatus = 'unhealthy'
      ApiErrorHandler.logError(error, 'AI service health check failed')
    }

    // Check vector database
    let vectorDbStatus = 'healthy'
    try {
      const { vectorDB } = await import('@/lib/rag-utils')
      // Basic connectivity test
      await vectorDB.searchDocuments('test', 1)
    } catch (error) {
      vectorDbStatus = 'unhealthy'
      ApiErrorHandler.logError(error, 'Vector database health check failed')
    }

    const responseTime = Date.now() - startTime
    const overallStatus = storageStatus === 'healthy' && aiStatus === 'healthy' ? 'healthy' : 'degraded'

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        storage: {
          status: storageStatus,
          stats: fileStats
        },
        ai: {
          status: aiStatus,
          provider: 'Pathumma AI'
        },
        vectorDb: {
          status: vectorDbStatus
        }
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(healthData, { status: statusCode })

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error, 'Health check operation')
  }
} 