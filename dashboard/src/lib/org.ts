import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/supabase/server";

function hasTenantId(tenantId: string | null | undefined): tenantId is string {
  return typeof tenantId === "string" && tenantId.trim().length > 0;
}

/**
 * Returns true when Prisma cannot connect to PostgreSQL, which should degrade to tenant fallback UI.
 */
function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001") {
    return true;
  }

  return error instanceof Error && error.message.includes("Can't reach database server");
}

export async function getOrCreateOrg() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const existing = await prisma.orgMember.findFirst({
      where: { authUserId: user.id },
      include: { org: true },
    });

    if (existing) {
      return hasTenantId(existing.org.tenantId) ? existing.org : null;
    }

    const slug = (
      user.email?.split("@")[0] ||
      user.id.slice(0, 8)
    ).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const displayName =
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata.name === "string"
          ? user.user_metadata.name
          : null;

    const tenantId = `tenant_${randomBytes(8).toString("hex")}`;

    const org = await prisma.organization.create({
      data: {
        name: displayName ? `${displayName}'s Org` : "My Organization",
        slug: `${slug}-${randomBytes(3).toString("hex")}`,
        tenantId,
        tier: "free",
        members: {
          create: {
            authUserId: user.id,
            role: "owner",
          },
        },
      },
    });

    return hasTenantId(org.tenantId) ? org : null;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

export function requireTenantId(tenantId: string | null | undefined): string {
  if (!hasTenantId(tenantId)) {
    throw new Error("Tenant context unavailable");
  }

  return tenantId;
}
