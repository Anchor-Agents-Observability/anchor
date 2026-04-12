import Link from "next/link";
import { ArrowRight, KeyRound, List, PlayCircle } from "lucide-react";

interface OverviewOnboardingProps {
  hasData: boolean;
  projectSlug: string;
}

export function OverviewOnboarding({ hasData, projectSlug }: OverviewOnboardingProps) {
  const steps = [
    {
      title: "Create API Key",
      description: "Generate a key you can use to send traces from your app.",
      href: "/settings/keys",
      icon: KeyRound,
    },
    {
      title: "Run First Request",
      description: "Send one instrumented call with the SDK to populate this dashboard.",
      href: "/settings",
      icon: PlayCircle,
    },
    {
      title: "View Traces",
      description: "Inspect incoming LLM calls as soon as your first request lands.",
      href: `/projects/${projectSlug}/traces`,
      icon: List,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            First Run
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            {hasData ? "Keep your demo moving" : "Send your first trace in under a minute"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {hasData
              ? "Your dashboard is live. Jump into traces or create another key for a second app."
              : "Create an API key, run one instrumented request, and come back here to watch traces and costs appear."}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/settings/keys"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
          >
            Create API Key
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <Link
            key={step.title}
            href={step.href}
            className="rounded-xl border border-border bg-background p-5 transition-colors hover:bg-panel-hover"
          >
            <step.icon className="h-5 w-5 text-foreground" />
            <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
