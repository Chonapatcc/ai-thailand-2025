import { ApiErrorHandler } from './error-handler'

export interface PDFMetadata {
  title: string
  author?: string
  subject?: string
  keywords?: string[]
  pageCount: number
  creationDate?: Date
  modificationDate?: Date
}

export interface PDFContent {
  text: string
  metadata: PDFMetadata
  headers: string[]
  summary?: string
}

export async function extractTextFromPDF(file: File): Promise<PDFContent> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Use pdf-parse to extract text and metadata
    let pdfData
    try {
      const pdfParse = require('pdf-parse')
      pdfData = await pdfParse(buffer)
    } catch (parseError) {
      ApiErrorHandler.logError(parseError, 'PDF parse failed, trying alternative method')
      
      // Fallback: try to extract basic text using a different approach
      const text = await extractBasicText(buffer)
      const metadata = extractMetadata({})
      const headers = extractHeaders(text)
      
      return {
        text,
        metadata,
        headers
      }
    }
    
    const text = pdfData.text || ''
    const metadata = extractMetadata(pdfData.info || {})
    const headers = extractHeaders(text)
    
    return {
      text,
      metadata,
      headers
    }
  } catch (error) {
    ApiErrorHandler.logError(error, 'PDF text extraction failed')
    throw new Error('Failed to extract text from PDF')
  }
}

async function extractBasicText(buffer: Buffer): Promise<string> {
  try {
    // Simple text extraction from PDF buffer
    const bufferString = buffer.toString('utf8', 0, Math.min(buffer.length, 10000))
    
    // Extract text between text operators
    const textMatches = bufferString.match(/\(([^)]+)\)/g)
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/[()]/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    // If no text found, return a placeholder
    return 'PDF content extracted (text extraction limited)'
  } catch (error) {
    return 'PDF content extracted (text extraction failed)'
  }
}

function extractMetadata(info: any): PDFMetadata {
  return {
    title: info.Title || info.title || 'Untitled Document',
    author: info.Author || info.author,
    subject: info.Subject || info.subject,
    keywords: info.Keywords ? info.Keywords.split(',').map((k: string) => k.trim()) : [],
    pageCount: info.Pages || 1,
    creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
    modificationDate: info.ModDate ? new Date(info.ModDate) : undefined
  }
}

function extractHeaders(text: string): string[] {
  const headers: string[] = []
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Look for common header patterns
  for (const line of lines) {
    // Check for title patterns (all caps, short length)
    if (line.length > 3 && line.length < 100 && line === line.toUpperCase()) {
      headers.push(line)
      continue
    }
    
    // Check for numbered headers (1. Introduction, 2. Methods, etc.)
    if (/^\d+\.\s+[A-Z]/.test(line)) {
      headers.push(line)
      continue
    }
    
    // Check for section headers (starts with capital letter, ends with colon or period)
    if (/^[A-Z][A-Za-z\s]{3,50}[:\s]*$/.test(line)) {
      headers.push(line)
      continue
    }
    
    // Check for bold patterns (if we had font information)
    // This is a simplified version
    if (line.length > 5 && line.length < 80 && /^[A-Z]/.test(line)) {
      // Additional check for common header words
      const headerWords = ['introduction', 'abstract', 'conclusion', 'method', 'result', 'discussion', 'reference', 'appendix']
      const lowerLine = line.toLowerCase()
      if (headerWords.some(word => lowerLine.includes(word))) {
        headers.push(line)
      }
    }
  }
  
  // Remove duplicates and limit to top 10 headers
  return [...new Set(headers)].slice(0, 10)
}

export interface PDFAnalysis {
  summary: string;
  sections: {
    methodology?: string;
    results?: string;
    findings?: string;
    limitations?: string;
  };
  keyPoints: string[];
  tags: string[];
  confidence: number;
  aiScores: {
    methodology: number;
    results: number;
    findings: number;
    limitations: number;
    overall: number;
  };
  chatAnalysis?: string;
  pageAnalysis?: {
    totalPages: number;
    contentDensity: number;
    textQuality: number;
    structureScore: number;
  };
}

