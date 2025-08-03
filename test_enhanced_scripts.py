#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for enhanced image and voice scripts
"""

import sys
import os
import subprocess
import tempfile
import base64
import json

def test_image_enhanced():
    """Test the enhanced image script"""
    print("🧪 Testing Enhanced Image Script")
    print("=" * 50)
    
    try:
        # Create test image data (base64 encoded)
        test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="  # 1x1 pixel PNG
        
        # Create temporary file with test data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_image_data)
            temp_file = f.name
        
        try:
            # Test enhanced image script
            result = subprocess.run([
                'python', 'python/aift_image_enhanced.py',
                temp_file,
                'What is in this image?',
                'test-session',
                'Test context',
                '0.3',
                'false'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ Enhanced image script test passed")
                print(f"Response: {result.stdout.strip()[:100]}...")
            else:
                print("❌ Enhanced image script test failed")
                print(f"Error: {result.stderr}")
                
        finally:
            # Clean up
            os.unlink(temp_file)
            
    except Exception as e:
        print(f"❌ Enhanced image script test error: {e}")

def test_voice_enhanced():
    """Test the enhanced voice script"""
    print("\n🧪 Testing Enhanced Voice Script")
    print("=" * 50)
    
    try:
        # Create test audio data (base64 encoded - minimal WAV)
        test_audio_data = "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"  # Minimal WAV
        
        # Create temporary file with test data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_audio_data)
            temp_file = f.name
        
        try:
            # Test enhanced voice script
            result = subprocess.run([
                'python', 'python/aift_voice_enhanced.py',
                temp_file,
                'What is in this audio?',
                'test-session',
                'Test context',
                '0.3',
                'false'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ Enhanced voice script test passed")
                print(f"Response: {result.stdout.strip()[:100]}...")
            else:
                print("❌ Enhanced voice script test failed")
                print(f"Error: {result.stderr}")
                
        finally:
            # Clean up
            os.unlink(temp_file)
            
    except Exception as e:
        print(f"❌ Enhanced voice script test error: {e}")

def main():
    """Main test function"""
    print("🧪 Enhanced Scripts Test")
    print("=" * 60)
    
    # Run tests
    test_image_enhanced()
    test_voice_enhanced()
    
    print("\n" + "=" * 60)
    print("✅ All enhanced script tests completed!")

if __name__ == "__main__":
    main() 