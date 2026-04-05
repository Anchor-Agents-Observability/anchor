import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}
