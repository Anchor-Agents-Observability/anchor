"use server";

import { clickhouse } from "@/lib/clickhouse";

export async function getOverviewMetrics(tenantId: string) {
  const result = await clickhouse.query({
    query: `
      SELECT
        count() as total_spans,
        sum(toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])) as total_cost,
        avg(Duration) / 1000000 as avg_latency_ms,
        uniq(SpanAttributes['gen_ai.request.model']) as active_models
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND Timestamp >= now() - INTERVAL 24 HOUR
    `,
    query_params: { tenantId },
    format: "JSONEachRow",
  });
  const rows = await result.json<{
    total_spans: string;
    total_cost: string;
    avg_latency_ms: string;
    active_models: string;
  }>();
  const row = rows[0] || { total_spans: "0", total_cost: "0", avg_latency_ms: "0", active_models: "0" };
  return {
    totalSpans: parseInt(row.total_spans),
    totalCost: parseFloat(row.total_cost),
    avgLatencyMs: parseFloat(row.avg_latency_ms),
    activeModels: parseInt(row.active_models),
  };
}

export async function getSpansOverTime(tenantId: string, days: number = 7) {
  const result = await clickhouse.query({
    query: `
      SELECT
        toDate(Timestamp) as date,
        count() as spans
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND Timestamp >= now() - INTERVAL {days:UInt32} DAY
      GROUP BY date
      ORDER BY date
    `,
    query_params: { tenantId, days },
    format: "JSONEachRow",
  });
  return result.json<{ date: string; spans: string }>();
}

export async function getCostByModel(tenantId: string, days: number = 7) {
  const result = await clickhouse.query({
    query: `
      SELECT
        SpanAttributes['gen_ai.request.model'] as model,
        sum(toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])) as cost
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND Timestamp >= now() - INTERVAL {days:UInt32} DAY
        AND SpanAttributes['gen_ai.request.model'] != ''
      GROUP BY model
      ORDER BY cost DESC
    `,
    query_params: { tenantId, days },
    format: "JSONEachRow",
  });
  return result.json<{ model: string; cost: string }>();
}
