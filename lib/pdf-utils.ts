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
    
    // Use pdf-parse to extract text and metadata
    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(Buffer.from(arrayBuffer))
    
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

export async function generatePDFSummary(content: PDFContent, message?: string): Promise<string> {
  try {
    const { AIFTStandalone } = await import('./aift-standalone')
    
    const prompt = `Please analyze this PDF document and provide a comprehensive summary.

Document Title: ${content.metadata.title}
Author: ${content.metadata.author || 'Unknown'}
Page Count: ${content.metadata.pageCount}

Main Headers/Sections:
${content.headers.map(h => `- ${h}`).join('\n')}

Document Content (first 2000 characters):
${content.text.substring(0, 2000)}${content.text.length > 2000 ? '...' : ''}

${message ? `User Question: ${message}` : ''}

Please provide:
1. A brief overview of the document
2. Key findings or main points
3. Important sections and their content
4. Any significant conclusions or recommendations

Format your response clearly with sections and bullet points where appropriate.`

    const summary = await AIFTStandalone.textqa(prompt, {
      sessionid: 'pdf-summary',
      temperature: 0.3,
      return_json: false
    })

    return summary
  } catch (error) {
    ApiErrorHandler.logError(error, 'PDF summary generation failed')
    return 'Summary generation failed. Please try again.'
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