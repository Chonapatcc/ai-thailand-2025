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
}

export default function MatchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [matchedPapers, setMatchedPapers] = useState<MatchedPaper[]>([])
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null)

  // Mock data
  const mockPapers: MatchedPaper[] = [
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
                similarityScore
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
                abstract: file.content?.substring(0, 200) + '...' || 'No content available'
              }
            }
          })
        )
        
        results = processedFiles
      }

      // If no uploaded files found, show mock results
      if (results.length === 0) {
        results = mockPapers.filter(paper => 
          paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
          paper.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

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
            <h2 className="text-3xl font-bold text-white mb-2">Research Paper Matching</h2>
            <p className="text-purple-200">Find related papers based on your research interests or abstract</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8 bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Describe Your Research</CardTitle>
              <CardDescription className="text-purple-200">Enter your research topic, abstract, or keywords to find related papers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="research-query">Research Description</Label>
                <Textarea
                  id="research-query"
                  placeholder="Enter your research topic, abstract, or specific questions you're investigating..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
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
                      Finding Papers...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find Related Papers
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
                <h3 className="text-xl font-semibold text-white">Found {matchedPapers.length} Related Papers</h3>
                <Button variant="outline" size="sm" className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Results
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
                              View Paper
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpanded(paper.id)}>
                            {expandedPaper === paper.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                More
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
                        <div className="pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-2">Abstract</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{paper.abstract}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button variant="outline" onClick={() => setMatchedPapers([])}>
                  New Search
                </Button>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/chat">Discuss with AI</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/summarize">Upload & Summarize</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
