"""
Auto-instrumentation for OpenAI (sync + async).
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
    async_chat_completions,
    async_embedding,
    async_image_generate,
    async_audio_create,
)


class openaiInstrumentor(BaseInstrumentor):
    """Instrumentor for the OpenAI Python client (sync and async)."""

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
        """Instrument both sync and async OpenAI client methods."""
        self._instrument_sync()
        self._instrument_async()

    def _instrument_sync(self):
        try:
            from openai.resources.chat.completions import Completions
            from openai.resources.embeddings import Embeddings
            from openai.resources.images import Images
            from openai.resources.audio.speech import Speech

            if hasattr(Completions, "create"):
                wrap_function_wrapper(Completions, "create", chat_completions(self._config))
            if hasattr(Completions, "create_parse"):
                wrap_function_wrapper(Completions, "create_parse", chat_completions_parse(self._config))
            if hasattr(Embeddings, "create"):
                wrap_function_wrapper(Embeddings, "create", embedding(self._config))
            if hasattr(Images, "create"):
                wrap_function_wrapper(Images, "create", image_generate(self._config))
            if hasattr(Images, "create_variation"):
                wrap_function_wrapper(Images, "create_variation", image_variatons(self._config))
            if hasattr(Speech, "create"):
                wrap_function_wrapper(Speech, "create", audio_create(self._config))

        except ImportError as e:
            print(f"Warning: OpenAI not installed or incompatible version: {e}")
            raise
        except Exception as e:
            print(f"Warning: Failed to instrument openai (sync): {e}")

    def _instrument_async(self):
        # Async classes may not exist in older openai versions — safe to skip
        try:
            from openai.resources.chat.completions import AsyncCompletions
            from openai.resources.embeddings import AsyncEmbeddings
            from openai.resources.images import AsyncImages
            from openai.resources.audio.speech import AsyncSpeech

            if hasattr(AsyncCompletions, "create"):
                wrap_function_wrapper(AsyncCompletions, "create", async_chat_completions(self._config))
            if hasattr(AsyncEmbeddings, "create"):
                wrap_function_wrapper(AsyncEmbeddings, "create", async_embedding(self._config))
            if hasattr(AsyncImages, "create"):
                wrap_function_wrapper(AsyncImages, "create", async_image_generate(self._config))
            if hasattr(AsyncSpeech, "create"):
                wrap_function_wrapper(AsyncSpeech, "create", async_audio_create(self._config))

        except ImportError:
            pass
        except Exception as e:
            print(f"Warning: Failed to instrument openai (async): {e}")

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["openai >= 1.0.0"]

    def _uninstrument(self, **kwargs):
        pass
