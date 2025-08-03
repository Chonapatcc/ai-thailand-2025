#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup script for file processing system
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    
    try:
        # Install requirements
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def verify_imports():
    """Verify all imports work"""
    print("\n🔍 Verifying imports...")
    
    imports_to_test = [
        ('aift', 'AIFT package'),
        ('PyPDF2', 'PDF processing'),
        ('PIL', 'Image processing'),
        ('cv2', 'OpenCV'),
        ('librosa', 'Audio processing'),
        ('soundfile', 'Audio I/O'),
        ('numpy', 'Numerical operations')
    ]
    
    all_good = True
    
    for module, description in imports_to_test:
        try:
            __import__(module)
            print(f"✅ {description} ({module})")
        except ImportError as e:
            print(f"❌ {description} ({module}): {e}")
            all_good = False
    
    return all_good

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        'uploads/backend/pdf',
        'uploads/backend/images',
        'uploads/backend/audio',
        'uploads/backend/text',
        'uploads/frontend/pdf',
        'uploads/frontend/images',
        'uploads/frontend/audio',
        'uploads/frontend/text',
        'temp'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {directory}")

def test_basic_functionality():
    """Test basic functionality"""
    print("\n🧪 Testing basic functionality...")
    
    try:
        # Test AIFT import
        from aift.multimodal import textqa
        from aift import setting
        
        # Test setting API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        print("✅ AIFT package working")
        
        # Test basic chat
        result = textqa.chat("Hello", return_json=False)
        print(f"✅ Basic chat test: {result[:50]}...")
        
        return True
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up File Processing System")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        print("❌ Setup failed: Could not install requirements")
        return False
    
    # Verify imports
    if not verify_imports():
        print("❌ Setup failed: Import verification failed")
        return False
    
    # Create directories
    create_directories()
    
    # Test basic functionality
    if not test_basic_functionality():
        print("❌ Setup failed: Basic functionality test failed")
        return False
    
    print("\n" + "=" * 50)
    print("✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Test the system: python test_file_processing.py")
    print("2. Start the web application: npm run dev")
    print("3. Upload files through the web interface")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 