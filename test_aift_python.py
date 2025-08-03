#!/usr/bin/env python3
"""
Test script for AIFT Python package
"""

try:
    from aift.multimodal import textqa
    from aift import setting
    
    # Set API key
    setting.set_api_key('Od2TqqTYP5FEOjtSX0yYcJgxRlSVGfR8')
    
    print("Testing AIFT textqa...")
    
    # Test 1: Plain text response
    response1 = textqa.generate('คุณคือใคร', return_json=False)
    print(f"Response 1 (plain text): {response1}")
    
    # Test 2: JSON response
    response2 = textqa.generate(instruction='1+1')
    print(f"Response 2 (JSON): {response2}")
    
    print("AIFT Python package test completed successfully!")
    
except ImportError as e:
    print(f"Error importing AIFT package: {e}")
    print("Please install the AIFT package: pip install aift")
except Exception as e:
    print(f"Error testing AIFT: {e}") 