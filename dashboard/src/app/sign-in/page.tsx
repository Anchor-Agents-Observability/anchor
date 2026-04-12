import { redirect } from "next/navigation";
import { SignInButtons } from "@/components/sign-in-buttons";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/overview");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-8 shadow-2xl shadow-black/30">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Ward</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in to the dashboard</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Use Google or GitHub to access your organization, manage API keys, and inspect tenant-scoped traces.
          </p>
        </div>
        <SignInButtons />
      </div>
    </div>
  );
}
