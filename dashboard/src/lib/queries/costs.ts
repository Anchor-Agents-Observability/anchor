"use server";

import { clickhouse } from "@/lib/clickhouse";

export async function getCostOverTime(tenantId: string, days: number = 30) {
  const result = await clickhouse.query({
    query: `
      SELECT
        toDate(Timestamp) as date,
        SpanAttributes['gen_ai.request.model'] as model,
        sum(toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])) as cost
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND Timestamp >= now() - INTERVAL {days:UInt32} DAY
        AND SpanAttributes['gen_ai.request.model'] != ''
      GROUP BY date, model
      ORDER BY date
    `,
    query_params: { tenantId, days },
    format: "JSONEachRow",
  });
  return result.json<{ date: string; model: string; cost: string }>();
}

export async function getCostByModelDetailed(tenantId: string, days: number = 30) {
  const result = await clickhouse.query({
    query: `
      SELECT
        SpanAttributes['gen_ai.request.model'] as model,
        count() as requests,
        sum(toUInt64OrZero(SpanAttributes['gen_ai.usage.input_tokens'])) as inputTokens,
        sum(toUInt64OrZero(SpanAttributes['gen_ai.usage.output_tokens'])) as outputTokens,
        sum(toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])) as totalCost
      FROM otel_traces
      WHERE ResourceAttributes['anchor.tenant_id'] = {tenantId:String}
        AND Timestamp >= now() - INTERVAL {days:UInt32} DAY
        AND SpanAttributes['gen_ai.request.model'] != ''
      GROUP BY model
      ORDER BY totalCost DESC
    `,
    query_params: { tenantId, days },
    format: "JSONEachRow",
  });
  return result.json<{
    model: string;
    requests: string;
    inputTokens: string;
    outputTokens: string;
    totalCost: string;
  }>();
}
