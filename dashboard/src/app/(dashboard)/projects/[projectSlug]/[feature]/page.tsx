import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getProjectFeatureCopy, getProjectDisplayName } from "@/lib/projects";

export default async function ProjectFeaturePlaceholderPage({
  params,
}: {
  params: Promise<{ projectSlug: string; feature: string }>;
}) {
  const { projectSlug, feature } = await params;
  const copy = getProjectFeatureCopy(feature);

  if (!copy) {
    notFound();
  }

  return (
    <div className="rounded-[2rem] border tech-border bg-panel p-8">
      <span className="inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {getProjectDisplayName(projectSlug)} / {copy.title}
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{copy.description}</p>

      <div className="mt-8 rounded-[1.5rem] border tech-border bg-background p-6">
        <p className="text-sm font-medium text-foreground">Coming soon</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          This section is part of the new project shell and is ready for feature implementation. For now, use Dashboard
          and Traces to explore the live product path.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/projects/${projectSlug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
          >
            Back to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/projects/${projectSlug}/traces`}
            className="inline-flex items-center gap-2 rounded-xl border tech-border bg-panel px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-panel-hover"
          >
            Open Traces
          </Link>
        </div>
      </div>
    </div>
  );
}
