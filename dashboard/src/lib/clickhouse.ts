import { createClient } from "@clickhouse/client";

export const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER || "otel",
  password: process.env.CLICKHOUSE_PASSWORD || "otelpass",
  request_timeout: 30000,
});
