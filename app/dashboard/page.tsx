"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MessageSquare,
  Clock,
  Download,
  Eye,
  Filter,
  Calendar,
  Cpu,
  Zap,
  Sparkles,
  Activity,
  Target,
  Layers,
  Network,
  Brain,
} from "lucide-react"
import Link from "next/link"

// Mock data focused on AI/Tech research
const recentSummaries = [
  {
    id: 1,
    title: "Transformer Architecture Optimization for Large Language Models",
    date: "2024-01-15",
    status: "completed",
    language: "EN",
    categories: ["Architecture", "Optimization", "LLM"],
    aiScore: 96,
    field: "Natural Language Processing",
  },
  {
    id: 2,
    title: "Convolutional Neural Networks for Real-time Object Detection",
    date: "2024-01-14",
    status: "completed",
    language: "EN",
    categories: ["CNN", "Computer Vision", "Real-time"],
    aiScore: 92,
    field: "Computer Vision",
  },
  {
    id: 3,
    title: "Reinforcement Learning in Autonomous Vehicle Navigation",
    date: "2024-01-13",
    status: "completed",
    language: "EN",
    categories: ["RL", "Autonomous Systems", "Navigation"],
    aiScore: 89,
    field: "Robotics",
  },
]

const matchedPapers = [
  {
    id: 1,
    title: "Attention Is All You Need: Transformer Architecture Deep Dive",
    topics: ["Transformers", "Attention Mechanism", "Neural Architecture"],
    summary: "Revolutionary self-attention mechanism that transformed NLP and beyond...",
    date: "2024-01-15",
    relevance: 98,
    citations: 47520,
    field: "Deep Learning",
  },
  {
    id: 2,
    title: "BERT: Bidirectional Encoder Representations from Transformers",
    topics: ["BERT", "Pre-training", "Language Understanding"],
    summary: "Breakthrough in bidirectional language representation learning...",
    date: "2024-01-14",
    relevance: 95,
    citations: 28340,
    field: "NLP",
  },
  {
    id: 3,
    title: "ResNet: Deep Residual Learning for Image Recognition",
    topics: ["ResNet", "Computer Vision", "Deep Networks"],
    summary: "Solving vanishing gradient problem with residual connections...",
    date: "2024-01-13",
    relevance: 91,
    citations: 89760,
    field: "Computer Vision",
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                AnomyResearch
              </h1>
              <p className="text-xs text-purple-300">AI Research Hub</p>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                placeholder="Search AI research patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-purple-300 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 backdrop-blur-sm bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              AI Filter
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-purple-400" />
                  AI Research Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    href: "/summarize",
                    icon: Brain,
                    label: "Analyze AI Papers",
                    gradient: "from-blue-500 to-purple-600",
                  },
                  {
                    href: "/match",
                    icon: Network,
                    label: "Find Tech Patterns",
                    gradient: "from-purple-500 to-pink-600",
                  },
                  {
                    href: "/chat",
                    icon: MessageSquare,
                    label: "AI Research Chat",
                    gradient: "from-pink-500 to-red-600",
                  },
                ].map((action, index) => (
                  <Button
                    key={index}
                    asChild
                    className={`w-full bg-gradient-to-r ${action.gradient} hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    <Link href={action.href}>
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Research Progress */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-green-400" />
                  Research Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: "AI Papers Analyzed", value: 85, max: 100, color: "from-blue-500 to-purple-600" },
                    { label: "Tech Connections", value: 72, max: 100, color: "from-purple-500 to-pink-600" },
                    { label: "Algorithm Insights", value: 68, max: 100, color: "from-pink-500 to-red-600" },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">{item.label}</span>
                        <span className="text-white font-medium">{item.value}%</span>
                      </div>
                      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.value}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Intelligence Score */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-400/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-yellow-900" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">AI Intelligence</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    96.8
                  </div>
                  <div className="text-purple-300 text-sm">Research Efficiency Score</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                AI Research Dashboard
              </h2>
              <p className="text-purple-200">Monitor your artificial intelligence research journey</p>
            </div>

            <Tabs defaultValue="summaries" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border-white/20">
                <TabsTrigger value="summaries" className="data-[state=active]:bg-purple-500/50 text-white">
                  AI Paper Analysis
                </TabsTrigger>
                <TabsTrigger value="matches" className="data-[state=active]:bg-purple-500/50 text-white">
                  Tech Discoveries
                </TabsTrigger>
                <TabsTrigger value="chats" className="data-[state=active]:bg-purple-500/50 text-white">
                  AI Conversations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summaries" className="space-y-4">
                {recentSummaries.map((summary) => (
                  <Card
                    key={summary.id}
                    className="group bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors">
                              {summary.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-blue-500/50 text-white">{summary.field}</Badge>
                              <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-300 font-medium">{summary.aiScore}% AI</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-purple-300 mb-3">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {summary.date}
                            </div>
                            <div className="flex items-center">
                              <Activity className="mr-1 h-4 w-4" />
                              AI Analysis Complete
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {summary.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20 transition-colors"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                {matchedPapers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="group bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors">
                              {paper.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <div className="bg-gradient-to-r from-green-500 to-blue-500 px-2 py-1 rounded-full">
                                <span className="text-xs text-white font-medium">{paper.relevance}% match</span>
                              </div>
                              <div className="bg-yellow-500/20 px-2 py-1 rounded-full">
                                <span className="text-xs text-yellow-300 font-medium">{paper.citations} citations</span>
                              </div>
                              <Badge className="bg-purple-500/50 text-white">{paper.field}</Badge>
                            </div>
                          </div>
                          <CardDescription className="text-purple-200 mb-3">{paper.summary}</CardDescription>
                          <div className="flex items-center text-sm text-purple-300">
                            <Clock className="mr-1 h-4 w-4" />
                            {paper.date}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                        >
                          <Layers className="h-4 w-4 mr-1" />
                          Deep Analyze
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {paper.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="bg-purple-500/30 text-purple-200">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="chats" className="space-y-4">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <MessageSquare className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <Sparkles className="h-4 w-4 text-yellow-900" />
                        </div>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-3">AI Research Conversations</h3>
                      <p className="text-purple-200 mb-6 max-w-md mx-auto">
                        Discuss algorithms, architectures, and breakthrough AI research with our specialized assistant
                      </p>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/chat">
                          <Brain className="mr-2 h-4 w-4" />
                          Start AI Research Chat
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
