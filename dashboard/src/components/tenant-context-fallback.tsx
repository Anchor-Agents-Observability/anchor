interface TenantContextFallbackProps {
  title?: string;
  description?: string;
}

export function TenantContextFallback({
  title = "Tenant context unavailable",
  description = "We could not resolve your organization context. Sign out and back in, or contact support if the problem persists.",
}: TenantContextFallbackProps) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
      <h2 className="text-lg font-semibold text-amber-100">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-50/80">
        {description}
      </p>
    </div>
  );
}
