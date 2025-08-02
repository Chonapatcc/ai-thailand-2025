# AI Thailand 2025 - Research Assistant

A research assistant application with separated frontend and backend architecture.

## Project Structure

```
ai-thailand-2025/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Frontend utilities and API client
│   ├── hooks/        # Custom React hooks
│   ├── public/       # Static assets
│   └── styles/       # Global styles
├── backend/          # Express.js backend API
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── config/   # Backend configuration
│   │   ├── utils/    # Backend utilities
│   │   └── server.ts # Main server file
│   └── package.json  # Backend dependencies
└── API_INTEGRATION.md # API documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/chat` - Chat with the AI assistant
- `POST /api/compare` - Compare research papers
- `POST /api/gaps` - Identify research gaps
- `POST /api/suggest` - Suggest future research directions
- `POST /api/summarize` - Summarize research papers
- `GET /health` - Health check endpoint

## Features

- **Chat Interface**: Interactive chat with AI assistant
- **Paper Analysis**: Upload and analyze research papers
- **Comparison Tools**: Compare methodologies across papers
- **Gap Analysis**: Identify research gaps and opportunities
- **Future Work Suggestions**: Get recommendations for future research
- **Summarization**: Generate comprehensive paper summaries

## Technology Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- React Hook Form

### Backend
- Express.js
- TypeScript
- Multer (file uploads)
- CORS
- Helmet (security)

## Development

### Running Both Services

You can run both services simultaneously using separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
pnpm dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
pnpm dev
```

### Building for Production

**Backend:**
```bash
cd backend
pnpm build
pnpm start
```

**Frontend:**
```bash
cd frontend
pnpm build
pnpm start
```

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS
- `OPENROUTER_API_KEY`: OpenRouter API key

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License. 