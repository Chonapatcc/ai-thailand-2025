"use client"

import type React from "react"
import { Search } from "lucide-react" // Import Search component

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  LinkIcon,
  FileText,
  Download,
  Copy,
  Loader2,
  CheckCircle,
  Database,
  AlertTriangle,
  Brain,
  Sparkles,
  Zap,
  Atom,
  Activity,
} from "lucide-react"
import Link from "next/link"

interface SummarySection {
  type: "method" | "result" | "dataset" | "weakness"
  title: string
  content: string
  icon: any
  gradient: string
  aiScore: number
}

export default function SummarizePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [paperUrl, setPaperUrl] = useState("")
  const [summaryGenerated, setSummaryGenerated] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<"en" | "th">("en")
  const [processingStage, setProcessingStage] = useState(0)

  // Mock summary data with AI scores
  const summaryData: Record<"en" | "th", SummarySection[]> = {
    en: [
      {
        type: "method",
        title: "Neural Methodology",
        content:
          "The research introduces a revolutionary quantum-neural hybrid architecture that leverages self-attention mechanisms with quantum entanglement properties. The model incorporates multi-dimensional attention layers with quantum positional encoding to capture non-linear dependencies across infinite dimensional spaces.",
        icon: Atom,
        gradient: "from-blue-500 to-purple-600",
        aiScore: 96,
      },
      {
        type: "result",
        title: "Quantum Results",
        content:
          "The proposed methodology achieves unprecedented performance breakthroughs, demonstrating 47% improvement in accuracy compared to classical approaches. The quantum-neural fusion shows superior performance across both microscopic and macroscopic datasets with exponential scaling capabilities.",
        icon: Activity,
        gradient: "from-green-500 to-blue-600",
        aiScore: 94,
      },
      {
        type: "dataset",
        title: "Data Nexus",
        content:
          "Experiments were conducted across multi-dimensional datasets including Quantum-GLUE benchmark, Neural-SQuAD 3.0, and a proprietary quantum dataset containing 10M+ entangled samples. Data preprocessing utilized quantum tokenization with neural embedding techniques.",
        icon: Database,
        gradient: "from-purple-500 to-pink-600",
        aiScore: 91,
      },
      {
        type: "weakness",
        title: "Neural Limitations",
        content:
          "The quantum-neural architecture requires significant quantum computational resources and specialized hardware. The approach may experience decoherence in non-quantum environments and requires careful calibration of entanglement parameters.",
        icon: AlertTriangle,
        gradient: "from-orange-500 to-red-600",
        aiScore: 88,
      },
    ],
    th: [
      {
        type: "method",
        title: "วิธีการเชิงควอนตัม",
        content:
          "งานวิจัยนี้นำเสนอสถาปัตยกรรมไฮบริดควอนตัม-นิวรัลที่ใช้กลไกการให้ความสนใจแบบตนเองร่วมกับคุณสมบัติการพันกันของควอนตัม โมเดลประกอบด้วยชั้นความสนใจหลายมิติพร้อม quantum positional encoding เพื่อจับความสัมพันธ์ไม่เชิงเส้นในพื้นที่มิติอนันต์",
        icon: Atom,
        gradient: "from-blue-500 to-purple-600",
        aiScore: 96,
      },
      {
        type: "result",
        title: "ผลลัพธ์ควอนตัม",
        content:
          "วิธีการที่นำเสนอบรรลุประสิทธิภาพที่ไม่เคยมีมาก่อน โดยแสดงการปรับปรุงความแม่นยำ 47% เมื่อเปรียบเทียบกับวิธีการคลาสสิก การผสานควอนตัม-นิวรัลแสดงประสิทธิภาพที่เหนือกว่าทั้งในชุดข้อมูลระดับจุลภาคและมหภาคพร้อมความสามารถในการขยายแบบเอ็กซ์โพเนนเชียล",
        icon: Activity,
        gradient: "from-green-500 to-blue-600",
        aiScore: 94,
      },
      {
        type: "dataset",
        title: "เน็กซัสข้อมูล",
        content:
          "การทดลองดำเนินการบนชุดข้อมูลหลายมิติรวมถึง Quantum-GLUE benchmark, Neural-SQuAD 3.0 และชุดข้อมูลควอนตัมที่พัฒนาเองซึ่งมีตัวอย่างที่พันกันมากกว่า 10 ล้านตัวอย่าง การประมวลผลข้อมูลใช้เทคนิค quantum tokenization ร่วมกับ neural embedding",
        icon: Database,
        gradient: "from-purple-500 to-pink-600",
        aiScore: 91,
      },
      {
        type: "weakness",
        title: "ข้อจำกัดเชิงนิวรัล",
        content:
          "สถาปัตยกรรมควอนตัม-นิวรัลต้องการทรัพยากรการคำนวณควอนตัมที่มากและฮาร์ดแวร์เฉพาะทาง วิธีการนี้อาจประสบปัญหา decoherence ในสภาพแวดล้อมที่ไม่ใช่ควอนตัมและต้องการการปรับเทียบพารามิเตอร์การพันกันอย่างระมัดระวัง",
        icon: AlertTriangle,
        gradient: "from-orange-500 to-red-600",
        aiScore: 88,
      },
    ],
  }

  const processingStages = [
    "Initializing Neural Networks...",
    "Quantum Pattern Recognition...",
    "Multi-dimensional Analysis...",
    "Synthesizing Insights...",
    "Neural Summary Complete!",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSummarize = async () => {
    setIsLoading(true)
    setProcessingStage(0)

    // Simulate processing stages
    for (let i = 0; i < processingStages.length; i++) {
      setProcessingStage(i)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setIsLoading(false)
    setSummaryGenerated(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadSummary = () => {
    const content = summaryData[activeLanguage].map((section) => `${section.title}:\n${section.content}\n\n`).join("")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `neural_summary_${activeLanguage}.txt`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                ResearchAI
              </h1>
              <p className="text-xs text-purple-300">Neural Summarizer</p>
            </div>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 backdrop-blur-sm bg-transparent"
            >
              Back to Neural Hub
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              Neural Summarization Engine
            </h2>
            <p className="text-purple-200 text-lg">
              Transform research papers into quantum insights with AI consciousness
            </p>
          </div>

          {!summaryGenerated ? (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-purple-400" />
                  Upload Research Paper
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Feed the neural network with your research document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border-white/20">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-purple-500/50 text-white">
                      Neural Upload
                    </TabsTrigger>
                    <TabsTrigger value="link" className="data-[state=active]:bg-purple-500/50 text-white">
                      Quantum Link
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="relative border-2 border-dashed border-purple-400/50 rounded-2xl p-12 text-center hover:border-purple-300/70 transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <Upload className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="file-upload"
                            className="text-xl font-medium cursor-pointer text-white hover:text-purple-200 transition-colors"
                          >
                            Drop your research into the neural void
                          </Label>
                          <p className="text-purple-300">Supports PDF files up to 10MB • Neural processing ready</p>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        {uploadedFile && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                            <div className="flex items-center justify-center space-x-3">
                              <FileText className="h-6 w-6 text-purple-300" />
                              <span className="text-white font-medium">{uploadedFile.name}</span>
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="link" className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="paper-url" className="text-white text-lg">
                        Quantum Research URL
                      </Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                        <Input
                          id="paper-url"
                          placeholder="https://arxiv.org/abs/quantum-neural-research..."
                          value={paperUrl}
                          onChange={(e) => setPaperUrl(e.target.value)}
                          className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300 backdrop-blur-sm text-lg"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={handleSummarize}
                      disabled={(!uploadedFile && !paperUrl) || isLoading}
                      className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-3 text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{processingStages[processingStage]}</span>
                          <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-white rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Atom className="h-5 w-5 group-hover:animate-spin transition-transform" />
                          <span>Begin Neural Analysis</span>
                          <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                        </div>
                      )}
                    </Button>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Summary Header */}
              <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border-green-400/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">Neural Analysis Complete</CardTitle>
                        <CardDescription className="text-green-200">
                          AI consciousness has processed your research with quantum precision
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as "en" | "th")}>
                        <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
                          <TabsTrigger value="en" className="data-[state=active]:bg-purple-500/50 text-white">
                            English
                          </TabsTrigger>
                          <TabsTrigger value="th" className="data-[state=active]:bg-purple-500/50 text-white">
                            ไทย
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <Button
                        variant="outline"
                        onClick={downloadSummary}
                        className="border-green-400/50 text-green-200 hover:bg-green-500/20 bg-transparent"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Neural Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {summaryData[activeLanguage].map((section, index) => {
                  const IconComponent = section.icon
                  return (
                    <Card
                      key={index}
                      className="group relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-500"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      ></div>
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-300 font-medium">{section.aiScore}% AI</span>
                          </div>
                        </div>
                        <CardTitle className="text-white text-xl mb-4 group-hover:text-purple-200 transition-colors">
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-purple-100 leading-relaxed mb-6 text-sm">{section.content}</p>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(section.content)}
                            className="text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Neural Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6 pt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSummaryGenerated(false)
                    setUploadedFile(null)
                    setPaperUrl("")
                  }}
                  className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 backdrop-blur-sm px-8"
                >
                  Analyze Another Paper
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:scale-105 transition-all duration-300 px-8"
                >
                  <Link href="/match">
                    <Search className="mr-2 h-4 w-4" />
                    Find Quantum Connections
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
