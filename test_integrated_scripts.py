#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for integrated Python scripts
"""

import sys
import os
import subprocess
import tempfile
import base64
import json

def test_chat_script():
    """Test the textqa script directly"""
    print("🧪 Testing TextQA Script")
    print("=" * 50)
    
    try:
        # Test basic textqa functionality
        result = subprocess.run([
            'python', 'python/aift_textqa.py',
            'Hello, how are you?',
            'test-session',
            'Test context',
            '0.2',
            'false'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ TextQA script test passed")
            print(f"Response: {result.stdout.strip()}")
        else:
            print("❌ TextQA script test failed")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ TextQA script test error: {e}")

def test_integrated_script():
    """Test the integrated script with actual data"""
    print("\n🤖 Testing Integrated Script")
    print("=" * 50)
    
    try:
        # Create test data
        test_text = "Hello, this is a test message."
        test_text_b64 = base64.b64encode(test_text.encode()).decode()
        
        # Create temporary file with base64 data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_text_b64)
            temp_file = f.name
        
        try:
            # Test chat functionality
            print("\n💬 Testing chat functionality...")
            result = subprocess.run([
                'python', 'python/aift_integrated.py',
                'chat',
                temp_file,
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
                    print(f"   - Raw response: {result.stdout.strip()}")
            else:
                print("❌ Chat functionality test failed")
                print(f"   Error: {result.stderr}")
                
        finally:
            # Clean up
            os.unlink(temp_file)
            
    except Exception as e:
        print(f"❌ Integrated script test error: {e}")

def test_file_processor():
    """Test the file processor with actual data"""
    print("\n📁 Testing File Processor")
    print("=" * 50)
    
    try:
        # Create test data
        test_text = "This is a test document about artificial intelligence."
        test_text_b64 = base64.b64encode(test_text.encode()).decode()
        
        # Create temporary file with base64 data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_text_b64)
            temp_file = f.name
        
        try:
            # Test text processing
            print("\n📝 Testing text processing...")
            result = subprocess.run([
                'python', 'python/file_processor.py',
                '--type', 'pdf',
                '--input', temp_file,
                '--filename', 'test_document.pdf',
                '--output-dir', 'test_uploads'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ Text processing test passed")
                try:
                    result_data = json.loads(result.stdout)
                    print(f"   - Success: {result_data.get('success')}")
                    print(f"   - Text content length: {len(result_data.get('text_content', ''))}")
                except:
                    print(f"   - Raw response: {result.stdout.strip()}")
            else:
                print("❌ Text processing test failed")
                print(f"   Error: {result.stderr}")
                
        finally:
            # Clean up
            os.unlink(temp_file)
            
    except Exception as e:
        print(f"❌ File processor test error: {e}")

def main():
    """Main test function"""
    print("🧪 Integrated Scripts Test")
    print("=" * 60)
    
    # Run tests
    test_chat_script()
    test_integrated_script()
    test_file_processor()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")

if __name__ == "__main__":
    main() 