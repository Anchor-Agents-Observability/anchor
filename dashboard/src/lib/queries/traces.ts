"use server";

import { clickhouse } from "@/lib/clickhouse";

export interface TraceRow {
  traceId: string;
  spanId: string;
  spanName: string;
  timestamp: string;
  duration: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  status: string;
}

export async function getTraces(
  tenantId: string,
  opts: { model?: string; limit?: number; offset?: number } = {}
): Promise<TraceRow[]> {
  const { model, limit = 50, offset = 0 } = opts;
  const modelFilter = model ? "AND SpanAttributes['gen_ai.request.model'] = {model:String}" : "";

  const result = await clickhouse.query({
    query: `
      SELECT
        TraceId as traceId,
        SpanId as spanId,
        SpanName as spanName,
        Timestamp as timestamp,
        Duration / 1000000 as duration,
        SpanAttributes['gen_ai.request.model'] as model,
        toUInt64OrZero(SpanAttributes['gen_ai.usage.input_tokens']) as inputTokens,
        toUInt64OrZero(SpanAttributes['gen_ai.usage.output_tokens']) as outputTokens,
        toFloat64OrZero(SpanAttributes['gen_ai.usage.cost']) as cost,
        StatusCode as status
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        ${modelFilter}
      ORDER BY Timestamp DESC
      LIMIT {limit:UInt32}
      OFFSET {offset:UInt32}
    `,
    query_params: { tenantId, model: model || "", limit, offset },
    format: "JSONEachRow",
  });
  return result.json<TraceRow>();
}

export async function getTraceDetail(tenantId: string, traceId: string) {
  const result = await clickhouse.query({
    query: `
      SELECT
        TraceId as traceId,
        SpanId as spanId,
        ParentSpanId as parentSpanId,
        SpanName as spanName,
        Timestamp as timestamp,
        Duration / 1000000 as duration,
        SpanAttributes as attributes,
        StatusCode as status,
        StatusMessage as statusMessage
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND TraceId = {traceId:String}
      ORDER BY Timestamp ASC
    `,
    query_params: { tenantId, traceId },
    format: "JSONEachRow",
  });
  return result.json();
}

export async function getDistinctModels(tenantId: string): Promise<string[]> {
  const result = await clickhouse.query({
    query: `
      SELECT DISTINCT SpanAttributes['gen_ai.request.model'] as model
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND model != ''
      ORDER BY model
    `,
    query_params: { tenantId },
    format: "JSONEachRow",
  });
  const rows = await result.json<{ model: string }>();
  return rows.map((r) => r.model);
}
