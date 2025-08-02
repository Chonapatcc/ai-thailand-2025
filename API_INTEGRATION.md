# API Integration Guide

This document explains how the chat application now sends real API calls instead of using mock responses.

## Overview

The chat application has been updated to make real API calls to backend services. The implementation includes:

1. **API Service Layer** (`lib/api.ts`) - Handles all API communication
2. **Next.js API Routes** - Local API endpoints for testing
3. **Fallback System** - Graceful degradation when API calls fail

## API Endpoints

The application uses local Next.js API routes that integrate with OpenRouter for AI responses.

### Local API Routes
- **Chat**: `/api/chat` - General chat responses
- **Summarize**: `/api/summarize` - Summarize key findings
- **Compare**: `/api/compare` - Compare methodologies
- **Gaps**: `/api/gaps` - Identify research gaps
- **Suggest**: `/api/suggest` - Suggest future work

### Request Format
Each endpoint accepts specific data:
```json
{
  "message": "user message",
  "context": ["paper1", "paper2"],
  "history": [...]
}
```

### Available Endpoints
- **Chat**: General chat responses
- **Summarize**: Summarize key findings
- **Compare**: Compare methodologies
- **Gaps**: Identify research gaps
- **Suggest**: Suggest future work

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
# For local development (default)
NEXT_PUBLIC_API_URL=/api

# For external API service
# NEXT_PUBLIC_API_URL=https://your-api-service.com/api

# OpenRouter API Key (configured in API routes)
# The API key is currently hardcoded in the API routes
# For production, move to environment variables
```

## Local API Routes with OpenRouter

The application uses local Next.js API routes that integrate directly with OpenRouter for AI responses. This provides:

1. **Direct Integration**: API routes call OpenRouter directly
2. **Specialized Endpoints**: Each endpoint has tailored prompts
3. **Error Handling**: Graceful fallback to mock responses
4. **Development Friendly**: Easy to test and debug locally

### API Route Structure
- Each endpoint is a separate Next.js API route
- All routes use the same OpenRouter configuration
- Specialized system prompts for each function
- Consistent error handling and fallback mechanisms

## OpenRouter Integration

The application is now integrated with OpenRouter using the Qwen model. This provides:

1. **High-Quality AI Responses**: Using the qwen/qwen3-235b-a22b:free model
2. **Cost-Effective**: Free tier available through OpenRouter
3. **Reliable Service**: OpenRouter's infrastructure ensures uptime
4. **Specialized Prompts**: Each endpoint has tailored system prompts

### Current Configuration

- **Model**: `qwen/qwen3-235b-a22b:free`
- **API Key**: Centralized in `lib/config.ts`
- **Endpoints**: All API routes use OpenRouter
- **Fallback**: Mock responses if API fails
- **Configuration**: Single source of truth in `lib/config.ts`

### API Route Implementation

```typescript
// Example from app/api/chat/route.ts
import { OPENROUTER_CONFIG, getAuthHeader } from '@/lib/config'

const response = await fetch(OPENROUTER_CONFIG.URL, {
  method: 'POST',
  headers: {
    ...OPENROUTER_CONFIG.HEADERS,
    ...getAuthHeader()
  },
  body: JSON.stringify({
    model: OPENROUTER_CONFIG.MODEL,
    messages: messages,
    max_tokens: OPENROUTER_CONFIG.DEFAULT_MAX_TOKENS,
    temperature: OPENROUTER_CONFIG.DEFAULT_TEMPERATURE,
    stream: false
  })
})
```

### Specialized System Prompts

Each endpoint uses tailored system prompts:

- **Chat**: General research assistant with context awareness
- **Summarize**: Specialized in paper summarization
- **Compare**: Focused on methodology comparison
- **Gaps**: Expert in identifying research gaps
- **Suggest**: Specialized in future work suggestions

## Integration with Other AI Services

To integrate with other AI services, you can modify the API routes:

## Error Handling

The application includes robust error handling:

1. **API Failures**: Falls back to mock responses
2. **Network Issues**: Graceful degradation
3. **Rate Limiting**: Automatic retry logic (can be implemented)
4. **Authentication**: Proper error messages for auth failures

## Testing

### Local Development
1. Start the development server: `npm run dev`
2. The API routes are automatically available at `/api/*`
3. Test the chat functionality in the browser

### External API Testing
1. Set up your external API service
2. Update `NEXT_PUBLIC_API_URL` in `.env.local`
3. Test the integration

## Performance Considerations

1. **Caching**: Implement response caching for repeated queries
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Streaming**: Consider streaming responses for better UX
4. **Optimization**: Implement request batching for multiple papers

## Security

1. **API Keys**: Store sensitive keys server-side
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Prevent abuse
4. **CORS**: Configure CORS properly for external APIs

## Monitoring

Consider implementing:
1. **Logging**: Track API usage and errors
2. **Metrics**: Monitor response times and success rates
3. **Alerts**: Set up alerts for API failures
4. **Analytics**: Track user interactions

## Next Steps

1. **Choose an AI Service**: Select OpenAI, Anthropic, or another provider
2. **Implement Authentication**: Add proper auth if needed
3. **Add Streaming**: Implement streaming responses
4. **Optimize Performance**: Add caching and optimization
5. **Add Monitoring**: Implement logging and metrics 