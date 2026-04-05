"use client";

import { ApiKeyTable } from "@/components/api-key-table";
import { CreateKeyDialog } from "@/components/create-key-dialog";
import { createApiKey, revokeApiKey } from "./actions";
import { useRouter } from "next/navigation";

interface KeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export function KeysClient({ keys }: { keys: KeyRow[] }) {
  const router = useRouter();

  async function handleCreate(name: string) {
    const result = await createApiKey(name);
    router.refresh();
    return result;
  }

  async function handleRevoke(id: string) {
    await revokeApiKey(id);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end">
        <CreateKeyDialog onCreate={handleCreate} />
      </div>
      <ApiKeyTable keys={keys} onRevoke={handleRevoke} />
    </>
  );
}
