"""
OpenTelemetry TracerProvider bootstrap for Ward SDK.

Configures the global TracerProvider once, choosing between OTLP and console
export based on whether an endpoint is provided.
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

# Protocol-aware import — must happen at module load so the exporter class is ready
if os.environ.get("OTEL_EXPORTER_OTLP_PROTOCOL") == "grpc":
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
else:
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

_TRACER_SET = False  # ensures TracerProvider is configured at most once


def setup_tracing(
    application_name: Optional[str] = None,
    environment: Optional[str] = None,
    tracer: Optional[trace.Tracer] = None,
    otlp_endpoint: Optional[str] = None,
    otlp_headers: Optional[dict] = None,
    disable_batch: bool = False,
) -> Optional[trace.Tracer]:
    """
    Bootstrap the OTel TracerProvider and return a tracer.

    Pass an existing ``tracer`` to skip setup entirely (useful for testing).
    If no OTLP endpoint is provided, falls back to ConsoleSpanExporter so
    spans are still visible during local development.
    """
    if tracer is not None:
        return tracer

    global _TRACER_SET

    try:
        # Prevent Haystack's auto-tracer from conflicting
        os.environ["HAYSTACK_AUTO_TRACE_ENABLED"] = "false"

        if not _TRACER_SET:
            resource_attributes = {TELEMETRY_SDK_NAME: "ward"}
            if application_name:
                resource_attributes[SERVICE_NAME] = application_name
            if environment:
                resource_attributes[DEPLOYMENT_ENVIRONMENT] = environment

            resource = Resource.create(attributes=resource_attributes)
            trace.set_tracer_provider(TracerProvider(resource=resource))

            # Forward caller-supplied endpoint/headers into env for OTLPSpanExporter
            if otlp_endpoint is not None:
                os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = otlp_endpoint
            if otlp_headers is not None:
                if isinstance(otlp_headers, dict):
                    headers_str = ",".join(f"{k}={v}" for k, v in otlp_headers.items())
                else:
                    headers_str = otlp_headers
                os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = headers_str

            if os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT"):
                exporter = OTLPSpanExporter()
                processor = BatchSpanProcessor(exporter) if not disable_batch else SimpleSpanProcessor(exporter)
            else:
                # No endpoint → print spans to stdout (useful for debugging)
                processor = SimpleSpanProcessor(ConsoleSpanExporter())

            trace.get_tracer_provider().add_span_processor(processor)
            _TRACER_SET = True

        return trace.get_tracer(__name__)

    except Exception:
        return None


def get_tracer(name: Optional[str] = None) -> trace.Tracer:
    """Convenience accessor for a named tracer (defaults to this module)."""
    return trace.get_tracer(name or __name__)
