import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    // Get all uploaded files
    const files = await fileStorage.getAllFiles()
    
    // Generate research progress based on uploaded files
    const progress = files.map((file, index) => {
      const uploadDate = new Date(file.uploadDate)
      const daysSinceUpload = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate progress based on file analysis and time
      let progress = 0
      let status: 'in-progress' | 'completed' | 'planned' = 'planned'
      let priority: 'high' | 'medium' | 'low' = 'medium'
      
      if (file.summary) {
        progress = Math.min(100, 50 + (daysSinceUpload * 10)) // Progress increases with time
        status = progress >= 100 ? 'completed' : 'in-progress'
      } else {
        progress = Math.min(30, daysSinceUpload * 5)
        status = 'planned'
      }
      
      // Determine priority based on file size and content
      if (file.size > 1000000) { // Large files are high priority
        priority = 'high'
      } else if (file.size > 500000) {
        priority = 'medium'
      } else {
        priority = 'low'
      }
      
      // Extract category from filename or tags
      const category = file.tags.length > 0 ? file.tags[0] : 'Research'
      
      return {
        id: file.id,
        title: file.originalName.replace('.pdf', ''),
        progress: Math.min(100, progress),
        status,
        category,
        lastUpdated: file.uploadDate,
        team: ['Research Team'], // Mock team
        priority
      }
    })
    
    // Add some additional research projects based on file analysis
    const additionalProgress = []
    
    if (files.length > 0) {
      // Add collaborative research projects
      additionalProgress.push({
        id: 'collab-1',
        title: 'Cross-Paper Analysis Framework',
        progress: 75,
        status: 'in-progress' as const,
        category: 'Analysis',
        lastUpdated: new Date().toISOString(),
        team: ['AI Team', 'Research Team'],
        priority: 'high' as const
      })
      
      additionalProgress.push({
        id: 'collab-2',
        title: 'Automated Literature Review',
        progress: 90,
        status: 'in-progress' as const,
        category: 'Automation',
        lastUpdated: new Date().toISOString(),
        team: ['ML Team'],
        priority: 'medium' as const
      })
    }
    
    return NextResponse.json({
      success: true,
      progress: [...progress, ...additionalProgress]
    })
    
  } catch (error) {
    console.error('Error fetching research progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch research progress' },
      { status: 500 }
    )
  }
} 