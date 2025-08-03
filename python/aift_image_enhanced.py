#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Enhanced Image Processing Python Script
This script provides AIFT image analysis functionality with preprocessing.
"""

import sys
import json
import io
import os
import base64
import tempfile
from aift.multimodal import vqa
from aift import setting

# Import file processor
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from file_processor import FileProcessor

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def main():
    """Main function to handle AIFT image analysis requests."""
    try:
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        
        # Get parameters from command line arguments
        if len(sys.argv) < 3:
            print("Error: Image data file path and question parameters are required")
            sys.exit(1)
            
        image_data_file = sys.argv[1]  # Path to file containing base64 image data
        question = sys.argv[2]
        sessionid = sys.argv[3] if len(sys.argv) > 3 else 'default-session'
        context = sys.argv[4] if len(sys.argv) > 4 else ''
        temperature = float(sys.argv[5]) if len(sys.argv) > 5 else 0.2
        return_json = sys.argv[6].lower() == 'true' if len(sys.argv) > 6 else False
        
        # Read base64 image data from file
        try:
            with open(image_data_file, 'r') as f:
                image_data = f.read().strip()
        except Exception as e:
            print(f"Error: Cannot read image data file - {str(e)}")
            sys.exit(1)
        
        # Decode base64 image data
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            print(f"Error: Invalid image data format - {str(e)}")
            sys.exit(1)
        
        # Process image using file processor
        processor = FileProcessor("uploads")
        image_result = processor.process_image(image_data, "uploaded_image.jpg")
        
        if not image_result.get("success"):
            print(f"Error: {image_result.get('error', 'Image processing failed')}")
            sys.exit(1)
        
        # Get the processed image path for VQA
        processed_image_path = image_result.get("backend_processed_path")
        if not processed_image_path or not os.path.exists(processed_image_path):
            # Fallback to original image path
            processed_image_path = image_result.get("backend_orig_path")
        
        if not processed_image_path or not os.path.exists(processed_image_path):
            print("Error: No valid image file found after processing")
            sys.exit(1)
        
        # Create comprehensive image analysis prompt
        image_prompt = f"""
Please analyze this image and answer the following question: {question}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the image content and answer the question comprehensively.
Consider the following aspects:
1. Visual content and objects in the image
2. Text content if any (OCR analysis)
3. Colors, composition, and visual elements
4. Context and meaning of the image
5. Any technical details or patterns

Question: {question}
"""
        
        # Call the AIFT VQA function with image file path
        result = vqa.generate(
            file=processed_image_path,
            instruction=image_prompt,
            return_json=return_json
        )
        
        # Print the result
        print(result)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 