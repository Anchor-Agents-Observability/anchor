"""
Initialize auto-instrumentation for OpenAI.
"""

from typing import Collection, Optional, Any
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry import trace
from wrapt import wrap_function_wrapper

from anchor.instrumentation.openai.openai import (
    chat_completions,
    embedding,
    responses,
    chat_completions_parse,
    image_generate,
    image_variatons,
    audio_create,
)


class openaiInstrumentor(BaseInstrumentor):
    """
    Instrumentor for OpenAI client.
    """

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
        """
        Initialize the OpenAI instrumentor.
        
        Args:
            tracer: OpenTelemetry tracer instance
            pricing_info: Pricing information for cost calculation
            environment: Environment name
            application_name: Application name
            metrics: Metrics handler
            capture_message_content: Whether to capture message content
            disable_metrics: Whether to disable metrics
            version: SDK version
        """

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
        """
        Instrument OpenAI client methods.
        """

        # where, what, how
        # string, string, wrap_fn
        wrap_function_wrapper("openai.resources.chat.Completions", "create", chat_completions(self._config))
        wrap_function_wrapper("openai.resources.chat.Completions", "create_parse", chat_completions_parse(self._config))
        wrap_function_wrapper("openai.resources.responses", "responses", responses(self._config))
        wrap_function_wrapper("openai.resources.embeddings.Embeddings", "create", embedding(self._config))
        wrap_function_wrapper("openai.resources.images.Images", "create", image_generate(self._config))
        wrap_function_wrapper("openai.resources.images.Images", "create_variation", image_variatons(self._config))
        wrap_function_wrapper("openai.resources.audio.speech.Speech", "create", audio_create(self._config))

    def instrumentation_dependencies(self) -> Collection[str]:
        """
        Return a list of package names that this instrumentor depends on.
        """
        return ["openai >= 1.92.0"]

   