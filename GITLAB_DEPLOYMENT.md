# GitLab Deployment Guide

## Overview
This guide will help you deploy your AI Thailand 2025 project to GitLab.

## Prerequisites

1. **GitLab Account**: Make sure you have a GitLab account
2. **Git Installed**: Ensure Git is installed on your system
3. **Project Ready**: All files are ready for deployment

## Step 1: Initialize Git Repository

```bash
# Initialize git repository (if not already done)
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: AI Thailand 2025 project with enhanced Python scripts"
```

## Step 2: Create GitLab Repository

1. **Go to GitLab**: Navigate to https://gitlab.com
2. **Sign In**: Log in to your GitLab account
3. **Create New Project**:
   - Click "New Project"
   - Choose "Create blank project"
   - Set project name: `ai-thailand-2025`
   - Set description: `AI Thailand 2025 - Enhanced Python Scripts with Pathumma APIs`
   - Choose visibility (Public or Private)
   - Click "Create project"

## Step 3: Connect Local Repository to GitLab

After creating the GitLab repository, you'll see instructions. Use these commands:

```bash
# Add GitLab remote (replace YOUR_USERNAME with your GitLab username)
git remote add origin https://gitlab.com/YOUR_USERNAME/ai-thailand-2025.git

# Push to GitLab
git branch -M main
git push -u origin main
```

## Step 4: Create .gitignore File

Create a `.gitignore` file to exclude unnecessary files:

```bash
# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.next/
out/
dist/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/

# Temporary files
temp/
*.tmp
*.temp

# Uploads (keep structure but ignore actual files)
uploads/backend/*/
uploads/frontend/*/
!uploads/backend/.gitkeep
!uploads/frontend/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
EOF
```

## Step 5: Create README.md

Create a comprehensive README file:

```bash
# Create README.md
cat > README.md << 'EOF'
# AI Thailand 2025

## Overview
AI Thailand 2025 is a comprehensive AI chat system with enhanced Python scripts that utilize Pathumma Vision API (VQA), Audio API (AudioQA), and Text API (TextQA).

## Features

### ✅ **Enhanced Python Scripts**
- **Image Analysis**: Uses `vqa.generate()` for Pathumma Vision API
- **Audio Analysis**: Uses `audioqa.generate()` for Pathumma Audio API
- **Text Analysis**: Uses `textqa.generate()` for Pathumma Text API

### ✅ **File Processing**
- **Image Preprocessing**: Resize, enhance, noise reduction
- **Audio Preprocessing**: Normalize, resample, noise reduction
- **PDF Processing**: Text extraction and analysis
- **Organized Storage**: Backend/frontend directory structure

### ✅ **Web Interface**
- **Chat Interface**: Real-time AI chat
- **File Upload**: Support for images, audio, PDFs
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

### **Frontend**
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

### **Backend**
- Next.js API Routes
- Python Scripts
- AIFT Multimodal APIs

### **AI Integration**
- Pathumma Vision API (VQA)
- Pathumma Audio API (AudioQA)
- Pathumma Text API (TextQA)

## Installation

### **Prerequisites**
- Node.js 18+
- Python 3.8+
- Git

### **Setup**

1. **Clone Repository**
```bash
git clone https://gitlab.com/YOUR_USERNAME/ai-thailand-2025.git
cd ai-thailand-2025
```

2. **Install Node.js Dependencies**
```bash
npm install
```

3. **Install Python Dependencies**
```bash
cd python
pip install -r requirements.txt
python setup.py
cd ..
```

4. **Environment Setup**
```bash
cp env.example .env
# Edit .env with your API keys
```

5. **Start Development Server**
```bash
npm run dev
```

## Usage

### **Web Interface**
1. Navigate to `http://localhost:3000`
2. Go to `/chat` for AI chat interface
3. Upload files or send text messages

### **Command Line**

#### **Image Analysis**
```bash
python python/aift_image_enhanced.py image_data.txt "What is in this image?" session-id context temperature return_json
```

#### **Audio Analysis**
```bash
python python/aift_voice_enhanced.py audio_data.txt "What is in this audio?" session-id context temperature return_json
```

#### **Text Analysis**
```bash
python python/aift_textqa.py "Your question" session-id context temperature return_json
```

## Project Structure

```
ai-thailand-2025/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   └── ...
├── components/             # React components
├── lib/                    # Utility libraries
├── python/                 # Python scripts
│   ├── aift_image_enhanced.py
│   ├── aift_voice_enhanced.py
│   ├── aift_textqa.py
│   ├── file_processor.py
│   └── ...
├── uploads/                # File storage
│   ├── backend/           # Processed files
│   └── frontend/          # Frontend files
└── ...
```

## API Endpoints

### **Chat API**
- `POST /api/chat` - Text chat and file uploads

### **AIFT APIs**
- `POST /api/aift/image` - Image analysis
- `POST /api/aift/voice` - Audio analysis
- `POST /api/aift/text` - Text analysis

## Development

### **Running Tests**
```bash
# Python tests
python test_enhanced_scripts.py
python test_integrated_scripts.py
python test_web_integration.py

# Web tests
npm run test
```

### **Building for Production**
```bash
npm run build
npm start
```

## Deployment

### **Vercel Deployment**
1. Connect your GitLab repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### **Docker Deployment**
```bash
# Build Docker image
docker build -t ai-thailand-2025 .

# Run container
docker run -p 3000:3000 ai-thailand-2025
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a merge request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the GitLab repository.
EOF
```

## Step 6: Push to GitLab

```bash
# Add all files including new .gitignore and README.md
git add .

# Commit changes
git commit -m "Add .gitignore and comprehensive README.md"

# Push to GitLab
git push origin main
```

## Step 7: Verify Deployment

1. **Check GitLab Repository**: Visit your GitLab repository URL
2. **Verify Files**: Ensure all files are uploaded correctly
3. **Check README**: Verify the README.md displays properly

## Step 8: Optional - Set up CI/CD

Create a `.gitlab-ci.yml` file for automated testing:

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build

test:
  stage: test
  image: node:18
  script:
    - npm install
    - npm run test
  only:
    - main

build:
  stage: build
  image: node:18
  script:
    - npm install
    - npm run build
  only:
    - main
```

## Step 9: Environment Variables (if needed)

If you need to set up environment variables in GitLab:

1. Go to your GitLab repository
2. Navigate to Settings > CI/CD
3. Expand "Variables"
4. Add your environment variables (API keys, etc.)

## Success Checklist

- ✅ Git repository initialized
- ✅ GitLab repository created
- ✅ Files pushed to GitLab
- ✅ README.md created
- ✅ .gitignore configured
- ✅ Repository is accessible
- ✅ CI/CD configured (optional)

## Next Steps

1. **Share Repository**: Share the GitLab URL with your team
2. **Set up CI/CD**: Configure automated testing and deployment
3. **Monitor**: Keep track of issues and merge requests
4. **Update**: Regularly update documentation and code

Your AI Thailand 2025 project is now successfully deployed to GitLab! 🚀 