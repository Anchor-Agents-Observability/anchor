import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function hasTenantId(tenantId: string | null | undefined): tenantId is string {
  return typeof tenantId === "string" && tenantId.trim().length > 0;
}

export async function getOrCreateOrg() {
  const user = await currentUser();
  if (!user) return null;

  const existing = await prisma.orgMember.findFirst({
    where: { clerkUserId: user.id },
    include: { org: true },
  });

  if (existing) {
    return hasTenantId(existing.org.tenantId) ? existing.org : null;
  }

  const slug = (
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    user.id.slice(0, 8)
  ).toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const tenantId = `tenant_${randomBytes(8).toString("hex")}`;

  const org = await prisma.organization.create({
    data: {
      name: user.firstName ? `${user.firstName}'s Org` : "My Organization",
      slug: `${slug}-${randomBytes(3).toString("hex")}`,
      tenantId,
      tier: "free",
      members: {
        create: {
          clerkUserId: user.id,
          role: "owner",
        },
      },
    },
  });

  return hasTenantId(org.tenantId) ? org : null;
}

export function requireTenantId(tenantId: string | null | undefined): string {
  if (!hasTenantId(tenantId)) {
    throw new Error("Tenant context unavailable");
  }

  return tenantId;
}
