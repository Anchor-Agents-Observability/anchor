interface WorkspaceProject {
  slug: string;
  name: string;
  summary: string;
  status: string;
  focusArea: string;
}

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function getWorkspaceProjects(orgName: string): WorkspaceProject[] {
  return [
    {
      slug: "projectname",
      name: "Project Name",
      summary: `${orgName} primary observability workspace for traces and evals.`,
      status: "Active",
      focusArea: "Production monitoring",
    },
    {
      slug: "support-copilot",
      name: "Support Copilot",
      summary: "Watch support assistant traces, prompt changes, and failure patterns.",
      status: "Seeded",
      focusArea: "Customer support",
    },
    {
      slug: "eval-lab",
      name: "Eval Lab",
      summary: "Use a sandbox project to compare prompts, experiments, and A/B tests.",
      status: "Ready",
      focusArea: "Offline evaluation",
    },
  ];
}

export function getProjectDisplayName(projectSlug: string) {
  if (projectSlug === "projectname") {
    return "Project Name";
  }

  return titleCase(projectSlug) || "Project";
}

export function getProjectDescription(projectSlug: string) {
  const name = getProjectDisplayName(projectSlug);
  return `${name} workspace for trace inspection, prompt iteration, and evaluation workflows.`;
}

export function getProjectFeatureCopy(feature: string) {
  const copy: Record<string, { title: string; description: string }> = {
    sessions: {
      title: "Sessions",
      description: "Follow user journeys, linked traces, and handoffs across multi-step interactions.",
    },
    monitors: {
      title: "Monitors",
      description: "Track regressions, latency spikes, and quality issues before they reach customers.",
    },
    datasets: {
      title: "Datasets",
      description: "Organize representative examples that power evaluations and experiment runs.",
    },
    experiments: {
      title: "Experiments",
      description: "Compare prompt, model, and retrieval changes against repeatable project benchmarks.",
    },
    evals: {
      title: "Evals",
      description: "Review scored runs, rubric outcomes, and failure slices for this project.",
    },
    "ab-tests": {
      title: "A/B Tests",
      description: "Measure production variants side by side before rolling changes out broadly.",
    },
    playground: {
      title: "Playground",
      description: "Iterate quickly on prompts, model settings, and request payloads in one place.",
    },
    prompts: {
      title: "Prompts",
      description: "Version prompt assets and keep build-time changes connected to runtime traces.",
    },
  };

  return copy[feature] ?? null;
}
