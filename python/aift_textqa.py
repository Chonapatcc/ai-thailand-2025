#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT TextQA Python Script
This script provides AIFT textqa functionality for the TypeScript application.
"""

import sys
import json
import io
import os
from aift.multimodal import textqa
from aift import setting

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def main():
    """Main function to handle AIFT textqa requests."""
    try:
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        
        # Get parameters from command line arguments
        if len(sys.argv) < 2:
            print("Error: Question parameter is required")
            sys.exit(1)
            
        question = sys.argv[1]
        sessionid = sys.argv[2] if len(sys.argv) > 2 else 'default-session'
        context = sys.argv[3] if len(sys.argv) > 3 else ''
        temperature = float(sys.argv[4]) if len(sys.argv) > 4 else 0.2
        return_json = sys.argv[5].lower() == 'true' if len(sys.argv) > 5 else False
        
        # Create Thai language prompt
        thai_prompt = f"""
กรุณาตอบคำถามหรือช่วยเหลือในเรื่องต่อไปนี้: {question}

บริบทเพิ่มเติม: {context if context else 'ไม่มีบริบทเพิ่มเติม'}

โปรดตอบคำถามหรือให้คำแนะนำที่เป็นประโยชน์และครบถ้วน โดยใช้ภาษาไทยที่เข้าใจง่ายและเป็นธรรมชาติ
หากเป็นคำถามเกี่ยวกับ AI หรือเทคโนโลยี กรุณาให้คำอธิบายที่ชัดเจนและมีตัวอย่างประกอบ
"""
        
        # Call the Python textqa function - use generate for direct model response
        result = textqa.generate(
            instruction=thai_prompt,
            system_prompt="คุณคือ Pathumma LLM ที่สร้างโดย NECTEC คุณเป็นผู้ช่วยที่เป็นประโยชน์ โปรดตอบคำถามทุกครั้งด้วยภาษาไทยที่ชัดเจนและเข้าใจง่าย",
            max_new_tokens=512,
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