export async function generatePDFSummary(content: PDFContent, message?: string): Promise<PDFAnalysis> {
  try {
    const { AIFTStandalone } = await import('./aift-standalone')
    
    const prompt = `Please provide a comprehensive analysis of this PDF document.

Document Title: ${content.metadata.title}
Author: ${content.metadata.author || 'Unknown'}
Page Count: ${content.metadata.pageCount}

Main Headers/Sections:
${content.headers.map(h => `- ${h}`).join('\n')}

Document Content (first 2000 characters):
${content.text.substring(0, 2000)}${content.text.length > 2000 ? '...' : ''}

${message ? `User Question: ${message}` : ''}

Please provide a structured analysis with the following sections:
1. Overall Summary
2. Methodology Section
3. Key Results/Findings
4. Limitations and Future Work
5. Key Points (as bullet points)
6. Relevant Tags (research areas, methods, tools mentioned)
7. Confidence Score (0-100) based on clarity and completeness of the content

Format your response as a JSON object with the following structure:
{
  "summary": "overall summary text",
  "sections": {
    "methodology": "methodology section text",
    "results": "results section text",
    "findings": "key findings text",
    "limitations": "limitations text"
  },
  "keyPoints": ["point1", "point2", ...],
  "tags": ["tag1", "tag2", ...],
  "confidence": number
}`

    const response = await AIFTStandalone.textqa(prompt, {
      sessionid: 'pdf-summary',
      temperature: 0.3,
      return_json: true
    })

    try {
      const analysis = JSON.parse(response)

      // Calculate page analysis scores
      const pageAnalysis = {
        totalPages: content.metadata.pageCount,
        contentDensity: calculateContentDensity(content.text),
        textQuality: calculateTextQuality(content.text),
        structureScore: content.headers.length > 0 ? Math.min(100, content.headers.length * 10) : 50
      }

      // Calculate AI scores based on content length and quality
      const aiScores = {
        methodology: calculateSectionScore(analysis.sections?.methodology),
        results: calculateSectionScore(analysis.sections?.results),
        findings: calculateSectionScore(analysis.sections?.findings),
        limitations: calculateSectionScore(analysis.sections?.limitations),
        overall: analysis.confidence || 75
      }

      return {
        summary: analysis.summary || 'Summary not available',
        sections: {
          methodology: analysis.sections?.methodology || '',
          results: analysis.sections?.results || '',
          findings: analysis.sections?.findings || '',
          limitations: analysis.sections?.limitations || ''
        },
        keyPoints: analysis.keyPoints || [],
        tags: analysis.tags || [],
        confidence: analysis.confidence || 75,
        aiScores,
        pageAnalysis,
        chatAnalysis: generateChatAnalysis(analysis)
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const defaultScores = {
        methodology: 50,
        results: 50,
        findings: 50,
        limitations: 50,
        overall: 50
      }

      return {
        summary: response.substring(0, 500),
        sections: {
          methodology: '',
          results: '',
          findings: '',
          limitations: ''
        },
        keyPoints: ['Content analysis available in unstructured format'],
        tags: [],
        confidence: 50,
        aiScores: defaultScores,
        pageAnalysis: {
          totalPages: content.metadata.pageCount,
          contentDensity: 50,
          textQuality: 50,
          structureScore: 50
        },
        chatAnalysis: 'Analysis not available due to processing error.'
      }
    }
  } catch (error) {
    ApiErrorHandler.logError(error, 'PDF summary generation failed')
    return {
      summary: 'Summary generation failed. Please try again.',
      sections: {
        methodology: '',
        results: '',
        findings: '',
        limitations: ''
      },
      keyPoints: [],
      tags: [],
      confidence: 0,
      aiScores: {
        methodology: 0,
        results: 0,
        findings: 0,
        limitations: 0,
        overall: 0
      },
      pageAnalysis: {
        totalPages: 0,
        contentDensity: 0,
        textQuality: 0,
        structureScore: 0
      },
      chatAnalysis: 'Analysis failed. Please try again.'
    }
  }
}

function calculateContentDensity(text: string): number {
  const words = text.split(/\s+/).length;
  // Assume ideal density is 300-500 words per page
  const density = Math.min(100, (words / 400) * 100);
  return Math.max(0, density);
}

function calculateTextQuality(text: string): number {
  // Check for common indicators of good quality text
  let score = 50;
  
  // Check for proper capitalization
  if (/[A-Z][a-z]+/.test(text)) score += 10;
  
  // Check for proper punctuation
  if (/[.!?][\s\n]/.test(text)) score += 10;
  
  // Check for reasonable word length (not OCR garbage)
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
  if (avgWordLength >= 3 && avgWordLength <= 12) score += 10;
  
  // Check for paragraphs
  if (text.includes('\n\n')) score += 10;
  
  // Check for numbers (often indicates data/results)
  if (/\d+(\.\d+)?/.test(text)) score += 10;
  
  return Math.min(100, score);
}

function calculateSectionScore(section?: string): number {
  if (!section) return 0;
  
  let score = 50;
  
  // Length-based score (ideal length 200-1000 chars)
  const length = section.length;
  if (length > 200) score += 10;
  if (length > 500) score += 10;
  
  // Check for numerical content
  if (/\d+(\.\d+)?%/.test(section)) score += 10;
  
  // Check for citations
  if (/\[\d+\]|\(\d{4}\)/.test(section)) score += 10;
  
  // Check for technical terms
  const technicalTerms = /analysis|methodology|algorithm|data|results|findings|experiment|study|research|model/i;
  if (technicalTerms.test(section)) score += 10;
  
  return Math.min(100, score);
}

function generateChatAnalysis(analysis: any): string {
  try {
    const points: string[] = [];
    
    if (analysis.summary) {
      points.push(`📄 Summary: ${analysis.summary.slice(0, 100)}...`);
    }
    
    if (analysis.keyPoints?.length > 0) {
      points.push('🔑 Key Points:');
      points.push(...analysis.keyPoints.map((point: string) => `• ${point}`));
    }
    
    if (analysis.tags?.length > 0) {
      points.push('🏷️ Tags: ' + analysis.tags.join(', '));
    }
    
    const confidenceEmoji = analysis.confidence >= 80 ? '🟢' : 
                           analysis.confidence >= 50 ? '🟡' : '🔴';
    points.push(`${confidenceEmoji} AI Confidence: ${analysis.confidence}%`);
    
    return points.join('\n');
  } catch (error) {
    return 'Chat analysis generation failed.';
  }
}

export function validatePDFFile(file: File): boolean {
  // Check file type
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return false
  }
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return false
  }
  
  return true
} 