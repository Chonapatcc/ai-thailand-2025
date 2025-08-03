#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload Handler Script
Handles file uploads and integrates with file processor
"""

import os
import sys
import json
import base64
import tempfile
from pathlib import Path
from file_processor import FileProcessor

class UploadHandler:
    def __init__(self, upload_dir="uploads"):
        self.upload_dir = Path(upload_dir)
        self.processor = FileProcessor(upload_dir)
        
        # Create upload directories
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
    def handle_text_upload(self, text_content, filename):
        """Handle text upload"""
        try:
            # Generate output filename
            base_name = Path(filename).stem
            timestamp = int(os.path.getmtime(tempfile.mktemp()))
            
            # Save text to backend
            backend_text_path = self.processor.backend_dir / "text" / f"{base_name}_{timestamp}.txt"
            with open(backend_text_path, 'w', encoding='utf-8') as f:
                f.write(text_content)
            
            # Save text to frontend
            frontend_text_path = self.processor.frontend_dir / "text" / f"{base_name}_{timestamp}.txt"
            with open(frontend_text_path, 'w', encoding='utf-8') as f:
                f.write(text_content)
            
            return {
                "success": True,
                "text_content": text_content,
                "backend_text_path": str(backend_text_path),
                "frontend_text_path": str(frontend_text_path),
                "filename": filename
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def handle_pdf_upload(self, pdf_data, filename):
        """Handle PDF upload"""
        return self.processor.process_pdf(pdf_data, filename)
    
    def handle_image_upload(self, image_data, filename):
        """Handle image upload"""
        return self.processor.process_image(image_data, filename)
    
    def handle_audio_upload(self, audio_data, filename):
        """Handle audio upload"""
        return self.processor.process_audio(audio_data, filename)
    
    def handle_voice_upload(self, voice_data, filename):
        """Handle voice upload (same as audio)"""
        return self.processor.process_audio(voice_data, filename)
    
    def process_upload(self, file_data, filename, file_type):
        """Main upload processing function"""
        file_type = file_type.lower()
        
        if file_type in ['text', 'txt']:
            return self.handle_text_upload(file_data, filename)
        elif file_type in ['pdf', 'application/pdf']:
            return self.handle_pdf_upload(file_data, filename)
        elif file_type.startswith('image/'):
            return self.handle_image_upload(file_data, filename)
        elif file_type.startswith('audio/') or file_type in ['wav', 'mp3', 'm4a', 'ogg']:
            return self.handle_audio_upload(file_data, filename)
        else:
            return {
                "success": False,
                "error": f"Unsupported file type: {file_type}",
                "filename": filename
            }

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 4:
        print("Usage: python upload_handler.py <file_type> <filename> <base64_data>")
        sys.exit(1)
    
    file_type = sys.argv[1]
    filename = sys.argv[2]
    base64_data = sys.argv[3]
    
    # Initialize handler
    handler = UploadHandler()
    
    # Process upload
    result = handler.process_upload(base64_data, filename, file_type)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main() 