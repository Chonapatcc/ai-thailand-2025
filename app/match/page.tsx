"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ExternalLink, BookOpen, Calendar, Users, ChevronDown, ChevronUp, Filter } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/ui/navigation"
import { calculateSimilarityScore, SimilarityScore } from "@/lib/similarity-utils"

interface MatchReason {
  type: 'title' | 'topic' | 'summary' | 'abstract' | 'author' | 'content'
  field: string
  matchedText: string
  explanation: string
}

interface MatchedPaper {
  id: number
  title: string
  authors: string[]
  year: number
  venue: string
  topics: string[]
  summary: string
  relevanceScore: number
  link: string
  abstract: string
  similarityScore?: SimilarityScore
  matchReasons: MatchReason[]
}

export default function MatchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [matchedPapers, setMatchedPapers] = useState<MatchedPaper[]>([])
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null)

  // Mock data with more papers
  const mockPapers: Omit<MatchedPaper, 'matchReasons'>[] = [
    {
      id: 1,
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
      year: 2017,
      venue: "NeurIPS",
      topics: ["Transformers", "Attention Mechanism", "Neural Networks"],
      summary:
        "Introduces the Transformer architecture, dispensing with recurrence and convolutions entirely and based solely on attention mechanisms.",
      relevanceScore: 95,
      link: "https://arxiv.org/abs/1706.03762",
      abstract:
        "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    },
    {
      id: 2,
      title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
      authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
      year: 2018,
      venue: "NAACL",
      topics: ["BERT", "Pre-training", "Language Models", "NLP"],
      summary:
        "Introduces BERT, a bidirectional encoder representation from Transformers designed to pre-train deep bidirectional representations.",
      relevanceScore: 92,
      link: "https://arxiv.org/abs/1810.04805",
      abstract:
        "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    },
    {
      id: 3,
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder"],
      year: 2020,
      venue: "NeurIPS",
      topics: ["GPT-3", "Few-shot Learning", "Language Models"],
      summary: "Demonstrates that scaling up language models greatly improves task-agnostic, few-shot performance.",
      relevanceScore: 88,
      link: "https://arxiv.org/abs/2005.14165",
      abstract:
        "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples.",
    },
    {
      id: 4,
      title: "ResNet: Deep Residual Learning for Image Recognition",
      authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren"],
      year: 2016,
      venue: "CVPR",
      topics: ["Computer Vision", "ResNet", "Deep Learning", "Image Recognition"],
      summary: "Introduces residual connections that enable training of very deep neural networks for image recognition.",
      relevanceScore: 85,
      link: "https://arxiv.org/abs/1512.03385",
      abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
    },
    {
      id: 5,
      title: "YOLO: You Only Look Once",
      authors: ["Joseph Redmon", "Santosh Divvala", "Ross Girshick"],
      year: 2016,
      venue: "CVPR",
      topics: ["Object Detection", "YOLO", "Computer Vision", "Real-time"],
      summary: "Presents a unified approach to object detection that is fast and accurate.",
      relevanceScore: 82,
      link: "https://arxiv.org/abs/1506.02640",
      abstract: "We present YOLO, a new approach to object detection. Prior work on object detection repurposes classifiers to perform detection.",
    },
    {
      id: 6,
      title: "AlphaGo: Mastering the Game of Go",
      authors: ["David Silver", "Aja Huang", "Chris Maddison"],
      year: 2016,
      venue: "Nature",
      topics: ["Reinforcement Learning", "AlphaGo", "Game AI", "Deep Learning"],
      summary: "Demonstrates that deep neural networks combined with reinforcement learning can master complex games.",
      relevanceScore: 90,
      link: "https://www.nature.com/articles/nature16961",
      abstract: "The game of Go has long been viewed as the most challenging of classic games for artificial intelligence owing to its enormous search space and the difficulty of evaluating board positions and moves.",
    },
    {
      id: 7,
      title: "StyleGAN: A Style-Based Generator Architecture",
      authors: ["Tero Karras", "Samuli Laine", "Timo Aila"],
      year: 2019,
      venue: "CVPR",
      topics: ["GAN", "StyleGAN", "Image Generation", "Computer Vision"],
      summary: "Introduces a new generator architecture for GANs that leads to better quality and controllability.",
      relevanceScore: 87,
      link: "https://arxiv.org/abs/1812.04948",
      abstract: "We propose an alternative generator architecture for generative adversarial networks, borrowing from style transfer literature.",
    },
    {
      id: 8,
      title: "Vision Transformer (ViT)",
      authors: ["Alexey Dosovitskiy", "Lucas Beyer", "Alexander Kolesnikov"],
      year: 2021,
      venue: "ICLR",
      topics: ["Vision Transformer", "Computer Vision", "Transformers", "Image Classification"],
      summary: "Applies transformer architecture to image classification, showing that pure attention can work well for computer vision.",
      relevanceScore: 89,
      link: "https://arxiv.org/abs/2010.11929",
      abstract: "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited.",
    },
    {
      id: 9,
      title: "CLIP: Learning Transferable Visual Representations",
      authors: ["Alec Radford", "Jong Wook Kim", "Chris Hallacy"],
      year: 2021,
      venue: "ICML",
      topics: ["CLIP", "Multimodal", "Computer Vision", "NLP"],
      summary: "Learns visual representations from natural language supervision, enabling zero-shot image classification.",
      relevanceScore: 86,
      link: "https://arxiv.org/abs/2103.00020",
      abstract: "State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories.",
    },
    {
      id: 10,
      title: "DALL-E: Zero-Shot Text-to-Image Generation",
      authors: ["Aditya Ramesh", "Mikhail Pavlov", "Gabriel Goh"],
      year: 2021,
      venue: "ICML",
      topics: ["DALL-E", "Text-to-Image", "Multimodal", "Generation"],
      summary: "Creates images from text descriptions using a transformer-based architecture.",
      relevanceScore: 84,
      link: "https://arxiv.org/abs/2102.12092",
      abstract: "We present a simple method for training conditional language models to generate images from text descriptions.",
    }
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setMatchedPapers([])

    try {
      // First, search uploaded files
      const response = await fetch(`/api/files/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data = await response.json()

      let results: MatchedPaper[] = []

      if (data.success && data.files && data.files.length > 0) {
        // Convert uploaded files to MatchedPaper format with LLM similarity scoring
        const processedFiles = await Promise.all(
          data.files.map(async (file: any, index: number) => {
            try {
              const similarityScore = await calculateSimilarityScore(
                file.content || '',
                searchQuery,
                file.summary
              )
              
              return {
                id: index + 1,
                title: file.filename,
                authors: ['Uploaded Paper'],
                year: new Date(file.uploadDate).getFullYear(),
                venue: 'Uploaded',
                topics: file.tags || [],
                summary: similarityScore.summary,
                relevanceScore: similarityScore.score, // This is now a percentage
                link: file.sourceUrl || '#',
                abstract: file.content?.substring(0, 200) + '...' || 'No content available',
                similarityScore,
                matchReasons: calculateMatchReasons({
                  title: file.filename,
                  topics: file.tags || [],
                  summary: file.summary || '',
                  abstract: file.content || '',
                  authors: ['Uploaded Paper']
                }, searchQuery)
              }
            } catch (error) {
              console.error('Error calculating similarity for file:', file.filename, error)
              return {
                id: index + 1,
                title: file.filename,
                authors: ['Uploaded Paper'],
                year: new Date(file.uploadDate).getFullYear(),
                venue: 'Uploaded',
                topics: file.tags || [],
                summary: file.summary || 'No summary available',
                relevanceScore: 50,
                link: file.sourceUrl || '#',
                abstract: file.content?.substring(0, 200) + '...' || 'No content available',
                matchReasons: calculateMatchReasons({
                  title: file.filename,
                  topics: file.tags || [],
                  summary: file.summary || '',
                  abstract: file.content || '',
                  authors: ['Uploaded Paper']
                }, searchQuery)
              }
            }
          })
        )
        
        results = processedFiles
      }

      // If no uploaded files found, show mock results
      if (results.length === 0) {
        const query = searchQuery.toLowerCase()
        const keywords = query.split(' ').filter(word => word.length > 2)
        
        const filteredPapers = mockPapers.filter(paper => {
          // Check exact matches first
          const exactMatch = 
            paper.title.toLowerCase().includes(query) ||
            paper.topics.some(topic => topic.toLowerCase().includes(query)) ||
            paper.summary.toLowerCase().includes(query) ||
            paper.abstract.toLowerCase().includes(query) ||
            paper.authors.some(author => author.toLowerCase().includes(query))
          
          if (exactMatch) return true
          
          // Check keyword matches
          const keywordMatch = keywords.some(keyword =>
            paper.title.toLowerCase().includes(keyword) ||
            paper.topics.some(topic => topic.toLowerCase().includes(keyword)) ||
            paper.summary.toLowerCase().includes(keyword) ||
            paper.abstract.toLowerCase().includes(keyword) ||
            paper.authors.some(author => author.toLowerCase().includes(keyword))
          )
          
          return keywordMatch
        })
        
        // Add match reasons and calculate relevance scores
        results = filteredPapers.map(paper => {
          const matchReasons = calculateMatchReasons(paper, searchQuery)
          const relevanceScore = Math.min(95, 70 + (matchReasons.length * 5)) // Base score + bonus for multiple matches
          
          return {
            ...paper,
            matchReasons,
            relevanceScore
          }
        })
      } else {
        // Add match reasons to uploaded files
        results = results.map(paper => ({
          ...paper,
          matchReasons: calculateMatchReasons(paper, searchQuery)
        }))
      }
      
      // Sort results by relevance score (highest first)
      results.sort((a, b) => b.relevanceScore - a.relevanceScore)

      setMatchedPapers(results)
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock results
      setMatchedPapers(mockPapers)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (paperId: number) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId)
  }

  const calculateMatchReasons = (paper: any, searchQuery: string): MatchReason[] => {
    const reasons: MatchReason[] = []
    const query = searchQuery.toLowerCase()
    const keywords = query.split(' ').filter(word => word.length > 2) // Split into keywords
    
    // Check title matches
    if (paper.title.toLowerCase().includes(query)) {
      const matchedText = paper.title
      reasons.push({
        type: 'title',
        field: 'Title',
        matchedText,
        explanation: `Title contains "${searchQuery}"`
      })
    } else {
      // Check for partial keyword matches in title
      const matchingKeywords = keywords.filter(keyword => 
        paper.title.toLowerCase().includes(keyword)
      )
      if (matchingKeywords.length > 0) {
        reasons.push({
          type: 'title',
          field: 'Title',
          matchedText: paper.title,
          explanation: `Title contains keywords: ${matchingKeywords.join(', ')}`
        })
      }
    }
    
    // Check topic matches
    const matchingTopics = paper.topics.filter((topic: string) => 
      topic.toLowerCase().includes(query) || 
      keywords.some(keyword => topic.toLowerCase().includes(keyword))
    )
    if (matchingTopics.length > 0) {
      reasons.push({
        type: 'topic',
        field: 'Topics',
        matchedText: matchingTopics.join(', '),
        explanation: `Topics match: ${matchingTopics.join(', ')}`
      })
    }
    
    // Check summary matches
    if (paper.summary.toLowerCase().includes(query)) {
      const startIndex = paper.summary.toLowerCase().indexOf(query)
      const endIndex = Math.min(startIndex + query.length + 50, paper.summary.length)
      const matchedText = paper.summary.substring(startIndex, endIndex) + '...'
      reasons.push({
        type: 'summary',
        field: 'Summary',
        matchedText,
        explanation: `Summary contains "${searchQuery}"`
      })
    } else {
      // Check for partial keyword matches in summary
      const matchingKeywords = keywords.filter(keyword => 
        paper.summary.toLowerCase().includes(keyword)
      )
      if (matchingKeywords.length > 0) {
        const firstMatch = matchingKeywords[0]
        const startIndex = paper.summary.toLowerCase().indexOf(firstMatch)
        const endIndex = Math.min(startIndex + firstMatch.length + 50, paper.summary.length)
        const matchedText = paper.summary.substring(startIndex, endIndex) + '...'
        reasons.push({
          type: 'summary',
          field: 'Summary',
          matchedText,
          explanation: `Summary contains keywords: ${matchingKeywords.join(', ')}`
        })
      }
    }
    
    // Check abstract matches
    if (paper.abstract.toLowerCase().includes(query)) {
      const startIndex = paper.abstract.toLowerCase().indexOf(query)
      const endIndex = Math.min(startIndex + query.length + 50, paper.abstract.length)
      const matchedText = paper.abstract.substring(startIndex, endIndex) + '...'
      reasons.push({
        type: 'abstract',
        field: 'Abstract',
        matchedText,
        explanation: `Abstract contains "${searchQuery}"`
      })
    } else {
      // Check for partial keyword matches in abstract
      const matchingKeywords = keywords.filter(keyword => 
        paper.abstract.toLowerCase().includes(keyword)
      )
      if (matchingKeywords.length > 0) {
        const firstMatch = matchingKeywords[0]
        const startIndex = paper.abstract.toLowerCase().indexOf(firstMatch)
        const endIndex = Math.min(startIndex + firstMatch.length + 50, paper.abstract.length)
        const matchedText = paper.abstract.substring(startIndex, endIndex) + '...'
        reasons.push({
          type: 'abstract',
          field: 'Abstract',
          matchedText,
          explanation: `Abstract contains keywords: ${matchingKeywords.join(', ')}`
        })
      }
    }
    
    // Check author matches
    const matchingAuthors = paper.authors.filter((author: string) => 
      author.toLowerCase().includes(query) ||
      keywords.some(keyword => author.toLowerCase().includes(keyword))
    )
    if (matchingAuthors.length > 0) {
      reasons.push({
        type: 'author',
        field: 'Authors',
        matchedText: matchingAuthors.join(', '),
        explanation: `Author matches: ${matchingAuthors.join(', ')}`
      })
    }
    
    return reasons
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">การค้นหางานวิจัยที่เกี่ยวข้อง</h2>
            <p className="text-purple-200">ค้นหางานวิจัยที่เกี่ยวข้องตามความสนใจหรือบทคัดย่อของคุณ</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8 bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">อธิบายงานวิจัยของคุณ</CardTitle>
              <CardDescription className="text-purple-200">ป้อนหัวข้องานวิจัย บทคัดย่อ หรือคำสำคัญเพื่อค้นหางานวิจัยที่เกี่ยวข้อง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="research-query">คำอธิบายงานวิจัย</Label>
                <Textarea
                  id="research-query"
                  placeholder="ป้อนหัวข้องานวิจัย บทคัดย่อ หรือคำถามเฉพาะที่คุณกำลังศึกษา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="text-xs text-purple-300">
                  <p className="mb-1">ตัวอย่างการค้นหา:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">transformer</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">computer vision</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">deep learning</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">neural networks</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">attention mechanism</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังค้นหา...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      ค้นหางานวิจัยที่เกี่ยวข้อง
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {matchedPapers.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">พบงานวิจัยที่เกี่ยวข้อง {matchedPapers.length} เรื่อง</h3>
                <Button variant="outline" size="sm" className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20">
                  <Filter className="mr-2 h-4 w-4" />
                  กรองผลลัพธ์
                </Button>
              </div>

              <div className="space-y-4">
                {matchedPapers.map((paper) => (
                  <Card key={paper.id} className="hover:shadow-lg transition-shadow bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg truncate max-w-md text-white">{paper.title}</CardTitle>
                            <Badge className={getRelevanceColor(paper.relevanceScore)}>
                              {paper.relevanceScore}% match
                            </Badge>
                            {paper.similarityScore && (
                              <div className="bg-purple-500/20 px-2 py-1 rounded-full">
                                <span className="text-xs text-purple-300 font-medium">AI: {paper.similarityScore.explanation}</span>
                              </div>
                            )}
                            {paper.matchReasons && paper.matchReasons.length > 0 && (
                              <div className="bg-blue-500/20 px-2 py-1 rounded-full">
                                <span className="text-xs text-blue-300 font-medium">
                                  {paper.matchReasons.length} match{paper.matchReasons.length > 1 ? 'es' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-purple-300 mb-3">
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {paper.authors.slice(0, 2).join(", ")}
                              {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {paper.year}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="mr-1 h-4 w-4" />
                              {paper.venue}
                            </div>
                          </div>
                          <CardDescription className="mb-3 text-purple-200">{paper.summary}</CardDescription>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <a href={paper.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              ดูงานวิจัย
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpanded(paper.id)}>
                            {expandedPaper === paper.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                น้อยลง
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                เพิ่มเติม
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      {expandedPaper === paper.id && (
                        <div className="pt-4 border-t space-y-4">
                          {/* Match Reasons */}
                          {paper.matchReasons && paper.matchReasons.length > 0 && (
                            <div>
                              <h4 className="font-medium text-white mb-2">เหตุผลที่ตรงกัน</h4>
                              <div className="space-y-2">
                                {paper.matchReasons.map((reason, index) => (
                                  <div key={index} className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-blue-300">{reason.field}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {reason.type}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-blue-200 mb-1">{reason.explanation}</p>
                                    <p className="text-xs text-blue-300 bg-blue-500/20 p-2 rounded">
                                      "{reason.matchedText}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Abstract */}
                          <div>
                            <h4 className="font-medium text-white mb-2">บทคัดย่อ</h4>
                            <p className="text-purple-200 text-sm leading-relaxed">{paper.abstract}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button variant="outline" onClick={() => setMatchedPapers([])}>
                  ค้นหาใหม่
                </Button>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/chat">สนทนากับ AI</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/summarize">อัปโหลดและสรุป</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
