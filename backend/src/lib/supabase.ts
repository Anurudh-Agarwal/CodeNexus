import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

function getKeyRole(key: string): string {
  try {
    const payload = key.split(".")[1];
    return (
      JSON.parse(Buffer.from(payload, "base64url").toString()).role || "unknown"
    );
  } catch {
    return "invalid-key";
  }
}

console.log("Supabase client:", {
  host: new URL(supabaseUrl).host,
  role: getKeyRole(supabaseServiceKey),
});

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
export const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
