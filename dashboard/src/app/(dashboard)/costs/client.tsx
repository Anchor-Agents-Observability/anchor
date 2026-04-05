"use client";

import { CostAreaChart, CostPieChart } from "@/components/cost-chart";
import { formatCost, formatNumber } from "@/lib/utils";

interface CostsClientProps {
  areaData: Record<string, unknown>[];
  models: string[];
  pieData: { name: string; value: number }[];
  tableData: {
    model: string;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  }[];
}

export function CostsClient({ areaData, models, pieData, tableData }: CostsClientProps) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-medium text-zinc-400">
            Cost over time
          </h3>
          <CostAreaChart
            data={areaData as { date: string; [k: string]: string | number }[]}
            models={models}
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-medium text-zinc-400">
            Cost by model
          </h3>
          <CostPieChart data={pieData} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Model</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Requests</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Input Tokens</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Output Tokens</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {tableData.map((row) => (
              <tr key={row.model} className="transition-colors hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                    {row.model}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.requests)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.inputTokens)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.outputTokens)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">{formatCost(row.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
