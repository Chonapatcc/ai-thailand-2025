# AIFT Python Scripts

This directory contains Python scripts for AIFT functionality that can be called from the TypeScript application.

## Files

### `aift_textqa.py`
- **Purpose**: Handles AIFT textqa functionality
- **Usage**: Called from TypeScript for question-answering
- **Parameters**:
  - `question`: The question to ask
  - `sessionid`: Session ID (optional, default: 'default-session')
  - `context`: Context information (optional, default: '')
  - `temperature`: Temperature for response generation (optional, default: 0.2)
  - `return_json`: Whether to return JSON format (optional, default: False)

### `aift_chat.py`
- **Purpose**: Handles AIFT chat functionality
- **Usage**: Called from TypeScript for chat conversations
- **Parameters**:
  - `message`: The chat message
  - `sessionid`: Session ID (optional, default: 'default-session')
  - `context`: Context information (optional, default: '')
  - `temperature`: Temperature for response generation (optional, default: 0.2)
  - `return_json`: Whether to return JSON format (optional, default: False)

### `aift_image.py`
- **Purpose**: Handles AIFT image analysis functionality
- **Usage**: Called from TypeScript for image processing and visual question answering
- **Parameters**:
  - `image_data`: Base64 encoded image data
  - `question`: The question about the image
  - `sessionid`: Session ID (optional, default: 'default-session')
  - `context`: Context information (optional, default: '')
  - `temperature`: Temperature for response generation (optional, default: 0.2)
  - `return_json`: Whether to return JSON format (optional, default: False)

### `aift_voice.py`
- **Purpose**: Handles AIFT audio/voice analysis functionality
- **Usage**: Called from TypeScript for audio processing and transcription
- **Parameters**:
  - `audio_data`: Base64 encoded audio data
  - `question`: The question about the audio
  - `sessionid`: Session ID (optional, default: 'default-session')
  - `context`: Context information (optional, default: '')
  - `temperature`: Temperature for response generation (optional, default: 0.2)
  - `return_json`: Whether to return JSON format (optional, default: False)

## API Key Configuration

Both scripts use the API key: `Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8`

## Dependencies

- `aift.multimodal.textqa`
- `aift.setting`

## Usage Examples

### Direct Python Usage

```bash
# TextQA
python python/aift_textqa.py "ซื้อขนมไป 20 เหลือเงินเท่าไหร่" "YOUR_SESSION" "มีเงิน 100 บาท" 0.2 false

# Chat
python python/aift_chat.py "สวัสดีครับ" "YOUR_SESSION" "" 0.2 false

# Image Analysis (requires base64 image data)
python python/aift_image.py "base64_image_data" "What do you see in this image?" "YOUR_SESSION" "" 0.2 false

# Voice Analysis (requires base64 audio data)
python python/aift_voice.py "base64_audio_data" "What is being said in this audio?" "YOUR_SESSION" "" 0.2 false
```

### From TypeScript

```typescript
// TextQA
const response = await AIFTStandalone.textqa('ซื้อขนมไป 20 เหลือเงินเท่าไหร่', {
  sessionid: 'YOUR_SESSION',
  context: 'มีเงิน 100 บาท',
  temperature: 0.2,
  return_json: false
})

// Chat
const response = await AIFTStandalone.chat('สวัสดีครับ', {
  sessionid: 'YOUR_SESSION',
  temperature: 0.2,
  return_json: false
})

// Image Analysis
const imageResponse = await AIFTStandalone.imageqa(imageFile, 'What do you see in this image?', {
  sessionid: 'YOUR_SESSION',
  temperature: 0.3,
  return_json: false
})

// Voice Analysis
const voiceResponse = await AIFTStandalone.voiceqa(audioFile, 'What is being said in this audio?', {
  sessionid: 'YOUR_SESSION',
  temperature: 0.3,
  return_json: false
})

## Benefits of Separate Scripts

1. **Maintainability**: Easy to modify Python code without touching TypeScript
2. **Debugging**: Can test Python scripts independently
3. **Reusability**: Scripts can be used by other applications
4. **Version Control**: Python code is properly tracked in Git
5. **Performance**: No need to generate Python code dynamically
6. **Clean Code**: Separation of concerns between TypeScript and Python

## Error Handling

Both scripts include proper error handling:
- Parameter validation
- Exception catching
- Clear error messages
- Proper exit codes 