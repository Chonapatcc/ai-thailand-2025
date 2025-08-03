"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Plus, Paperclip, Lightbulb, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/ui/navigation"
import { ChatAPI, ChatMessage, getMockResponse } from "@/lib/api"
import { Loading, LoadingSpinner } from "@/components/ui/loading"

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<File | null>(null)
  const [showContextPapers, setShowContextPapers] = useState(false)
  const [availablePapers, setAvailablePapers] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file)
        console.log('Image uploaded:', file.name, file.size)
      } else {
        alert('Please upload an image file')
      }
    }
  }

  const handleVoiceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.wav') || file.name.toLowerCase().endsWith('.mp3')) {
        setSelectedVoice(file)
        console.log('Voice file uploaded:', file.name, file.size)
      } else {
        alert('Please upload an audio file')
      }
    }
  }

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage
    if (!content.trim() && !uploadedFile && !selectedImage && !selectedVoice) return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: "user",
      content: uploadedFile ? `[Uploaded PDF: ${uploadedFileName}] ${content}` : 
               selectedImage ? `[Uploaded Image: ${selectedImage.name}] ${content}` :
               selectedVoice ? `[Uploaded Voice: ${selectedVoice.name}] ${content}` : content,
      timestamp: new Date(),
      attachedPaper: attachedPapers.length > 0 ? attachedPapers[0] : undefined,
      attachedImage: selectedImage,
      attachedVoice: selectedVoice,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      let response: any
      
      if (uploadedFile) {
        // Handle PDF upload using new Python script approach
        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('message', content || 'Please summarize this paper')
        formData.append('context', JSON.stringify(attachedPapers))
        formData.append('history', JSON.stringify(messages.slice(-10)))
        
        console.log('Sending PDF upload to API:', {
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
        console.log('PDF upload API response:', response)
        
      } else if (selectedImage) {
        // Handle image upload using new Python script approach
        const formData = new FormData()
        formData.append('image', selectedImage)
        formData.append('question', content || 'What do you see in this image?')
        formData.append('sessionid', 'web-chat-image')
        formData.append('temperature', '0.3')
        
        console.log('Sending image upload to API:', {
          fileName: selectedImage.name,
          fileSize: selectedImage.size,
          question: content
        })
        
        const apiResponse = await fetch('/api/aift/image', {
          method: 'POST',
          body: formData
        })
        
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`)
        }
        
        response = await apiResponse.json()
        console.log('Image upload API response:', response)
        
      } else if (selectedVoice) {
        // Handle voice upload using new Python script approach
        const formData = new FormData()
        formData.append('audio', selectedVoice)
        formData.append('question', content || 'What is being said in this audio?')
        formData.append('sessionid', 'web-chat-voice')
        formData.append('temperature', '0.3')
        
        console.log('Sending voice upload to API:', {
          fileName: selectedVoice.name,
          fileSize: selectedVoice.size,
          question: content
        })
        
        const apiResponse = await fetch('/api/aift/voice', {
          method: 'POST',
          body: formData
        })
        
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`)
        }
        
        response = await apiResponse.json()
        console.log('Voice upload API response:', response)
        
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
      
      // Clear uploaded files after successful processing
      if (uploadedFile) {
        setUploadedFile(null)
        setUploadedFileName("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      if (selectedImage) {
        setSelectedImage(null)
        if (imageInputRef.current) {
          imageInputRef.current.value = ""
        }
      }
      if (selectedVoice) {
        setSelectedVoice(null)
        if (voiceInputRef.current) {
          voiceInputRef.current.value = ""
        }
      }
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

  const addPaperToContext = async () => {
    try {
      // Fetch available papers from the database
      const response = await fetch('/api/files/list')
      if (response.ok) {
        const data = await response.json()
        setAvailablePapers(data.files || [])
        setShowContextPapers(true)
      }
    } catch (error) {
      console.error('Error fetching papers:', error)
    }
  }

  const selectContextPaper = (paper: any) => {
    setAttachedPapers([paper.filename])
    setShowContextPapers(false)
    console.log('Selected context paper:', paper.filename)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-x-hidden">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Context Papers</CardTitle>
              </CardHeader>
              <CardContent>
                {attachedPapers.length > 0 ? (
                  <div className="space-y-2">
                    {attachedPapers.map((paper, index) => (
                      <div key={index} className="p-2 bg-purple-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-300" />
                          <span className="text-sm font-medium text-purple-200 truncate">{paper}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-300">
                    No papers added to context yet. Add papers to get more specific insights.
                  </p>
                )}
                
                <Button
                  onClick={addPaperToContext}
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Context Paper
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
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
                        className="w-full justify-start text-left h-auto p-2 text-purple-200 hover:text-white hover:bg-purple-500/20"
                        onClick={() => handleQuickAction(action)}
                      >
                        <IconComponent className="mr-2 h-4 w-4 text-purple-300" />
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
            <Card className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Bot className="mr-2 h-5 w-5 text-purple-400" />
                  AI Research Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-transparent">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user" ? "bg-purple-600 text-white" : "bg-purple-500/20 text-white backdrop-blur-sm border border-purple-400/30"
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
                        <div className="bg-purple-500/20 backdrop-blur-md rounded-lg p-3 border border-purple-400/30">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-purple-400" />
                            <LoadingSpinner className="h-4 w-4" />
                            <span className="text-sm text-purple-200">AI is analyzing...</span>
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
                    <div className="mb-3 p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-300" />
                          <span className="text-sm text-blue-200">{uploadedFileName}</span>
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
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image Upload Status */}
                  {selectedImage && (
                    <div className="mb-3 p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-300 rounded"></div>
                          <span className="text-sm text-green-200">{selectedImage.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(null)
                            if (imageInputRef.current) {
                              imageInputRef.current.value = ""
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Voice Upload Status */}
                  {selectedVoice && (
                    <div className="mb-3 p-2 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
                          <span className="text-sm text-purple-200">{selectedVoice.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVoice(null)
                            if (voiceInputRef.current) {
                              voiceInputRef.current.value = ""
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
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
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                    
                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <input
                      ref={voiceInputRef}
                      type="file"
                      accept="audio/*,.wav,.mp3"
                      onChange={handleVoiceUpload}
                      className="hidden"
                    />
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20"
                      title="Upload PDF"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isLoading}
                      className="border-green-400/50 text-green-200 hover:bg-green-500/20"
                      title="Upload Image"
                    >
                      <div className="w-4 h-4 bg-green-300 rounded"></div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => voiceInputRef.current?.click()}
                      disabled={isLoading}
                      className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20"
                      title="Upload Voice"
                    >
                      <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
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

      {/* Context Papers Modal */}
      {showContextPapers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-purple-400/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Context Paper</h3>
              <Button
                variant="ghost"
                onClick={() => setShowContextPapers(false)}
                className="text-purple-300 hover:text-white"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2">
              {availablePapers.length > 0 ? (
                availablePapers.map((paper, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer"
                    onClick={() => selectContextPaper(paper)}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-300" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{paper.filename}</div>
                        <div className="text-xs text-purple-300">
                          {paper.summary ? paper.summary.substring(0, 100) + '...' : 'No summary available'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-purple-300 text-center py-4">No papers available in database</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
