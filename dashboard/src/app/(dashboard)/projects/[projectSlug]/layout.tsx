import { redirect } from "next/navigation";
import { getOrCreateOrg } from "@/lib/org";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getOrCreateOrg();

  if (!org?.tenantId) {
    redirect("/overview");
  }

  return <main className="px-6 py-8 lg:px-10 lg:py-10">{children}</main>;
}
