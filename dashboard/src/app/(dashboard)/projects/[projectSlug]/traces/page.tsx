import Link from "next/link";
import { getOrCreateOrg } from "@/lib/org";
import { getProjectDisplayName } from "@/lib/projects";
import { getTraces } from "@/lib/queries/traces";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { TraceTable } from "@/components/trace-table";

export default async function ProjectTracesPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>;
  searchParams: Promise<{ model?: string; page?: string }>;
}) {
  const [org, routeParams, query] = await Promise.all([getOrCreateOrg(), params, searchParams]);
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const page = parseInt(query.page || "1");
  const limit = 50;
  const offset = (page - 1) * limit;
  const traces = await getTraces(org.tenantId, {
    model: query.model,
    limit,
    offset,
  });

  const projectName = getProjectDisplayName(routeParams.projectSlug);
  const loadMoreHref = `/projects/${routeParams.projectSlug}/traces?page=${page + 1}${
    query.model ? `&model=${query.model}` : ""
  }`;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border tech-border bg-panel p-8">
        <span className="inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Ward / Traces
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{projectName} traces</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          All LLM calls instrumented by Ward for this project workspace.
        </p>
      </div>

      <TraceTable traces={traces} traceHrefBase={`/projects/${routeParams.projectSlug}/traces`} />

      {traces.length === limit ? (
        <div className="flex justify-center">
          <Link
            href={loadMoreHref}
            className="rounded-xl border tech-border bg-panel px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-panel-hover"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
