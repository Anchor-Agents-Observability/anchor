"use client";

import { CostBarChart } from "@/components/cost-chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewChartsProps {
  spanData: { date: string; spans: number }[];
  costData: { name: string; value: number }[];
}

export function OverviewCharts({ spanData, costData }: OverviewChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-400">Spans over time (7 days)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={spanData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="spans"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-400">Cost by model (7 days)</h3>
        <CostBarChart data={costData} />
      </div>
    </div>
  );
}
