#!/usr/bin/env python3
"""
Integration test: makes a real OpenAI call through Anchor SDK.

Requires OPENAI_API_KEY in env or .env file.
Run: python src/tests/openai_test.py
"""

import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    project_root = Path(__file__).parent.parent.parent
    env_path = project_root / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

sdk_path = Path(__file__).parent.parent
if str(sdk_path) not in sys.path:
    sys.path.insert(0, str(sdk_path))

import anchor
from openai import OpenAI


def test_openai_chat_completion():
    """Integration test: OpenAI chat completion with Anchor instrumentation."""
    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if otlp_endpoint and otlp_endpoint.endswith("/v1/traces"):
        otlp_endpoint = otlp_endpoint.replace("/v1/traces", "").rstrip("/")
        print(f"Note: Removed /v1/traces from endpoint. Using: {otlp_endpoint}")

    anchor.init(
        application_name="anchor-test",
        environment="test",
        otlp_endpoint=otlp_endpoint,
    )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Warning: OPENAI_API_KEY not set. Skipping test.")
        return

    client = OpenAI(api_key=api_key)

    print("Making OpenAI API call...")
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'Hello from Anchor SDK!' in one sentence."}],
            max_tokens=50,
        )

        assert response.choices[0].message.content is not None
        print(f"\n Response: {response.choices[0].message.content}")
        print("\n Test passed! Check console or OTLP endpoint for trace data.")
        return response
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            print(f"\n  OpenAI API Error (quota/billing): {e}")
            print("   The instrumentation still worked - check console for span data!")
        else:
            print(f"\n Error: {e}")
        raise


if __name__ == "__main__":
    test_openai_chat_completion()
