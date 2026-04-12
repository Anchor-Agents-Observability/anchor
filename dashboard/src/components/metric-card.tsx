import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="tech-panel rounded-md p-5 transition-colors duration-200 hover:bg-panel-hover">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-foreground/70" />
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-foreground tracking-tight">{value}</span>
      </div>
    </div>
  );
}
