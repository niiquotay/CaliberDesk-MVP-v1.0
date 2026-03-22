import crypto from "crypto";
import express from "express";
import path from "path";
import fs from "fs";
// import cors from "cors";
// import helmet from "helmet";
// import { z } from "zod";
// import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { MOCK_USER } from '../constants.js';

dotenv.config();
const app = express();
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ghpnirzdfxtxkwmqifld.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__NZL22B4reM7xUpOFPKqRQ_gcgGjw3M";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.get('/api/test', async (req, res) => {
  res.status(200).json({ 
    status: "group b list ok", 
    bcrypt: typeof bcrypt !== 'undefined',
    jwt: typeof jwt !== 'undefined',
    time: new Date().toISOString() 
  });
});

export default app;
