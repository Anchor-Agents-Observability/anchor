# Anchor SDK Examples

## Quick Start

### 1. Simple Example (Console Exporter)

The simplest way to test the SDK - prints traces to console:

```bash
export OPENAI_API_KEY="your-api-key"
python examples/simple_example.py
```

This will:
- Initialize Anchor SDK with console exporter
- Make an OpenAI API call
- Print span data to console

### 2. With OTLP Endpoint

To send traces to an OTLP endpoint (collector, Jaeger, Grafana Cloud, etc.):

```python
import anchor

anchor.init(
    application_name="my-app",
    environment="production",
    otlp_endpoint="http://localhost:4318/v1/traces"  # Your OTLP endpoint
)
```

### 3. Setup with OTLP Collector + Jaeger

See `docker-compose.yaml` for a complete setup with OTLP Collector and Jaeger.

```bash
docker-compose up -d
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
python examples/simple_example.py
```

Then view traces at: http://localhost:16686

