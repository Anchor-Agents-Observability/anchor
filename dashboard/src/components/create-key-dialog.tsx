"use client";

import { useState } from "react";
import { Copy, Check, Plus } from "lucide-react";

export function CreateKeyDialog({
  onCreate,
}: {
  onCreate: (name: string) => Promise<{ plain: string } | null>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    const result = await onCreate(name.trim());
    setLoading(false);
    if (result) {
      setCreatedKey(result.plain);
    }
  }

  function handleCopy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setCreatedKey(null);
    setCopied(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        Create Key
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        {createdKey ? (
          <>
            <h3 className="text-lg font-bold">API Key Created</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Copy this key now. You will not be able to see it again.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <code className="flex-1 break-all text-sm text-zinc-100">{createdKey}</code>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded p-1.5 transition-colors hover:bg-zinc-700"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="mt-4 w-full rounded-lg bg-zinc-800 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold">Create API Key</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Give your key a name so you can identify it later.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production, Staging"
              className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder-zinc-500 outline-none focus:border-zinc-400"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg bg-zinc-800 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-1 rounded-lg bg-white py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
