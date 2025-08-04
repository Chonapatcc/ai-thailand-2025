"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cpu, BarChart3, FileText, Search, MessageSquare, Sparkles } from "lucide-react"

interface NavigationProps {
  className?: string
}

export function Navigation({ className = "" }: NavigationProps) {
  const navigationItems = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: BarChart3 },
    { href: "/summarize", label: "วิเคราะห์", icon: FileText },
    { href: "/match", label: "ค้นพบ", icon: Search },
    { href: "/chat", label: "แชท AI", icon: MessageSquare },
  ]

  return (
    <header className={`relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                ThaiJoy
              </h1>
              <p className="text-xs text-purple-200">AI & Tech Research Intelligence</p>
            </Link>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center space-x-2 text-purple-200 hover:text-white transition-all duration-300"
            >
              <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="relative">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          ))}
        </nav>
        
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
        >
          <Link href="/dashboard">
            <Sparkles className="mr-2 h-4 w-4" />
            เริ่มวิจัย
          </Link>
        </Button>
      </div>
    </header>
  )
} 