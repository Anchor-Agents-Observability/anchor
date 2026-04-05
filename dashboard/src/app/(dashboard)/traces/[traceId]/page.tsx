import { getOrCreateOrg } from "@/lib/org";
import { getTraceDetail } from "@/lib/queries/traces";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { formatLatency } from "@/lib/utils";

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ traceId: string }>;
}) {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const { traceId } = await params;
  const spans = await getTraceDetail(org.tenantId, traceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trace Detail</h1>
        <p className="mt-1 font-mono text-sm text-zinc-500">{traceId}</p>
      </div>

      {(spans as Record<string, unknown>[]).length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
          No spans found for this trace.
        </div>
      ) : (
        <div className="space-y-3">
          {(spans as Record<string, unknown>[]).map((span: Record<string, unknown>, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{span.spanName as string}</p>
                  <p className="text-sm text-zinc-500">
                    {new Date(span.timestamp as string).toLocaleString()}
                  </p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-mono">
                  {formatLatency(span.duration as number)}
                </span>
              </div>
              {span.attributes != null && typeof span.attributes === "object" ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                    Attributes
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-zinc-800 p-3 text-xs text-zinc-300">
                    {JSON.stringify(span.attributes, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
