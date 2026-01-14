"""
Module for monitoring OpenAI API calls 
"""

import time
from typing import Callable, Dict, Any
from opentelemetry import trace
from opentelemetry.trace import SpanKind
from anchor.conventions import SemanticConventions
from anchor.instrumentation.openai.utils import set_server_address_and_port, handle_exception, response_to_dict


def create_wrapper(
    config: Dict[str, Any],
    operation_type: str,
    process_response_func: Callable,
    default_model: str,
    span_name_prefix: str = None,
) -> Callable:
    """
    Generic factory function that creates wrappers for any OpenAI API endpoint.
    Compatible with wrapt's wrap_function_wrapper signature: (wrapped, instance, args, kwargs)
    
    Args:
        config: Configuration dictionary containing:
            - tracer: OpenTelemetry tracer
            - pricing_info: Pricing information for cost calculation
            - environment: Environment name
            - application_name: Application name
            - metrics: Metrics handler
            - capture_message_content: Whether to capture message content
            - disable_metrics: Whether to disable metrics
            - version: SDK version
        operation_type: Operation type constant (e.g., SemanticConventions.GEN_AI_OPERATION_TYPE_CHAT)
        process_response_func: Function to process the response
        default_model: Default model name if not specified in kwargs
        span_name_prefix: Optional prefix for span name (defaults to operation_type)
        
    Returns:
        Wrapper function compatible with wrapt signature: (wrapped, instance, args, kwargs)
    """

    tracer = config.get("tracer")
    pricing_info = config.get("pricing_info")
    environment = config.get("environment")
    application_name = config.get("application_name")
    metrics = config.get("metrics")
    capture_message_content = config.get("capture_message_content", True)
    disable_metrics = config.get("disable_metrics", False)
    version = config.get("version", "unknown")
    
    
    def wrapper(wrapped, instance, args, kwargs):
        """
        Wraps the OpenAI API call for non-streaming requests.
        Compatible with wrapt's signature.
        """
        # Skip streaming requests for now
        if kwargs.get("stream", False):
            return wrapped(*args, **kwargs)
        
        # Get server information
        server_address, server_port = set_server_address_and_port(
            instance, "api.openai.com", 443
        )
        
        # Get model from kwargs or use default
        request_model = kwargs.get("model", default_model)
        
        # Create span name
        span_name = f"{operation_type} {request_model}"
        
        # Start span and execute call
        with tracer.start_as_current_span(span_name, kind=SpanKind.CLIENT) as span:
            start_time = time.time()
            
            # Set basic span attributes
            if span.is_recording():
                span.set_attribute(SemanticConventions.GEN_AI_SYSTEM, SemanticConventions.GEN_AI_SYSTEM_OPENAI)
                span.set_attribute(SemanticConventions.GEN_AI_OPERATION_TYPE, operation_type)
                span.set_attribute(SemanticConventions.GEN_AI_REQUEST_MODEL, request_model)
                span.set_attribute(SemanticConventions.SERVER_ADDRESS, server_address)
                span.set_attribute(SemanticConventions.SEVER_PORT, server_port)
                span.set_attribute(SemanticConventions.GEN_AI_ENDPOINT, f"{server_address}:{server_port}")
            
            # Execute the wrapped function
            response = wrapped(*args, **kwargs)
            
            # Process the response
            try:
                response = process_response_func(
                    response=response,
                    request_model=request_model,
                    pricing_info=pricing_info,
                    server_port=server_port,
                    server_address=server_address,
                    environment=environment,
                    application_name=application_name,
                    metrics=metrics,
                    start_time=start_time,
                    span=span,
                    capture_message_content=capture_message_content,
                    disable_metrics=disable_metrics,
                    version=version,
                    **kwargs,
                )
            except Exception as e:
                handle_exception(span, e)
            
            return response
    
    return wrapper


