import { Activity, DollarSign, Clock, Cpu } from "lucide-react";
import { getOrCreateOrg } from "@/lib/org";
import { getOverviewMetrics, getSpansOverTime, getCostByModel } from "@/lib/queries/overview";
import { MetricCard } from "@/components/metric-card";
import { OverviewOnboarding } from "@/components/overview-onboarding";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { formatNumber, formatCost, formatLatency } from "@/lib/utils";
import { OverviewCharts } from "./charts";

export default async function OverviewPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

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
  const hasData = metrics.totalSpans > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {hasData ? "Last 24 hours" : "Get from zero to first trace quickly"}
        </p>
      </div>

      <OverviewOnboarding hasData={hasData} />

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

      {hasData ? (
        <OverviewCharts spanData={spanChartData} costData={costChartData} />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="text-lg font-semibold">No traces yet</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Your first request will unlock live trace volume, model costs, and latency trends here.
            Create an API key, add it to the SDK, then send one request to bring this overview to life.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Step 1</p>
              <p className="mt-2 text-sm font-medium">Create a key</p>
              <p className="mt-1 text-sm text-zinc-400">Generate a dashboard key in Settings.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Step 2</p>
              <p className="mt-2 text-sm font-medium">Run one request</p>
              <p className="mt-1 text-sm text-zinc-400">Send a single instrumented call through Anchor.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Step 3</p>
              <p className="mt-2 text-sm font-medium">Watch traces appear</p>
              <p className="mt-1 text-sm text-zinc-400">Refresh this page or open Traces to inspect the result.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
