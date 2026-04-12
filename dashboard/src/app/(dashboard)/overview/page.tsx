import Link from "next/link";
import { ArrowRight, FolderPlus, Link2, Sparkles } from "lucide-react";
import { getOrCreateOrg } from "@/lib/org";
import { getWorkspaceProjects } from "@/lib/projects";
import { TenantContextFallback } from "@/components/tenant-context-fallback";

export default async function OverviewPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const projects = getWorkspaceProjects(org.name);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-10">
      <div className="rounded-[2rem] border tech-border bg-panel p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Workspace
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">
              {org.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Choose a project to inspect traces, compare evals, or iterate on prompts. New users land here first, then
              move into a project shell such as <span className="font-medium text-foreground">/projects/projectname/traces</span>.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/projects/projectname"
              className="rounded-2xl bg-foreground px-5 py-4 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              <span className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Create project
              </span>
            </Link>
            <Link
              href="/projects/projectname"
              className="rounded-2xl border tech-border bg-background px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-panel-hover"
            >
              <span className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Connect existing project
              </span>
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border tech-border bg-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Your projects</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seeded project destinations for the current workspace.
              </p>
            </div>
            <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {projects.length} active
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group rounded-[1.5rem] border tech-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:bg-panel-hover"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
                      <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.summary}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {project.focusArea}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    Open project
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border tech-border bg-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Suggested starting path</p>
                <p className="text-sm text-muted-foreground">Project Name to Traces</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The first run path stays short: choose a project, create a key in Settings, send one instrumented request,
              then inspect results under the project&apos;s trace explorer.
            </p>
            <Link
              href="/projects/projectname/traces"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Go to traces
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border tech-border bg-panel p-6">
            <p className="text-sm font-medium text-foreground">Workspace notes</p>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tenant</dt>
                <dd className="mt-1 font-mono text-sm text-foreground">{org.tenantId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Plan</dt>
                <dd className="mt-1 text-sm text-foreground capitalize">{org.tier}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </main>
  );
}
