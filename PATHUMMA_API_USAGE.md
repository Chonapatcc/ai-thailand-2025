# 🚀 Pathumma API Usage Guide

## 📋 **API Endpoints Overview**

Your application now supports **Pathumma AI** with multi-model capabilities:

### **Text Processing** 📝
- **Text QA**: Thai and English question answering
- **Chat**: General conversation and research assistance
- **Summarization**: Document and paper summarization
- **Comparison**: Research paper comparison
- **Gap Analysis**: Research gap identification
- **Suggestions**: Research direction suggestions

### **Voice Processing** 🎤
- **Audio QA**: Audio file transcription and question answering
- **Voice Upload**: Process voice files with questions

### **Vision Processing** 👁️
- **Visual QA**: Image analysis and question answering
- **Image Upload**: Process images with questions

## 🔧 **API Usage Examples**

### **1. Text QA (Thai/English)**

```bash
# Using curl
curl -X POST http://localhost:3000/api/aift/text \
  -H "Content-Type: application/json" \
  -d '{
    "question": "คุณคือใคร",
    "return_json": false,
    "apiKey": "your_pathumma_api_key"
  }'
```

```javascript
// Using fetch
const response = await fetch('/api/aift/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'คุณคือใคร',
    return_json: false,
    apiKey: 'your_pathumma_api_key'
  })
});

const data = await response.json();
console.log(data.answer);
```

### **2. Audio QA**

```bash
# Using curl with file upload
curl -X POST http://localhost:3000/api/aift/audio \
  -F "audio=@/path/to/your/audio_file.mp3" \
  -F "question=แปลข้อความ" \
  -F "apiKey=your_pathumma_api_key"
```

```javascript
// Using fetch with FormData
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('question', 'แปลข้อความ');
formData.append('apiKey', 'your_pathumma_api_key');

const response = await fetch('/api/aift/audio', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.answer);
```

### **3. Visual QA**

```bash
# Using curl with image upload
curl -X POST http://localhost:3000/api/aift/visual \
  -F "image=@/path/to/your/image_file/car-demo.png" \
  -F "question=รูปนี้คืออะไร" \
  -F "apiKey=your_pathumma_api_key"
```

```javascript
// Using fetch with FormData
const formData = new FormData();
formData.append('image', imageFile);
formData.append('question', 'รูปนี้คืออะไร');
formData.append('apiKey', 'your_pathumma_api_key');

const response = await fetch('/api/aift/visual', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.answer);
```

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "answer": "AI generated response here",
  "question": "Original question",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "filename": "file_name.ext" // for file uploads
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🔧 **Configuration**

### **Environment Variables**
```env
# Required
PATHUMMA_API_KEY=your_pathumma_api_key_here

# Optional (with defaults)
PATHUMMA_BASE_URL=https://api.pathumma.ai
PATHUMMA_TEXT_MODEL=pathumma-text-v1
PATHUMMA_VOICE_MODEL=pathumma-voice-v1
PATHUMMA_VISION_MODEL=pathumma-vision-v1
```

### **File Upload Limits**
- **Audio**: 10MB max (MP3, WAV, OGG, M4A)
- **Image**: 5MB max (JPEG, PNG, GIF, WebP)
- **PDF**: 50MB max

## 🧪 **Testing**

### **Run API Tests**
```bash
# Start your server first
npm run dev

# Then run tests
npm run test:api
```

### **Manual Testing**
```bash
# Health check
curl http://localhost:3000/api/health

# Text QA test
curl -X POST http://localhost:3000/api/aift/text \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello, how are you?", "apiKey": "your_key"}'
```

## 🚨 **Troubleshooting**

### **503 Service Unavailable**
1. Check your `PATHUMMA_API_KEY` is correct
2. Verify the API key has sufficient credits
3. Check network connectivity to Pathumma API

### **File Upload Errors**
1. Check file size limits
2. Verify file format is supported
3. Ensure file is not corrupted

### **Rate Limiting**
- Default: 100 requests per minute
- Check response headers for rate limit info
- Implement exponential backoff for retries

## 🎯 **Best Practices**

### **Error Handling**
```javascript
try {
  const response = await fetch('/api/aift/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, apiKey })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    return;
  }

  const data = await response.json();
  console.log('Success:', data.answer);
} catch (error) {
  console.error('Network Error:', error);
}
```

### **File Upload**
```javascript
// Validate file before upload
function validateFile(file, maxSize, allowedTypes) {
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
}

// Usage
const audioFile = event.target.files[0];
validateFile(audioFile, 10 * 1024 * 1024, ['audio/mpeg', 'audio/mp3']);
```

## 🎉 **Ready to Use!**

Your Pathumma AI integration is now ready with:
- ✅ **Text QA** for Thai/English questions
- ✅ **Audio QA** for voice file processing
- ✅ **Visual QA** for image analysis
- ✅ **Error handling** and validation
- ✅ **Rate limiting** and security
- ✅ **File upload** support

**Start testing with the examples above!** 🚀 