import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text, className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-500`} />
      {text && <span className="text-sm text-purple-200">{text}</span>}
    </div>
  )
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  )
}

export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
} 