# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anchor SDK is a zero-code observability library for LLM applications. It auto-instruments LLM client libraries (OpenAI, Anthropic) using OpenTelemetry, providing full tracing, token tracking, latency metrics, and cost visibility.

**One-liner**: "Zero-code observability for LLM applications."

**Target user**: Developers building AI-powered applications who need production visibility into their LLM calls.

## Tech Stack

- **Language**: Python 3.9+
- **Instrumentation**: OpenTelemetry SDK + wrapt monkey-patching
- **Trace Export**: OTLP (HTTP/gRPC) → ClickHouse via OTel Collector
- **Visualization**: Grafana with ClickHouse datasource
- **Infrastructure**: Docker Compose (ClickHouse + OTel Collector + Grafana)
- **Packaging**: setuptools via pyproject.toml, published as `anchor-sdk`

## Architecture

### How It Works
1. User calls `anchor.init()` which sets up OTel tracing
2. SDK wraps LLM client methods (chat, embeddings, images, audio) via wrapt
3. Each LLM call creates an OTel span with GenAI semantic convention attributes
4. Spans are exported via OTLP to a collector, then stored in ClickHouse
5. Grafana dashboards visualize traces, tokens, latency, and costs

### Key Directories
- `src/anchor/` — Core SDK: init, tracer setup, conventions, pricing, instrument mapper
- `src/anchor/otel/` — OpenTelemetry tracer, exporters, propagators
- `src/anchor/instrumentation/openai/` — OpenAI auto-instrumentation (sync + async + streaming)
- `src/anchor/instrumentation/anthropic/` — Anthropic auto-instrumentation (sync + async + streaming)
- `src/tests/` — Unit tests (mocked) and integration tests
- `configs/` — Docker service configs (OTel Collector, ClickHouse, Grafana provisioning)

## Build & Validation Commands

```bash
# Install in dev mode
pip install -e ".[dev]"

# Run unit tests
pytest src/tests/ -v

# Run integration test (needs OPENAI_API_KEY)
python src/tests/openai_test.py

# Start observability stack
docker-compose up -d
```

## Key Files

- `src/anchor/__init__.py` — `anchor.init()` entry point
- `src/anchor/otel/tracer.py` — OTel TracerProvider setup
- `src/anchor/instrumentation/openai/openai.py` — OpenAI wrappers + stream wrappers
- `src/anchor/instrumentation/anthropic/anthropic.py` — Anthropic wrappers + stream wrappers
- `src/anchor/instrument_mapper.py` — Maps provider names to instrumentor classes
- `src/anchor/conventions/__init__.py` — GenAI semantic convention constants
- `src/anchor/pricing.py` — Per-model cost calculation
- `pyproject.toml` — Package metadata and dependencies
- `docker-compose.yaml` — Local observability stack

## Common Tasks

- **Add new LLM provider**: Create module in `src/anchor/instrumentation/<provider>/`, register in `instrument_mapper.py`, add pricing in `pricing.py`
- **Add span attributes**: Use constants from `conventions/__init__.py`
- **Update pricing**: Edit `src/anchor/pricing.py` dictionaries
- **Add Grafana panel**: Edit `configs/grafana/provisioning/dashboards/json/llm-traces.json`

## Patterns

- All instrumentation follows the wrapt `(wrapped, instance, args, kwargs)` signature
- Streaming responses return `StreamWrapper`/`AsyncStreamWrapper` that finalize spans on iteration end
- Non-streaming responses process spans inline and call `span.end()` before returning
- Cost is calculated lazily via `anchor.pricing.calculate_cost()` inside response processors
