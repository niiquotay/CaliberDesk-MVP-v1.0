import crypto from "crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { MOCK_USER, MOCK_EMPLOYER, STAFF_ACCOUNTS, MOCK_JOBS, MOCK_BLOG_POSTS, MOCK_APTITUDE_TESTS } from "../constants.js";
import { UserProfile } from "../types.js";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ghpnirzdfxtxkwmqifld.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__NZL22B4reM7xUpOFPKqRQ_gcgGjw3M";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "minimal index ok", timestamp: new Date().toISOString() });
});

export default app;
