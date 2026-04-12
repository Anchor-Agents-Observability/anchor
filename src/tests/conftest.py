"""
Shared test fixtures for Ward SDK tests.
"""

import sys
import threading
from pathlib import Path
from typing import Sequence

import pytest
from opentelemetry.sdk.trace import TracerProvider, ReadableSpan
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExporter, SpanExportResult

src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


class InMemorySpanExporter(SpanExporter):
    """Captures spans in a list so tests can assert on attributes and status.
    (OTel SDK removed InMemorySpanExporter in newer versions, so we roll our own.)"""

    def __init__(self):
        self._spans = []
        self._lock = threading.Lock()

    def export(self, spans: Sequence[ReadableSpan]) -> SpanExportResult:
        with self._lock:
            self._spans.extend(spans)
        return SpanExportResult.SUCCESS

    def get_finished_spans(self) -> list:
        with self._lock:
            return list(self._spans)

    def clear(self):
        with self._lock:
            self._spans.clear()

    def shutdown(self):
        self.clear()


@pytest.fixture()
def span_exporter():
    """In-memory exporter that captures spans for assertions."""
    return InMemorySpanExporter()


@pytest.fixture()
def tracer(span_exporter):
    """Fresh TracerProvider + tracer wired to the in-memory exporter."""
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(span_exporter))
    return provider.get_tracer("ward-test")
