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
        if len(sys.argv) < 4:
            print("Error: Data file path, question, and file type parameters are required")
            sys.exit(1)

        data_file = sys.argv[1]  # Path to file containing base64 data
        question = sys.argv[2]
        file_type = sys.argv[3].lower()  # 'image' or 'audio'
        sessionid = sys.argv[4] if len(sys.argv) > 4 else 'default-session'
        context = sys.argv[5] if len(sys.argv) > 5 else ''
        temperature = float(sys.argv[6]) if len(sys.argv) > 6 else 0.2
        return_json = sys.argv[7].lower() == 'true' if len(sys.argv) > 7 else False

        # Read base64 data from file
        try:
            with open(data_file, 'r') as f:
                base64_data = f.read().strip()
        except Exception as e:
            print(f"Error: Cannot read data file - {str(e)}")
            sys.exit(1)

        # Decode base64 data
        try:
            file_bytes = base64.b64decode(base64_data)
        except Exception as e:
            print(f"Error: Invalid base64 data format - {str(e)}")
            sys.exit(1)

        if file_type == 'image':
            # Process image using file processor
            processor = FileProcessor("uploads")
            image_result = processor.process_image(base64_data, "uploaded_image.jpg")

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

            # Create comprehensive Thai image analysis prompt
            image_prompt = f"""
กรุณาวิเคราะห์ภาพนี้และตอบคำถามต่อไปนี้: {question}

บริบทเพิ่มเติม: {context if context else 'ไม่มีบริบทเพิ่มเติม'}

โปรดให้การวิเคราะห์รายละเอียดของเนื้อหาในภาพและตอบคำถามอย่างครบถ้วน
พิจารณาแง่มุมต่างๆ ดังนี้:
1. เนื้อหาภาพและวัตถุในภาพ
2. ข้อความในภาพ (หากมี) การวิเคราะห์ OCR
3. สี การจัดวาง และองค์ประกอบภาพ
4. บริบทและความหมายของภาพ
5. รายละเอียดทางเทคนิคหรือรูปแบบต่างๆ

คำถาม: {question}
โปรดตอบคำถามทุกครั้งด้วยภาษาไทยที่ชัดเจนและเข้าใจง่าย
"""

            # Call the AIFT VQA function with image file path
            result = vqa.generate(
                file=processed_image_path,
                instruction=image_prompt,
                return_json=return_json
            )
            print(result)

        elif file_type == 'audio' or file_type == 'voice':
            # Save audio file to uploads directory
            uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
            if not os.path.exists(uploads_dir):
                os.makedirs(uploads_dir)
            audio_path = os.path.join(uploads_dir, f"uploaded_audio_{sessionid}.wav")
            try:
                with open(audio_path, 'wb') as af:
                    af.write(file_bytes)
            except Exception as e:
                print(f"Error: Could not save audio file - {str(e)}")
                sys.exit(1)

            # Placeholder for audio/voice analysis
            # TODO: Integrate with actual audio/voice analysis function
            print(json.dumps({
                "success": True,
                "message": "Audio file uploaded successfully.",
                "audio_path": audio_path,
                "question": question,
                "context": context
            }, ensure_ascii=False))

        else:
            print(f"Error: Unsupported file type '{file_type}'. Use 'image' or 'audio'.")
            sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 