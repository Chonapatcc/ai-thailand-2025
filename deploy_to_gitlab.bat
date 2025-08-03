@echo off
REM AI Thailand 2025 - GitLab Deployment Script for Windows

echo 🚀 Starting GitLab Deployment for AI Thailand 2025

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
)

REM Add all files
echo 📦 Adding files to Git...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if errorlevel 1 (
    echo 💾 Committing changes...
    git commit -m "Update AI Thailand 2025 with enhanced Python scripts and GitLab deployment"
) else (
    echo ℹ️  No changes to commit.
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Please add your GitLab repository as remote origin:
    echo    git remote add origin https://gitlab.com/YOUR_USERNAME/ai-thailand-2025.git
    echo.
    echo 📝 Replace YOUR_USERNAME with your GitLab username
    echo 📝 Replace ai-thailand-2025 with your repository name
    echo.
    echo After adding the remote, run this script again.
    pause
    exit /b 1
)

REM Push to GitLab
echo ⬆️  Pushing to GitLab...
git branch -M main
git push -u origin main

echo.
echo ✅ Deployment completed!
echo 🌐 Your repository should now be available on GitLab
echo.
echo 📋 Next steps:
echo    1. Visit your GitLab repository
echo    2. Check that all files are uploaded correctly
echo    3. Verify the README.md displays properly
echo    4. Set up CI/CD if needed
echo.
echo 🎉 AI Thailand 2025 is now on GitLab!
pause 