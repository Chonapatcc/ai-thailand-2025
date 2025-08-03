"use client"

import { useState, useEffect } from "react"
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
  FileText,
  Upload,
  Check,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/ui/navigation"
import { DownloadArchive } from "@/components/ui/download-archive"
import { calculateHistoricalSimilarity, SimilarityScore } from "@/lib/similarity-utils"

interface UploadedFile {
  id: string
  filename: string
  size: number
  uploadDate: string
  summary?: string
  tags: string[]
  similarityScore?: SimilarityScore
}

interface TechDiscovery {
  id: string
  title: string
  description: string
  category: string
  matchPercentage: number
  date: string
  impact: 'high' | 'medium' | 'low'
  status: 'active' | 'emerging' | 'mature'
}

interface ResearchProgress {
  id: string
  title: string
  progress: number
  status: 'in-progress' | 'completed' | 'planned'
  category: string
  lastUpdated: string
  team: string[]
  priority: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [techDiscoveries, setTechDiscoveries] = useState<TechDiscovery[]>([])
  const [researchProgress, setResearchProgress] = useState<ResearchProgress[]>([])
  const [isLoadingTech, setIsLoadingTech] = useState(false)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const fetchUploadedFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const response = await fetch('/api/files/list')
      if (response.ok) {
        const data = await response.json()
        const files = data.files || []
        
        // Calculate similarity scores for each file
        const filesWithScores = await Promise.all(
          files.map(async (file: any) => {
            try {
              // Mock recent queries for historical similarity
              const recentQueries = ['AI research', 'machine learning', 'deep learning', 'neural networks']
              const similarityScore = await calculateHistoricalSimilarity(file.content || '', recentQueries)
              
              return {
                ...file,
                similarityScore
              }
            } catch (error) {
              console.error('Error calculating similarity for file:', file.filename, error)
              return {
                ...file,
                similarityScore: {
                  score: 50,
                  explanation: 'Similarity calculation failed',
                  summary: 'Unable to calculate relevance score'
                }
              }
            }
          })
        )
        
        setUploadedFiles(filesWithScores)
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const fetchTechDiscoveries = async () => {
    setIsLoadingTech(true)
    try {
      const response = await fetch('/api/tech-discoveries')
      if (response.ok) {
        const data = await response.json()
        setTechDiscoveries(data.discoveries || [])
      } else {
        console.error('Tech discoveries API failed:', response.status)
        setTechDiscoveries([])
      }
    } catch (error) {
      console.error('Error fetching tech discoveries:', error)
    } finally {
      setIsLoadingTech(false)
    }
  }

  const fetchResearchProgress = async () => {
    setIsLoadingProgress(true)
    try {
      const response = await fetch('/api/research-progress')
      if (response.ok) {
        const data = await response.json()
        setResearchProgress(data.progress || [])
      } else {
        console.error('Research progress API failed:', response.status)
        setResearchProgress([])
      }
    } catch (error) {
      console.error('Error fetching research progress:', error)
    } finally {
      setIsLoadingProgress(false)
    }
  }

  useEffect(() => {
    fetchUploadedFiles()
    fetchTechDiscoveries()
    fetchResearchProgress()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'planned': return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <Navigation />
      
      {/* Search Bar */}
      <div className="relative z-10 container mx-auto px-4 py-4">
        <div className="flex items-center justify-center space-x-4">
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
                {isLoadingFiles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-purple-200 mt-2">Loading uploaded files...</p>
                  </div>
                ) : uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file) => (
                    <Card
                      key={file.id}
                      className="group bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors truncate max-w-xs">
                                {file.filename}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-500/50 text-white">PDF</Badge>
                                {file.similarityScore && (
                                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
                                    <span className="text-xs text-white font-medium">{file.similarityScore.score}% match</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-blue-300 font-medium">{formatFileSize(file.size)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-purple-300 mb-3">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {formatDate(file.uploadDate)}
                              </div>
                              <div className="flex items-center">
                                <Activity className="mr-1 h-4 w-4" />
                                AI Analyzed
                              </div>
                            </div>
                            {file.similarityScore?.summary && (
                              <p className="text-purple-200 text-sm mb-3 line-clamp-2">
                                {file.similarityScore.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                              onClick={() => handleFileSelection(file.id)}
                            >
                              {selectedFiles.includes(file.id) ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Select
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {file.tags.slice(0, 5).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 5 && (
                            <Badge
                              variant="outline"
                              className="border-purple-400/50 text-purple-300"
                            >
                              +{file.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white text-lg font-medium mb-2">No files uploaded yet</h3>
                    <p className="text-purple-200 mb-4">Upload your first research paper to get started</p>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Link href="/summarize">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Paper
                      </Link>
                    </Button>
                  </div>
                )}
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Bulk Actions</h4>
                      <DownloadArchive fileIds={selectedFiles} />
                    </div>
                    <p className="text-purple-200 text-sm">
                      Select files to download as archive
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                {techDiscoveries.map((discovery) => (
                  <Card
                    key={discovery.id}
                    className="group bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors truncate max-w-xs">
                              {discovery.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <div className="bg-gradient-to-r from-green-500 to-blue-500 px-2 py-1 rounded-full">
                                <span className="text-xs text-white font-medium">{discovery.matchPercentage}% match</span>
                              </div>
                              <Badge className="bg-purple-500/50 text-white">{discovery.category}</Badge>
                            </div>
                          </div>
                          <CardDescription className="text-purple-200 mb-3">{discovery.description}</CardDescription>
                          <div className="flex items-center text-sm text-purple-300">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatDate(discovery.date)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getImpactColor(discovery.impact)} border-2`}>
                            {discovery.impact}
                          </Badge>
                          <Badge className={`${getStatusColor(discovery.status)} border-2`}>
                            {discovery.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {/* No specific topics for discovery, just category */}
                        <Badge key={discovery.category} variant="secondary" className="bg-purple-500/30 text-purple-200">
                          {discovery.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="chats" className="space-y-4">
                {isLoadingProgress ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-purple-200 mt-2">Loading research progress...</p>
                  </div>
                ) : researchProgress.length > 0 ? (
                  researchProgress.map((project) => (
                    <Card
                      key={project.id}
                      className="group bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors truncate max-w-xs">
                                {project.title}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getStatusColor(project.status)} border-2`}>
                                  {project.status}
                                </Badge>
                                <Badge className={`${getPriorityColor(project.priority)} border-2`}>
                                  {project.priority}
                                </Badge>
                                <Badge className="bg-purple-500/50 text-white">{project.category}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-purple-300 mb-3">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {formatDate(project.lastUpdated)}
                              </div>
                              <div className="flex items-center">
                                <Activity className="mr-1 h-4 w-4" />
                                {project.team.length} team members
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm text-purple-200 mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {project.team.map((member, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-500/30 text-blue-200 text-xs">
                                  {member}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-400/50 text-green-200 hover:bg-green-500/20 bg-transparent"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-purple-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Research Projects</h3>
                    <p className="text-purple-200 mb-4">Start tracking your research progress and team collaboration</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Project
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
