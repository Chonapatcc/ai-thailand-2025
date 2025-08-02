import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnomyResearch - AI & Tech Research Intelligence",
  description:
    "Advanced AI assistant for analyzing artificial intelligence and technology research papers. Specialized in machine learning, deep learning, computer vision, NLP, and emerging tech.",
  keywords:
    "AI research, machine learning, deep learning, computer vision, NLP, artificial intelligence, technology research, research assistant, paper analysis",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
