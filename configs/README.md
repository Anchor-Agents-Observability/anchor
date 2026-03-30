# Configuration Files

## Files Overview

- `otel-collector-config.yaml` - OTLP Collector configuration
- `clickhouse-config.xml` - ClickHouse server configuration
- `grafana/` - Grafana provisioning (datasources + dashboards)

## Quick Start

### 1. Start Services

```bash
docker-compose up -d
```

### 2. Verify Services

**Check ClickHouse:**
```bash
curl http://localhost:8123/ping
# Should return: Ok.
```

**Check OTLP Collector:**
```bash
curl http://localhost:13133
```

### 3. Configure Your SDK

Point your SDK to the collector. Use the **base URL only** — the OTLP HTTP exporter
appends `/v1/traces` automatically:

```python
import anchor

anchor.init(
    application_name="my-app",
    otlp_endpoint="http://localhost:4318"  # base URL, no /v1/traces
)
```

For gRPC, set the environment variable:
```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```
Then use port 4317:
```python
anchor.init(otlp_endpoint="http://localhost:4317")
```

### 4. Verify Data Flow

```bash
# Watch collector logs
docker logs otel-collector -f

# Query ClickHouse
docker exec -it clickhouse clickhouse-client
# USE default; SELECT count() FROM otel_traces;
```

## Environment Variables

The OTLP Collector uses these (set in docker-compose.yaml):

- `CLICKHOUSE_HOST=clickhouse`
- `CLICKHOUSE_DATABASE=default`
- `CLICKHOUSE_USERNAME=otel`
- `CLICKHOUSE_PASSWORD=otelpass`

## Troubleshooting

**Collector can't connect to ClickHouse:**
- Check ClickHouse is healthy: `docker ps | grep clickhouse`
- Check logs: `docker logs clickhouse`

**No traces in ClickHouse:**
- Check collector logs: `docker logs otel-collector`
- Verify tables exist: `SHOW TABLES FROM default;`

**Tables not created:**
- The OTLP exporter auto-creates tables on first write
- Check ClickHouse logs for errors
