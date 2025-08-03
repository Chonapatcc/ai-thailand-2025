# Python Integration Implementation

## Problem
You wanted to modify the `textqa` function to send text to a Python function and return the response using the AIFT Python library.

## Solution
Modified the standalone function to call Python AIFT functions using child process execution.

### Changes Made:

1. **Updated `lib/aift-standalone.ts`**:
   - **Added Python integration**: Calls Python AIFT functions via child process
   - **Dynamic Python script generation**: Creates temporary Python scripts
   - **Parameter passing**: Passes all parameters to Python function
   - **Response handling**: Captures Python output and returns it

2. **Python Function Integration**:
   - **textqa() method**: Calls `textqa.chat()` from Python AIFT library
   - **chat() method**: Also calls `textqa.chat()` for chat functionality
   - **API key configuration**: Uses your provided API key (`Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8`)
   - **Error handling**: Proper error handling for Python process failures

### Key Features:

- **✅ Python AIFT Integration**: Uses real AIFT Python library
- **✅ API Key Support**: Uses your provided API key
- **✅ Parameter Passing**: Passes all parameters to Python
- **✅ Error Handling**: Proper error handling for Python failures
- **✅ Session Management**: Maintains session context
- **✅ JSON Support**: Supports return_json parameter

### Implementation Details:

```typescript
// Call Python function with the text
const { spawn } = require('child_process')

// Prepare Python script with the parameters
const pythonScript = `
import sys
from aift.multimodal import textqa
from aift import setting

# Set API key
setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')

# Get parameters from command line arguments
question = sys.argv[1]
sessionid = sys.argv[2] if len(sys.argv) > 2 else 'default-session'
context = sys.argv[3] if len(sys.argv) > 3 else ''
temperature = float(sys.argv[4]) if len(sys.argv) > 4 else 0.2
return_json = sys.argv[5].lower() == 'true' if len(sys.argv) > 5 else False

try:
    # Call the Python textqa function
    result = textqa.chat(question, sessionid=sessionid, context=context, temperature=temperature, return_json=return_json)
    print(result)
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
`
```

### Python Function Used:

```python
from aift.multimodal import textqa
from aift import setting

# Set API key
setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')

# Call the Python textqa function
result = textqa.chat(question, sessionid=sessionid, context=context, temperature=temperature, return_json=return_json)
return result
```

### Benefits:

- **Real AIFT Integration**: Uses actual AIFT Python library
- **API Key Support**: Uses your provided API key
- **Full Parameter Support**: Passes all parameters to Python
- **Error Handling**: Proper error handling for Python failures
- **Session Management**: Maintains conversation context
- **Flexible**: Supports both textqa and chat methods

### Example Usage:

```javascript
// Your specific example now calls Python AIFT function
const response = await AIFTStandalone.textqa('ซื้อขนมไป 20 เหลือเงินเท่าไหร่', {
  sessionid: 'YOUR_SESSION',
  context: 'มีเงิน 100 บาท',
  temperature: 0.2,
  return_json: false
})
// Returns: Real AIFT Python response
```

### API Key Configuration:

The function uses your API key:
- **API Key**: `Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8`
- **Python Library**: `aift.multimodal.textqa`
- **Function**: `textqa.chat()`

### Testing:
Run the test script: `node test-standalone.js`

### Files Modified:
- `lib/aift-standalone.ts` - Main standalone function with Python integration
- `test-standalone.js` - Updated test script for Python integration

### Key Differences:
- **Before**: Just logged user text without API calls
- **After**: Calls real Python AIFT functions
- **Before**: No external AI processing
- **After**: Uses actual AIFT Python library
- **Before**: No API key usage
- **After**: Uses your API key for real AI processing

The standalone function now calls real Python AIFT functions using your API key, providing genuine AI responses through the AIFT Python library. 