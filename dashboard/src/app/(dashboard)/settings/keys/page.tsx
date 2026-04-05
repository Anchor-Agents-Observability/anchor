import { getOrCreateOrg } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { TenantContextFallback } from "@/components/tenant-context-fallback";
import { KeysClient } from "./client";

export default async function ApiKeysPage() {
  const org = await getOrCreateOrg();
  if (!org?.tenantId) {
    return <TenantContextFallback />;
  }

  const keys = await prisma.apiKey.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    active: k.active,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage keys used by the Anchor SDK to send traces
          </p>
        </div>
      </div>
      <KeysClient keys={serialized} />
    </div>
  );
}
