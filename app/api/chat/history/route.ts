import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: Replace this with actual database integration
    // For now, we'll return an empty history
    const messages = [
      {
        id: 1,
        type: "assistant" as const,
        content: "Hello! I'm your AI research assistant. I can help you understand research papers, find connections between studies, and answer questions about your uploaded documents. How can I assist you today?",
        timestamp: new Date().toISOString(),
      }
    ]

    return NextResponse.json({
      messages,
    })
  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 