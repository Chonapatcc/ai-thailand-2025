# 🚀 GitLab Quick Deployment Guide

## 📋 **Step 1: Push to GitLab**

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add GitLab CI/CD and Docker deployment"

# Push to GitLab
git push origin main
```

## ⚙️ **Step 2: Configure GitLab Variables**

Go to your GitLab project → **Settings** → **CI/CD** → **Variables** and add:

```
PATHUMMA_API_KEY = your_pathumma_api_key_here
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-gitlab-pages-url.gitlab.io/ai-thailand-2025
```

## 🔍 **Step 3: Find Your GitLab URL**

### **Your GitLab Project URL:**
```
https://gitlab.com/your-username/ai-thailand-2025
```

### **Your GitLab Pages URL (after deployment):**
```
https://your-username.gitlab.io/ai-thailand-2025
```

### **How to find your username:**
1. Go to GitLab.com
2. Click your profile picture
3. Your username is in the URL or profile

## 🧪 **Step 4: Test Your Deployment**

### **Check Pipeline Status:**
1. Go to your GitLab project
2. Click **CI/CD** → **Pipelines**
3. Look for green checkmarks ✅

### **Test Your App:**
```bash
# Health check
curl https://your-username.gitlab.io/ai-thailand-2025/api/health

# Test chat
curl -X POST https://your-username.gitlab.io/ai-thailand-2025/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## 📜 **Available Scripts**

### **deploy.bat (Windows)**
```bash
# Local deployment on Windows
deploy.bat
```

### **deploy.sh (Linux/Mac)**
```bash
# Local deployment on Linux/Mac
./deploy.sh
```

### **.gitlab-ci.yml (GitLab CI/CD)**
- Automatically runs when you push to GitLab
- Builds Docker image
- Deploys to GitLab Pages

## 🎯 **Quick Commands Summary**

```bash
# 1. Push to GitLab
git add .
git commit -m "Deploy to GitLab"
git push origin main

# 2. Check deployment status
# Go to GitLab → CI/CD → Pipelines

# 3. Test your app
# Visit: https://your-username.gitlab.io/ai-thailand-2025
```

## 🚨 **Troubleshooting**

### **If pipeline fails:**
1. Check GitLab → CI/CD → Pipelines
2. Click on failed pipeline
3. Check the error logs

### **If variables are missing:**
1. Go to Settings → CI/CD → Variables
2. Make sure all required variables are set

### **If app doesn't work:**
1. Check the health endpoint: `/api/health`
2. Verify your Pathumma API key is correct
3. Check the deployment logs in GitLab

## 🎉 **Success!**

After following these steps, your app will be available at:
```
https://your-username.gitlab.io/ai-thailand-2025
```

With all 19 API endpoints working! 🚀 