"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  fps: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      
      // Memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0

      setMetrics({
        loadTime,
        memoryUsage,
        fps: 60 // Placeholder, would need more complex measurement
      })
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('load', measurePerformance)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible])

  if (!isVisible || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg text-xs z-50">
      <div className="font-mono">
        <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
        <div>FPS: {metrics.fps}</div>
      </div>
    </div>
  )
} 