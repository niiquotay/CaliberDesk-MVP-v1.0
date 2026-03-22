import { MOCK_USER } from '../constants.js';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ghpnirzdfxtxkwmqifld.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__NZL22B4reM7xUpOFPKqRQ_gcgGjw3M";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
  const { data, error } = await supabase.from('users').select('name').limit(1);
  res.status(200).json({ 
    status: "test ok", 
    db: error ? "error" : "success",
    db_error: error?.message,
    userCount: data?.length,
    time: new Date().toISOString() 
  });
}
