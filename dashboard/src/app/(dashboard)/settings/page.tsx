import { getOrCreateOrg } from "@/lib/org";
import { TenantContextFallback } from "@/components/tenant-context-fallback";

export default async function SettingsPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Organization details</p>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-sm font-medium text-zinc-400">Organization</h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs text-zinc-500">Name</dt>
              <dd className="mt-1 text-sm font-medium">{org.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Slug</dt>
              <dd className="mt-1 font-mono text-sm text-zinc-300">{org.slug}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Tenant ID</dt>
              <dd className="mt-1 font-mono text-sm text-cyan-400">{org.tenantId}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-sm font-medium text-zinc-400">Plan</h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs text-zinc-500">Tier</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium capitalize text-cyan-400">
                  {org.tier}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Rate Limit</dt>
              <dd className="mt-1 text-sm font-medium">
                {org.rateLimit.toLocaleString()} spans/min
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-sm font-medium text-zinc-400">SDK Configuration</h3>
          <div className="mt-4">
            <pre className="overflow-x-auto rounded-lg bg-zinc-800 p-4 text-sm text-zinc-300">
{`import anchor

anchor.init(
    otlp_endpoint="https://ingest.anchor.dev",
    otlp_headers={"Authorization": "Bearer <your-api-key>"},
    application_name="my-app",
)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
