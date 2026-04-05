import { Activity, DollarSign, Clock, Cpu } from "lucide-react";
import { getOrCreateOrg } from "@/lib/org";
import { getOverviewMetrics, getSpansOverTime, getCostByModel } from "@/lib/queries/overview";
import { MetricCard } from "@/components/metric-card";
import { formatNumber, formatCost, formatLatency } from "@/lib/utils";
import { OverviewCharts } from "./charts";

export default async function OverviewPage() {
  const org = await getOrCreateOrg();
  if (!org) return null;

  const [metrics, spansOverTime, costByModel] = await Promise.all([
    getOverviewMetrics(org.tenantId),
    getSpansOverTime(org.tenantId),
    getCostByModel(org.tenantId),
  ]);

  const spanChartData = spansOverTime.map((r) => ({
    date: r.date,
    spans: parseInt(r.spans),
  }));

  const costChartData = costByModel.map((r) => ({
    name: r.model,
    value: parseFloat(r.cost),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">Last 24 hours</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Spans"
          value={formatNumber(metrics.totalSpans)}
          icon={Activity}
        />
        <MetricCard
          title="Total Cost"
          value={formatCost(metrics.totalCost)}
          icon={DollarSign}
        />
        <MetricCard
          title="Avg Latency"
          value={formatLatency(metrics.avgLatencyMs)}
          icon={Clock}
        />
        <MetricCard
          title="Active Models"
          value={metrics.activeModels.toString()}
          icon={Cpu}
        />
      </div>

      <OverviewCharts spanData={spanChartData} costData={costChartData} />
    </div>
  );
}
