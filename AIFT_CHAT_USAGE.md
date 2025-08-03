# 🚀 AIFT Chat Usage Guide

## 📋 **API Endpoints Overview**

Your application now supports **AIFT AI** with chat functionality and session management:

### **Text Processing** 📝
- **Text QA**: Basic question answering
- **Chat**: Conversational AI with session management
- **Context-aware**: Maintains conversation context across sessions

### **Voice Processing** 🎤
- **Audio QA**: Audio file processing with session support
- **Voice Upload**: Process voice files with context

### **Vision Processing** 👁️
- **Visual QA**: Image analysis with session support
- **Image Upload**: Process images with context

## 🔧 **API Usage Examples**

### **1. Basic Text QA**

```bash
# Using curl
curl -X POST http://localhost:3000/api/aift/text \
  -H "Content-Type: application/json" \
  -d '{
    "question": "คุณคือใคร",
    "return_json": false,
    "apiKey": "your_aift_api_key"
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
    apiKey: 'your_aift_api_key'
  })
});

const data = await response.json();
console.log(data.answer);
```

### **2. Chat with Session Management**

```bash
# First message with context
curl -X POST http://localhost:3000/api/aift/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ตอนนี้มีเงินเท่าไหร่",
    "sessionid": "user123",
    "context": "ขณะนี้มีเงิน 100 บาท",
    "temperature": 0.2,
    "return_json": false,
    "apiKey": "your_aift_api_key"
  }'
```

```bash
# Follow-up message in same session
curl -X POST http://localhost:3000/api/aift/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ซื้อขนมไป 20 เหลือเงินเท่าไหร่",
    "sessionid": "user123",
    "context": "ขณะนี้มีเงิน 100 บาท",
    "temperature": 0.2,
    "return_json": false,
    "apiKey": "your_aift_api_key"
  }'
```

```javascript
// Using fetch with session management
const chatResponse = await fetch('/api/aift/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'ตอนนี้มีเงินเท่าไหร่',
    sessionid: 'user123',
    context: 'ขณะนี้มีเงิน 100 บาท',
    temperature: 0.2,
    return_json: false,
    apiKey: 'your_aift_api_key'
  })
});

const chatData = await chatResponse.json();
console.log(chatData.answer);
```

### **3. Audio QA with Session**

```bash
# Using curl with file upload and session
curl -X POST http://localhost:3000/api/aift/audio \
  -F "audio=@/path/to/your/audio_file.mp3" \
  -F "question=แปลข้อความ" \
  -F "sessionid=user123" \
  -F "context=This is a conversation about money" \
  -F "temperature=0.2" \
  -F "apiKey=your_aift_api_key"
```

```javascript
// Using fetch with FormData and session
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('question', 'แปลข้อความ');
formData.append('sessionid', 'user123');
formData.append('context', 'This is a conversation about money');
formData.append('temperature', '0.2');
formData.append('apiKey', 'your_aift_api_key');

const response = await fetch('/api/aift/audio', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.answer);
```

### **4. Visual QA with Session**

```bash
# Using curl with image upload and session
curl -X POST http://localhost:3000/api/aift/visual \
  -F "image=@/path/to/your/image_file/car-demo.png" \
  -F "question=รูปนี้คืออะไร" \
  -F "sessionid=user123" \
  -F "context=This is a conversation about cars" \
  -F "temperature=0.2" \
  -F "apiKey=your_aift_api_key"
```

```javascript
// Using fetch with FormData and session
const formData = new FormData();
formData.append('image', imageFile);
formData.append('question', 'รูปนี้คืออะไร');
formData.append('sessionid', 'user123');
formData.append('context', 'This is a conversation about cars');
formData.append('temperature', '0.2');
formData.append('apiKey', 'your_aift_api_key');

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
  "message": "Original message",
  "sessionid": "user123",
  "context": "Conversation context",
  "temperature": 0.2,
  "return_json": false,
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
AIFT_API_KEY=your_aift_api_key_here

# Optional (with defaults)
AIFT_BASE_URL=https://api.aift.ai
AIFT_TEXT_MODEL=default
AIFT_VOICE_MODEL=default
AIFT_VISION_MODEL=default
AIFT_MAX_TOKENS=1000
AIFT_TEMPERATURE=0.7
```

### **Session Management**
- **sessionid**: Unique identifier for conversation sessions
- **context**: Initial context for the conversation
- **temperature**: Controls response randomness (0.0-1.0)
- **return_json**: Whether to return JSON format or plain text

## 🧪 **Testing Examples**

### **Test Chat Session**
```bash
# Set context and start conversation
curl -X POST http://localhost:3000/api/aift/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ตอนนี้มีเงินเท่าไหร่",
    "sessionid": "test-session",
    "context": "ขณะนี้มีเงิน 100 บาท",
    "temperature": 0.2,
    "apiKey": "Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8"
  }'
```

### **Test Text QA**
```bash
# Basic question answering
curl -X POST http://localhost:3000/api/aift/text \
  -H "Content-Type: application/json" \
  -d '{
    "question": "คุณคือใคร",
    "return_json": false,
    "apiKey": "Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8"
  }'
```

## 🚨 **Troubleshooting**

### **Session Management**
- Use unique `sessionid` for each user/conversation
- Maintain `context` across messages in same session
- Reset session by using new `sessionid`

### **Temperature Settings**
- **0.0-0.3**: More deterministic, consistent responses
- **0.4-0.7**: Balanced creativity and consistency
- **0.8-1.0**: More creative, varied responses

### **Context Usage**
- Provide relevant context for better responses
- Update context as conversation progresses
- Use context for maintaining conversation state

## 🎯 **Best Practices**

### **Session Management**
```javascript
// Start a new conversation
const startConversation = async (userId, initialContext) => {
  const response = await fetch('/api/aift/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello',
      sessionid: userId,
      context: initialContext,
      temperature: 0.2,
      apiKey: 'your_key'
    })
  });
  return response.json();
};

// Continue conversation
const continueConversation = async (userId, message, context) => {
  const response = await fetch('/api/aift/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionid: userId,
      context,
      temperature: 0.2,
      apiKey: 'your_key'
    })
  });
  return response.json();
};
```

### **Error Handling**
```javascript
try {
  const response = await fetch('/api/aift/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello',
      sessionid: 'user123',
      context: 'Initial context',
      temperature: 0.2,
      apiKey: 'your_key'
    })
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

## 🎉 **Ready to Use!**

Your AIFT integration now supports:
- ✅ **Chat functionality** with session management
- ✅ **Context-aware conversations** across messages
- ✅ **Text QA** for basic questions
- ✅ **Audio QA** with session support
- ✅ **Visual QA** with session support
- ✅ **Temperature control** for response creativity
- ✅ **JSON/Text response** options
- ✅ **Error handling** and validation

**Start testing with the examples above!** 🚀 