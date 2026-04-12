"""
Auto-instrumentation for the Anthropic Python client (sync + async).
"""

from typing import Collection, Optional, Any
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry import trace
from wrapt import wrap_function_wrapper

from ward.instrumentation.anthropic.anthropic import (
    messages_create,
    async_messages_create,
)


class anthropicInstrumentor(BaseInstrumentor):
    """Instrumentor for the Anthropic Python client."""

    def __init__(
        self,
        tracer: Optional[trace.Tracer] = None,
        pricing_info: Optional[dict] = None,
        environment: Optional[str] = None,
        application_name: Optional[str] = None,
        metrics: Optional[Any] = None,
        capture_message_content: bool = True,
        disable_metrics: bool = False,
        version: str = "unknown",
    ):
        super().__init__()
        self._tracer = tracer or trace.get_tracer(__name__)
        self._config = {
            "tracer": self._tracer,
            "pricing_info": pricing_info or {},
            "environment": environment,
            "application_name": application_name,
            "metrics": metrics,
            "capture_message_content": capture_message_content,
            "disable_metrics": disable_metrics,
            "version": version,
        }

    def instrument(self, **kwargs):
        self._instrument_sync()
        self._instrument_async()

    def _instrument_sync(self):
        try:
            from anthropic.resources.messages import Messages

            if hasattr(Messages, "create"):
                wrap_function_wrapper(Messages, "create", messages_create(self._config))
        except ImportError as e:
            print(f"Warning: Anthropic not installed or incompatible version: {e}")
            raise
        except Exception as e:
            print(f"Warning: Failed to instrument anthropic (sync): {e}")

    def _instrument_async(self):
        try:
            from anthropic.resources.messages import AsyncMessages

            if hasattr(AsyncMessages, "create"):
                wrap_function_wrapper(AsyncMessages, "create", async_messages_create(self._config))
        except ImportError:
            pass
        except Exception as e:
            print(f"Warning: Failed to instrument anthropic (async): {e}")

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["anthropic >= 0.18.0"]

    def _uninstrument(self, **kwargs):
        pass
