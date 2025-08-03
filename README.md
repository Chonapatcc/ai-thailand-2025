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