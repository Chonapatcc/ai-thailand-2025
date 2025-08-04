import fs from 'fs'
import path from 'path'
import { NextRequest } from 'next/server'
import { vectorDB, encodeDocument } from '@/lib/rag-utils'
import { ApiErrorHandler } from './error-handler'

export interface StoredFile {
  id: string
  filename: string
  originalName: string
  size: number
  uploadDate: Date
  content: string
  tags: string[]
  summary?: string
  sourceUrl?: string
  fileType: string
  frontendPath: string
  backendPath: string
  metadata?: {
    title?: string
    author?: string
    subject?: string
    pageCount?: number
    keywords?: string[]
    creationDate?: Date
    modificationDate?: Date
    producer?: string
    creator?: string
    analysis?: {
      summary: string
      sections: {
        methodology?: string
        results?: string
        findings?: string
        limitations?: string
      }
      keyPoints: string[]
      confidence: number
    }
  }
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const METADATA_FILE = path.join(UPLOAD_DIR, 'metadata.json')

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
    throw new Error('Failed to initialize storage system')
  }
}

// Initialize metadata file if it doesn't exist
if (!fs.existsSync(METADATA_FILE)) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2))
  } catch (error) {
    console.error('Failed to initialize metadata file:', error)
    throw new Error('Failed to initialize storage system')
  }
}

export class FileStorage {
  private static instance: FileStorage
  private metadata: StoredFile[] = []
  private metadataLock = false

  private constructor() {
    this.loadMetadata()
  }

  static getInstance(): FileStorage {
    if (!FileStorage.instance) {
      FileStorage.instance = new FileStorage()
    }
    return FileStorage.instance
  }

  private async loadMetadata() {
    try {
      const data = fs.readFileSync(METADATA_FILE, 'utf-8')
      this.metadata = JSON.parse(data)
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error loading metadata')
      this.metadata = []
    }
  }

  private async saveMetadata() {
    if (this.metadataLock) {
      throw new Error('Metadata is currently being saved')
    }

    this.metadataLock = true
    try {
      const tempFile = `${METADATA_FILE}.tmp`
      fs.writeFileSync(tempFile, JSON.stringify(this.metadata, null, 2))
      fs.renameSync(tempFile, METADATA_FILE)
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error saving metadata')
      throw error
    } finally {
      this.metadataLock = false
    }
  }

