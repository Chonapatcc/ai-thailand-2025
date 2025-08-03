import { NextRequest, NextResponse } from 'next/server'
import { downloadPDFFromURL } from '@/lib/url-utils'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    console.log('Testing quantum link with URL:', url)
    
    const result = await downloadPDFFromURL(url)
    
    return NextResponse.json({
      success: true,
      filename: result.filename,
      contentLength: result.content.length,
      preview: result.content.substring(0, 200) + '...'
    })
    
  } catch (error) {
    console.error('Quantum link test failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  }
} 