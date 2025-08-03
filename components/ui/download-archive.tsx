"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface DownloadArchiveProps {
  fileIds: string[]
  className?: string
}

export function DownloadArchive({ fileIds, className = "" }: DownloadArchiveProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (fileIds.length === 0) return

    setIsDownloading(true)
    try {
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds })
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `research_papers_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download archive')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading || fileIds.length === 0}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Archive...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Archive ({fileIds.length} files)
        </>
      )}
    </Button>
  )
} 