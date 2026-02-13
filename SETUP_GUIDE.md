# Anchor SDK Setup Guide

## 🎯 Quick Start Checklist

Follow these steps in order to get your observability stack running:

### Step 1: Start Docker Services ✅
```bash
cd /Users/nular/Documents/anchor
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

### Step 2: Set Up Environment Variables 🔑

Create or update your `.env` file in the project root:

```bash
# OpenAI API Key (required for testing)
OPENAI_API_KEY=your_openai_api_key_here

# OTLP Endpoint (for sending traces to collector)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

**Note:** The test script will automatically use `http://localhost:4318` if `OTEL_EXPORTER_OTLP_ENDPOINT` is not set.

---

### Step 3: Install Python Dependencies 📦

```bash
cd /Users/nular/Documents/anchor/src

# Install dependencies
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http openai python-dotenv

# Or if using requirements.txt:
pip install -r tests/requirements.txt
```

**Required packages:**
- `opentelemetry-api` - OpenTelemetry API
- `opentelemetry-sdk` - OpenTelemetry SDK
- `opentelemetry-exporter-otlp-proto-http` - OTLP HTTP exporter
- `openai` - OpenAI Python client
- `python-dotenv` - For loading .env files (optional)

---

### Step 4: Run Your First Test 🧪

```bash
cd /Users/nular/Documents/anchor/src/tests
python openai_test.py
```

**What to expect:**
- ✅ Test makes OpenAI API call
- ✅ Traces are automatically captured
- ✅ Traces sent to OTLP Collector
- ✅ Data stored in ClickHouse

**If you see errors:**
- **"OPENAI_API_KEY not set"** → Add your API key to `.env`
- **Connection errors** → Make sure Docker services are running
- **API quota errors** → That's okay! Instrumentation still works

---

### Step 5: Verify Data in ClickHouse 🗄️

```bash
# Connect to ClickHouse
docker exec -it clickhouse clickhouse-client

# Then run:
USE default;
SHOW TABLES;
# Should show: otel_traces, otel_logs, otel_metrics

# Check if traces exist
SELECT count() FROM otel_traces;

# View recent traces
SELECT * FROM otel_traces ORDER BY Timestamp DESC LIMIT 5;
```

---

### Step 6: Access Grafana Dashboards 📊

1. **Open Grafana:**
   - URL: http://localhost:3000
   - Username: `admin`
   - Password: `admin`

2. **Verify ClickHouse Datasource:**
   - Go to: Configuration → Data Sources
   - Click on "ClickHouse"
   - Click "Test" button
   - Should show: "Data source is working"

3. **Create Your First Dashboard:**
   - Go to: Dashboards → New Dashboard
   - Add a new panel
   - Select "ClickHouse" as datasource
   - Try this query:
     ```sql
     SELECT count() as trace_count 
     FROM otel_traces 
     WHERE Timestamp >= now() - INTERVAL 1 HOUR
     ```

---

## 🔍 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs clickhouse
docker-compose logs otel-collector
docker-compose logs grafana

# Restart services
docker-compose restart
```

### No traces in ClickHouse
1. Check collector logs: `docker logs otel-collector -f`
2. Verify test ran successfully
3. Check if tables exist: `SHOW TABLES FROM default;`
4. Verify OTLP endpoint in test: Should be `http://localhost:4318`

### Grafana can't connect to ClickHouse
1. Verify ClickHouse is running: `docker ps | grep clickhouse`
2. Check datasource config: `configs/grafana/provisioning/datasources/clickhouse.yml`
3. Test connection manually: `curl http://localhost:8123/ping`

### Port conflicts
If ports are already in use:
- ClickHouse: 8123, 9000
- OTLP Collector: 4317, 4318
- Grafana: 3000

Edit `docker-compose.yaml` to change ports.

---

## 📈 Next Steps

1. **Create Grafana Dashboards:**
   - Trace overview dashboard
   - Latency metrics
   - Token usage tracking
   - Error rate monitoring

2. **Add More Instrumentations:**
   - Anthropic Claude
   - LangChain
   - Custom functions

3. **Production Setup:**
   - Add authentication to Grafana
   - Configure data retention policies
   - Set up alerts

---

## 🎉 Success Criteria

You're all set when:
- ✅ Docker services are running
- ✅ Test script runs without errors
- ✅ Traces appear in ClickHouse
- ✅ Grafana can query ClickHouse
- ✅ You can see your traces in Grafana
