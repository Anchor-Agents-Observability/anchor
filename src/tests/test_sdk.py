"""
Unit tests for Anchor SDK.
Uses mocked LLM responses and in-memory span exporter.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, AsyncMock

import pytest
from opentelemetry.trace import StatusCode

src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from anchor.pricing import calculate_cost


# ---------------------------------------------------------------------------
# Pricing tests
# ---------------------------------------------------------------------------


class TestPricing:
    def test_known_openai_model(self):
        cost = calculate_cost("gpt-4o", input_tokens=1000, output_tokens=500, provider="openai")
        assert cost is not None
        assert cost > 0

    def test_known_anthropic_model(self):
        cost = calculate_cost("claude-sonnet-4-20250514", input_tokens=1000, output_tokens=500, provider="anthropic")
        assert cost is not None
        assert cost > 0

    def test_unknown_model_returns_none(self):
        cost = calculate_cost("nonexistent-model", 100, 100)
        assert cost is None

    def test_zero_tokens(self):
        cost = calculate_cost("gpt-4o", 0, 0)
        assert cost == 0.0


# ---------------------------------------------------------------------------
# OpenAI sync non-streaming
# ---------------------------------------------------------------------------


class TestOpenAISyncNonStreaming:
    def _make_mock_response(self):
        resp = MagicMock()
        resp.model_dump.return_value = {
            "id": "chatcmpl-test123",
            "model": "gpt-4o",
            "system_fingerprint": "fp_abc",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": "Hello!"},
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 5,
                "total_tokens": 15,
            },
        }
        return resp

    def test_chat_completion_creates_span(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        mock_response = self._make_mock_response()

        wrapped = MagicMock(return_value=mock_response)
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        result = wrapper_fn(
            wrapped,
            instance,
            (),
            {"model": "gpt-4o", "messages": [{"role": "user", "content": "Hi"}]},
        )

        assert result == mock_response
        wrapped.assert_called_once()

        spans = span_exporter.get_finished_spans()
        assert len(spans) == 1

        span = spans[0]
        assert "chat" in span.name
        assert span.status.status_code == StatusCode.OK
        assert span.attributes["gen_ai.system"] == "openai"
        assert span.attributes["gen_ai.request.model"] == "gpt-4o"
        assert span.attributes["gen_ai.usage.input_tokens"] == 10
        assert span.attributes["gen_ai.usage.output_tokens"] == 5
        assert span.attributes["gen_ai.response.model"] == "gpt-4o"
        assert span.attributes["gen_ai.response.finish_reasons"] == "stop"

    def test_captures_message_content(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        mock_response = self._make_mock_response()
        wrapped = MagicMock(return_value=mock_response)
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        wrapper_fn(
            wrapped,
            instance,
            (),
            {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": "You are helpful."},
                    {"role": "user", "content": "Hi"},
                ],
            },
        )

        spans = span_exporter.get_finished_spans()
        span = spans[0]
        assert span.attributes["gen_ai.system.message.0"] == "You are helpful."
        assert span.attributes["gen_ai.user.message.1"] == "Hi"
        assert span.attributes["gen_ai.assistant.message.0"] == "Hello!"

    def test_disables_content_capture(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": False,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        mock_response = self._make_mock_response()
        wrapped = MagicMock(return_value=mock_response)
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        wrapper_fn(
            wrapped,
            instance,
            (),
            {"model": "gpt-4o", "messages": [{"role": "user", "content": "secret"}]},
        )

        spans = span_exporter.get_finished_spans()
        span = spans[0]
        assert "gen_ai.user.message.0" not in span.attributes

    def test_exception_records_error(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        wrapped = MagicMock(side_effect=RuntimeError("API down"))
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        with pytest.raises(RuntimeError, match="API down"):
            wrapper_fn(wrapped, instance, (), {"model": "gpt-4o", "messages": []})

        spans = span_exporter.get_finished_spans()
        assert len(spans) == 1
        assert spans[0].status.status_code == StatusCode.ERROR


# ---------------------------------------------------------------------------
# OpenAI sync streaming
# ---------------------------------------------------------------------------


class TestOpenAISyncStreaming:
    def _make_stream_chunks(self):
        chunks = []
        for i, text in enumerate(["Hello", " world", "!"]):
            chunk = MagicMock()
            chunk.model_dump.return_value = {
                "id": "chatcmpl-stream",
                "model": "gpt-4o",
                "choices": [
                    {
                        "index": 0,
                        "delta": {"content": text},
                        "finish_reason": None,
                    }
                ],
            }
            chunks.append(chunk)

        final = MagicMock()
        final.model_dump.return_value = {
            "id": "chatcmpl-stream",
            "model": "gpt-4o",
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 8, "completion_tokens": 3, "total_tokens": 11},
        }
        chunks.append(final)
        return chunks

    def test_streaming_captures_tokens(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        chunks = self._make_stream_chunks()
        wrapped = MagicMock(return_value=iter(chunks))
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        stream = wrapper_fn(
            wrapped,
            instance,
            (),
            {"model": "gpt-4o", "messages": [{"role": "user", "content": "Hi"}], "stream": True},
        )

        collected = list(stream)
        assert len(collected) == 4

        spans = span_exporter.get_finished_spans()
        assert len(spans) == 1
        span = spans[0]
        assert span.attributes["gen_ai.request.is_stream"] is True
        assert span.attributes["gen_ai.usage.input_tokens"] == 8
        assert span.attributes["gen_ai.usage.output_tokens"] == 3
        assert span.attributes["gen_ai.response.finish_reasons"] == "stop"
        assert span.attributes["gen_ai.assistant.message.0"] == "Hello world!"

    def test_streaming_injects_usage_option(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = chat_completions(config)
        chunks = self._make_stream_chunks()
        wrapped = MagicMock(return_value=iter(chunks))
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        stream = wrapper_fn(
            wrapped,
            instance,
            (),
            {"model": "gpt-4o", "messages": [], "stream": True},
        )
        list(stream)

        call_kwargs = wrapped.call_args[1]
        assert call_kwargs.get("stream_options", {}).get("include_usage") is True


# ---------------------------------------------------------------------------
# OpenAI async non-streaming
# ---------------------------------------------------------------------------


class TestOpenAIAsyncNonStreaming:
    @pytest.mark.asyncio
    async def test_async_chat_creates_span(self, tracer, span_exporter):
        from anchor.instrumentation.openai.openai import async_chat_completions

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "environment": "test",
            "application_name": "test-app",
            "metrics": None,
            "capture_message_content": True,
            "disable_metrics": False,
            "version": "0.1.0",
        }

        wrapper_fn = async_chat_completions(config)

        mock_response = MagicMock()
        mock_response.model_dump.return_value = {
            "id": "chatcmpl-async",
            "model": "gpt-4o",
            "choices": [
                {"message": {"role": "assistant", "content": "Async hello!"}, "finish_reason": "stop"}
            ],
            "usage": {"prompt_tokens": 5, "completion_tokens": 3, "total_tokens": 8},
        }

        wrapped = AsyncMock(return_value=mock_response)
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.openai.com/v1"

        result = await wrapper_fn(
            wrapped, instance, (), {"model": "gpt-4o", "messages": [{"role": "user", "content": "Hi"}]}
        )

        assert result == mock_response
        spans = span_exporter.get_finished_spans()
        assert len(spans) == 1
        assert spans[0].attributes["gen_ai.usage.input_tokens"] == 5


# ---------------------------------------------------------------------------
# Anthropic sync non-streaming
# ---------------------------------------------------------------------------


class TestAnthropicSync:
    def _make_mock_response(self):
        resp = MagicMock()
        resp.model_dump.return_value = {
            "id": "msg-test123",
            "type": "message",
            "model": "claude-sonnet-4-20250514",
            "content": [{"type": "text", "text": "Hello from Claude!"}],
            "stop_reason": "end_turn",
            "usage": {"input_tokens": 12, "output_tokens": 6},
        }
        return resp

    def test_messages_create_span(self, tracer, span_exporter):
        from anchor.instrumentation.anthropic.anthropic import messages_create

        config = {
            "tracer": tracer,
            "pricing_info": {},
            "capture_message_content": True,
        }

        wrapper_fn = messages_create(config)
        mock_response = self._make_mock_response()
        wrapped = MagicMock(return_value=mock_response)
        instance = MagicMock()
        instance._client = MagicMock()
        instance._client.base_url = "https://api.anthropic.com"

        result = wrapper_fn(
            wrapped,
            instance,
            (),
            {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Hi Claude"}],
            },
        )

        assert result == mock_response
        spans = span_exporter.get_finished_spans()
        assert len(spans) == 1
        span = spans[0]
        assert span.attributes["gen_ai.system"] == "anthropic"
        assert span.attributes["gen_ai.request.model"] == "claude-sonnet-4-20250514"
        assert span.attributes["gen_ai.usage.input_tokens"] == 12
        assert span.attributes["gen_ai.usage.output_tokens"] == 6
        assert span.attributes["gen_ai.response.finish_reasons"] == "end_turn"
        assert span.attributes["gen_ai.assistant.message.0"] == "Hello from Claude!"


# ---------------------------------------------------------------------------
# SDK init
# ---------------------------------------------------------------------------


class TestSDKInit:
    def test_init_returns_tracer(self):
        import anchor

        tracer = anchor.init(
            application_name="test",
            environment="test",
        )
        assert tracer is not None

    def test_init_with_unknown_instrumentation_does_not_crash(self):
        import anchor

        tracer = anchor.init(
            application_name="test",
            environment="test",
            instrumentations=["nonexistent"],
        )
        assert tracer is not None
