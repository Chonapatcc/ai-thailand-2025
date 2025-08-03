# File Processing System

This directory contains Python scripts for processing various file types (PDF, images, audio) and integrating with the AIFT system for AI analysis.

## Overview

The file processing system consists of several components:

1. **File Processor** (`file_processor.py`) - Handles file conversion and preprocessing
2. **Upload Handler** (`upload_handler.py`) - Manages file uploads and routing
3. **AIFT Integrated** (`aift_integrated.py`) - Combines file processing with AI analysis
4. **Individual AIFT Scripts** - Direct AIFT integration for specific file types

## Features

### 📄 PDF Processing
- Extract text from PDF files
- Save original and processed files to backend/frontend directories
- Generate comprehensive text content for AI analysis

### 🖼️ Image Processing
- Preprocess images for better AI analysis
- Enhance contrast, sharpness, and reduce noise
- Resize large images to optimal size
- Save original and processed versions

### 🎵 Audio Processing
- Preprocess audio files for speech recognition
- Normalize audio levels and reduce noise
- Resample to 16kHz for better compatibility
- Save original and processed versions

### 💬 Text Processing
- Handle direct text input
- Save text files to organized directories
- Prepare text for AI analysis

## Directory Structure

```
uploads/
├── backend/
│   ├── pdf/          # Original PDF files
│   ├── images/       # Original and processed images
│   ├── audio/        # Original and processed audio files
│   └── text/         # Extracted text files
└── frontend/
    ├── pdf/          # PDF files for frontend access
    ├── images/       # Images for frontend access
    ├── audio/        # Audio files for frontend access
    └── text/         # Text files for frontend access
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure the AIFT package is installed:
```bash
pip install aift
```

## Usage

### File Processor

Process individual files:

```bash
# Process PDF
python file_processor.py --type pdf --input data.txt --filename document.pdf

# Process image
python file_processor.py --type image --input data.txt --filename image.jpg

# Process audio
python file_processor.py --type audio --input data.txt --filename audio.wav
```

### Upload Handler

Handle file uploads:

```bash
python upload_handler.py <file_type> <filename> <base64_data>
```

### AIFT Integrated

Process files with AI analysis:

```bash
# Analyze PDF
python aift_integrated.py pdf data.txt "What is this document about?"

# Analyze image
python aift_integrated.py image data.txt "What do you see in this image?"

# Analyze audio
python aift_integrated.py audio data.txt "What is being said?"

# Chat
python aift_integrated.py chat data.txt "Hello, how are you?"
```

## API Integration

The system integrates with the TypeScript backend through the `AIFTStandalone` class:

```typescript
// PDF analysis
const result = await AIFTStandalone.pdfqa(pdfFile, question, params);

// Image analysis
const result = await AIFTStandalone.imageqa(imageFile, question, params);

// Audio analysis
const result = await AIFTStandalone.voiceqa(audioFile, question, params);

// Text chat
const result = await AIFTStandalone.chat(message, params);
```

## File Types Supported

### PDF Files
- **Input**: PDF files (base64 encoded)
- **Output**: Extracted text + original PDF
- **Processing**: Text extraction using PyPDF2

### Image Files
- **Supported formats**: JPEG, PNG, GIF, WebP
- **Processing**: Enhancement, resizing, noise reduction
- **Output**: Original + processed images

### Audio Files
- **Supported formats**: WAV, MP3, OGG, WebM, M4A
- **Processing**: Normalization, noise reduction, resampling
- **Output**: Original + processed audio

### Text Files
- **Input**: Plain text or base64 encoded text
- **Output**: Saved text files
- **Processing**: Direct text handling

## Error Handling

All scripts include comprehensive error handling:

- File format validation
- Processing error recovery
- Temporary file cleanup
- Detailed error messages

## Testing

Run the comprehensive test suite:

```bash
python test_file_processing.py
```

This will test:
- File processor functionality
- Upload handler
- AIFT integration
- Error handling

## Dependencies

### Required Packages
- `aift` - AIFT package for AI analysis
- `PyPDF2` - PDF text extraction
- `Pillow` - Image processing
- `opencv-python` - Advanced image processing
- `librosa` - Audio processing
- `soundfile` - Audio file I/O
- `numpy` - Numerical operations

### Optional Packages
- `pathlib2` - Enhanced path handling

## Configuration

### API Key
The AIFT API key is configured in the scripts:
```python
setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
```

### Directory Structure
Files are automatically organized into backend and frontend directories:
- **Backend**: For server-side processing and storage
- **Frontend**: For client-side access and display

## Performance Considerations

- Large files are automatically resized/compressed
- Temporary files are cleaned up after processing
- Processing is optimized for AI analysis
- Memory usage is managed for large files

## Security

- File type validation
- Size limits enforced
- Temporary file cleanup
- Secure file handling

## Troubleshooting

### Common Issues

1. **Missing dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **File permission errors**
   - Ensure write permissions for upload directories
   - Check temp directory permissions

3. **Memory issues with large files**
   - Files are automatically resized
   - Processing is optimized for memory efficiency

4. **AIFT API errors**
   - Check API key configuration
   - Verify network connectivity
   - Check API rate limits

### Debug Mode

Enable debug output by setting environment variables:
```bash
export DEBUG=1
python file_processor.py --type pdf --input data.txt --filename test.pdf
```

## Contributing

When adding new file types or processing methods:

1. Update `file_processor.py` with new processing logic
2. Add corresponding test cases
3. Update documentation
4. Test with various file formats and sizes

## License

This file processing system is part of the AI Thailand 2025 project. 