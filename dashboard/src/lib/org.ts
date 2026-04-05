import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function getOrCreateOrg() {
  const user = await currentUser();
  if (!user) return null;

  const existing = await prisma.orgMember.findFirst({
    where: { clerkUserId: user.id },
    include: { org: true },
  });

  if (existing) return existing.org;

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

  return org;
}
