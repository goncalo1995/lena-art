import { createClient } from '@supabase/supabase-js'
import type { Database } from "@/types/database.types";

/**
 * Static Supabase client for use during static generation (build time).
 * This client doesn't use cookies, making it safe for SSG.
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(url, key)
}
