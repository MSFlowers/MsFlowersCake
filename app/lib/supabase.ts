import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://iwbxuxrxqarcqsyryfbp.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_Publishable_key ||
  process.env.NEXT_Publishable_key ||
  "sb_publishable_TeROVf3GNSofhwJ5hirzXw_nmJxnzM-";

const supabaseSecretKey =
  process.env.SUPABASE_Secret_key ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

// Client for public queries (Storefront read operations respecting RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (bypasses RLS for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
