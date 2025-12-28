#!/usr/bin/env python3
"""
Simple example demonstrating Anchor SDK usage.

This example shows how to:
1. Initialize the Anchor SDK
2. Use OpenAI (automatically instrumented)
3. View traces in console (for testing)

Run with:
    python examples/simple_example.py

Make sure you have:
    - OpenAI API key in OPENAI_API_KEY environment variable
    - Anchor SDK path added (this script handles it automatically)
"""

import os
import sys
from pathlib import Path

# Add the anchor package to Python path
# This allows importing anchor even if not installed as a package
anchor_path = Path(__file__).parent.parent / "src" / "anchor-sdk-python"
if str(anchor_path) not in sys.path:
    sys.path.insert(0, str(anchor_path))

import anchor

# Initialize Anchor SDK
# Without otlp_endpoint, it will use console exporter (prints to stdout)
anchor.init(
    application_name="anchor-example",
    environment="development",
    # otlp_endpoint="http://localhost:4318/v1/traces",  # Uncomment to send to OTLP endpoint
)

# Now use OpenAI - it's automatically instrumented!
# No code changes needed - just use OpenAI normally
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("Making OpenAI API call...")
print("(Check console output for span data)\n")

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Say 'Hello from Anchor SDK!' in one sentence."}
    ],
    max_tokens=50,
)

print(f"\nResponse: {response.choices[0].message.content}")
print("\nCheck the console output above for OpenTelemetry span data!")
print("   You should see span information with model, tokens, duration, etc.")

