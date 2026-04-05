import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/overview");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
