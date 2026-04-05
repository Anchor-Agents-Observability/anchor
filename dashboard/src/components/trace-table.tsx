"use client";

import Link from "next/link";
import type { TraceRow } from "@/lib/queries/traces";
import { formatCost, formatLatency } from "@/lib/utils";

export function TraceTable({ traces }: { traces: TraceRow[] }) {
  if (traces.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
        No traces found. Start sending data through the SDK to see traces here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Timestamp</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Span</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Model</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-400">Tokens</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-400">Cost</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-400">Latency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {traces.map((trace) => (
            <tr
              key={trace.spanId}
              className="transition-colors hover:bg-zinc-900/50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                {new Date(trace.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/traces/${trace.traceId}`}
                  className="font-medium text-cyan-400 hover:underline"
                >
                  {trace.spanName}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                  {trace.model || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                {trace.inputTokens + trace.outputTokens > 0
                  ? `${trace.inputTokens} → ${trace.outputTokens}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                {trace.cost > 0 ? formatCost(trace.cost) : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                {formatLatency(trace.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
