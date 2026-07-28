import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Felen] Supabase environment variables are missing. " +
    "Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

console.log("Supabase URL is:", SUPABASE_URL);

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
