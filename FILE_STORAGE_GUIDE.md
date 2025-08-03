# 📁 File Storage & Management Guide

## 🗂️ **File Storage Locations**

### **1. Uploaded PDF Files**
**Location**: `uploads/` directory in project root

**Structure**:
```
uploads/
├── metadata.json          # File metadata and information
├── [file_id]_[filename]   # Actual PDF files
└── [archives]            # Generated ZIP files (if any)
```

**Example**:
```
uploads/
├── metadata.json
├── abc123_research_paper.pdf
├── def456_quantum_study.pdf
└── research_papers_2025-08-02.zip
```

### **2. File Metadata Storage**
**File**: `uploads/metadata.json`

**Content Structure**:
```json
[
  {
    "id": "abc123",
    "filename": "abc123_research_paper.pdf",
    "originalName": "research_paper.pdf",
    "size": 1024000,
    "uploadDate": "2025-08-02T10:30:00.000Z",
    "content": "Extracted text from PDF...",
    "tags": ["ai", "machine learning", "research"],
    "summary": "AI-generated summary of the paper..."
  }
]
```

## 🔧 **File Management System**

### **1. File Storage Class**
**Location**: `lib/storage.ts`

**Key Methods**:
- `saveFile()` - Save uploaded PDF with metadata
- `getAllFiles()` - Retrieve all stored files
- `searchFiles()` - Search files by content/tags
- `deleteFile()` - Remove file and metadata
- `createArchive()` - Generate ZIP archives

### **2. API Endpoints**

#### **Upload Files**
- **Endpoint**: `/api/files/upload`
- **Method**: `POST`
- **Function**: Upload PDF, extract text, generate summary

#### **List Files**
- **Endpoint**: `/api/files/list`
- **Method**: `GET`
- **Function**: Get all uploaded files

#### **Search Files**
- **Endpoint**: `/api/files/search?q=query`
- **Method**: `GET`
- **Function**: Search files by content/tags

#### **Download Archive**
- **Endpoint**: `/api/files/download`
- **Method**: `POST`
- **Function**: Download multiple files as ZIP

## 📊 **File Information Tracking**

### **1. What Gets Stored**

#### **File Metadata**:
- ✅ **ID**: Unique identifier for each file
- ✅ **Filename**: Original uploaded filename
- ✅ **Size**: File size in bytes
- ✅ **Upload Date**: When file was uploaded
- ✅ **Content**: Extracted text from PDF
- ✅ **Tags**: Auto-extracted research terms
- ✅ **Summary**: AI-generated summary

#### **Auto-Extracted Tags**:
- Research terms: `ai`, `machine learning`, `deep learning`
- Technical terms: `algorithm`, `model`, `dataset`
- Academic terms: `research`, `paper`, `study`

### **2. File Processing Pipeline**

```
1. File Upload → 2. PDF Text Extraction → 3. AI Summary → 4. Tag Extraction → 5. Storage
```

#### **Step 1: File Upload**
- User uploads PDF file
- File validation (PDF only, size limits)
- File stored in `uploads/` directory

#### **Step 2: Text Extraction**
- Uses `pdf-parse` library with fallback
- Extracts readable text from PDF
- Handles corrupted or image-only PDFs

#### **Step 3: AI Summary**
- Sends content to OpenRouter API
- Generates concise summary
- Stores summary with file metadata

#### **Step 4: Tag Extraction**
- Analyzes filename and content
- Extracts research-related terms
- Creates searchable tags

#### **Step 5: Storage**
- Saves file to `uploads/` directory
- Updates `metadata.json` with file info
- Links file with metadata

## 🔍 **File Discovery & Search**

### **1. Search Capabilities**

#### **Search Fields**:
- ✅ **Filename**: Search by original filename
- ✅ **Content**: Search within PDF text content
- ✅ **Tags**: Search by extracted research terms
- ✅ **Summary**: Search within AI-generated summaries

