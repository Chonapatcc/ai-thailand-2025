#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Enhanced Voice Processing Python Script
This script provides AIFT audio analysis functionality with preprocessing.
"""

import sys
import json
import io
import os
import base64
import tempfile
from aift.multimodal import audioqa
from aift import setting

# Import file processor
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from file_processor import FileProcessor

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def main():
    """Main function to handle AIFT audio analysis requests."""
    try:
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        
        # Get parameters from command line arguments
        if len(sys.argv) < 3:
            print("Error: Audio data file path and question parameters are required")
            sys.exit(1)
            
        audio_data_file = sys.argv[1]  # Path to file containing base64 audio data
        question = sys.argv[2]
        sessionid = sys.argv[3] if len(sys.argv) > 3 else 'default-session'
        context = sys.argv[4] if len(sys.argv) > 4 else ''
        temperature = float(sys.argv[5]) if len(sys.argv) > 5 else 0.2
        return_json = sys.argv[6].lower() == 'true' if len(sys.argv) > 6 else False
        
        # Read base64 audio data from file
        try:
            with open(audio_data_file, 'r') as f:
                audio_data = f.read().strip()
        except Exception as e:
            print(f"Error: Cannot read audio data file - {str(e)}")
            sys.exit(1)
        
        # Process audio using file processor
        processor = FileProcessor("uploads")
        audio_result = processor.process_audio(audio_data, "uploaded_audio.wav")
        
        if not audio_result.get("success"):
            print(f"Error: {audio_result.get('error', 'Audio processing failed')}")
            sys.exit(1)
        
        # Get the processed audio path for AudioQA
        processed_audio_path = audio_result.get("backend_processed_path")
        if not processed_audio_path or not os.path.exists(processed_audio_path):
            # Fallback to original audio path
            processed_audio_path = audio_result.get("backend_orig_path")
        
        if not processed_audio_path or not os.path.exists(processed_audio_path):
            print("Error: No valid audio file found after processing")
            sys.exit(1)
        
        # Create comprehensive audio analysis prompt
        audio_prompt = f"""
Please analyze this audio content and answer the following question: {question}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the audio content and answer the question comprehensively.
Consider the following aspects:
1. Speech content and transcription if applicable
2. Audio quality and characteristics
3. Background sounds or music
4. Emotional tone and context
5. Technical audio properties

Question: {question}
"""
        
        # Call the AIFT AudioQA function with audio file path
        result = audioqa.generate(
            file=processed_audio_path,
            instruction=audio_prompt,
            return_json=return_json
        )
        
        # Print the result
        print(result)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 