import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/lib/types/database.types";

/**
 * Standard server-side Supabase client for user requests.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured."
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can be ignored in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Can be ignored in Server Components
        }
      },
    },
  });
}

/**
 * Hardened Service-Role Admin Client for secure backend operations (e.g. Telemetry ingestion, Device verification).
 * STRICT SECURITY RULES:
 * 1. Requires SUPABASE_SERVICE_ROLE_KEY exclusively.
 * 2. NEVER falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * 3. NEVER uses placeholder keys or URLs.
 * 4. MUST remain server-only (persistSession: false, autoRefreshToken: false).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL: NEXT_PUBLIC_SUPABASE_URL must be configured."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing Supabase Service Role Key: SUPABASE_SERVICE_ROLE_KEY must be configured for admin client operations."
    );
  }

  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
