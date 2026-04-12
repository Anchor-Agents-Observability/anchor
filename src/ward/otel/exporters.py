"""
Standalone exporter/processor factories.

Not used by ward.init() (which wires everything in tracer.py), but available
for advanced users who want to compose their own TracerProvider.
"""

import os
from typing import Optional
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    SimpleSpanProcessor,
    ConsoleSpanExporter,
)

if os.environ.get("OTEL_EXPORTER_OTLP_PROTOCOL") == "grpc":
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
else:
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


def create_otlp_exporter(endpoint: Optional[str] = None, headers: Optional[dict] = None) -> OTLPSpanExporter:
    """Create an OTLP exporter, optionally overriding endpoint/headers via env."""
    if endpoint:
        os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = endpoint
    if headers:
        headers_str = ",".join(f"{k}={v}" for k, v in headers.items()) if isinstance(headers, dict) else headers
        os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = headers_str
    return OTLPSpanExporter()


def create_console_exporter() -> ConsoleSpanExporter:
    """Create a console exporter that prints spans to stdout."""
    return ConsoleSpanExporter()


def create_span_processor(exporter, use_batch: bool = True):
    """Wrap an exporter in a Batch or Simple processor."""
    return BatchSpanProcessor(exporter) if use_batch else SimpleSpanProcessor(exporter)

