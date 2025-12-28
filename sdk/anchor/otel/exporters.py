"""
OpenTelemetry exporters configuration for Anchor SDK.
"""

import os
from typing import Optional
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    SimpleSpanProcessor,
    ConsoleSpanExporter,
)

# Determine OTLP exporter based on protocol
if os.environ.get("OTEL_EXPORTER_OTLP_PROTOCOL") == "grpc":
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
else:
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


def create_otlp_exporter(
    endpoint: Optional[str] = None,
    headers: Optional[dict] = None,
) -> OTLPSpanExporter:
    """
    Create an OTLP span exporter.
    
    Args:
        endpoint: OTLP endpoint URL (if None, uses OTEL_EXPORTER_OTLP_ENDPOINT env var)
        headers: Optional headers dict for authentication
        
    Returns:
        Configured OTLPSpanExporter instance
    """
    if endpoint:
        os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = endpoint
    
    if headers:
        if isinstance(headers, dict):
            headers_str = ",".join(
                f"{key}={value}" for key, value in headers.items()
            )
        else:
            headers_str = headers
        os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = headers_str
    
    return OTLPSpanExporter()


def create_console_exporter() -> ConsoleSpanExporter:
    """
    Create a console span exporter for debugging.
    
    Returns:
        ConsoleSpanExporter instance
    """
    return ConsoleSpanExporter()


def create_span_processor(
    exporter,
    use_batch: bool = True,
) -> BatchSpanProcessor | SimpleSpanProcessor:
    """
    Create a span processor with the given exporter.
    
    Args:
        exporter: Span exporter instance
        use_batch: If True, use BatchSpanProcessor; otherwise use SimpleSpanProcessor
        
    Returns:
        Span processor instance
    """
    if use_batch:
        return BatchSpanProcessor(exporter)
    else:
        return SimpleSpanProcessor(exporter)

