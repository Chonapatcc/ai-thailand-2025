import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'
import { extractTextFromPDF } from '@/lib/pdf-utils'
import { OPENROUTER_CONFIG, getAuthHeader } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { fileId, analysisType } = await request.json()
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }
    
    // Get file from storage
    const files = await fileStorage.getAllFiles()
    const file = files.find(f => f.id === fileId)
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    if (!file.content) {
      return NextResponse.json({ error: 'File content not available' }, { status: 400 })
    }
    
    // Generate analysis based on type
    let analysis = ''
    let aiScore = 0
    
    try {
      const systemPrompt = `You are an expert research analyst. Analyze the provided research paper and provide insights based on the requested analysis type.`
      
      let userPrompt = ''
      switch (analysisType) {
        case 'summary':
          userPrompt = `Please provide a comprehensive summary of this research paper including key findings, methodology, and contributions.`
          break
        case 'methodology':
          userPrompt = `Please analyze the methodology used in this research paper, including experimental design, data collection, and analysis techniques.`
          break
        case 'results':
          userPrompt = `Please summarize the key results and findings from this research paper, including quantitative and qualitative outcomes.`
          break
        case 'limitations':
          userPrompt = `Please identify and analyze the limitations and potential weaknesses of this research paper.`
          break
        case 'future_work':
          userPrompt = `Based on this research paper, please suggest future research directions and potential areas for improvement.`
          break
        default:
          userPrompt = `Please provide a general analysis of this research paper.`
      }
      
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userPrompt}\n\nPaper content:\n${file.content.substring(0, 4000)}` }
      ]
      
      const response = await fetch(OPENROUTER_CONFIG.URL, {
        method: 'POST',
        headers: {
          ...OPENROUTER_CONFIG.HEADERS,
          ...getAuthHeader()
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.MODEL,
          messages,
          max_tokens: 1000,
          temperature: 0.3,
          stream: false
        })
      })
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }
      
      const data = await response.json()
      analysis = data.choices[0].message.content
      aiScore = Math.floor(Math.random() * 20) + 80 // Mock AI score between 80-100
      
    } catch (error) {
      console.error('AI analysis failed:', error)
      analysis = 'Analysis failed due to processing error. Please try again.'
      aiScore = 0
    }
    
    return NextResponse.json({
      success: true,
      analysis,
      aiScore,
      analysisType,
      fileId
    })
    
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
} 