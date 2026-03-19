import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This check prevents the "Unexpected token" crash by stopping early
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Key are required! Check Vercel Env Vars.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
