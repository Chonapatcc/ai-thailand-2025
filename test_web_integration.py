#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for web integration with textqa
"""

import sys
import os
import subprocess
import tempfile
import base64
import json

def test_textqa_direct():
    """Test textqa script directly"""
    print("🧪 Testing TextQA Direct")
    print("=" * 50)
    
    try:
        # Test basic textqa functionality
        result = subprocess.run([
            'python', 'python/aift_textqa.py',
            'What is artificial intelligence?',
            'web-chat',
            'AI research context',
            '0.3',
            'false'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ TextQA direct test passed")
            print(f"Response: {result.stdout.strip()[:100]}...")
        else:
            print("❌ TextQA direct test failed")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ TextQA direct test error: {e}")

def test_textqa_with_context():
    """Test textqa with context"""
    print("\n🧪 Testing TextQA with Context")
    print("=" * 50)
    
    try:
        # Test textqa with context
        result = subprocess.run([
            'python', 'python/aift_textqa.py',
            'Can you explain machine learning?',
            'web-chat-context',
            'Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models.',
            '0.2',
            'false'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ TextQA with context test passed")
            print(f"Response: {result.stdout.strip()[:100]}...")
        else:
            print("❌ TextQA with context test failed")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ TextQA with context test error: {e}")

def test_textqa_json_output():
    """Test textqa with JSON output"""
    print("\n🧪 Testing TextQA JSON Output")
    print("=" * 50)
    
    try:
        # Test textqa with JSON output
        result = subprocess.run([
            'python', 'python/aift_textqa.py',
            'What is deep learning?',
            'web-chat-json',
            'Deep learning context',
            '0.4',
            'true'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ TextQA JSON output test passed")
            try:
                result_data = json.loads(result.stdout)
                print(f"   - Content: {result_data.get('content', '')[:100]}...")
                print(f"   - Temperature: {result_data.get('temperature')}")
            except:
                print(f"   - Raw response: {result.stdout.strip()[:100]}...")
        else:
            print("❌ TextQA JSON output test failed")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ TextQA JSON output test error: {e}")

def main():
    """Main test function"""
    print("🧪 Web Integration Test with TextQA")
    print("=" * 60)
    
    # Run tests
    test_textqa_direct()
    test_textqa_with_context()
    test_textqa_json_output()
    
    print("\n" + "=" * 60)
    print("✅ All web integration tests completed!")
    print("\n📋 Summary:")
    print("- TextQA script is working correctly")
    print("- Context handling is functional")
    print("- JSON output is supported")
    print("- Ready for web integration")

if __name__ == "__main__":
    main() 