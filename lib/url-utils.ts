export async function downloadPDFFromURL(url: string): Promise<{ content: string; filename: string }> {
  try {
    console.log('Downloading PDF from URL:', url)
    
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided')
    }
    
    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }
    
    console.log('Normalized URL:', normalizedUrl)
    
    // Handle arXiv URLs - convert to PDF URL
    if (normalizedUrl.includes('arxiv.org/abs/')) {
      const arxivId = normalizedUrl.split('arxiv.org/abs/')[1]
      if (arxivId) {
        normalizedUrl = `https://arxiv.org/pdf/${arxivId}.pdf`
        console.log('Converted arXiv URL to PDF:', normalizedUrl)
      }
    }
    
    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch (e) {
      throw new Error('Invalid URL format. Please provide a valid URL.')
    }
    
    // Fetch the PDF content with proper headers and timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let response
    try {
      response = await fetch(normalizedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/octet-stream,text/html,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        signal: controller.signal
      })
    } catch (fetchError: unknown) {
      console.error('Fetch error:', fetchError)
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Download timeout: The request took too long. Please try again or check the URL.')
        } else if (fetchError instanceof TypeError) {
          throw new Error('Network error: Unable to connect to the URL. Please check the URL and try again.')
        } else {
          throw new Error(`Network error: ${fetchError.message}`)
        }
      } else {
        throw new Error('Network error: Unknown error occurred')
      }
    }
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorMessage = response.status === 404 
        ? 'File not found (404). Please check if the URL is correct.'
        : response.status === 403
        ? 'Access denied (403). The file may be protected or require authentication.'
        : response.status === 500
        ? 'Server error (500). The server is experiencing issues.'
        : `HTTP ${response.status}: ${response.statusText}`
      
      throw new Error(errorMessage)
    }
    
    // Check content type but be more lenient
    const contentType = response.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    // Get the filename from the URL or response headers
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'downloaded_paper.pdf'
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    } else {
      // Extract filename from URL
      try {
        const urlObj = new URL(normalizedUrl)
        const pathname = urlObj.pathname
        const lastPart = pathname.split('/').pop()
        if (lastPart && (lastPart.toLowerCase().endsWith('.pdf') || lastPart.toLowerCase().includes('pdf'))) {
          filename = lastPart
        }
      } catch (e) {
        console.warn('Could not parse URL for filename extraction')
      }
    }
    
    console.log('Extracted filename:', filename)
    
    // Convert response to array buffer
    let arrayBuffer
    try {
      arrayBuffer = await response.arrayBuffer()
    } catch (bufferError) {
      throw new Error('Failed to read file content. The file may be corrupted or too large.')
    }
    
    const uint8Array = new Uint8Array(arrayBuffer)
    
    console.log('Downloaded file size:', uint8Array.length, 'bytes')
    
    if (uint8Array.length === 0) {
      throw new Error('Downloaded file is empty. Please check the URL.')
    }
    
    // Check PDF header (should start with %PDF)
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4))
    console.log('File header:', pdfHeader)
    
    if (!pdfHeader.startsWith('%PDF')) {
      console.warn('File may not be a valid PDF. Header:', pdfHeader)
      // Continue anyway as some servers don't serve proper PDF headers
    }
    
    // Extract text content (improved version)
    let text = ''
    let printableCount = 0
    
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i]
      if (byte >= 32 && byte <= 126) {
        text += String.fromCharCode(byte)
        printableCount++
      } else if (byte === 9 || byte === 10 || byte === 13) { // tab, newline, carriage return
        text += String.fromCharCode(byte)
        printableCount++
      }
    }
    
    console.log('Extracted printable characters:', printableCount)
    
    // Clean up the extracted text
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
    
    if (cleanedText.length < 50) {
      throw new Error('Could not extract meaningful text from PDF. The file might be corrupted, contain only images, or not be a PDF.')
    }
    
    // Limit text length to prevent excessive processing
    const maxLength = 10000 // 10k characters max
    const limitedText = cleanedText.length > maxLength
      ? cleanedText.substring(0, maxLength) + '... [Content truncated for processing]'
      : cleanedText
    
    console.log('PDF downloaded successfully. Text length:', limitedText.length)
    
    return {
      content: limitedText,
      filename: filename
    }
    
  } catch (error) {
    console.error('Error downloading PDF from URL:', error)
    
    // Re-throw the error with the specific message
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Failed to download PDF: Unknown error occurred')
    }
  }
} 