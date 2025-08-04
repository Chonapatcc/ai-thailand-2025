#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Image Processing Python Script
This script provides AIFT image analysis functionality for the TypeScript application.
"""

import sys
import json
import io
import os
import base64
from aift.multimodal import textqa
from aift import setting

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
        
        # Create a comprehensive Thai prompt for image analysis
        image_prompt = f"""
กรุณาวิเคราะห์ภาพนี้และตอบคำถามต่อไปนี้: {question}

บริบทเพิ่มเติม: {context if context else 'ไม่มีบริบทเพิ่มเติม'}

โปรดให้การวิเคราะห์รายละเอียดของเนื้อหาในภาพและตอบคำถามอย่างครบถ้วน
หากภาพมีข้อความ กรุณาอ่านและแปลข้อความนั้น
หากภาพมีวัตถุหรือสถานการณ์ กรุณาอธิบายรายละเอียด
หากเป็นภาพที่เกี่ยวข้องกับ AI หรือเทคโนโลยี กรุณาให้คำอธิบายที่ชัดเจน
"""
        
        # Call the Python textqa function with image context
        result = textqa.chat(
            image_prompt, 
            sessionid=sessionid, 
            context=context, 
            temperature=temperature, 
            return_json=return_json
        )
        
        # Print the result
        print(result)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 