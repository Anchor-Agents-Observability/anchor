"""
Shared helpers for LLM instrumentation (used by both OpenAI and Anthropic).
"""

from opentelemetry.trace import Span, Status, StatusCode


def set_server_address_and_port(instance, default_address="api.openai.com", default_port=443):
    """Resolve server address/port from a client resource's base_url."""
    server_address = default_address
    server_port = default_port

    # OpenAI resource classes (Completions, etc.) hold the client as _client
    client = instance
    if hasattr(instance, '_client'):
        client = instance._client
    elif hasattr(instance, 'client'):
        client = instance.client

    if hasattr(client, 'base_url') and client.base_url:
        from urllib.parse import urlparse
        parsed = urlparse(str(client.base_url))
        if parsed.hostname:
            server_address = parsed.hostname
        if parsed.port:
            server_port = parsed.port

    return server_address, server_port


def handle_exception(span: Span, exception: Exception):
    """Record an exception on the span and mark it as ERROR."""
    if span and span.is_recording():
        span.record_exception(exception)
        span.set_status(Status(StatusCode.ERROR, str(exception)))


def response_to_dict(response):
    """
    Normalize an LLM response object to a plain dict.

    Handles Pydantic v2 (model_dump), v1 (dict), raw dicts, and passthrough.
    """
    if isinstance(response, dict):
        return response

    if hasattr(response, 'model_dump'):
        try:
            return response.model_dump()
        except Exception:
            pass

    if hasattr(response, 'dict'):
        try:
            return response.dict()
        except Exception:
            pass

    return response