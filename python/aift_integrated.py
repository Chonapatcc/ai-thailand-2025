#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Integrated Script
Combines file processing with AIFT analysis
"""

import sys
import json
import io
import os
import base64
import tempfile
from pathlib import Path
from aift.multimodal import textqa
from aift import setting
from file_processor import FileProcessor

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class AIFTIntegrated:
    def __init__(self, upload_dir="uploads"):
        self.processor = FileProcessor(upload_dir)
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
    
    def analyze_pdf(self, pdf_data, question, sessionid='default-session', context='', temperature=0.2, return_json=False):
        """Analyze PDF with AIFT"""
        try:
            # First process the PDF
            pdf_result = self.processor.process_pdf(pdf_data, "uploaded_pdf.pdf")
            
            if not pdf_result.get("success"):
                return pdf_result
            
            # Get the extracted text
            text_content = pdf_result.get("text_content", "")
            
            # Create comprehensive prompt
            prompt = f"""
Please analyze this PDF document and answer the following question: {question}

PDF Content:
{text_content}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the PDF content and answer the question comprehensively.
"""
            
            # Call AIFT for analysis - use generate for direct model response
            result = textqa.generate(
                instruction=prompt,
                system_prompt="You are Pathumma LLM, created by NECTEC. You are a helpful assistant.",
                max_new_tokens=512,
                temperature=temperature,
                return_json=return_json
            )
            
            # Combine results
            return {
                "success": True,
                "analysis": result,
                "text_content": text_content,
                "backend_text_path": pdf_result.get("backend_text_path"),
                "frontend_text_path": pdf_result.get("frontend_text_path"),
                "backend_pdf_path": pdf_result.get("backend_pdf_path"),
                "frontend_pdf_path": pdf_result.get("frontend_pdf_path"),
                "question": question,
                "sessionid": sessionid
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question": question
            }
    
    def analyze_image(self, image_data, question, sessionid='default-session', context='', temperature=0.2, return_json=False):
        """Analyze image with AIFT"""
        try:
            # First process the image
            image_result = self.processor.process_image(image_data, "uploaded_image.jpg")
            
            if not image_result.get("success"):
                return image_result
            
            # Create comprehensive prompt for image analysis
            prompt = f"""
Please analyze this image and answer the following question: {question}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the image content and answer the question comprehensively.
"""
            
            # Call AIFT for analysis - use generate for direct model response
            result = textqa.generate(
                instruction=prompt,
                system_prompt="You are Pathumma LLM, created by NECTEC. You are a helpful assistant.",
                max_new_tokens=512,
                temperature=temperature,
                return_json=return_json
            )
            
            # Combine results
            return {
                "success": True,
                "analysis": result,
                "backend_orig_path": image_result.get("backend_orig_path"),
                "frontend_orig_path": image_result.get("frontend_orig_path"),
                "backend_processed_path": image_result.get("backend_processed_path"),
                "frontend_processed_path": image_result.get("frontend_processed_path"),
                "question": question,
                "sessionid": sessionid
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question": question
            }
    
    def analyze_audio(self, audio_data, question, sessionid='default-session', context='', temperature=0.2, return_json=False):
        """Analyze audio with AIFT"""
        try:
            # First process the audio
            audio_result = self.processor.process_audio(audio_data, "uploaded_audio.wav")
            
            if not audio_result.get("success"):
                return audio_result
            
            # Create comprehensive prompt for audio analysis
            prompt = f"""
Please analyze this audio content and answer the following question: {question}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the audio content and answer the question comprehensively.
If the audio contains speech, please transcribe and analyze the spoken content.
"""
            
            # Call AIFT for analysis - use generate for direct model response
            result = textqa.generate(
                instruction=prompt,
                system_prompt="You are Pathumma LLM, created by NECTEC. You are a helpful assistant.",
                max_new_tokens=512,
                temperature=temperature,
                return_json=return_json
            )
            
            # Combine results
            return {
                "success": True,
                "analysis": result,
                "backend_orig_path": audio_result.get("backend_orig_path"),
                "frontend_orig_path": audio_result.get("frontend_orig_path"),
                "backend_processed_path": audio_result.get("backend_processed_path"),
                "frontend_processed_path": audio_result.get("frontend_processed_path"),
                "question": question,
                "sessionid": sessionid
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question": question
            }
    
    def chat(self, message, sessionid='default-session', context='', temperature=0.2, return_json=False):
        """Regular chat with AIFT using textqa"""
        try:
            # Use textqa for chat functionality
            result = textqa.generate(
                instruction=message,
                system_prompt="You are Pathumma LLM, created by NECTEC. You are a helpful assistant.",
                max_new_tokens=512,
                temperature=temperature,
                return_json=return_json
            )
            
            return {
                "success": True,
                "response": result,
                "message": message,
                "sessionid": sessionid
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": message
            }

def main():
    """Main function to handle AIFT integrated requests."""
    try:
        # Get parameters from command line arguments
        if len(sys.argv) < 3:
            print("Error: At least operation and data parameters are required")
            sys.exit(1)
            
        operation = sys.argv[1]
        data_file = sys.argv[2]  # Path to file containing base64 data
        question = sys.argv[3] if len(sys.argv) > 3 else ''
        sessionid = sys.argv[4] if len(sys.argv) > 4 else 'default-session'
        context = sys.argv[5] if len(sys.argv) > 5 else ''
        temperature = float(sys.argv[6]) if len(sys.argv) > 6 else 0.2
        return_json = sys.argv[7].lower() == 'true' if len(sys.argv) > 7 else False
        
        # Initialize integrated handler
        handler = AIFTIntegrated()
        
        # Read base64 data from file
        try:
            with open(data_file, 'r') as f:
                base64_data = f.read().strip()
        except Exception as e:
            print(f"Error: Cannot read data file - {str(e)}")
            sys.exit(1)
        
        # Process based on operation
        if operation == 'pdf':
            result = handler.analyze_pdf(base64_data, question, sessionid, context, temperature, return_json)
        elif operation == 'image':
            result = handler.analyze_image(base64_data, question, sessionid, context, temperature, return_json)
        elif operation == 'audio':
            result = handler.analyze_audio(base64_data, question, sessionid, context, temperature, return_json)
        elif operation == 'chat':
            result = handler.chat(question, sessionid, context, temperature, return_json)
        else:
            print(f"Error: Unknown operation '{operation}'")
            sys.exit(1)
        
        # Print the result
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 