"""
OpenTelemetry context propagators configuration for Anchor SDK.
"""

from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.composite import CompositePropagator
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator


def setup_propagators():
    """
    Set up OpenTelemetry context propagators.
    
    Configures composite propagator with:
    - W3C Trace Context (for distributed tracing)
    - W3C Baggage (for context propagation)
    """
    propagator = CompositePropagator([
        TraceContextTextMapPropagator(),
        W3CBaggagePropagator(),
    ])
    
    set_global_textmap(propagator)

