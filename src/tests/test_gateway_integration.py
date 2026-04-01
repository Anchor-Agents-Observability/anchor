"""
End-to-end integration test: SDK -> Gateway -> Collector -> ClickHouse.

Prerequisites:
  1. docker-compose up -d  (full stack including gateway + redis)
  2. Seed an API key:
       cd gateway && REDIS_ADDR=localhost:6379 go run ./cmd/seed --tenant test-tenant-001
     Copy the printed key and set it as ANCHOR_TEST_API_KEY env var.

Usage:
  ANCHOR_TEST_API_KEY=ak_live_xxx python -m pytest src/tests/test_gateway_integration.py -v
"""

import os
import time

import pytest
import requests


GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:8080")
API_KEY = os.getenv("ANCHOR_TEST_API_KEY", "")
CLICKHOUSE_URL = os.getenv("CLICKHOUSE_URL", "http://localhost:8123")


@pytest.fixture(autouse=True)
def require_api_key():
    if not API_KEY:
        pytest.skip("ANCHOR_TEST_API_KEY not set — run seed first")


class TestGatewayHealth:
    def test_health_endpoint(self):
        resp = requests.get(f"{GATEWAY_URL}/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestGatewayAuth:
    def test_missing_auth_returns_401(self):
        resp = requests.post(f"{GATEWAY_URL}/v1/traces", data=b"")
        assert resp.status_code == 401

    def test_invalid_key_returns_401(self):
        resp = requests.post(
            f"{GATEWAY_URL}/v1/traces",
            data=b"",
            headers={"Authorization": "Bearer ak_live_invalid_key_000000000000"},
        )
        assert resp.status_code == 401

    def test_valid_key_accepted(self):
        """A valid key should not return 401 (may return 400 for empty body, which is fine)."""
        resp = requests.post(
            f"{GATEWAY_URL}/v1/traces",
            data=b"",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/x-protobuf",
            },
        )
        assert resp.status_code != 401


class TestEndToEndTraces:
    def test_sdk_traces_reach_clickhouse(self):
        """Send traces via the SDK through the gateway and verify they land in ClickHouse."""
        try:
            import anchor
        except ImportError:
            pytest.skip("anchor SDK not installed")

        tracer = anchor.init(
            application_name="gateway-integration-test",
            environment="test",
            otlp_endpoint=GATEWAY_URL,
            otlp_headers={"Authorization": f"Bearer {API_KEY}"},
            disable_batch=True,
        )

        if tracer is None:
            pytest.fail("anchor.init() returned None")

        with tracer.start_as_current_span("integration-test-span") as span:
            span.set_attribute("test.marker", "gateway-e2e")
            span.set_attribute("anchor.tenant_id", "test-tenant-001")

        # Give the pipeline time to flush
        time.sleep(5)

        # Query ClickHouse for the span
        query = (
            "SELECT SpanName, ResourceAttributes "
            "FROM otel_traces "
            "WHERE SpanName = 'integration-test-span' "
            "ORDER BY Timestamp DESC "
            "LIMIT 1 "
            "FORMAT JSON"
        )
        resp = requests.get(
            CLICKHOUSE_URL,
            params={"query": query, "user": "otel", "password": "otelpass"},
        )

        if resp.status_code != 200:
            pytest.skip(f"ClickHouse query failed ({resp.status_code}): {resp.text}")

        data = resp.json()
        rows = data.get("data", [])
        assert len(rows) > 0, "No spans found in ClickHouse for integration-test-span"

        resource_attrs = rows[0].get("ResourceAttributes", {})
        assert "anchor.tenant_id" in str(resource_attrs), (
            f"tenant_id not found in resource attributes: {resource_attrs}"
        )


class TestRateLimitHeaders:
    def test_rate_limit_headers_present(self):
        resp = requests.post(
            f"{GATEWAY_URL}/v1/traces",
            data=b"",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/x-protobuf",
            },
        )
        assert "X-RateLimit-Limit" in resp.headers
        assert "X-RateLimit-Remaining" in resp.headers
