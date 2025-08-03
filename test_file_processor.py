#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for File Processor
"""

import sys
import os
import tempfile
import base64
from pathlib import Path

# Add python directory to path
sys.path.append('python')

try:
    from file_processor import FileProcessor
    print("✅ File processor imported successfully")
except ImportError as e:
    print(f"❌ Failed to import file processor: {e}")
    sys.exit(1)

def test_pdf_processing():
    """Test PDF processing with a simple text file"""
    print("\n🧪 Testing PDF processing...")
    
    try:
        # Create a simple test PDF-like content
        test_content = """
        This is a test document about artificial intelligence.
        
        Page 1:
        Artificial Intelligence (AI) is a branch of computer science that aims to create 
        intelligent machines that work and react like humans.
        
        Page 2:
        Machine learning is a subset of AI that enables computers to learn and improve 
        from experience without being explicitly programmed.
        """
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_content)
            test_file = f.name
        
        # Convert to base64
        with open(test_file, 'rb') as f:
            base64_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Create base64 data file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(base64_data)
            base64_file = f.name
        
        # Initialize processor
        processor = FileProcessor("test_processed_files")
        
        # Test PDF processing
        pdf_bytes = base64.b64decode(base64_data)
        result = processor.process_pdf(pdf_bytes, "test_document.pdf")
        
        # Clean up
        os.unlink(test_file)
        os.unlink(base64_file)
        
        if "error" in result:
            print(f"❌ PDF processing failed: {result['error']}")
        else:
            print("✅ PDF processing test passed")
            print(f"   - Extracted text length: {len(result.get('text_content', ''))}")
            print(f"   - Pages: {result.get('pages', 0)}")
            print(f"   - Text file: {result.get('text_file', 'N/A')}")
            
    except Exception as e:
        print(f"❌ PDF processing test error: {e}")

def test_image_processing():
    """Test image processing with a simple image"""
    print("\n🧪 Testing image processing...")
    
    try:
        # Create a simple test image (1x1 pixel)
        from PIL import Image
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_data = img_bytes.getvalue()
        
        # Convert to base64
        base64_data = base64.b64encode(img_data).decode('utf-8')
        
        # Create base64 data file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(base64_data)
            base64_file = f.name
        
        # Initialize processor
        processor = FileProcessor("test_processed_files")
        
        # Test image processing
        image_bytes = base64.b64decode(base64_data)
        result = processor.preprocess_image(image_bytes, "test_image.jpg")
        
        # Clean up
        os.unlink(base64_file)
        
        if "error" in result:
            print(f"❌ Image processing failed: {result['error']}")
        else:
            print("✅ Image processing test passed")
            print(f"   - Original size: {result.get('original_size', (0, 0))}")
            print(f"   - Processed images: {len(result.get('processed_images', {}))}")
            
    except Exception as e:
        print(f"❌ Image processing test error: {e}")

def test_audio_processing():
    """Test audio processing with a simple audio"""
    print("\n🧪 Testing audio processing...")
    
    try:
        # Create a simple test audio (1 second of silence)
        import numpy as np
        import soundfile as sf
        import io
        
        # Create 1 second of silence at 44100 Hz
        sample_rate = 44100
        duration = 1.0
        samples = np.zeros(int(sample_rate * duration))
        
        # Convert to bytes
        audio_bytes = io.BytesIO()
        sf.write(audio_bytes, samples, sample_rate, format='WAV')
        audio_data = audio_bytes.getvalue()
        
        # Convert to base64
        base64_data = base64.b64encode(audio_data).decode('utf-8')
        
        # Create base64 data file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(base64_data)
            base64_file = f.name
        
        # Initialize processor
        processor = FileProcessor("test_processed_files")
        
        # Test audio processing
        audio_bytes = base64.b64decode(base64_data)
        result = processor.preprocess_audio(audio_bytes, "test_audio.wav")
        
        # Clean up
        os.unlink(base64_file)
        
        if "error" in result:
            print(f"❌ Audio processing failed: {result['error']}")
        else:
            print("✅ Audio processing test passed")
            print(f"   - Duration: {result.get('duration', 0):.2f} seconds")
            print(f"   - Sample rate: {result.get('sample_rate', 0)} Hz")
            print(f"   - Processed audio: {len(result.get('processed_audio', {}))}")
            
    except Exception as e:
        print(f"❌ Audio processing test error: {e}")

def test_file_processor_script():
    """Test the file processor script directly"""
    print("\n🧪 Testing file processor script...")
    
    try:
        import subprocess
        
        # Create a simple test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is a test document.")
            test_file = f.name
        
        # Convert to base64
        with open(test_file, 'rb') as f:
            base64_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Create base64 data file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(base64_data)
            base64_file = f.name
        
        # Test the script
        result = subprocess.run([
            'python', 'python/file_processor.py',
            '--input', base64_file,
            '--filename', 'test_document.pdf',
            '--type', 'pdf',
            '--output', 'test_processed_files',
            '--base64'
        ], capture_output=True, text=True, timeout=30)
        
        # Clean up
        os.unlink(test_file)
        os.unlink(base64_file)
        
        if result.returncode == 0:
            print("✅ File processor script test passed")
            print(f"   - Output: {result.stdout.strip()}")
        else:
            print("❌ File processor script test failed")
            print(f"   - Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ File processor script test error: {e}")

if __name__ == "__main__":
    print("🧪 Testing File Processor")
    print("=" * 50)
    
    test_pdf_processing()
    test_image_processing()
    test_audio_processing()
    test_file_processor_script()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!") 