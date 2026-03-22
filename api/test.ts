import { MOCK_USER } from '../constants.js';
import { createClient } from "@supabase/supabase-js";
import express from 'express';

const app = express();
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ghpnirzdfxtxkwmqifld.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__NZL22B4reM7xUpOFPKqRQ_gcgGjw3M";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.get('/api/test', async (req, res) => {
  const { data, error } = await supabase.from('users').select('name').limit(1);
  res.status(200).json({ 
    status: "express test ok", 
    db: error ? "error" : "success",
    db_error: error?.message,
    userCount: data?.length,
    time: new Date().toISOString() 
  });
});

export default app;
