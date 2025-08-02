# Setup Guide for AI Thailand 2025

This guide will help you set up the separated frontend and backend architecture.

## Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

**Backend (.env file in backend directory):**
```
PORT=3001
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=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
```

**Frontend (.env.local file in frontend directory):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Development Servers

**Option 1: Run both simultaneously (recommended)**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Project Structure

```
ai-thailand-2025/
├── frontend/          # Next.js frontend
│   ├── app/          # Pages and components
│   ├── components/   # UI components
│   ├── lib/          # Utilities and API client
│   └── package.json  # Frontend dependencies
├── backend/          # Express.js backend
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── utils/    # Backend utilities
│   │   └── server.ts # Main server
│   └── package.json  # Backend dependencies
└── package.json      # Root workspace config
```

## API Endpoints

- `POST /api/chat` - Chat with AI assistant
- `POST /api/compare` - Compare research papers
- `POST /api/gaps` - Identify research gaps
- `POST /api/suggest` - Suggest future work
- `POST /api/summarize` - Summarize papers
- `GET /health` - Health check

## Development Workflow

1. **Backend Development**: Edit files in `backend/src/`
2. **Frontend Development**: Edit files in `frontend/app/` and `frontend/components/`
3. **API Integration**: Frontend calls backend via `frontend/lib/api.ts`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 3001 (backend) are available
2. **CORS errors**: Check that `FRONTEND_URL` in backend `.env` matches frontend URL
3. **API connection**: Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Reset Everything

```bash
# Clean all dependencies and build files
npm run clean

# Reinstall everything
npm run install:all
```

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Next Steps

1. Test the API endpoints using the health check: `http://localhost:3001/health`
2. Open the frontend: `http://localhost:3000`
3. Try uploading a PDF and chatting with the AI assistant
4. Explore the different analysis features (compare, gaps, suggest, summarize) 