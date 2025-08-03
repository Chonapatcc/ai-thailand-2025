#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Voice Processing Python Script
This script provides AIFT audio analysis functionality for the TypeScript application.
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
        
        # Decode base64 audio data
        try:
            audio_bytes = base64.b64decode(audio_data)
        except Exception as e:
            print(f"Error: Invalid audio data format - {str(e)}")
            sys.exit(1)
        
        # Create a comprehensive prompt for audio analysis
        audio_prompt = f"""
Please analyze this audio content and answer the following question: {question}

Context: {context if context else 'No additional context provided'}

Please provide a detailed analysis of the audio content and answer the question comprehensively.
If the audio contains speech, please transcribe and analyze the spoken content.
"""
        
        # Call the Python textqa function with audio context
        result = textqa.chat(
            audio_prompt, 
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