# 🚀 Quick Deployment Setup Guide

## �� **Step 1: Get Your Pathumma API Key**

1. Go to https://pathumma.ai/
2. Sign up/Login
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key

## 🔧 **Step 2: Configure Environment Variables**

### **For Local Testing:**
Create a `.env` file in your project root:

```env
# Required - Your Pathumma API Key
PATHUMMA_API_KEY=your_pathumma_api_key_here

# Application Mode
NODE_ENV=production

# Your Application URL (for local testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **For GitLab Deployment:**
In GitLab → Your Project → Settings → CI/CD → Variables, add:

```
PATHUMMA_API_KEY = your_pathumma_api_key_here
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-gitlab-pages-url.gitlab.io/ai-thailand-2025
```

### **For Server Deployment:**
```env
PATHUMMA_API_KEY=your_pathumma_api_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://your-server-ip:3000
```

## 🎯 **Step 3: Choose Your Deployment Method**

### **Option A: Quick Local Test (Windows)**
```bash
# Run the Windows deployment script
deploy.bat
```

### **Option B: GitLab Deployment**
```bash
# Push to GitLab
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Option C: Manual Docker**
```bash
# Build and run
docker build -t ai-thailand-2025 .
docker run -d --name ai-thailand-2025 \
  -p 3000:3000 \
  -e PATHUMMA_API_KEY=your_api_key \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  ai-thailand-2025
```

## 🧪 **Step 4: Test Your Deployment**

### **Health Check:**
```bash
curl http://localhost:3000/api/health
```

### **Test Chat:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## 📊 **What Each Variable Does:**

| Variable | What It Does | Example Value |
|----------|--------------|---------------|
| `PATHUMMA_API_KEY` | Connects to Pathumma AI service | `your_pathumma_key_here` |
| `NODE_ENV` | Sets production mode | `production` |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` |

## 🚨 **Important Notes:**

### **For Local Development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **For GitLab Pages:**
```env
NEXT_PUBLIC_APP_URL=https://your-username.gitlab.io/ai-thailand-2025
```

### **For Custom Domain:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **For Server IP:**
```env
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
```

## 🎉 **You're Ready!**

Once you've set these variables, your application will:
- ✅ Connect to Pathumma AI service (Text, Voice, Vision)
- ✅ Run in production mode
- ✅ Know its public URL
- ✅ Handle all 19 API endpoints

**Just replace the example values with your actual values!** 