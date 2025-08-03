import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PerformanceMonitor } from "@/components/ui/performance-monitor"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: "AnomyResearch - AI & Tech Research Intelligence",
  description:
    "Advanced AI assistant for analyzing artificial intelligence and technology research papers. Specialized in machine learning, deep learning, computer vision, NLP, and emerging tech.",
  keywords:
    "AI research, machine learning, deep learning, computer vision, NLP, artificial intelligence, technology research, research assistant, paper analysis",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b5cf6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "AnomyResearch - AI & Tech Research Intelligence",
    description: "Advanced AI assistant for analyzing artificial intelligence and technology research papers.",
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AnomyResearch - AI & Tech Research Intelligence",
    description: "Advanced AI assistant for analyzing artificial intelligence and technology research papers.",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preload" href="/illustration-anime-city.jpg" as="image" type="image/jpeg" />
        <link rel="dns-prefetch" href="//openrouter.ai" />
        <link rel="preconnect" href="https://openrouter.ai" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <PerformanceMonitor />
      </body>
    </html>
  )
}
