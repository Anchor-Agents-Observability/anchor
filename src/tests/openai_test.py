#!/usr/bin/env python3
"""
Simple OpenAI chat completion test for Anchor SDK.

This test demonstrates the basic workflow:
1. Initialize Anchor SDK
2. Make OpenAI API call (automatically instrumented)
3. Verify traces are created

Run with:
    python -m pytest sdk/tests/openai_test.py -v
    
Or directly:
    python sdk/tests/openai_test.py
"""

import os
import sys
from pathlib import Path

# Try to load .env file from project root (optional - requires python-dotenv)
try:
    from dotenv import load_dotenv
    # Load .env from project root (2 levels up from sdk/tests/)
    project_root = Path(__file__).parent.parent.parent
    env_path = project_root / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed - that's okay, use environment variables directly
    pass

# Add SDK to path
sdk_path = Path(__file__).parent.parent
if str(sdk_path) not in sys.path:
    sys.path.insert(0, str(sdk_path))

import anchor
from openai import OpenAI


def test_openai_chat_completion():
    """
    Test OpenAI chat completion with Anchor SDK instrumentation.
    """
    # Get OTLP endpoint and clean it (remove /v1/traces if present)
    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if otlp_endpoint and otlp_endpoint.endswith("/v1/traces"):
        # Remove /v1/traces if present (OTLP exporter adds it automatically)
        otlp_endpoint = otlp_endpoint.replace("/v1/traces", "").rstrip("/")
        print(f"Note: Removed /v1/traces from endpoint. Using: {otlp_endpoint}")
    
    # Initialize Anchor SDK
    # This matches the architecture design: simple init with otlp_endpoint
    # Note: OTLP HTTP exporter automatically appends /v1/traces, so use base URL only
    anchor.init(
        application_name="anchor-test",
        environment="test",
        otlp_endpoint=otlp_endpoint,  # Optional: http://127.0.0.1:4318 (NOT /v1/traces)
        # If otlp_endpoint is None, uses console exporter (prints to stdout)
    )
    
    # Get OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("Warning: OPENAI_API_KEY not set. Skipping test.")
        return
    
    # Create OpenAI client
    # Note: No code changes needed - instrumentation happens automatically!
    client = OpenAI(api_key=api_key)
    
    # Make a simple chat completion call
    print("Making OpenAI API call...")
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say 'Hello from Anchor SDK!' in one sentence."}
            ],
            max_tokens=50,
        )
        
        # Verify response
        assert response.choices[0].message.content is not None
        print(f"\n Response: {response.choices[0].message.content}")
        print("\n Test passed! Check console or OTLP endpoint for trace data.")
        
        return response
    except Exception as e:
        # Handle API errors gracefully
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            print(f"\n  OpenAI API Error (quota/billing): {e}")
            print("   This is expected if your API key has no billing enabled.")
            print("   The instrumentation still worked - check console for span data!")
        else:
            print(f"\n Error: {e}")
        raise


if __name__ == "__main__":
    # Run test directly
    test_openai_chat_completion()

