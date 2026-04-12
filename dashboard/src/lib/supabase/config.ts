// Literal NEXT_PUBLIC_* access so Next inlines them in client/Edge bundles.
export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof url === "string" && url.trim().length > 0) {
    return url;
  }
  throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof key === "string" && key.trim().length > 0) {
    return key;
  }
  throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
