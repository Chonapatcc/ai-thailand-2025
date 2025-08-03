# 🚀 Production Deployment Guide

## ✅ **Current Status: READY FOR DEPLOYMENT**

Your application is now production-ready with the following improvements:

### **🔧 What's Been Fixed for Production:**

1. **Environment Variables** - API keys and configs now use environment variables
2. **Docker Support** - Containerized deployment ready
3. **Vercel Configuration** - Cloud deployment optimized
4. **Security Headers** - Production security measures
5. **Error Handling** - Robust error handling for production
6. **Rate Limiting** - API protection against abuse
7. **Health Checks** - System monitoring endpoints

## 🎯 **Deployment Options**

### **Option 1: Vercel (Recommended - Easiest)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# OPENROUTER_API_KEY=your_api_key
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Option 2: Docker Deployment**

```bash
# Build and run with Docker
docker build -t ai-thailand-2025 .
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key ai-thailand-2025

# Or use Docker Compose
docker-compose up -d
```

### **Option 3: Traditional Server**

```bash
# On your server
git clone your-repo
cd ai-thailand-2025
npm install
npm run build
npm start

# Set environment variables
export OPENROUTER_API_KEY=your_api_key
export NODE_ENV=production
```

### **Option 4: Railway/Heroku**

```bash
# Railway
railway login
railway init
railway up

# Heroku
heroku create your-app-name
git push heroku main
```

## 🔐 **Environment Variables Setup**

Create a `.env.local` file (for local development) or set in your deployment platform:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here
NODE_ENV=production

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=qwen/qwen3-235b-a22b:free
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
CORS_ORIGIN=*
```

## 📋 **Pre-Deployment Checklist**

- [ ] **API Key**: Get your OpenRouter API key
- [ ] **Environment Variables**: Set all required env vars
- [ ] **File Storage**: Ensure uploads directory is writable
- [ ] **Domain**: Configure your domain (if using custom domain)
- [ ] **SSL**: Enable HTTPS (automatic on most platforms)
- [ ] **Monitoring**: Set up health checks

## 🧪 **Testing Your Deployment**

1. **Health Check**: Visit `/api/health` to verify system status
2. **File Upload**: Test PDF upload functionality
3. **AI Chat**: Test chat with AI assistant
4. **Search**: Test file search functionality
5. **All Features**: Test summarize, compare, gaps analysis

## 🔧 **Production Optimizations**

### **Performance:**
- ✅ Next.js optimizations enabled
- ✅ Image optimization configured
- ✅ Compression enabled
- ✅ Security headers added

### **Security:**
- ✅ Rate limiting implemented
- ✅ Input validation added
- ✅ Error handling improved
- ✅ CORS configured
- ✅ Security headers set

### **Monitoring:**
- ✅ Health check endpoint
- ✅ Error logging
- ✅ Request logging
- ✅ Performance monitoring

## 🚨 **Important Notes**

### **File Storage:**
- **Local Development**: Files stored in `./uploads/`
- **Production**: Consider using cloud storage (AWS S3, Google Cloud Storage)
- **Docker**: Files persist in volume mount

### **API Limits:**
- **Rate Limiting**: 100 requests/minute per IP
- **File Size**: 50MB maximum
- **Upload Limits**: 10 uploads/minute per IP

### **Scaling Considerations:**
- **Memory**: ~512MB RAM recommended
- **CPU**: 1 vCPU minimum
- **Storage**: 1GB+ for file uploads
- **Database**: Consider external database for large scale

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **API Key Error**: Check `OPENROUTER_API_KEY` environment variable
2. **File Upload Fails**: Ensure uploads directory is writable
3. **500 Errors**: Check server logs for detailed error messages
4. **Rate Limiting**: Implement proper rate limiting for production
5. **Memory Issues**: Increase server memory allocation

### **Debug Commands:**

```bash
# Check application status
curl http://localhost:3000/api/health

# Check environment variables
echo $OPENROUTER_API_KEY

# Check logs
docker logs your-container-name

# Test API endpoints
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## 🎉 **Success!**

Your application is now production-ready and can be deployed to any platform. The improvements include:

- ✅ **Environment-based configuration**
- ✅ **Docker containerization**
- ✅ **Cloud deployment support**
- ✅ **Security hardening**
- ✅ **Performance optimizations**
- ✅ **Monitoring and health checks**
- ✅ **Comprehensive error handling**

Choose your preferred deployment method and follow the steps above! 