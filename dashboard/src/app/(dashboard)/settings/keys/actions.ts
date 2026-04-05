"use server";

import { prisma } from "@/lib/prisma";
import { syncKeyToRedis } from "@/lib/redis";
import { generateApiKey } from "@/lib/api-keys";
import { getOrCreateOrg, requireTenantId } from "@/lib/org";
import { revalidatePath } from "next/cache";

export async function createApiKey(name: string) {
  const org = await getOrCreateOrg();
  if (!org) throw new Error("Tenant context unavailable");
  const tenantId = requireTenantId(org.tenantId);

  const { plain, hash, prefix } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      orgId: org.id,
      name,
      keyPrefix: prefix,
      keyHash: hash,
    },
  });

  await syncKeyToRedis(hash, tenantId, org.rateLimit, org.tier, true);

  revalidatePath("/settings/keys");
  return { plain };
}

export async function revokeApiKey(keyId: string) {
  const org = await getOrCreateOrg();
  if (!org) throw new Error("Tenant context unavailable");
  const tenantId = requireTenantId(org.tenantId);

  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, orgId: org.id },
  });
  if (!key) throw new Error("Key not found");

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { active: false },
  });

  await syncKeyToRedis(key.keyHash, tenantId, org.rateLimit, org.tier, false);

  revalidatePath("/settings/keys");
}