#### **Search Examples**:
```javascript
// Search by filename
GET /api/files/search?q=quantum

// Search by content
GET /api/files/search?q=machine learning

// Search by tags
GET /api/files/search?q=ai algorithm
```

### **2. Dashboard Integration**

#### **File Display**:
- Shows all uploaded files
- Displays filename, size, upload date
- Shows extracted tags and summaries
- File selection for bulk download

#### **Bulk Operations**:
- Select multiple files
- Download as ZIP archive
- File management interface

## 📥 **Download System**

### **1. Individual File Download**
- Files stored in `uploads/` directory
- Accessible via file system
- Original filenames preserved

### **2. Bulk Archive Download**
- Select multiple files in dashboard
- Generate ZIP archive on-demand
- Download with timestamped filename

**Example**: `research_papers_2025-08-02.zip`

## 🛡️ **Security & Privacy**

### **1. File Validation**
- ✅ **Type Check**: Only PDF files allowed
- ✅ **Size Limits**: Configurable file size limits
- ✅ **Content Validation**: Ensures meaningful text extraction

### **2. Error Handling**
- ✅ **Upload Errors**: Graceful handling of upload failures
- ✅ **Processing Errors**: Fallback for PDF extraction issues
- ✅ **Storage Errors**: Proper error logging and recovery

## 🔧 **Configuration**

### **1. Storage Settings**
**File**: `lib/storage.ts`

```typescript
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const METADATA_FILE = path.join(UPLOAD_DIR, 'metadata.json')
```

### **2. File Limits**
- **File Size**: Configurable in upload handler
- **File Types**: PDF only
- **Storage Location**: Local `uploads/` directory

## 📋 **File Management Commands**

### **1. Check File Storage**
```bash
# List all uploaded files
ls uploads/

# Check metadata
cat uploads/metadata.json

# Check file sizes
du -h uploads/
```

### **2. Backup Files**
```bash
# Backup uploads directory
cp -r uploads/ uploads_backup/

# Backup metadata only
cp uploads/metadata.json metadata_backup.json
```

### **3. Clean Up**
```bash
# Remove specific file
rm uploads/[filename]

# Clear all files (keep metadata)
rm uploads/*.pdf

# Reset completely
rm -rf uploads/
mkdir uploads/
echo "[]" > uploads/metadata.json
```

## 🎯 **Key Features**

### **1. Automatic Organization**
- ✅ **Unique IDs**: Each file gets unique identifier
- ✅ **Metadata Tracking**: Complete file information stored
- ✅ **Search Index**: Full-text search capabilities
- ✅ **Tag System**: Auto-extracted research tags

### **2. AI Integration**
- ✅ **Text Extraction**: Robust PDF text extraction
- ✅ **AI Summaries**: OpenRouter-powered summaries
- ✅ **Smart Tagging**: Research term extraction
- ✅ **Content Analysis**: Full document analysis

### **3. User Experience**
- ✅ **Dashboard Display**: Real-time file listing
- ✅ **Search Interface**: Easy file discovery
- ✅ **Bulk Operations**: Multi-file management
- ✅ **Download System**: Individual and bulk downloads

## 🚀 **Current Status**

- ✅ **File Storage**: Complete local file storage system
- ✅ **Metadata Management**: Full file information tracking
- ✅ **Search System**: Multi-field search capabilities
- ✅ **AI Processing**: Text extraction and summarization
- ✅ **User Interface**: Dashboard and search integration
- ✅ **Download System**: Individual and bulk download
- ✅ **Error Handling**: Robust error management

## 📝 **Notes**

1. **Local Storage**: Files are stored locally in `uploads/` directory
2. **No Database**: Uses JSON file for metadata (simple and effective)
3. **File Persistence**: Files remain until manually deleted
4. **Backup Recommended**: Regular backups of `uploads/` directory
5. **Production Ready**: System is ready for production use

The file management system provides complete PDF storage, processing, and retrieval capabilities! 🎊 