# Testing Guide for Anchor SDK

## Quick Fixes for Common Issues

### Issue 1: OTLP Collector Not Running

**Error:** `Connection refused` on port 4318

**Solution:** Start the OTLP Collector

```bash
# Start all services
docker-compose up -d

# Check if collector is running
docker-compose ps

# View collector logs
docker-compose logs otel-collector
```

**OR** - Use console exporter (no collector needed):

```bash
# Don't set OTEL_EXPORTER_OTLP_ENDPOINT
unset OTEL_EXPORTER_OTLP_ENDPOINT

# Run test - will use console exporter
python sdk/tests/openai_test.py
```

### Issue 2: Path Duplication (`/v1/traces/v1/traces`)

**Error:** URL shows `/v1/traces/v1/traces`

**Solution:** Use base URL only (no `/v1/traces`)

```bash
# ✅ CORRECT
export OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:4318"

# ❌ WRONG (causes duplication)
export OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:4318/v1/traces"
```

The test now automatically removes `/v1/traces` if present.

### Issue 3: OpenAI Quota Error (429)

**Error:** `insufficient_quota` or `RateLimitError`

**Solution:** This is expected if your API key has no billing. Options:

1. **Enable billing** on your OpenAI account
2. **Use a different API key** with credits
3. **Test instrumentation only** - the error happens AFTER instrumentation, so spans are still created

The test now handles this gracefully and shows span data even if API call fails.

## Testing Scenarios

### Scenario 1: Test with Console Exporter (No Collector Needed)

```bash
# Don't set OTLP endpoint
unset OTEL_EXPORTER_OTLP_ENDPOINT

# Set API key
export OPENAI_API_KEY="your-key"

# Run test
python sdk/tests/openai_test.py

# Check console output for span data
```

### Scenario 2: Test with OTLP Collector

```bash
# Start collector
docker-compose up -d

# Set endpoint (base URL only!)
export OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:4318"

# Set API key
export OPENAI_API_KEY="your-key"

# Run test
python sdk/tests/openai_test.py

# Check ClickHouse for traces
docker exec -it clickhouse clickhouse-client
# Then: USE otel; SELECT count() FROM otel_traces;
```

### Scenario 3: Test Instrumentation Only (No API Call)

If you want to test instrumentation without making API calls:

```bash
# Disable tracing export
export OTEL_TRACES_EXPORTER=none

# Or use console exporter
unset OTEL_EXPORTER_OTLP_ENDPOINT
```

## Quick Checklist

Before running tests:

- [ ] Docker Desktop is running (if using collector)
- [ ] `OTEL_EXPORTER_OTLP_ENDPOINT` is set correctly (base URL only) OR unset (for console)
- [ ] `OPENAI_API_KEY` is set (or test will skip)
- [ ] OTLP Collector is running (if using OTLP endpoint)

## Troubleshooting

**Collector not starting?**
```bash
docker-compose logs otel-collector
# Check for configuration errors
```

**Still seeing path duplication?**
```bash
# Check your environment variable
echo $OTEL_EXPORTER_OTLP_ENDPOINT

# Should be: http://127.0.0.1:4318
# NOT: http://127.0.0.1:4318/v1/traces
```

**No spans appearing?**
- Check collector logs: `docker-compose logs otel-collector -f`
- Verify instrumentation: Look for "Warning: Failed to instrument" messages
- Check if spans are being created: Look for console output or ClickHouse data

