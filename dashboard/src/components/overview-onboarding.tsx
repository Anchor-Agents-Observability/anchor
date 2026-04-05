import Link from "next/link";
import { ArrowRight, KeyRound, List, PlayCircle } from "lucide-react";

interface OverviewOnboardingProps {
  hasData: boolean;
}

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
    href: "/traces",
    icon: List,
  },
];

export function OverviewOnboarding({ hasData }: OverviewOnboardingProps) {
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-950 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            First Run
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            {hasData ? "Keep your demo moving" : "Send your first trace in under a minute"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">
            {hasData
              ? "Your dashboard is live. Jump into traces or create another key for a second app."
              : "Create an API key, run one instrumented request, and come back here to watch traces and costs appear."}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/settings/keys"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
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
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900"
          >
            <step.icon className="h-5 w-5 text-cyan-400" />
            <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
