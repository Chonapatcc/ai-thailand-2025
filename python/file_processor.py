#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
File Processor Script
Handles PDF to text conversion, image preprocessing, and audio preprocessing
"""

import os
import sys
import base64
import tempfile
import json
import shutil
from pathlib import Path
import argparse

# PDF processing
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PyPDF2 not available. Install with: pip install PyPDF2")

# Image processing
try:
    from PIL import Image, ImageEnhance, ImageFilter
    import cv2
    import numpy as np
    IMAGE_AVAILABLE = True
except ImportError:
    IMAGE_AVAILABLE = False
    print("Warning: PIL/OpenCV not available. Install with: pip install Pillow opencv-python")

# Audio processing
try:
    import librosa
    import soundfile as sf
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    print("Warning: librosa/soundfile not available. Install with: pip install librosa soundfile")

class FileProcessor:
    def __init__(self, base_dir="uploads"):
        self.base_dir = Path(base_dir)
        self.backend_dir = self.base_dir / "backend"
        self.frontend_dir = self.base_dir / "frontend"
        
        # Create directories
        for dir_path in [self.backend_dir, self.frontend_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
            
        # Create subdirectories
        for subdir in ["pdf", "images", "audio", "text"]:
            (self.backend_dir / subdir).mkdir(exist_ok=True)
            (self.frontend_dir / subdir).mkdir(exist_ok=True)
    
    def process_pdf(self, pdf_data, filename, output_format="text"):
        """Convert PDF to text and save to appropriate directories"""
        try:
            # Decode base64 data
            pdf_bytes = base64.b64decode(pdf_data)
            
            # Create temporary PDF file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
                temp_pdf.write(pdf_bytes)
                temp_pdf_path = temp_pdf.name
            
            try:
                # Extract text from PDF
                text_content = self._extract_pdf_text(temp_pdf_path)
                
                # Generate output filename
                base_name = Path(filename).stem
                timestamp = int(os.path.getmtime(temp_pdf_path))
                
                # Save text to backend
                backend_text_path = self.backend_dir / "text" / f"{base_name}_{timestamp}.txt"
                with open(backend_text_path, 'w', encoding='utf-8') as f:
                    f.write(text_content)
                
                # Save text to frontend
                frontend_text_path = self.frontend_dir / "text" / f"{base_name}_{timestamp}.txt"
                with open(frontend_text_path, 'w', encoding='utf-8') as f:
                    f.write(text_content)
                
                # Save original PDF to backend
                backend_pdf_path = self.backend_dir / "pdf" / f"{base_name}_{timestamp}.pdf"
                with open(backend_pdf_path, 'wb') as f:
                    f.write(pdf_bytes)
                
                # Save original PDF to frontend
                frontend_pdf_path = self.frontend_dir / "pdf" / f"{base_name}_{timestamp}.pdf"
                with open(frontend_pdf_path, 'wb') as f:
                    f.write(pdf_bytes)
                
                return {
                    "success": True,
                    "text_content": text_content,
                    "backend_text_path": str(backend_text_path),
                    "frontend_text_path": str(frontend_text_path),
                    "backend_pdf_path": str(backend_pdf_path),
                    "frontend_pdf_path": str(frontend_pdf_path),
                    "filename": filename
                }
                
            finally:
                # Clean up temporary file
                os.unlink(temp_pdf_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def _extract_pdf_text(self, pdf_path):
        """Extract text from PDF file"""
        if not PDF_AVAILABLE:
            raise ImportError("PyPDF2 is required for PDF processing")
        
        text_content = ""
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text_content += page.extract_text() + "\n"
        
        return text_content.strip()
    
    def process_image(self, image_data, filename, output_format="processed"):
        """Preprocess image and save to appropriate directories"""
        try:
            # Decode base64 data
            image_bytes = base64.b64decode(image_data)
            
            # Create temporary image file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_image:
                temp_image.write(image_bytes)
                temp_image_path = temp_image.name
            
            try:
                # Process image
                processed_image = self._preprocess_image(temp_image_path)
                
                # Generate output filename
                base_name = Path(filename).stem
                timestamp = int(os.path.getmtime(temp_image_path))
                
                # Save original image to backend
                backend_orig_path = self.backend_dir / "images" / f"{base_name}_{timestamp}_original.jpg"
                with open(backend_orig_path, 'wb') as f:
                    f.write(image_bytes)
                
                # Save original image to frontend
                frontend_orig_path = self.frontend_dir / "images" / f"{base_name}_{timestamp}_original.jpg"
                with open(frontend_orig_path, 'wb') as f:
                    f.write(image_bytes)
                
                # Save processed image to backend
                backend_processed_path = self.backend_dir / "images" / f"{base_name}_{timestamp}_processed.jpg"
                processed_image.save(backend_processed_path, 'JPEG', quality=85)
                
                # Save processed image to frontend
                frontend_processed_path = self.frontend_dir / "images" / f"{base_name}_{timestamp}_processed.jpg"
                processed_image.save(frontend_processed_path, 'JPEG', quality=85)
                
                return {
                    "success": True,
                    "backend_orig_path": str(backend_orig_path),
                    "frontend_orig_path": str(frontend_orig_path),
                    "backend_processed_path": str(backend_processed_path),
                    "frontend_processed_path": str(frontend_processed_path),
                    "filename": filename
                }
                
            finally:
                # Clean up temporary file
                os.unlink(temp_image_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def _preprocess_image(self, image_path):
        """Preprocess image for better analysis"""
        if not IMAGE_AVAILABLE:
            raise ImportError("PIL/OpenCV is required for image processing")
        
        # Load image
        image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (max 1024x1024)
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.1)
        
        # Apply slight Gaussian blur to reduce noise
        image = image.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        return image
    
    def process_audio(self, audio_data, filename, output_format="processed"):
        """Preprocess audio and save to appropriate directories"""
        try:
            # Decode base64 data
            audio_bytes = base64.b64decode(audio_data)
            
            # Create temporary audio file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
                temp_audio.write(audio_bytes)
                temp_audio_path = temp_audio.name
            
            try:
                # Process audio
                processed_audio_path = self._preprocess_audio(temp_audio_path)
                
                # Generate output filename
                base_name = Path(filename).stem
                timestamp = int(os.path.getmtime(temp_audio_path))
                
                # Save original audio to backend
                backend_orig_path = self.backend_dir / "audio" / f"{base_name}_{timestamp}_original.wav"
                with open(backend_orig_path, 'wb') as f:
                    f.write(audio_bytes)
                
                # Save original audio to frontend
                frontend_orig_path = self.frontend_dir / "audio" / f"{base_name}_{timestamp}_original.wav"
                with open(frontend_orig_path, 'wb') as f:
                    f.write(audio_bytes)
                
                # Copy processed audio to backend
                backend_processed_path = self.backend_dir / "audio" / f"{base_name}_{timestamp}_processed.wav"
                shutil.copy2(processed_audio_path, backend_processed_path)
                
                # Copy processed audio to frontend
                frontend_processed_path = self.frontend_dir / "audio" / f"{base_name}_{timestamp}_processed.wav"
                shutil.copy2(processed_audio_path, frontend_processed_path)
                
                # Clean up temporary processed file
                os.unlink(processed_audio_path)
                
                return {
                    "success": True,
                    "backend_orig_path": str(backend_orig_path),
                    "frontend_orig_path": str(frontend_orig_path),
                    "backend_processed_path": str(backend_processed_path),
                    "frontend_processed_path": str(frontend_processed_path),
                    "filename": filename
                }
                
            finally:
                # Clean up temporary file
                os.unlink(temp_audio_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def _preprocess_audio(self, audio_path):
        """Preprocess audio for better analysis"""
        if not AUDIO_AVAILABLE:
            raise ImportError("librosa/soundfile is required for audio processing")
        
        # Load audio
        y, sr = librosa.load(audio_path, sr=None)
        
        # Normalize audio
        y = librosa.util.normalize(y)
        
        # Apply noise reduction (simple high-pass filter)
        y = librosa.effects.preemphasis(y)
        
        # Resample to 16kHz if necessary
        if sr != 16000:
            y = librosa.resample(y, orig_sr=sr, target_sr=16000)
            sr = 16000
        
        # Create temporary processed file
        processed_path = tempfile.mktemp(suffix='.wav')
        sf.write(processed_path, y, sr)
        
        return processed_path

def main():
    parser = argparse.ArgumentParser(description='Process files for AI analysis')
    parser.add_argument('--type', required=True, choices=['pdf', 'image', 'audio'], 
                       help='Type of file to process')
    parser.add_argument('--input', required=True, help='Input file path or base64 data')
    parser.add_argument('--filename', required=True, help='Original filename')
    parser.add_argument('--output-dir', default='uploads', help='Output directory')
    parser.add_argument('--format', default='text', choices=['text', 'processed'], 
                       help='Output format')
    
    args = parser.parse_args()
    
    # Initialize processor
    processor = FileProcessor(args.output_dir)
    
    # Read input data
    if os.path.exists(args.input):
        # Input is a file path
        with open(args.input, 'r') as f:
            data = f.read().strip()
    else:
        # Input is base64 data
        data = args.input
    
    # Process file based on type
    if args.type == 'pdf':
        result = processor.process_pdf(data, args.filename, args.format)
    elif args.type == 'image':
        result = processor.process_image(data, args.filename, args.format)
    elif args.type == 'audio':
        result = processor.process_audio(data, args.filename, args.format)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main() 