def process_chat_response(
    response,
    request_model: str,
    pricing_info: Dict,
    server_port: int,
    server_address: str,
    environment: str,
    application_name: str,
    metrics: Any,
    start_time: float,
    span: trace.Span,
    capture_message_content: bool,
    disable_metrics: bool,
    version: str,
    **kwargs : Any,
):
    """
    Process non-streaming chat completion response and set span attributes.


    example response:
    {
        "id": "chatcmpl-abc123",
        "model": "gpt-4o-mini",
        "system_fingerprint": "fp_123",
        "service_tier": "auto",
        "choices": [
            {
            "index": 0,
            "finish_reason": "stop",
            "message": {
                "role": "assistant",
                "content": "ronaldo siuuu",
                "tool_calls": null
            }
            }
        ],
        "usage": {
            "prompt_tokens": 12,
            "completion_tokens": 8,
            "total_tokens": 20
        }
    }

    """
    if not span.is_recording():
        return response
    
    end_time = time.time()
    duration = end_time - start_time
    
    # Set duration
    span.set_attribute(SemanticConventions.GEN_AI_CLIENT_OPERATION_DURATION, duration)
    
    # Convert response to dict for easier access
    response_dict = response_to_dict(response)
    
    # Extract response information
    if 'id' in response_dict and response_dict['id'] is not None:
        span.set_attribute(SemanticConventions.GEN_AI_RESPONSE_ID, response_dict['id'])
    if 'model' in response_dict and response_dict['model'] is not None:
        span.set_attribute(SemanticConventions.GEN_AI_RESPONSE_MODEL, response_dict['model'])
    if 'system_fingerprint' in response_dict and response_dict['system_fingerprint'] is not None:
        span.set_attribute(SemanticConventions.GEN_AI_RESPONSE_SYSTEM_FINGERPRINT, response_dict['system_fingerprint'])
    
    # Extract usage information
    if 'usage' in response_dict:
        usage = response_dict['usage']
        if isinstance(usage, dict):
            if 'prompt_tokens' in usage and usage['prompt_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_USAGE_INPUT_TOKENS, usage['prompt_tokens'])
            if 'completion_tokens' in usage and usage['completion_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_USAGE_OUTPUT_TOKENS, usage['completion_tokens'])
            if 'total_tokens' in usage and usage['total_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_CLIENT_TOKEN_USAGE, usage['total_tokens'])
            if 'reasoning_tokens' in usage and usage['reasoning_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_USAGE_REASONING_TOKENS, usage['reasoning_tokens'])
    
    # Extract finish reasons
    if 'choices' in response_dict and response_dict['choices']:
        finish_reasons = []
        for choice in response_dict['choices']:
            if isinstance(choice, dict) and 'finish_reason' in choice and choice['finish_reason'] is not None:
                finish_reasons.append(str(choice['finish_reason']))
        if finish_reasons:
            span.set_attribute(SemanticConventions.GEN_AI_RESPONSE_FINISH_REASON, ",".join(finish_reasons))
    
    # Capture message content if enabled
    if capture_message_content:
        # Capture request messages
        if 'messages' in kwargs:
            messages = kwargs['messages']
            for i, msg in enumerate(messages):
                role = getattr(msg, 'role', None) or (msg.get('role') if isinstance(msg, dict) else None)
                content = getattr(msg, 'content', None) or (msg.get('content') if isinstance(msg, dict) else None)
                if role == 'user' and content:
                    span.set_attribute(f"{SemanticConventions.GEN_AI_USER_MESSAGE}.{i}", str(content))
                elif role == 'system' and content:
                    span.set_attribute(f"{SemanticConventions.GEN_AI_SYSTEM_MESSAGE}.{i}", str(content))
        
        # Capture response messages
        if 'choices' in response_dict and response_dict['choices']:
            for i, choice in enumerate(response_dict['choices']):
                if isinstance(choice, dict) and 'message' in choice:
                    message = choice['message']
                    if isinstance(message, dict) and 'content' in message:
                        span.set_attribute(f"{SemanticConventions.GEN_AI_ASSISTANT_MESSAGE}.{i}", str(message['content']))
    
    # Set request parameters
    for param in ['temperature', 'max_tokens', 'top_p', 'frequency_penalty', 'presence_penalty', 'seed']:
        if param in kwargs:
            attr_name = getattr(SemanticConventions, f"GEN_AI_REQUEST_{param.upper()}", None)
            if attr_name:
                span.set_attribute(attr_name, kwargs[param])
    
    span.set_status(trace.Status(trace.StatusCode.OK))
    return response


def process_embedding_response(
    response,
    request_model: str,
    pricing_info: Dict,
    server_port: int,
    server_address: str,
    environment: str,
    application_name: str,
    metrics: Any,
    start_time: float,
    span: trace.Span,
    capture_message_content: bool,
    disable_metrics: bool,
    version: str,
    **kwargs,
):
    """
    Process embedding response and set span attributes.
    """
    if not span.is_recording():
        return response
    
    end_time = time.time()
    duration = end_time - start_time
    
    span.set_attribute(SemanticConventions.GEN_AI_CLIENT_OPERATION_DURATION, duration)
    
    # Convert response to dict for easier access
    response_dict = response_to_dict(response)
    
    if 'model' in response_dict and response_dict['model'] is not None:
        span.set_attribute(SemanticConventions.GEN_AI_RESPONSE_MODEL, response_dict['model'])
    if 'usage' in response_dict:
        usage = response_dict['usage']
        if isinstance(usage, dict):
            if 'prompt_tokens' in usage and usage['prompt_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_USAGE_INPUT_TOKENS, usage['prompt_tokens'])
            if 'total_tokens' in usage and usage['total_tokens'] is not None:
                span.set_attribute(SemanticConventions.GEN_AI_CLIENT_TOKEN_USAGE, usage['total_tokens'])
    
    if 'data' in response_dict:
        data = response_dict['data']
        if isinstance(data, list):
            span.set_attribute("gen_ai.embedding.count", len(data))
    
    span.set_status(trace.Status(trace.StatusCode.OK))
    return response


def process_image_response(
    response,
    request_model: str,
    pricing_info: Dict,
    server_port: int,
    server_address: str,
    environment: str,
    application_name: str,
    metrics: Any,
    start_time: float,
    span: trace.Span,
    capture_message_content: bool,
    disable_metrics: bool,
    version: str,
    **kwargs,
):
    """
    Process image generation response and set span attributes.
    """
    if not span.is_recording():
        return response
    
    end_time = time.time()
    duration = end_time - start_time
    
    span.set_attribute(SemanticConventions.GEN_AI_CLIENT_OPERATION_DURATION, duration)
    
    # Convert response to dict for easier access
    response_dict = response_to_dict(response)
    
    if 'data' in response_dict:
        data = response_dict['data']
        if isinstance(data, list):
            span.set_attribute("gen_ai.image.count", len(data))
    
    span.set_status(trace.Status(trace.StatusCode.OK))
    return response


def process_audio_response(
    response,
    request_model: str,
    pricing_info: Dict,
    server_port: int,
    server_address: str,
    environment: str,
    application_name: str,
    metrics: Any,
    start_time: float,
    span: trace.Span,
    capture_message_content: bool,
    disable_metrics: bool,
    version: str,
    **kwargs,
):
    """
    Process audio generation response and set span attributes.
    """
    if not span.is_recording():
        return response
    
    end_time = time.time()
    duration = end_time - start_time
    
    span.set_attribute(SemanticConventions.GEN_AI_CLIENT_OPERATION_DURATION, duration)
    
    # Convert response to dict for easier access (if needed in future)
    # response_dict = response_to_dict(response)
    
    span.set_status(trace.Status(trace.StatusCode.OK))
    return response


# Wrapper factory functions for each OpenAI endpoint

def chat_completions(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI chat completions.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_CHAT,
        process_response_func=process_chat_response,
        default_model="gpt-4o",
    )


def responses(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI responses API.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_CHAT,
        process_response_func=process_chat_response,
        default_model="gpt-4o",
    )


def chat_completions_parse(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI chat completions parse.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_CHAT,
        process_response_func=process_chat_response,
        default_model="gpt-4o",
    )


def embedding(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI embeddings.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_EMBEDDING,
        process_response_func=process_embedding_response,
        default_model="text-embedding-ada-002",
    )


def image_generate(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI image generation.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_IMAGE,
        process_response_func=process_image_response,
        default_model="dall-e-2",
    )


def image_variatons(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI image variations.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_IMAGE,
        process_response_func=process_image_response,
        default_model="dall-e-2",
    )


def audio_create(config: Dict[str, Any]) -> Callable:
    """
    Generates a telemetry wrapper for OpenAI audio creation.
    """
    return create_wrapper(
        config=config,
        operation_type=SemanticConventions.GEN_AI_OPERATION_TYPE_AUDIO,
        process_response_func=process_audio_response,
        default_model="tts-1",
    )
