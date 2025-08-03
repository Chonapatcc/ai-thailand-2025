@echo off
setlocal enabledelayedexpansion

echo 🚀 AI Thailand 2025 - Docker Deployment Script
echo ================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your OpenRouter API key:
    echo    OPENROUTER_API_KEY=your_api_key_here
    echo.
    pause
)

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set %%a=%%b
)

REM Check if API key is set
if "%OPENROUTER_API_KEY%"=="" (
    echo ❌ Please set your OPENROUTER_API_KEY in the .env file
    pause
    exit /b 1
)

if "%OPENROUTER_API_KEY%"=="your_openrouter_api_key_here" (
    echo ❌ Please set your OPENROUTER_API_KEY in the .env file
    pause
    exit /b 1
)

echo 🔧 Building Docker image...
docker build -t ai-thailand-2025 .

echo 🧹 Cleaning up old containers...
docker stop ai-thailand-2025 2>nul
docker rm ai-thailand-2025 2>nul

echo 🚀 Starting container...
docker run -d ^
  --name ai-thailand-2025 ^
  -p 3000:3000 ^
  -e OPENROUTER_API_KEY="%OPENROUTER_API_KEY%" ^
  -e NODE_ENV=production ^
  -e PORT=3000 ^
  -v "%cd%/uploads:/app/uploads" ^
  --restart unless-stopped ^
  ai-thailand-2025

echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

echo 🧪 Testing application...
curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Application failed to start. Check logs:
    docker logs ai-thailand-2025
    pause
    exit /b 1
) else (
    echo ✅ Application is running successfully!
    echo.
    echo 🌐 Access your application at:
    echo    http://localhost:3000
    echo.
    echo 📊 Health check:
    echo    http://localhost:3000/api/health
    echo.
    echo 📋 Available endpoints:
    echo    - POST /api/chat - Chat with AI
    echo    - POST /api/files/upload - Upload files
    echo    - GET /api/files/search - Search files
    echo    - POST /api/summarize - Summarize papers
    echo    - POST /api/compare - Compare papers
    echo    - And 11 more endpoints...
    echo.
    echo 🔍 View logs:
    echo    docker logs ai-thailand-2025
    echo.
    echo 🛑 Stop application:
    echo    docker stop ai-thailand-2025
)

pause 