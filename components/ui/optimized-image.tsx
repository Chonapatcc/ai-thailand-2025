"use client"

import Image from "next/image"
import { useState } from "react"
import { LoadingSpinner } from "./loading"

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  priority = false,
  quality = 85,
  sizes = "100vw",
  className = "",
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
} 