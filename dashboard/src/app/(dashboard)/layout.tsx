import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getOrCreateOrg } from "@/lib/org";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const org = await getOrCreateOrg();
  const userAvatarUrl =
    typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        workspaceLabel={org?.name ?? "Workspace"}
        userEmail={user.email ?? "Signed in"}
        userAvatarUrl={userAvatarUrl}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
