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
  title: "ThaiJoy - AI & Tech Research Intelligence",
  description:
    "ผู้ช่วย AI ขั้นสูงสำหรับการวิเคราะห์งานวิจัยด้านปัญญาประดิษฐ์และเทคโนโลยี เชี่ยวชาญด้าน machine learning, deep learning, computer vision, NLP และเทคโนโลยีใหม่",
  keywords:
    "AI research, machine learning, deep learning, computer vision, NLP, artificial intelligence, technology research, research assistant, paper analysis, วิจัย AI, ปัญญาประดิษฐ์",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b5cf6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "ThaiJoy - AI & Tech Research Intelligence",
    description: "ผู้ช่วย AI ขั้นสูงสำหรับการวิเคราะห์งานวิจัยด้านปัญญาประดิษฐ์และเทคโนโลยี",
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ThaiJoy - AI & Tech Research Intelligence",
    description: "ผู้ช่วย AI ขั้นสูงสำหรับการวิเคราะห์งานวิจัยด้านปัญญาประดิษฐ์และเทคโนโลยี",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="scroll-smooth">
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
