"""
Anchor SDK - Zero-code observability for LLM applications.
"""

from typing import Optional
from opentelemetry import trace as trace_api
from opentelemetry.trace import SpanKind, Span, StatusCode, Status

from anchor.otel.tracer import setup_tracing
from anchor.otel.propagators import setup_propagators
from anchor.instrument_mapper import get_instrumentor


def init(
    application_name: Optional[str] = None,
    environment: Optional[str] = None,
    otlp_endpoint: Optional[str] = None,
    otlp_headers: Optional[dict] = None,
    instrumentations: Optional[list[str]] = None,
    disable_batch: bool = False,
    **kwargs,
) -> Optional[trace_api.Tracer]:
    """
    Initialize Anchor SDK with tracing and instrumentations.
    """
    
    # Set up OpenTelemetry tracing
    tracer = setup_tracing(
        application_name=application_name,
        environment=environment,
        otlp_endpoint=otlp_endpoint,
        otlp_headers=otlp_headers,
        disable_batch=disable_batch,
    )
    
    if tracer is None:
        return None
    
    # Set up context propagators for distributed tracing
    setup_propagators()
    
    # Instrument specified libraries
    if instrumentations is None:
        instrumentations = ["openai"]  # Default to OpenAI
    
    for instrumentation_name in instrumentations:
        try:
            InstrumentorClass = get_instrumentor(instrumentation_name)
            instrumentor = InstrumentorClass(
                tracer=tracer,
                environment=environment,
                application_name=application_name,
            )
            instrumentor.instrument()
        except Exception as e:
            # Log error but continue with other instrumentations
            print(f"Warning: Failed to instrument {instrumentation_name}: {e}")
    
    return tracer

