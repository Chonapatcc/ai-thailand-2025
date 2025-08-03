# 🚀 GitLab Docker Deployment Guide

## 📊 **Total Endpoints in This Project: 16 API Endpoints**

### **🔍 Complete API Endpoints List:**

#### **📁 File Management (5 endpoints):**
1. `POST /api/files/upload` - Upload PDF files
2. `GET /api/files/list` - List all uploaded files
3. `GET /api/files/search` - Search files by content
4. `POST /api/files/download` - Download/archive files
5. `POST /api/files/process` - Process uploaded files

#### **🤖 AI Analysis (5 endpoints):**
6. `POST /api/chat` - Chat with AI assistant
7. `POST /api/summarize` - Summarize research papers
8. `POST /api/compare` - Compare research papers
9. `POST /api/gaps` - Identify research gaps
10. `POST /api/suggest` - Suggest future research directions

#### **🔬 Research Tools (3 endpoints):**
11. `GET /api/research-progress` - Track research progress
12. `GET /api/tech-discoveries` - Get technology discoveries
13. `GET /api/test-similarity` - Test document similarity

#### **🧪 Testing & Development (2 endpoints):**
14. `GET /api/test-quantum` - Quantum computing tests
15. `GET /api/test-similarity` - Similarity testing

#### **🏥 System & Monitoring (1 endpoint):**
16. `GET /api/health` - System health check

## 🎯 **GitLab Deployment Steps**

### **Step 1: Prepare Your GitLab Repository**

```bash
# Clone your repository (if not already done)
git clone https://gitlab.com/your-username/ai-thailand-2025.git
cd ai-thailand-2025

# Add all deployment files
git add .
git commit -m "Add GitLab CI/CD configuration"
git push origin main
```

### **Step 2: Configure GitLab Variables**

Go to your GitLab project → **Settings** → **CI/CD** → **Variables** and add:

#### **Required Variables:**
```
OPENROUTER_API_KEY = your_openrouter_api_key_here
SSH_PRIVATE_KEY = your_ssh_private_key_for_server_access
STAGING_HOST = your_staging_server_ip
STAGING_USER = your_staging_server_username
PRODUCTION_HOST = your_production_server_ip
PRODUCTION_USER = your_production_server_username
PRODUCTION_URL = https://your-production-domain.com
```

#### **Optional Variables:**
```
NODE_ENV = production
PORT = 3000
UPLOAD_DIR = ./uploads
MAX_FILE_SIZE = 52428800
CORS_ORIGIN = *
```

### **Step 3: Prepare Your Server**

#### **On Your Server (Ubuntu/Debian):**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Create uploads directory
sudo mkdir -p /var/ai-thailand-uploads
sudo chown $USER:$USER /var/ai-thailand-uploads

# Generate SSH key for GitLab
ssh-keygen -t rsa -b 4096 -C "gitlab-deployment"
# Copy the public key to your server's ~/.ssh/authorized_keys
```

### **Step 4: Configure GitLab Runner (Optional)**

If you want to use GitLab's shared runners, skip this step. Otherwise:

```bash
# On your server, install GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner

# Register the runner
sudo gitlab-runner register
# Follow the prompts and use your GitLab project token
```

### **Step 5: Deploy to Staging**

```bash
# Create a develop branch
git checkout -b develop
git push origin develop

# This will trigger automatic deployment to staging
# Check GitLab CI/CD pipeline for progress
```

### **Step 6: Deploy to Production**

```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Go to GitLab → CI/CD → Pipelines
# Click "Run Pipeline" on the main branch
# Manually trigger the "deploy_production" job
```

## 🔧 **Docker Commands for Manual Deployment**

### **Build and Run Locally:**
```bash
# Build the Docker image
docker build -t ai-thailand-2025 .

# Run the container
docker run -d --name ai-thailand-2025 \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY=your_api_key \
  -e NODE_ENV=production \
  -v /var/ai-thailand-uploads:/app/uploads \
  --restart unless-stopped \
  ai-thailand-2025
```

### **Using Docker Compose:**
```bash
# Create .env file with your variables
echo "OPENROUTER_API_KEY=your_api_key" > .env
echo "NODE_ENV=production" >> .env

# Run with docker-compose
docker-compose up -d
```

## 🧪 **Testing Your Deployment**

### **Health Check:**
```bash
curl http://your-server-ip:3000/api/health
```

### **Test API Endpoints:**
```bash
# Test file upload
curl -X POST http://your-server-ip:3000/api/files/upload \
  -F "file=@test.pdf" \
  -F "message=Test upload"

# Test chat
curl -X POST http://your-server-ip:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# Test file search
curl "http://your-server-ip:3000/api/files/search?q=test"
```

## 📋 **Environment Variables Reference**

### **Required for Production:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `NODE_ENV` - Set to "production"
- `PORT` - Application port (default: 3000)

### **Optional Configuration:**
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `UPLOAD_DIR` - File upload directory
- `MAX_FILE_SIZE` - Maximum file size in bytes
- `CORS_ORIGIN` - CORS origin setting

## 🚨 **Important Notes**

### **No Local Models Required:**
- ✅ **API-Only Architecture** - Uses OpenRouter API for AI
- ✅ **No ML Models** - No need to download or train models
- ✅ **Lightweight** - Only needs Node.js and Docker
- ✅ **Scalable** - Can handle multiple concurrent users

### **Server Requirements:**
- **CPU**: 1 vCPU minimum (2+ recommended)
- **RAM**: 512MB minimum (1GB+ recommended)
- **Storage**: 1GB+ for file uploads
- **Network**: Stable internet connection for API calls

### **Security Considerations:**
- ✅ **Environment Variables** - No hardcoded secrets
- ✅ **Rate Limiting** - API protection
- ✅ **Input Validation** - Security measures
- ✅ **Error Handling** - Robust error management

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Docker Build Fails:**
   ```bash
   # Check Dockerfile syntax
   docker build --no-cache -t ai-thailand-2025 .
   ```

2. **Container Won't Start:**
   ```bash
   # Check container logs
   docker logs ai-thailand-2025
   
   # Check environment variables
   docker exec ai-thailand-2025 env
   ```

3. **API Key Issues:**
   ```bash
   # Verify API key is set
   echo $OPENROUTER_API_KEY
   
   # Test API connectivity
   curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models
   ```

4. **File Upload Issues:**
   ```bash
   # Check uploads directory permissions
   ls -la /var/ai-thailand-uploads
   
   # Fix permissions if needed
   sudo chown -R $USER:$USER /var/ai-thailand-uploads
   ```

## 🎉 **Success!**

Your application is now ready for GitLab deployment with:

- ✅ **16 API endpoints** ready for production
- ✅ **Docker containerization** for easy deployment
- ✅ **GitLab CI/CD pipeline** for automated deployment
- ✅ **Environment-based configuration** for security
- ✅ **No local models required** - API-only architecture
- ✅ **Comprehensive testing** and monitoring

Follow the steps above to deploy your application to GitLab! 🚀 