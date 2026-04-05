"use client";

import { useState } from "react";

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export function ApiKeyTable({
  keys,
  onRevoke,
}: {
  keys: ApiKeyRow[];
  onRevoke: (id: string) => Promise<void>;
}) {
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    setRevoking(id);
    await onRevoke(id);
    setRevoking(null);
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
        No API keys yet. Create one to start sending traces.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Key</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Created</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {keys.map((key) => (
            <tr key={key.id} className="transition-colors hover:bg-zinc-900/50">
              <td className="px-4 py-3 font-medium">{key.name}</td>
              <td className="px-4 py-3 font-mono text-zinc-400">{key.keyPrefix}</td>
              <td className="px-4 py-3">
                {key.active ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    Revoked
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {new Date(key.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {key.active && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {revoking === key.id ? "Revoking..." : "Revoke"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
