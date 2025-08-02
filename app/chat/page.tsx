"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Plus, Paperclip, Loader2, Lightbulb, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import { ChatAPI, ChatMessage, getMockResponse } from "@/lib/api"

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setUploadedFile(file)
        setUploadedFileName(file.name)
        console.log('PDF file uploaded:', file.name, file.size)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage
    if (!content.trim() && !uploadedFile) return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: "user",
      content: uploadedFile ? `[Uploaded: ${uploadedFileName}] ${content}` : content,
      timestamp: new Date(),
      attachedPaper: attachedPapers.length > 0 ? attachedPapers[0] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      let response: any
      
      if (uploadedFile) {
        // Handle file upload
        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('message', content || 'Please summarize this paper')
        formData.append('context', JSON.stringify(attachedPapers))
        formData.append('history', JSON.stringify(messages.slice(-10)))
        
        console.log('Sending file upload to API:', {
          fileName: uploadedFileName,
          fileSize: uploadedFile.size,
          message: content,
          context: attachedPapers
        })
        
        const apiResponse = await fetch('/api/chat', {
          method: 'POST',
          body: formData
        })
        
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`)
        }
        
        response = await apiResponse.json()
        console.log('File upload API response:', response)
        
        // Clear uploaded file after successful upload
        setUploadedFile(null)
        setUploadedFileName("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        // Regular text message
        console.log('Sending message to API:', {
          message: content,
          context: attachedPapers,
          history: messages.slice(-10)
        })
        
        response = await ChatAPI.sendMessage({
          message: content,
          context: attachedPapers,
          history: messages.slice(-10), // Send last 10 messages for context
        })
        
        console.log('API response:', response)
      }

      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        type: "assistant",
        content: response.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('API call failed, using fallback response:', error)
      // Fallback to mock response if API fails
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        type: "assistant",
        content: getMockResponse(content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (attachedPapers.length === 0) {
      // If no papers are attached, just send the prompt normally
      handleSendMessage(action.prompt)
      return
    }

    setIsLoading(true)
    try {
      let response: any
      
      switch (action.label) {
        case "Summarize key findings":
          response = await ChatAPI.summarizePapers(attachedPapers)
          break
        case "Compare methodologies":
          response = await ChatAPI.compareMethodologies(attachedPapers)
          break
        case "Identify research gaps":
          response = await ChatAPI.identifyResearchGaps(attachedPapers)
          break
        case "Suggest future work":
          response = await ChatAPI.suggestFutureWork(attachedPapers)
          break
        default:
          // Fallback to regular message sending
          handleSendMessage(action.prompt)
          return
      }

      const aiResponse: ChatMessage = {
        id: messages.length + 1,
        type: "assistant",
        content: response.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Quick action API call failed:', error)
      // Fallback to regular message sending
      handleSendMessage(action.prompt)
    } finally {
      setIsLoading(false)
    }
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
                  {/* File Upload Status */}
                  {uploadedFile && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800">{uploadedFileName}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null)
                            setUploadedFileName("")
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about your research papers or upload a PDF..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={(!inputMessage.trim() && !uploadedFile) || isLoading}
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
