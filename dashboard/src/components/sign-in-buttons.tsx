"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Provider = "google" | "github";

const providerLabels: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
};

export function SignInButtons() {
  const searchParams = useSearchParams();
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toErrorMessage(cause: unknown) {
    if (cause instanceof Error) {
      return cause.message;
    }

    return "Unable to start sign-in flow. Check Supabase client environment variables.";
  }

  async function handleSignIn(provider: Provider) {
    setActiveProvider(provider);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const next = searchParams.get("next") || "/overview";
      const callbackUrl = new URL("/auth/callback", window.location.origin);

      if (next.startsWith("/")) {
        callbackUrl.searchParams.set("next", next);
      }

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) {
        setError(signInError.message);
        setActiveProvider(null);
      }
    } catch (cause) {
      setError(toErrorMessage(cause));
      setActiveProvider(null);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      {(["google", "github"] as Provider[]).map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => handleSignIn(provider)}
          disabled={activeProvider !== null}
          className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeProvider === provider ? `Redirecting to ${providerLabels[provider]}...` : `Continue with ${providerLabels[provider]}`}
        </button>
      ))}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
