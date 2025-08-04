#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Enhanced PDF Processing Python Script
This script provides AIFT PDF analysis functionality with text extraction.
"""

import sys
import json
import io
import os
import base64
import tempfile
from aift.multimodal import textqa
from aift import setting

# Import file processor
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from file_processor import FileProcessor

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def main():
    """Main function to handle AIFT PDF analysis requests."""
    try:
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        
        # Get parameters from command line arguments
        if len(sys.argv) < 3:
            print("Error: PDF data file path and question parameters are required")
            sys.exit(1)
            
        pdf_data_file = sys.argv[1]  # Path to file containing base64 PDF data
        question = sys.argv[2]
        sessionid = sys.argv[3] if len(sys.argv) > 3 else 'default-session'
        context = sys.argv[4] if len(sys.argv) > 4 else ''
        temperature = float(sys.argv[5]) if len(sys.argv) > 5 else 0.2
        return_json = sys.argv[6].lower() == 'true' if len(sys.argv) > 6 else False
        
        # Read base64 PDF data from file
        try:
            with open(pdf_data_file, 'r') as f:
                pdf_data = f.read().strip()
        except Exception as e:
            print(f"Error: Cannot read PDF data file - {str(e)}")
            sys.exit(1)
        
        # Decode base64 PDF data
        try:
            pdf_bytes = base64.b64decode(pdf_data)
        except Exception as e:
            print(f"Error: Invalid PDF data format - {str(e)}")
            sys.exit(1)
        
        # Process PDF using file processor
        processor = FileProcessor("processed_files")
        pdf_result = processor.process_pdf(pdf_bytes, "uploaded_document.pdf")
        
        if "error" in pdf_result:
            print(f"Error: {pdf_result['error']}")
            sys.exit(1)
        
        # Extract text content
        text_content = pdf_result.get("text_content", "")
        
        if not text_content.strip():
            # If no text extracted, use a generic Thai prompt
            pdf_prompt = f"""
กรุณาวิเคราะห์เอกสาร PDF นี้และตอบคำถามต่อไปนี้: {question}

บริบทเพิ่มเติม: {context if context else 'ไม่มีบริบทเพิ่มเติม'}

เอกสาร PDF นี้ดูเหมือนจะมีภาพหรือเนื้อหาที่สแกนไว้
โปรดให้การวิเคราะห์ทั่วไปตามโครงสร้างเอกสารและข้อมูลที่มีอยู่
"""
        else:
            # Use extracted text for analysis with Thai prompt
            pdf_prompt = f"""
กรุณาวิเคราะห์เอกสาร PDF นี้และตอบคำถามต่อไปนี้: {question}

บริบทเพิ่มเติม: {context if context else 'ไม่มีบริบทเพิ่มเติม'}

ข้อความที่สกัดจาก PDF:
{text_content}

โปรดให้การวิเคราะห์รายละเอียดของเนื้อหาใน PDF และตอบคำถามอย่างครบถ้วน
หากเป็นเอกสารวิจัยหรือทางวิชาการ กรุณาให้คำอธิบายที่ชัดเจนและสรุปประเด็นสำคัญ
"""
        
        # Call the AIFT chat function with PDF context
        result = textqa.chat(
            pdf_prompt, 
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