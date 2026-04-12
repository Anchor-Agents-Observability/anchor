import Link from "next/link";
import { getOrCreateOrg } from "@/lib/org";
import { TenantContextFallback } from "@/components/tenant-context-fallback";

export default async function SettingsPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10 lg:py-10">
      <div className="rounded-[2rem] border tech-border bg-panel p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Organization details, SDK setup, and access management.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border tech-border bg-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Organization</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{org.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Slug</dt>
                <dd className="mt-1 font-mono text-sm text-foreground">{org.slug}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tenant ID</dt>
                <dd className="mt-1 font-mono text-sm text-foreground">{org.tenantId}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.75rem] border tech-border bg-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Plan</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs text-muted-foreground">Tier</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-sm font-medium capitalize text-foreground">
                    {org.tier}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rate Limit</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {org.rateLimit.toLocaleString()} spans/min
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.75rem] border tech-border bg-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">SDK Configuration</h2>
            <div className="mt-5">
              <pre className="overflow-x-auto rounded-2xl bg-background p-4 text-sm text-foreground">
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

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] border tech-border bg-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Access</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Manage the API keys your projects use to authenticate incoming traces.
            </p>
            <Link
              href="/settings/keys"
              className="mt-5 inline-flex items-center rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Manage API Keys
            </Link>
          </div>

          <div className="rounded-[1.75rem] border tech-border bg-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace Routing</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Users sign in to <span className="font-medium text-foreground">/overview</span>, then enter a project route
              like <span className="font-medium text-foreground">/projects/projectname/traces</span>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
