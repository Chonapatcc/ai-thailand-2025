# Thai API Integration

## Problem
The API was throwing HTTP errors when the server response wasn't OK, and you wanted to use the AIFT standalone function for Thai responses.

## Solution
Modified the API to get raw text from the server and use the AIFT standalone function for Thai responses.

### Changes Made:

1. **Updated `lib/api.ts`**:
   - **Removed HTTP error checking**: No longer throws errors on non-OK responses
   - **Get raw text**: Uses `response.text()` instead of `response.json()`
   - **Thai detection**: Detects Thai text using Unicode range `/[\u0E00-\u0E7F]/`
   - **AIFT integration**: Uses `AIFTStandalone.textqa()` for Thai responses
   - **Fallback handling**: Returns raw text if JSON parsing fails

2. **Enhanced Response Handling**:
   - **Thai text**: Automatically uses AIFT standalone function
   - **Non-Thai text**: Tries to parse JSON, falls back to raw text
   - **Mixed text**: Detects Thai characters and uses AIFT function

### Key Features:

- **✅ Raw Text Processing**: Gets raw text from server without HTTP error checking
- **✅ Thai Detection**: Automatically detects Thai text using Unicode
- **✅ AIFT Integration**: Uses standalone function for Thai responses
- **✅ Fallback Support**: Handles both JSON and raw text responses
- **✅ Context Awareness**: Passes context to AIFT function

### Implementation Details:

```typescript
// Get raw text from server
const rawText = await response.text()

// Detect Thai text
const hasThaiText = /[\u0E00-\u0E7F]/.test(message)

// Use AIFT for Thai responses
if (hasThaiText) {
  const thaiResponse = await AIFTStandalone.textqa(message, {
    sessionid: 'api-chat',
    context: data.context ? data.context.join(', ') : '',
    temperature: 0.7,
    return_json: false
  })
  
  return {
    message: thaiResponse,
    success: true
  }
}
```

### Benefits:

- **No HTTP Errors**: Eliminates HTTP status error checking
- **Thai Support**: Automatic Thai language processing
- **Flexible Responses**: Handles both JSON and raw text
- **Context Aware**: Maintains conversation context
- **Reliable**: Fallback mechanisms for different response types

### Example Usage:

```javascript
// Thai question - uses AIFT standalone
const thaiResponse = await ChatAPI.sendMessage({
  message: 'ซื้อขนมไป 20 เหลือเงินเท่าไหร่',
  context: ['มีเงิน 100 บาท'],
  history: []
})

// English question - uses regular API
const englishResponse = await ChatAPI.sendMessage({
  message: 'Hello, how are you?',
  context: [],
  history: []
})
```

### Testing:
Run the test script: `node test-thai-api.js`

### Files Modified:
- `lib/api.ts` - Main API integration with Thai support
- `test-thai-api.js` - Test script for Thai API functionality

### Key Differences:
- **Before**: Threw HTTP errors on non-OK responses
- **After**: Gets raw text and processes it intelligently
- **Before**: No Thai language support
- **After**: Automatic Thai detection and AIFT integration
- **Before**: Only JSON responses
- **After**: Handles both JSON and raw text responses

The API now provides seamless Thai language support using the AIFT standalone function while maintaining compatibility with existing English functionality. 