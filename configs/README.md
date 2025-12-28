# Configuration Files

## Files Overview

- `otel-collector-config.yaml` - OTLP Collector configuration
- `clickhouse-config.xml` - ClickHouse server configuration

## Quick Start

### 1. Start Services

```bash
docker-compose up -d
```

### 2. Verify Services

**Check ClickHouse:**
```bash
# Test HTTP interface
curl http://localhost:8123/ping
# Should return: Ok.

# Or check logs
docker logs clickhouse
```

**Check OTLP Collector:**
```bash
# Check health endpoint
curl http://localhost:13133
# Or check logs
docker logs otel-collector
```

### 3. Configure Your SDK

Point your SDK to the collector:

```python
import anchor

anchor.init(
    application_name="my-app",
    otlp_endpoint="http://localhost:4318/v1/traces"  # HTTP
    # or
    # otlp_endpoint="http://localhost:4317"  # gRPC
)
```

### 4. Verify Data Flow

**Check if traces are being received:**
```bash
docker logs otel-collector -f
```

**Query ClickHouse to see traces:**
```bash
# Connect to ClickHouse
docker exec -it clickhouse clickhouse-client

# Then run:
USE otel;
SELECT count() FROM otel_traces;
```

## Environment Variables

The OTLP Collector uses these environment variables (set in docker-compose.yaml):

- `CLICKHOUSE_HOST=clickhouse` - ClickHouse service name
- `CLICKHOUSE_DATABASE=otel` - Database name
- `CLICKHOUSE_USERNAME=default` - Username
- `CLICKHOUSE_PASSWORD=` - Password (empty for default user)

## ClickHouse Access

**HTTP Interface:**
- URL: `http://localhost:8123`
- Use for SQL queries via HTTP

**Native Protocol:**
- Port: `9000`
- Used by OTLP Collector

**Command Line Client:**
```bash
docker exec -it clickhouse clickhouse-client
```

## Troubleshooting

**Collector can't connect to ClickHouse:**
- Check ClickHouse is healthy: `docker ps | grep clickhouse`
- Check logs: `docker logs clickhouse`
- Verify environment variables match

**No traces in ClickHouse:**
- Check collector logs: `docker logs otel-collector`
- Verify tables exist: `SHOW TABLES FROM otel;`
- Check if data is being received: Look for "Received" messages in collector logs

**Tables not created:**
- The OTLP exporter should auto-create tables
- If not, check ClickHouse logs for errors
- You can manually create tables if needed

## Next Steps

1. ✅ Services are running
2. ✅ SDK is configured
3. ✅ Make some API calls
4. ✅ Query ClickHouse to see your traces!
