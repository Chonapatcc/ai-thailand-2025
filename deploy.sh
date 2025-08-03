#!/bin/bash

# AI Thailand 2025 - Docker Deployment Script
# This script helps you deploy the application using Docker

set -e

echo "🚀 AI Thailand 2025 - Docker Deployment Script"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your OpenRouter API key:"
    echo "   OPENROUTER_API_KEY=your_api_key_here"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Load environment variables
source .env

# Check if API key is set
if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "your_openrouter_api_key_here" ]; then
    echo "❌ Please set your OPENROUTER_API_KEY in the .env file"
    exit 1
fi

echo "🔧 Building Docker image..."
docker build -t ai-thailand-2025 .

echo "🧹 Cleaning up old containers..."
docker stop ai-thailand-2025 2>/dev/null || true
docker rm ai-thailand-2025 2>/dev/null || true

echo "🚀 Starting container..."
docker run -d \
  --name ai-thailand-2025 \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -v "$(pwd)/uploads:/app/uploads" \
  --restart unless-stopped \
  ai-thailand-2025

echo "⏳ Waiting for application to start..."
sleep 10

echo "🧪 Testing application..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo ""
    echo "🌐 Access your application at:"
    echo "   http://localhost:3000"
    echo ""
    echo "📊 Health check:"
    echo "   http://localhost:3000/api/health"
    echo ""
    echo "📋 Available endpoints:"
    echo "   - POST /api/chat - Chat with AI"
    echo "   - POST /api/files/upload - Upload files"
    echo "   - GET /api/files/search - Search files"
    echo "   - POST /api/summarize - Summarize papers"
    echo "   - POST /api/compare - Compare papers"
    echo "   - And 11 more endpoints..."
    echo ""
    echo "🔍 View logs:"
    echo "   docker logs ai-thailand-2025"
    echo ""
    echo "🛑 Stop application:"
    echo "   docker stop ai-thailand-2025"
else
    echo "❌ Application failed to start. Check logs:"
    docker logs ai-thailand-2025
    exit 1
fi 