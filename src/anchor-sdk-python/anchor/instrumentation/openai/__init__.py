"""
initialize auto-instrumentation for open ai 
"""

from typing import Collection
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor

from anchor.instrumentation.openai.openai import ()

from anchor.instrumentation.openai.openai import (
    chat_completions,
    embedding,
    responses,
    chat_completions_parse,
    image_generate,
    image_variatons,
    audio_create,
)
from anchor.instrumentation.openai.async_openai import (
    async_chat_completions,
    async_embedding,
    async_chat_completions_parse,
    async_image_generate,
    async_image_variations,
    async_audio_create,
    async_responses,
)

class openaiInstrumentor(BaseInstrumentor):

    
    pass