  async saveFile(file: File, content: string, summary?: string, sourceUrl?: string): Promise<StoredFile> {
    try {
      const id = this.generateId()
      const filename = `${id}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Determine file type and organize into proper directories
      const fileType = this.getFileType(file)
      const frontendDir = path.join(UPLOAD_DIR, 'frontend', fileType)
      const backendDir = path.join(UPLOAD_DIR, 'backend', fileType)
      
      // Create directories if they don't exist
      fs.mkdirSync(frontendDir, { recursive: true })
      fs.mkdirSync(backendDir, { recursive: true })
      
      // Save to both frontend and backend directories
      const frontendPath = path.join(frontendDir, filename)
      const backendPath = path.join(backendDir, filename)
      
      // Check if file already exists
      if (fs.existsSync(frontendPath) || fs.existsSync(backendPath)) {
        throw new Error('File with this name already exists')
      }

      // Save file content to both locations
      const buffer = Buffer.from(await file.arrayBuffer())
      fs.writeFileSync(frontendPath, buffer)
      fs.writeFileSync(backendPath, buffer)

      // Extract tags from filename and content
      const tags = this.extractTags(file.name, content)

      // Create stored file object
      const storedFile: StoredFile = {
        id,
        filename,
        originalName: file.name,
        size: file.size,
        uploadDate: new Date(),
        content,
        tags,
        summary,
        sourceUrl,
        fileType,
        frontendPath: path.relative(UPLOAD_DIR, frontendPath),
        backendPath: path.relative(UPLOAD_DIR, backendPath)
      }

      // Add metadata if it's a PDF file
      if (fileType === 'pdf' && file instanceof Blob) {
        try {
          const { extractTextFromPDF, generatePDFSummary } = require('./pdf-utils')
          const pdfContent = await extractTextFromPDF(file)
          const pdfAnalysis = await generatePDFSummary(pdfContent)
          
          storedFile.metadata = {
            title: pdfContent.metadata.title,
            author: pdfContent.metadata.author,
            subject: pdfContent.metadata.subject,
            pageCount: pdfContent.metadata.pageCount,
            keywords: pdfContent.metadata.keywords,
            creationDate: pdfContent.metadata.creationDate,
            modificationDate: pdfContent.metadata.modificationDate,
            analysis: {
              summary: pdfAnalysis.summary,
              sections: pdfAnalysis.sections,
              keyPoints: pdfAnalysis.keyPoints,
              confidence: pdfAnalysis.confidence
            }
          }

          // Add analysis tags to file tags
          if (pdfAnalysis.tags && pdfAnalysis.tags.length > 0) {
            storedFile.tags = [...new Set([...storedFile.tags, ...pdfAnalysis.tags])]
          }

          // Add any keywords from PDF metadata to tags
          if (pdfContent.metadata.keywords) {
            storedFile.tags = [...new Set([...tags, ...pdfContent.metadata.keywords])]
          }
        } catch (error) {
          console.warn('Could not extract PDF metadata:', error)
        }
      }

      this.metadata.push(storedFile)
      await this.saveMetadata()

      // Add to vector database for RAG functionality
      try {
        const vectorEmbedding = await encodeDocument(content, {
          id,
          filename: storedFile.originalName,
          uploadDate: storedFile.uploadDate.toISOString(),
          tags,
          summary,
          sourceUrl
        })
        
        await vectorDB.addDocument(vectorEmbedding)
        console.log('Document added to vector database:', id)
      } catch (error) {
        ApiErrorHandler.logError(error, 'Error adding document to vector database')
        // Continue without vector database if it fails
      }

      return storedFile
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error saving file')
      throw error
    }
  }

  async getFile(id: string): Promise<StoredFile | null> {
    try {
      return this.metadata.find(file => file.id === id) || null
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error retrieving file')
      throw error
    }
  }

  async getAllFiles(): Promise<StoredFile[]> {
    try {
      return [...this.metadata] // Return a copy to prevent external modification
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error retrieving all files')
      throw error
    }
  }

  async searchFiles(query: string): Promise<StoredFile[]> {
    try {
      const searchTerm = query.toLowerCase()
      return this.metadata.filter(file => 
        file.originalName.toLowerCase().includes(searchTerm) ||
        file.content.toLowerCase().includes(searchTerm) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        (file.summary && file.summary.toLowerCase().includes(searchTerm))
      )
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error searching files')
      throw error
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const fileIndex = this.metadata.findIndex(file => file.id === id)
      if (fileIndex === -1) return false

      const file = this.metadata[fileIndex]
      const frontendPath = path.join(UPLOAD_DIR, file.frontendPath)
      const backendPath = path.join(UPLOAD_DIR, file.backendPath)

      // Delete physical files
      if (fs.existsSync(frontendPath)) {
        fs.unlinkSync(frontendPath)
      }
      if (fs.existsSync(backendPath)) {
        fs.unlinkSync(backendPath)
      }

      // Remove from metadata
      this.metadata.splice(fileIndex, 1)
      await this.saveMetadata()

      // Remove from vector database
      try {
        await vectorDB.deleteDocument(id)
      } catch (error) {
        ApiErrorHandler.logError(error, 'Error removing document from vector database')
        // Continue even if vector database deletion fails
      }

      return true
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error deleting file')
      return false
    }
  }

  async createArchive(files: StoredFile[]): Promise<Buffer> {
    try {
      const archiver = require('archiver')
      const stream = require('stream')

      return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } })
        const chunks: Buffer[] = []

        archive.on('data', (chunk: Buffer) => chunks.push(chunk))
        archive.on('end', () => resolve(Buffer.concat(chunks)))
        archive.on('error', reject)

        files.forEach(file => {
          const filePath = path.join(UPLOAD_DIR, file.filename)
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file.originalName })
          }
        })

        archive.finalize()
      })
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error creating archive')
      throw error
    }
  }

  async getFileStats(): Promise<{
    totalFiles: number
    totalSize: number
    averageFileSize: number
    fileTypes: Record<string, number>
  }> {
    try {
      const totalFiles = this.metadata.length
      const totalSize = this.metadata.reduce((sum, file) => sum + file.size, 0)
      const averageFileSize = totalFiles > 0 ? totalSize / totalFiles : 0

      const fileTypes: Record<string, number> = {}
      this.metadata.forEach(file => {
        const ext = path.extname(file.originalName).toLowerCase()
        fileTypes[ext] = (fileTypes[ext] || 0) + 1
      })

      return {
        totalFiles,
        totalSize,
        averageFileSize,
        fileTypes
      }
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error getting file stats')
      throw error
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private extractTags(filename: string, content: string): string[] {
    try {
      const tags = new Set<string>()
      
      // Extract from filename
      const filenameParts = filename.replace(/\.pdf$/i, '').split(/[_\-\s]+/)
      filenameParts.forEach(part => {
        if (part.length > 2) {
          tags.add(part.toLowerCase())
        }
      })

      // Extract common research terms from content
      const researchTerms = [
        'ai', 'machine learning', 'deep learning', 'neural network', 'transformer',
        'computer vision', 'nlp', 'natural language processing', 'reinforcement learning',
        'algorithm', 'model', 'dataset', 'training', 'inference', 'optimization',
        'research', 'paper', 'study', 'analysis', 'methodology', 'results'
      ]

      const contentLower = content.toLowerCase()
      researchTerms.forEach(term => {
        if (contentLower.includes(term)) {
          tags.add(term)
        }
      })

      return Array.from(tags)
    } catch (error) {
      ApiErrorHandler.logError(error, 'Error extracting tags')
      return []
    }
  }

  private getFileType(file: File): string {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()
    
    // Check for images
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(fileName)) {
      return 'images'
    }
    
    // Check for PDFs
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf'
    }
    
    // Check for audio files
    if (fileType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/.test(fileName)) {
      return 'audio'
    }
    
    // Check for text files
    if (fileType.startsWith('text/') || /\.(txt|md|json|xml|html|css|js|ts)$/.test(fileName)) {
      return 'text'
    }
    
    // Default to text for unknown types
    return 'text'
  }
}

export const fileStorage = FileStorage.getInstance() 