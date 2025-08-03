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
      const filePath = path.join(UPLOAD_DIR, filename)

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        throw new Error('File with this name already exists')
      }

      // Save file content
      const buffer = Buffer.from(await file.arrayBuffer())
      fs.writeFileSync(filePath, buffer)

      // Extract tags from filename and content
      const tags = this.extractTags(file.name, content)

      const storedFile: StoredFile = {
        id,
        filename,
        originalName: file.name,
        size: file.size,
        uploadDate: new Date(),
        content,
        tags,
        summary,
        sourceUrl
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
      const filePath = path.join(UPLOAD_DIR, file.filename)

      // Delete physical file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
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
}

export const fileStorage = FileStorage.getInstance() 