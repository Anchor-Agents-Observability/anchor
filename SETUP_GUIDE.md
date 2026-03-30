# Anchor SDK Setup Guide

## Quick Start Checklist

### Step 1: Start Docker Services

```bash
cd /path/to/anchor
docker-compose up -d
```

**Verify services are running:**
```bash
docker-compose ps
# Should show: clickhouse, otel-collector, grafana all "Up"
```

**Check service health:**
```bash
# ClickHouse
curl http://localhost:8123/ping
# Should return: Ok.

# OTLP Collector
curl http://localhost:13133
# Should return: {"Status":"OK",...}

# Grafana
curl http://localhost:3000/api/health
# Should return: {"commit":"...","database":"ok",...}
```

---

### Step 2: Set Up Environment Variables

Create or update your `.env` file in the project root:

```bash
# OpenAI API Key (required for OpenAI testing)
OPENAI_API_KEY=your_openai_api_key_here

# OTLP Endpoint — base URL only, SDK appends /v1/traces automatically
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

---

### Step 3: Install the SDK

```bash
# From the project root
pip install -e ".[all]"

# Or install dependencies manually
pip install -r requirements.txt
pip install openai anthropic python-dotenv
```

---

### Step 4: Run Your First Test

```bash
python src/tests/openai_test.py
```

**What to expect:**
- Test makes OpenAI API call
- Traces are automatically captured
- Traces sent to OTLP Collector
- Data stored in ClickHouse

**If you see errors:**
- **"OPENAI_API_KEY not set"** — Add your API key to `.env`
- **Connection errors** — Make sure Docker services are running
- **API quota errors** — That's okay! Instrumentation still works

---

### Step 5: Verify Data in ClickHouse

```bash
docker exec -it clickhouse clickhouse-client

# Then run:
USE default;
SHOW TABLES;
# Should show: otel_traces, otel_logs, otel_metrics

SELECT count() FROM otel_traces;
SELECT * FROM otel_traces ORDER BY Timestamp DESC LIMIT 5;
```

---

### Step 6: Access Grafana Dashboards

1. Open Grafana: [http://localhost:3000](http://localhost:3000)
   - Username: `admin`
   - Password: `admin`

2. The **Anchor SDK - LLM Traces** dashboard is pre-provisioned.
   Navigate to Dashboards to find it.

3. Verify the ClickHouse datasource:
   - Go to Configuration → Data Sources → ClickHouse → Test
   - Should show: "Data source is working"

---

## Run Unit Tests

```bash
pip install -e ".[dev]"
pytest src/tests/ -v
```

---

## Troubleshooting

### Services won't start
```bash
docker-compose logs clickhouse
docker-compose logs otel-collector
docker-compose logs grafana

docker-compose restart
```

### No traces in ClickHouse
1. Check collector logs: `docker logs otel-collector -f`
2. Verify test ran successfully
3. Check if tables exist: `SHOW TABLES FROM default;`
4. Verify OTLP endpoint: should be `http://localhost:4318` (base URL, no `/v1/traces`)

### Port conflicts
Default ports:
- ClickHouse: 8123, 9000
- OTLP Collector: 4317, 4318
- Grafana: 3000

Edit `docker-compose.yaml` to change ports.

---

## Next Steps

1. **Build more dashboards** in Grafana
2. **Add Anthropic** instrumentation: `anchor.init(instrumentations=["openai", "anthropic"])`
3. **Production setup**: add auth to Grafana, configure data retention, set up alerts
