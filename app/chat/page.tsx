"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Plus, Paperclip, Loader2, Lightbulb, BookOpen, Search } from "lucide-react"
import Link from "next/link"

interface Message {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: Date
  attachedPaper?: string
}

interface QuickAction {
  label: string
  prompt: string
  icon: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      content:
        "Hello! I'm your AI research assistant. I can help you understand research papers, find connections between studies, and answer questions about your uploaded documents. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedPapers, setAttachedPapers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      label: "Summarize key findings",
      prompt: "Can you summarize the key findings from the attached papers?",
      icon: FileText,
    },
    {
      label: "Compare methodologies",
      prompt: "How do the methodologies in these papers compare?",
      icon: Search,
    },
    {
      label: "Identify research gaps",
      prompt: "What research gaps can you identify from these studies?",
      icon: Lightbulb,
    },
    {
      label: "Suggest future work",
      prompt: "Based on these papers, what future research directions would you suggest?",
      icon: BookOpen,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage
    if (!content.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content,
      timestamp: new Date(),
      attachedPaper: attachedPapers.length > 0 ? attachedPapers[0] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: "assistant",
        content: generateAIResponse(content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 2000)
  }

  const generateAIResponse = (userMessage: string): string => {
    // Mock AI responses based on user input
    if (userMessage.toLowerCase().includes("summarize")) {
      return "Based on the papers you've shared, here are the key findings:\n\n1. **Novel Architecture**: The transformer-based approach shows significant improvements over traditional RNN models\n2. **Performance Gains**: 15-20% improvement in accuracy across multiple benchmarks\n3. **Computational Efficiency**: Reduced training time while maintaining model quality\n\nWould you like me to elaborate on any of these points?"
    }

    if (userMessage.toLowerCase().includes("methodology") || userMessage.toLowerCase().includes("method")) {
      return "The methodologies in these papers share some common approaches:\n\n**Similarities:**\n- Both use attention mechanisms as core components\n- Similar preprocessing techniques for data preparation\n- Comparable evaluation metrics\n\n**Key Differences:**\n- Paper A uses multi-head attention while Paper B employs single-head with different scaling\n- Different optimization strategies (Adam vs. AdamW)\n\nWhich specific aspect of the methodology would you like to explore further?"
    }

    return "That's an interesting question! Based on the research papers in our conversation, I can provide insights on various aspects including methodologies, results, limitations, and potential future directions. Could you be more specific about what you'd like to know?"
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt)
  }

  const addPaperToContext = () => {
    // Mock adding a paper to context
    const paperTitle = "Attention Is All You Need"
    if (!attachedPapers.includes(paperTitle)) {
      setAttachedPapers((prev) => [...prev, paperTitle])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ResearchAI</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={addPaperToContext}>
              <Plus className="mr-2 h-4 w-4" />
              Add Paper to Context
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Context Papers</CardTitle>
              </CardHeader>
              <CardContent>
                {attachedPapers.length > 0 ? (
                  <div className="space-y-2">
                    {attachedPapers.map((paper, index) => (
                      <div key={index} className="p-2 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800 truncate">{paper}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No papers added to context yet. Add papers to get more specific insights.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleQuickAction(action)}
                      >
                        <IconComponent className="mr-2 h-4 w-4 text-purple-600" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-purple-600" />
                  AI Research Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.type === "assistant" && <Bot className="h-5 w-5 mt-0.5 text-purple-600" />}
                            {message.type === "user" && <User className="h-5 w-5 mt-0.5 text-white" />}
                            <div className="flex-1">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                              {message.attachedPaper && (
                                <Badge variant="secondary" className="mt-2">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  {message.attachedPaper}
                                </Badge>
                              )}
                              <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span className="text-sm text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about your research papers..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
