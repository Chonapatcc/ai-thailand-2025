#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for file processing functionality
"""

import sys
import os
import subprocess
import tempfile
import base64
import json
from pathlib import Path

def test_file_processor():
    """Test the file processor"""
    print("🧪 Testing File Processor")
    print("=" * 50)
    
    try:
        # Test PDF processing
        print("\n📄 Testing PDF processing...")
        result = subprocess.run([
            'python', 'python/file_processor.py',
            '--type', 'pdf',
            '--input', 'test.pdf',
            '--filename', 'test_document.pdf',
            '--output-dir', 'test_uploads'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ PDF processing test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Text content length: {len(result_data.get('text_content', ''))}")
                print(f"   - Backend paths: {result_data.get('backend_text_path')}")
                print(f"   - Frontend paths: {result_data.get('frontend_text_path')}")
            except:
                print("   - Raw output received")
        else:
            print("❌ PDF processing test failed")
            print(f"   Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ PDF processing test error: {e}")
    
    try:
        # Test image processing
        print("\n🖼️ Testing image processing...")
        result = subprocess.run([
            'python', 'python/file_processor.py',
            '--type', 'image',
            '--input', 'test_image.jpg',
            '--filename', 'test_image.jpg',
            '--output-dir', 'test_uploads'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Image processing test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Backend paths: {result_data.get('backend_processed_path')}")
                print(f"   - Frontend paths: {result_data.get('frontend_processed_path')}")
            except:
                print("   - Raw output received")
        else:
            print("❌ Image processing test failed")
            print(f"   Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Image processing test error: {e}")
    
    try:
        # Test audio processing
        print("\n🎵 Testing audio processing...")
        result = subprocess.run([
            'python', 'python/file_processor.py',
            '--type', 'audio',
            '--input', 'test_audio.wav',
            '--filename', 'test_audio.wav',
            '--output-dir', 'test_uploads'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Audio processing test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Backend paths: {result_data.get('backend_processed_path')}")
                print(f"   - Frontend paths: {result_data.get('frontend_processed_path')}")
            except:
                print("   - Raw output received")
        else:
            print("❌ Audio processing test failed")
            print(f"   Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Audio processing test error: {e}")

def test_upload_handler():
    """Test the upload handler"""
    print("\n📤 Testing Upload Handler")
    print("=" * 50)
    
    try:
        # Test text upload
        print("\n📝 Testing text upload...")
        test_text = "This is a test document about artificial intelligence."
        test_text_b64 = base64.b64encode(test_text.encode()).decode()
        
        result = subprocess.run([
            'python', 'python/upload_handler.py',
            'text',
            'test_document.txt',
            test_text_b64
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Text upload test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Text content: {result_data.get('text_content', '')[:50]}...")
                print(f"   - Backend path: {result_data.get('backend_text_path')}")
            except:
                print("   - Raw output received")
        else:
            print("❌ Text upload test failed")
            print(f"   Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Text upload test error: {e}")

def test_aift_integrated():
    """Test the AIFT integrated functionality"""
    print("\n🤖 Testing AIFT Integrated")
    print("=" * 50)
    
    try:
        # Test chat functionality
        print("\n💬 Testing chat functionality...")
        result = subprocess.run([
            'python', 'python/aift_integrated.py',
            'chat',
            'test_data.txt',
            'Hello, how are you?',
            'test-session',
            'Test context',
            '0.2',
            'false'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Chat functionality test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Response: {result_data.get('response', '')[:100]}...")
                print(f"   - Success: {result_data.get('success')}")
            except:
                print("   - Raw output received")
        else:
            print("❌ Chat functionality test failed")
            print(f"   Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Chat functionality test error: {e}")

def create_test_files():
    """Create test files for testing"""
    print("\n📁 Creating test files...")
    
    # Create test PDF (simple text file for now)
    with open('test.pdf', 'w') as f:
        f.write("This is a test PDF document about artificial intelligence and machine learning.")
    
    # Create test image (simple text file for now)
    with open('test_image.jpg', 'w') as f:
        f.write("This is a test image data.")
    
    # Create test audio (simple text file for now)
    with open('test_audio.wav', 'w') as f:
        f.write("This is a test audio data.")
    
    # Create test data file
    test_text = "Hello, this is a test message."
    test_text_b64 = base64.b64encode(test_text.encode()).decode()
    with open('test_data.txt', 'w') as f:
        f.write(test_text_b64)
    
    print("✅ Test files created")

def cleanup_test_files():
    """Clean up test files"""
    print("\n🧹 Cleaning up test files...")
    
    test_files = ['test.pdf', 'test_image.jpg', 'test_audio.wav', 'test_data.txt']
    for file in test_files:
        try:
            os.remove(file)
        except:
            pass
    
    # Clean up test directories
    try:
        import shutil
        shutil.rmtree('test_uploads', ignore_errors=True)
    except:
        pass
    
    print("✅ Test files cleaned up")

def main():
    """Main test function"""
    print("🧪 Comprehensive File Processing Test")
    print("=" * 60)
    
    # Create test files
    create_test_files()
    
    # Run tests
    test_file_processor()
    test_upload_handler()
    test_aift_integrated()
    
    # Clean up
    cleanup_test_files()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")

if __name__ == "__main__":
    main() 