/**
 * Browser-side Supabase client.
 *
 * This is separate from the backend's Supabase client (which uses a
 * privileged key and must never reach the browser). This one uses the
 * PUBLIC anon key, which is designed to be safe in client-side code --
 * Supabase enforces access rules server-side via Row Level Security.
 *
 * Used for auth flows that don't need to touch our own `users` table
 * (e.g. password recovery), so there's no need to round-trip through
 * our Express backend for these.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
