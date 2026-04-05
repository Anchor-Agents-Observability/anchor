import { getOrCreateOrg } from "@/lib/org";
import { getTraces } from "@/lib/queries/traces";
import { TraceTable } from "@/components/trace-table";

export default async function TracesPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; page?: string }>;
}) {
  const org = await getOrCreateOrg();
  if (!org) return null;

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const traces = await getTraces(org.tenantId, {
    model: params.model,
    limit,
    offset,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Traces</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All LLM calls instrumented by Anchor
        </p>
      </div>

      <TraceTable traces={traces} />

      {traces.length === limit && (
        <div className="flex justify-center">
          <a
            href={`/traces?page=${page + 1}${params.model ? `&model=${params.model}` : ""}`}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
