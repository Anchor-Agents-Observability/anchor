import { Activity, Clock, Cpu, DollarSign } from "lucide-react";
import { getOrCreateOrg } from "@/lib/org";
import { getProjectDescription, getProjectDisplayName } from "@/lib/projects";
import { getCostByModel, getOverviewMetrics, getSpansOverTime } from "@/lib/queries/overview";
import { formatCost, formatLatency, formatNumber } from "@/lib/utils";
import { MetricCard } from "@/components/metric-card";
import { OverviewOnboarding } from "@/components/overview-onboarding";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { OverviewCharts } from "@/app/(dashboard)/overview/charts";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const [org, { projectSlug }] = await Promise.all([getOrCreateOrg(), params]);
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const [metrics, spansOverTime, costByModel] = await Promise.all([
    getOverviewMetrics(org.tenantId),
    getSpansOverTime(org.tenantId),
    getCostByModel(org.tenantId),
  ]);

  const projectName = getProjectDisplayName(projectSlug);
  const projectDescription = getProjectDescription(projectSlug);
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
      <div className="rounded-[2rem] border tech-border bg-panel p-8">
        <span className="inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Ward / Dashboard
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">{projectName}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{projectDescription}</p>
      </div>

      <OverviewOnboarding hasData={hasData} projectSlug={projectSlug} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Spans" value={formatNumber(metrics.totalSpans)} icon={Activity} />
        <MetricCard title="Total Cost" value={formatCost(metrics.totalCost)} icon={DollarSign} />
        <MetricCard title="Avg Latency" value={formatLatency(metrics.avgLatencyMs)} icon={Clock} />
        <MetricCard title="Active Models" value={metrics.activeModels.toString()} icon={Cpu} />
      </div>

      {hasData ? (
        <OverviewCharts spanData={spanChartData} costData={costChartData} />
      ) : (
        <div className="rounded-[2rem] border tech-border bg-panel p-8">
          <h2 className="text-lg font-semibold text-foreground">No traces yet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This project is ready for its first request. Create an API key, instrument one call, and refresh the traces
            view to see volume, model mix, and latency begin to populate.
          </p>
        </div>
      )}
    </div>
  );
}
