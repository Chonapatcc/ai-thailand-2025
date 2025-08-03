#!/bin/bash

# AI Thailand 2025 - GitLab Deployment Script
echo "🚀 Starting GitLab Deployment for AI Thailand 2025"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit."
else
    echo "💾 Committing changes..."
    git commit -m "Update AI Thailand 2025 with enhanced Python scripts and GitLab deployment"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Please add your GitLab repository as remote origin:"
    echo "   git remote add origin https://gitlab.com/YOUR_USERNAME/ai-thailand-2025.git"
    echo ""
    echo "📝 Replace YOUR_USERNAME with your GitLab username"
    echo "📝 Replace ai-thailand-2025 with your repository name"
    echo ""
    echo "After adding the remote, run this script again."
    exit 1
fi

# Push to GitLab
echo "⬆️  Pushing to GitLab..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your repository should now be available on GitLab"
echo ""
echo "📋 Next steps:"
echo "   1. Visit your GitLab repository"
echo "   2. Check that all files are uploaded correctly"
echo "   3. Verify the README.md displays properly"
echo "   4. Set up CI/CD if needed"
echo ""
echo "🎉 AI Thailand 2025 is now on GitLab!" 