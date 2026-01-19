"""
Utility functions for OpenAI instrumentation.
"""

from opentelemetry.trace import Span, Status, StatusCode


def set_server_address_and_port(instance, default_address: str = "api.openai.com", default_port: int = 443):
    """
    Extract server address and port from OpenAI client instance.
    
    Args:
        instance: OpenAI resource instance (e.g., Completions) or client instance
        default_address: Default server address if not found
        default_port: Default port if not found
        
    Returns:
        Tuple of (server_address, server_port)
    """
    server_address = default_address
    server_port = default_port
    
    # Try to get client from resource instance (e.g., Completions has _client)
    client = instance
    if hasattr(instance, '_client'):
        client = instance._client
    elif hasattr(instance, 'client'):
        client = instance.client
    
    # Try to get from base_url if available
    if hasattr(client, 'base_url') and client.base_url:
        # Parse base_url to extract address and port
        from urllib.parse import urlparse
        parsed = urlparse(str(client.base_url))
        if parsed.hostname:
            server_address = parsed.hostname
        if parsed.port:
            server_port = parsed.port
    elif hasattr(instance, 'base_url') and instance.base_url:
        # Fallback: try instance directly
        from urllib.parse import urlparse
        parsed = urlparse(str(instance.base_url))
        if parsed.hostname:
            server_address = parsed.hostname
        if parsed.port:
            server_port = parsed.port
    
    return server_address, server_port


def handle_exception(span: Span, exception: Exception):
    """
    Record exception on span and set error status.
    
    Args:
        span: OpenTelemetry span
        exception: Exception that occurred
    """
    if span and span.is_recording():
        span.record_exception(exception)
        span.set_status(Status(StatusCode.ERROR, str(exception)))


def response_to_dict(response):
    """
    Convert OpenAI response object to dictionary.
    
    Handles multiple response types:
    - Pydantic v2 models (uses model_dump())
    - Pydantic v1 models (uses dict())
    - Already a dictionary
    - Objects with attributes (converts to dict)
    
    Args:
        response: OpenAI response object (Pydantic model, dict, or object)
        
    Returns:
        Dictionary representation of the response
    """
    # If already a dict, return as-is
    if isinstance(response, dict):
        return response
    
    # Try Pydantic v2 model_dump() method
    if hasattr(response, 'model_dump'):
        try:
            return response.model_dump()
        except Exception:
            pass
    
    # Try Pydantic v1 dict() method
    if hasattr(response, 'dict'):
        try:
            return response.dict()
        except Exception:
            pass
    
    return response