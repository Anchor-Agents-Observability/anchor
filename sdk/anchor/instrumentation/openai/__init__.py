"""
Initialize auto-instrumentation for OpenAI.
"""

from typing import Collection, Optional, Any
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry import trace
from wrapt import wrap_function_wrapper, wrap_object

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
        
        Wraps methods on the OpenAI client instance when it's created.
        Uses the correct approach: client.chat.completions.create(...)
        """
        try:
            # Import OpenAI to access the classes
            from openai import OpenAI
            from openai.resources.chat.completions import Completions
            from openai.resources.embeddings import Embeddings
            from openai.resources.images import Images
            from openai.resources.audio.speech import Speech
            
            # Wrap the create method on Completions class
            if hasattr(Completions, "create"):
                wrap_function_wrapper(Completions, "create", chat_completions(self._config))
            
            # Wrap create_parse if it exists (newer OpenAI versions)
            if hasattr(Completions, "create_parse"):
                wrap_function_wrapper(Completions, "create_parse", chat_completions_parse(self._config))
            
            # Wrap embeddings
            if hasattr(Embeddings, "create"):
                wrap_function_wrapper(Embeddings, "create", embedding(self._config))
            
            # Wrap images
            if hasattr(Images, "create"):
                wrap_function_wrapper(Images, "create", image_generate(self._config))
            if hasattr(Images, "create_variation"):
                wrap_function_wrapper(Images, "create_variation", image_variatons(self._config))
            
            # Wrap audio/speech
            if hasattr(Speech, "create"):
                wrap_function_wrapper(Speech, "create", audio_create(self._config))
            
        except ImportError as e:
            # If OpenAI is not installed, log warning but don't fail
            print(f"Warning: OpenAI not installed or incompatible version: {e}")
            raise
        except Exception as e:
            # Catch any other errors during instrumentation
            print(f"Warning: Failed to instrument openai: {e}")
            # Don't raise - allow the app to continue without instrumentation

    def instrumentation_dependencies(self) -> Collection[str]:
        """
        Return a list of package names that this instrumentor depends on.
        """
        return ["openai >= 1.92.0"]

    def _uninstrument(self, **kwargs):
        """
        Uninstrument OpenAI client methods.
        """
        pass