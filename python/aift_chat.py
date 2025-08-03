#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIFT Chat Python Script
This script provides AIFT chat functionality for the TypeScript application.
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
    """Main function to handle AIFT chat requests."""
    try:
        # Set API key
        setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
        
        # Get parameters from command line arguments
        if len(sys.argv) < 2:
            print("Error: Message parameter is required")
            sys.exit(1)
            
        message = sys.argv[1]
        sessionid = sys.argv[2] if len(sys.argv) > 2 else 'default-session'
        context = sys.argv[3] if len(sys.argv) > 3 else ''
        temperature = float(sys.argv[4]) if len(sys.argv) > 4 else 0.2
        return_json = sys.argv[5].lower() == 'true' if len(sys.argv) > 5 else False
        
        # Call the Python textqa function for chat
        result = textqa.chat(
            message, 
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