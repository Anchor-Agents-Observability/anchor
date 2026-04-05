import { getOrCreateOrg } from "@/lib/org";
import { getCostOverTime, getCostByModelDetailed } from "@/lib/queries/costs";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { CostsClient } from "./client";

export default async function CostsPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const [costOverTime, costByModel] = await Promise.all([
    getCostOverTime(org.tenantId, 30),
    getCostByModelDetailed(org.tenantId, 30),
  ]);

  const models = [...new Set(costOverTime.map((r) => r.model))];

  const dateMap = new Map<string, Record<string, string | number>>();
  for (const row of costOverTime) {
    if (!dateMap.has(row.date)) dateMap.set(row.date, { date: row.date });
    const entry = dateMap.get(row.date)!;
    entry[row.model] = parseFloat(row.cost);
  }
  const areaData = Array.from(dateMap.entries()).map(([date, vals]) => ({
    date,
    ...vals,
  }));

  const pieData = costByModel.map((r) => ({
    name: r.model,
    value: parseFloat(r.totalCost),
  }));

  const tableData = costByModel.map((r) => ({
    model: r.model,
    requests: parseInt(r.requests),
    inputTokens: parseInt(r.inputTokens),
    outputTokens: parseInt(r.outputTokens),
    totalCost: parseFloat(r.totalCost),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Costs</h1>
        <p className="mt-1 text-sm text-zinc-500">Last 30 days</p>
      </div>
      <CostsClient
        areaData={areaData}
        models={models}
        pieData={pieData}
        tableData={tableData}
      />
    </div>
  );
}
