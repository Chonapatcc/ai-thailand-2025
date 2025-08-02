"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Plus, Paperclip, Loader2, Lightbulb, BookOpen, Search, AlertCircle } from "lucide-react"
import Link from "next/link"
import { chatApi, ChatMessage, ApiError } from "@/lib/api"
import { toast } from "sonner"

interface QuickAction {
  label: string
  prompt: string
  icon: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
  const [error, setError] = useState<string | null>(null)
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

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await chatApi.getChatHistory()
        if (history.length > 0) {
          setMessages(history)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // Don't show error toast for history loading, just log it
      }
    }

    loadChatHistory()
  }, [])

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: "user",
      content,
      timestamp: new Date(),
      attachedPaper: attachedPapers.length > 0 ? attachedPapers[0] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApi.sendMessage({
        message: content,
        attachedPapers: attachedPapers,
        conversationHistory: messages,
      })

      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        type: "assistant",
        content: response.message,
        timestamp: response.timestamp,
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to send message:', error)
      
      let errorMessage = 'Failed to send message. Please try again.'
      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to send messages.'
        } else if (error.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.'
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Remove the user message if the API call failed
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt)
  }

  const addPaperToContext = () => {
    // Mock adding a paper to context
    const paperTitle = "Attention Is All You Need"
    if (!attachedPapers.includes(paperTitle)) {
      setAttachedPapers((prev) => [...prev, paperTitle])
      toast.success(`Added "${paperTitle}" to context`)
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
                        disabled={isLoading}
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
                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-400">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

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
                      disabled={isLoading}
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
