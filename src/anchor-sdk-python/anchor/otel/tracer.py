"""
Sets up OpenTelemetry tracer for Anchor SDK.
"""

import os
from typing import Optional
from opentelemetry import trace
from opentelemetry.sdk.resources import (
    SERVICE_NAME,
    TELEMETRY_SDK_NAME,
    DEPLOYMENT_ENVIRONMENT,
    Resource,
)
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, SimpleSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

# Determine OTLP exporter based on protocol
if os.environ.get("OTEL_EXPORTER_OTLP_PROTOCOL") == "grpc":
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
else:
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

# Global flag to check if the tracer provider initialization is complete.
_TRACER_SET = False


def setup_tracing(
    application_name: Optional[str] = None,
    environment: Optional[str] = None,
    tracer: Optional[trace.Tracer] = None,
    otlp_endpoint: Optional[str] = None,
    otlp_headers: Optional[dict] = None,
    disable_batch: bool = False,
) -> Optional[trace.Tracer]:
    """
    Sets up tracing with OpenTelemetry for Anchor SDK.
    
    Initializes the tracer provider and configures the span processor and exporter.
    
    Args:
        application_name: Name of the application/service being instrumented
        environment: Deployment environment (e.g., "production", "staging", "development")
        tracer: Optional external tracer to use instead of creating a new one
        otlp_endpoint: OTLP endpoint URL for exporting traces
        otlp_headers: Optional headers dict for OTLP exporter authentication
        disable_batch: If True, use SimpleSpanProcessor instead of BatchSpanProcessor
        
    Returns:
        Configured OpenTelemetry tracer, or None if setup fails
    """
    # If an external tracer is provided, return it immediately.
    if tracer is not None:
        return tracer

    # Proceed with setting up a new tracer or configuration only if _TRACER_SET is False.
    global _TRACER_SET

    try:
        # Disable other auto-tracing frameworks that might conflict
        os.environ["HAYSTACK_AUTO_TRACE_ENABLED"] = "false"

        if not _TRACER_SET:
            # Create a resource with service attributes
            resource_attributes = {
                TELEMETRY_SDK_NAME: "anchor",
            }
            
            if application_name:
                resource_attributes[SERVICE_NAME] = application_name
            
            if environment:
                resource_attributes[DEPLOYMENT_ENVIRONMENT] = environment

            resource = Resource.create(attributes=resource_attributes)

            # Initialize the TracerProvider with the created resource.
            trace.set_tracer_provider(TracerProvider(resource=resource))

            # Set environment variables for OTLP exporter if provided
            if otlp_endpoint is not None:
                os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = otlp_endpoint

            if otlp_headers is not None:
                if isinstance(otlp_headers, dict):
                    headers_str = ",".join(
                        f"{key}={value}" for key, value in otlp_headers.items()
                    )
                else:
                    headers_str = otlp_headers

                os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = headers_str

            # Configure the span exporter and processor
            if os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT"):
                span_exporter = OTLPSpanExporter()
                span_processor = (
                    BatchSpanProcessor(span_exporter)
                    if not disable_batch
                    else SimpleSpanProcessor(span_exporter)
                )
            else:
                # Default to console exporter if no OTLP endpoint is configured
                span_exporter = ConsoleSpanExporter()
                span_processor = SimpleSpanProcessor(span_exporter)

            trace.get_tracer_provider().add_span_processor(span_processor)

            _TRACER_SET = True

        return trace.get_tracer(__name__)

    except Exception:
        # Return None if setup fails to allow graceful degradation
        return None


def get_tracer(name: Optional[str] = None) -> trace.Tracer:
    """
    Get an OpenTelemetry tracer instance.
    
    Args:
        name: Optional name for the tracer (defaults to module name)
        
    Returns:
        OpenTelemetry tracer instance
    """
    return trace.get_tracer(name or __name__)

