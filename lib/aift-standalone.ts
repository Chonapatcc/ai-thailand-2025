// Simple error logging without external dependency
const logError = (error: any, context: string) => {
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] ${context}:`, error)
}

export interface AIFTChatParams {
  sessionid?: string
  context?: string
  temperature?: number
  return_json?: boolean
}

export class AIFTStandalone {
  private static sessions: Map<string, string[]> = new Map()

  static async textqa(question: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT standalone textqa with:', { question, params })
      
      // Call Python script file
      const { spawn } = await import('child_process')
      const path = await import('path')
      
      // Path to the Python script
      const pythonScriptPath = path.default.join(process.cwd(), 'python', 'aift_textqa.py')
      
      // Call Python script
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        question,
        params.sessionid || 'default-session',
        params.context || '',
        (params.temperature || 0.2).toString(),
        (params.return_json || false).toString()
      ])
      
      // Get response from Python
      let response = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        response += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      // Wait for Python process to complete
      await new Promise<string>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(response.trim())
          } else {
            reject(new Error(`Python process failed with code ${code}: ${error}`))
          }
        })
      })
      
      console.log('AIFT standalone Python response:', { content: response })
      
      if (params.return_json) {
        return JSON.stringify({
          instruction: question,
          system_prompt: 'Python AIFT function call',
          content: response,
          temperature: params.temperature || 0.4,
          max_new_tokens: 256,
          execution_time: '0.05'
        })
      } else {
        return response
      }
      
    } catch (error) {
      console.error('AIFT standalone textqa error:', error)
      logError(error, 'AIFT standalone textqa failed')
      throw new Error('AIFT standalone service temporarily unavailable')
    }
  }

  static async chat(message: string, params: AIFTChatParams = {}): Promise<string> {
    try {
      console.log('Calling AIFT standalone chat with:', { message, params })
      
      const sessionid = params.sessionid || 'default-session'
      const context = params.context || ''
      
      // Get or create session history
      if (!this.sessions.has(sessionid)) {
        this.sessions.set(sessionid, [])
      }
      const sessionHistory = this.sessions.get(sessionid)!
      
      // Add context and message to history
      if (context) {
        sessionHistory.push(`Context: ${context}`)
      }
      sessionHistory.push(`User: ${message}`)
      
      // Call Python script file
      const { spawn } = await import('child_process')
      const path = await import('path')
      
      // Path to the Python script
      const pythonScriptPath = path.default.join(process.cwd(), 'python', 'aift_chat.py')
      
      // Call Python script
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        message,
        sessionid,
        context,
        (params.temperature || 0.2).toString(),
        (params.return_json || false).toString()
      ])
      
      // Get response from Python
      let response = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        response += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      // Wait for Python process to complete
      await new Promise<string>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(response.trim())
          } else {
            reject(new Error(`Python process failed with code ${code}: ${error}`))
          }
        })
      })
      
      // Add response to session history
      sessionHistory.push(`Assistant: ${response}`)
      
      // Keep only last 10 messages to prevent memory issues
      if (sessionHistory.length > 10) {
        sessionHistory.splice(0, sessionHistory.length - 10)
      }
      
      console.log('AIFT standalone chat response:', { content: response })
      
      if (params.return_json) {
        return JSON.stringify({
          message,
          sessionid,
          context,
          content: response,
          temperature: params.temperature || 0.4,
          execution_time: '0.02'
        })
      } else {
        return response
      }
    } catch (error) {
      console.error('AIFT standalone chat error:', error)
      logError(error, 'AIFT standalone chat failed')
      throw new Error('AIFT standalone chat service temporarily unavailable')
    }
  }

  // Method to clear session history
  static clearSession(sessionid: string): void {
    this.sessions.delete(sessionid)
  }

  // Method to get session history
  static getSessionHistory(sessionid: string): string[] {
    return this.sessions.get(sessionid) || []
  }

  static async imageqa(imageFile: File, question: string, params: AIFTChatParams = {}): Promise<string> {
    let tempFile: string | null = null
    let fs: any = null
    
    try {
      console.log('Calling AIFT standalone imageqa with:', { question, filename: imageFile.name, params })
      
      // Convert image file to base64
      const arrayBuffer = await imageFile.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')
      
      // Call Python script file
      const { spawn } = await import('child_process')
      const path = await import('path')
      fs = await import('fs')
      
      // Path to the Python script
      const pythonScriptPath = path.default.join(process.cwd(), 'python', 'aift_image.py')
      
      // Create temporary file for image data
      const tempDir = path.default.join(process.cwd(), 'temp')
      if (!fs.default.existsSync(tempDir)) {
        fs.default.mkdirSync(tempDir, { recursive: true })
      }
      
      tempFile = path.default.join(tempDir, `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`)
      fs.default.writeFileSync(tempFile, base64Data)
      
      // Call Python script with image data file path
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        tempFile,
        question,
        params.sessionid || 'default-session',
        params.context || '',
        (params.temperature || 0.2).toString(),
        (params.return_json || false).toString()
      ])
      
      // Get response from Python
      let response = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        response += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      // Wait for Python process to complete
      await new Promise<string>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(response.trim())
          } else {
            reject(new Error(`Python process failed with code ${code}: ${error}`))
          }
        })
      })
      
      console.log('AIFT standalone imageqa response:', { content: response })
      
      // Clean up temporary file
      try {
        fs.default.unlinkSync(tempFile)
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError)
      }
      
      if (params.return_json) {
        return JSON.stringify({
          question,
          filename: imageFile.name,
          content: response,
          temperature: params.temperature || 0.4,
          execution_time: '0.05'
        })
      } else {
        return response
      }
      
    } catch (error) {
      // Clean up temporary file on error
      try {
        if (tempFile && fs.default.existsSync(tempFile)) {
          fs.default.unlinkSync(tempFile)
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file on error:', cleanupError)
      }
      
      console.error('AIFT standalone imageqa error:', error)
      logError(error, 'AIFT standalone imageqa failed')
      throw new Error('AIFT standalone image service temporarily unavailable')
    }
  }

  static async pdfqa(pdfFile: File, question: string, params: AIFTChatParams = {}): Promise<string> {
    let tempFile: string | null = null
    let fs: any = null
    
    try {
      console.log('Calling AIFT standalone pdfqa with:', { question, filename: pdfFile.name, params })
      
      // Convert PDF file to base64
      const arrayBuffer = await pdfFile.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')
      
      // Call Python script file
      const { spawn } = await import('child_process')
      const path = await import('path')
      fs = await import('fs')
      
      // Path to the Python script
      const pythonScriptPath = path.default.join(process.cwd(), 'python', 'aift_pdf.py')
      
      // Create temporary file for PDF data
      const tempDir = path.default.join(process.cwd(), 'temp')
      if (!fs.default.existsSync(tempDir)) {
        fs.default.mkdirSync(tempDir, { recursive: true })
      }
      
      tempFile = path.default.join(tempDir, `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`)
      fs.default.writeFileSync(tempFile, base64Data)
      
      // Call Python script with PDF data file path
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        tempFile,
        question,
        params.sessionid || 'default-session',
        params.context || '',
        (params.temperature || 0.2).toString(),
        (params.return_json || false).toString()
      ])
      
      // Get response from Python
      let response = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        response += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      // Wait for Python process to complete
      await new Promise<string>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(response.trim())
          } else {
            reject(new Error(`Python process failed with code ${code}: ${error}`))
          }
        })
      })
      
      console.log('AIFT standalone pdfqa response:', { content: response })
      
      // Clean up temporary file
      try {
        fs.default.unlinkSync(tempFile)
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError)
      }
      
      if (params.return_json) {
        return JSON.stringify({
          question,
          filename: pdfFile.name,
          content: response,
          temperature: params.temperature || 0.4,
          execution_time: '0.05'
        })
      } else {
        return response
      }
      
    } catch (error) {
      // Clean up temporary file on error
      try {
        if (tempFile && fs.default.existsSync(tempFile)) {
          fs.default.unlinkSync(tempFile)
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file on error:', cleanupError)
      }
      
      console.error('AIFT standalone pdfqa error:', error)
      logError(error, 'AIFT standalone pdfqa failed')
      throw new Error('AIFT standalone PDF service temporarily unavailable')
    }
  }

  static async voiceqa(audioFile: File, question: string, params: AIFTChatParams = {}): Promise<string> {
    let tempFile: string | null = null
    let fs: any = null
    
    try {
      console.log('Calling AIFT standalone voiceqa with:', { question, filename: audioFile.name, params })
      
      // Convert audio file to base64
      const arrayBuffer = await audioFile.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')
      
      // Call Python script file
      const { spawn } = await import('child_process')
      const path = await import('path')
      fs = await import('fs')
      
      // Path to the Python script
      const pythonScriptPath = path.default.join(process.cwd(), 'python', 'aift_voice.py')
      
      // Create temporary file for audio data
      const tempDir = path.default.join(process.cwd(), 'temp')
      if (!fs.default.existsSync(tempDir)) {
        fs.default.mkdirSync(tempDir, { recursive: true })
      }
      
      tempFile = path.default.join(tempDir, `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`)
      fs.default.writeFileSync(tempFile, base64Data)
      
      // Call Python script with audio data file path
      const pythonProcess = spawn('python', [
        pythonScriptPath,
        tempFile,
        question,
        params.sessionid || 'default-session',
        params.context || '',
        (params.temperature || 0.2).toString(),
        (params.return_json || false).toString()
      ])
      
      // Get response from Python
      let response = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        response += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      // Wait for Python process to complete
      await new Promise<string>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(response.trim())
          } else {
            reject(new Error(`Python process failed with code ${code}: ${error}`))
          }
        })
      })
      
      console.log('AIFT standalone voiceqa response:', { content: response })
      
      // Clean up temporary file
      try {
        fs.default.unlinkSync(tempFile)
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError)
      }
      
      if (params.return_json) {
        return JSON.stringify({
          question,
          filename: audioFile.name,
          content: response,
          temperature: params.temperature || 0.4,
          execution_time: '0.05'
        })
      } else {
        return response
      }
      
    } catch (error) {
      // Clean up temporary file on error
      try {
        if (tempFile && fs.default.existsSync(tempFile)) {
          fs.default.unlinkSync(tempFile)
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file on error:', cleanupError)
      }
      
      console.error('AIFT standalone voiceqa error:', error)
      logError(error, 'AIFT standalone voiceqa failed')
      throw new Error('AIFT standalone voice service temporarily unavailable')
    }
  }
} 