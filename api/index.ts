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
import { createClient } from "@supabase/supabase-js";
import { MOCK_USER, MOCK_EMPLOYER, STAFF_ACCOUNTS, MOCK_JOBS, MOCK_BLOG_POSTS, MOCK_APTITUDE_TESTS } from "../constants.js";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ghpnirzdfxtxkwmqifld.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__NZL22B4reM7xUpOFPKqRQ_gcgGjw3M";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const FINAL_JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ID Generation Utility
const generateIdNumber = (prefix: string) => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${random}`;
};

// Helper to filter objects to only include valid keys for a table
const filterObject = (obj: any, validKeys: string[]) => {
  const filtered: any = {};
  validKeys.forEach(key => {
    if (key in obj && obj[key] !== undefined && obj[key] !== null) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

const USER_TABLE_KEYS = [
  'id', 'email', 'password', 'name', 'firstName', 'middleName', 'lastName', 'phoneNumbers',
  'isEmployer', 'isVerified', 'joinedDate', 'companyName', 'isSuperUser', 'idNumber',
  'role', 'city', 'country', 'skills', 'digitalSkills', 'certifications', 'hobbies',
  'projects', 'experienceSummary', 'profileCompleted', 'linkedInConnected', 'isSubscribed',
  'subscriptionTier', 'purchaseHistory', 'adOptIn', 'alerts', 'savedJobIds', 'autoApplyEnabled',
  'profileImages', 'workHistory', 'education', 'stealthMode', 'notifications', 'subUsers',
  'isAdmin', 'opRole', 'isDeactivated', 'deactivationDate', 'verificationEmail',
  'verificationMethod', 'verificationDocuments', 'pendingAssessmentReminders',
  'employmentVerificationStatus', 'verificationCertificateUrl'
];

const registerSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  isEmployer: z.boolean(),
  phone: z.string().optional().default(""),
  country: z.string().optional().default(""),
  companyName: z.string().optional(),
  subUsers: z.array(z.any()).optional(),
  verificationCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  isEmployer: z.boolean().optional()
});

// Helper to hash passwords
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many authentication attempts" },
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input data", errors: validation.error.errors });
    }

    const { firstName, middleName, lastName, email, password, isEmployer, phone, country, companyName, verificationCode } = validation.data;
    const name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
    
    if (isEmployer) {
      if (!companyName) {
        return res.status(400).json({ message: "Company name is required for employer accounts." });
      }
    }

    const hashedPassword = await hashPassword(password);
    const newUser = filterObject({
      name,
      firstName,
      middleName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumbers: [phone],
      isEmployer: !!isEmployer,
      isVerified: !isEmployer,
      joinedDate: new Date().toISOString(),
      companyName: isEmployer ? companyName : null,
      idNumber: generateIdNumber(isEmployer ? 'CMP' : 'SKR'),
      role: isEmployer ? "Employer" : "Seeker",
      country: country || "",
      profileCompleted: false
    }, USER_TABLE_KEYS);

    const { data: user, error } = await supabase.from('users').insert([newUser]).select().single();
    
    if (error) {
      return res.status(500).json({ message: "Database error during registration", details: error.message });
    }

    const token = jwt.sign({ id: user.id, email: user.email, isEmployer: user.isEmployer }, FINAL_JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({ message: "Registration successful", user: { id: user.id, email: user.email, name: user.name, isEmployer: user.isEmployer } });

  } catch (err: any) {
    res.status(500).json({ message: "Internal server error during registration", error: err.message });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password, isEmployer } = loginSchema.parse(req.body);
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).eq('isEmployer', !!isEmployer).single();
    
    if (error || !user) return res.status(401).json({ message: "Invalid email or password" });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email, isEmployer: user.isEmployer }, FINAL_JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ message: "Login successful", user: { id: user.id, email: user.email, name: user.name, isEmployer: user.isEmployer } });
  } catch (err: any) {
    res.status(400).json({ message: "Login failed", error: err.message });
  }
});

// Mock other routes for registration completeness
app.get("/api/jobs", async (req, res) => {
  const { data: jobs } = await supabase.from('jobs').select('*');
  res.json(jobs || []);
});

export default app;
