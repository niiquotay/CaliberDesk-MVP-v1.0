import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import { MOCK_USER, MOCK_EMPLOYER, STAFF_ACCOUNTS, MOCK_JOBS, MOCK_BLOG_POSTS, MOCK_APTITUDE_TESTS } from "./constants";
import { UserProfile } from "./types";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET || JWT_SECRET === "fallback_secret") {
    console.warn("[SECURITY] JWT_SECRET is not set or using a weak fallback. Please set a strong secret in environment variables.");
  }

  const FINAL_JWT_SECRET = JWT_SECRET || "fallback_secret";

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development with Vite
    crossOriginEmbedderPolicy: false
  }));

  const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  ) : null;

  const getRedirectUri = (req: any, path: string) => {
    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;
    return `${origin}${path}`;
  };

  // Resilient CORS for development and production
  const allowedOrigins = [
    process.env.APP_URL,
    process.env.SHARED_APP_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // In development, be more permissive
      if (process.env.NODE_ENV !== 'production') return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.run.app')) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  // Supabase Connection Health Check
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        if (error.message.includes('the client is offline')) {
          console.error("[CRITICAL] Supabase client is offline. Check your URL and Key.");
        } else {
          console.error("[SYSTEM] Supabase connection error:", error.message);
        }
        return false;
      }
      console.log("[SYSTEM] Supabase connection verified.");
      return true;
    } catch (err) {
      console.error("[SYSTEM] Supabase connection failed:", err);
      return false;
    }
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ID Generation Utility
  const generateIdNumber = (prefix: string) => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${random}`;
  };

  // Helper to send in-app notifications to staff
  const notifyStaff = async (title: string, message: string, actionLink?: any) => {
    const { data: staff, error } = await supabase
      .from('users')
      .select('*')
      .or('isAdmin.eq.true,opRole.neq.null');
    
    if (error || !staff) return;

    for (const s of staff) {
      const notifications = s.notifications || [];
      notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        type: 'in-app',
        category: 'system',
        date: new Date().toISOString(),
        isRead: false,
        actionLink
      });
      await supabase.from('users').update({ notifications }).eq('id', s.id);
    }
  };

  // Helper to check and deactivate unverified accounts
  const checkDeactivations = async () => {
    if (!tablesReady) return;
    const now = new Date();
    const { data: users, error } = await supabase.from('users').select('*');
    if (error || !users) return;

    for (const u of users) {
      if (u.isEmployer && !u.isVerified && !u.isDeactivated && u.joinedDate) {
        const joined = new Date(u.joinedDate);
        const diffDays = Math.ceil((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
          await supabase.from('users').update({ isDeactivated: true, deactivationDate: now.toISOString() }).eq('id', u.id);
        }
      }
    }
  };

  // Run deactivation check every hour (simulated)
  setInterval(checkDeactivations, 60 * 60 * 1000);
  checkDeactivations(); // Initial check

  // Helper to check for job expiries and notify applicants
  const checkJobExpiries = async () => {
    if (!tablesReady) return;
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    console.log("[SYSTEM] Checking for jobs nearing expiry...");

    try {
      // Fetch active jobs that expire in the next 48 hours
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .lte('expiryDate', fortyEightHoursLater.toISOString())
        .gt('expiryDate', now.toISOString());

      if (jobsError) {
        console.error("[SYSTEM] Job expiry query error:", jobsError.message || jobsError);
        return;
      }
      if (!jobs || jobs.length === 0) {
        console.log("[SYSTEM] No jobs nearing expiry found.");
        return;
      }

      for (const job of jobs) {
        // Fetch applications for this job
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('userId')
          .eq('jobId', job.id);

        if (appsError) {
          console.error(`[SYSTEM] Error fetching applications for job ${job.id}:`, appsError.message);
          continue;
        }

        if (!apps || apps.length === 0) continue;

        const userIds = apps.map(a => a.userId).filter(Boolean);
        if (userIds.length === 0) continue;

        // Fetch users to notify
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (usersError) {
          console.error(`[SYSTEM] Error fetching users for job expiry notification:`, usersError.message);
          continue;
        }

        if (!users) continue;

        for (const user of users) {
          const notifications = user.notifications || [];
          const alreadyNotified = notifications.some((n: any) => 
            n.title === 'Job Expiry Warning' && n.message.includes(job.title)
          );

          if (!alreadyNotified) {
            const expiryStr = new Date(job.expiryDate).toLocaleDateString();
            const msg = `The job "${job.title}" at ${job.company} you applied to is expiring soon (on ${expiryStr}). Keep an eye on your application status!`;
            
            notifications.unshift({
              id: Math.random().toString(36).substr(2, 9),
              title: 'Job Expiry Warning',
              message: msg,
              type: 'both',
              category: 'application',
              date: now.toISOString(),
              isRead: false,
              actionLink: { label: 'View Job', view: 'job-details', params: job }
            });

            await supabase.from('users').update({ notifications }).eq('id', user.id);
            console.log(`[EXPIRY-NOTIFICATION] To: ${user.email}, Message: ${msg}`);
            console.log(`[EMAIL] To: ${user.email}, Subject: Job Expiry Warning - CaliberDesk, Body: ${msg}`);
          }
        }
      }
    } catch (err: any) {
      console.error("[SYSTEM] Job expiry check failed:", err.message || err);
    }
  };

  // Run job expiry check every 12 hours (simulated)
  setInterval(checkJobExpiries, 12 * 60 * 60 * 1000);
  setTimeout(checkJobExpiries, 5000); // Initial check after startup

  // Helper to check for assessment reminders
  const checkAssessmentReminders = async () => {
    if (!tablesReady) return;
    const now = new Date();
    console.log("[SYSTEM] Checking for assessment reminders...");

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('pendingAssessmentReminders', 'is', null);

      if (error) {
        console.error("[SYSTEM] Assessment reminder query error:", error.message || error);
        return;
      }
      if (!users) return;

      for (const user of users) {
        const reminders = user.pendingAssessmentReminders || [];
        if (reminders.length === 0) continue;

        let updatedReminders = [...reminders];
        let changed = false;

        for (let i = 0; i < updatedReminders.length; i++) {
          const reminder = updatedReminders[i];
          const matchedAt = new Date(reminder.matchedAt);
          const diffHours = (now.getTime() - matchedAt.getTime()) / (1000 * 60 * 60);

          // Check if user already applied
          const { data: app } = await supabase
            .from('applications')
            .select('id')
            .eq('userId', user.id)
            .eq('jobId', reminder.jobId)
            .single();

          if (app) {
            // User applied, remove reminder
            updatedReminders.splice(i, 1);
            i--;
            changed = true;
            continue;
          }

          let shouldNotify = false;
          let newRemindersSent = reminder.remindersSent;

          if (diffHours >= 72 && reminder.remindersSent < 3) {
            shouldNotify = true;
            newRemindersSent = 3;
          } else if (diffHours >= 36 && reminder.remindersSent < 2) {
            shouldNotify = true;
            newRemindersSent = 2;
          } else if (diffHours >= 24 && reminder.remindersSent < 1) {
            shouldNotify = true;
            newRemindersSent = 1;
          }

          if (shouldNotify) {
            const { data: job } = await supabase.from('jobs').select('title, company').eq('id', reminder.jobId).single();
            if (job) {
              const msg = `Reminder: You have a high match for ${job.title} at ${job.company}. Please complete the assessment to finalize your application.`;
              const notifications = user.notifications || [];
              notifications.unshift({
                id: Math.random().toString(36).substr(2, 9),
                title: 'Assessment Reminder',
                message: msg,
                type: 'both',
                category: 'application',
                date: now.toISOString(),
                isRead: false,
                actionLink: { label: 'Take Assessment', view: 'job-details', params: { id: reminder.jobId, ...job } }
              });

              await supabase.from('users').update({ 
                notifications,
                pendingAssessmentReminders: updatedReminders.map((r, idx) => idx === i ? { ...r, remindersSent: newRemindersSent } : r)
              }).eq('id', user.id);
              
              console.log(`[ASSESSMENT-REMINDER] To: ${user.email}, Message: ${msg}`);
              console.log(`[EMAIL] To: ${user.email}, Subject: Assessment Reminder - CaliberDesk, Body: ${msg}`);
              
              updatedReminders[i].remindersSent = newRemindersSent;
              changed = true;
            }
          }
          
          // If 72h passed and last reminder sent, we can stop tracking this one
          if (diffHours > 72 && updatedReminders[i].remindersSent >= 3) {
             updatedReminders.splice(i, 1);
             i--;
             changed = true;
          }
        }

        if (changed) {
          await supabase.from('users').update({ pendingAssessmentReminders: updatedReminders }).eq('id', user.id);
        }
      }
    } catch (err: any) {
      console.error("[SYSTEM] Assessment reminder check failed:", err.message || err);
    }
  };

  // Run assessment reminder check every 6 hours (simulated)
  setInterval(checkAssessmentReminders, 6 * 60 * 60 * 1000);
  setTimeout(checkAssessmentReminders, 10000); // Initial check after startup

  // Helper to check for 7-day application status updates
  const checkApplication7dUpdates = async () => {
    if (!tablesReady) return;
    const now = new Date();
    console.log("[SYSTEM] Checking for 7-day application status updates...");

    try {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: apps, error } = await supabase
        .from('applications')
        .select('*, jobs(title, company), users(*)')
        .lte('appliedDate', sevenDaysAgo)
        .eq('reminderSent7d', false)
        .neq('status', 'rejected')
        .neq('status', 'hired')
        .neq('status', 'closed');

      if (error) {
        console.error("[SYSTEM] 7-day application update query error:", error.message || error);
        return;
      }
      if (!apps) return;

      for (const app of apps) {
        const user = app.users;
        const job = app.jobs;
        if (!user || !job) continue;

        const msg = `Update on your application for ${job.title} at ${job.company}: Your current status is "${app.status}". The employer is still reviewing candidates.`;
        const notifications = user.notifications || [];
        notifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Application Status Update',
          message: msg,
          type: 'both',
          category: 'application',
          date: now.toISOString(),
          isRead: false,
          actionLink: { label: 'Track Application', view: 'seeker-applications' }
        });

        await supabase.from('users').update({ notifications }).eq('id', user.id);
        await supabase.from('applications').update({ reminderSent7d: true }).eq('id', app.id);
        
        console.log(`[7D-UPDATE] To: ${user.email}, Message: ${msg}`);
        console.log(`[EMAIL] To: ${user.email}, Subject: Application Update - CaliberDesk, Body: ${msg}`);
      }
    } catch (err: any) {
      console.error("[SYSTEM] 7-day application update check failed:", err.message || err);
    }
  };

  // Run 7-day update check every 24 hours
  setInterval(checkApplication7dUpdates, 24 * 60 * 60 * 1000);
  setTimeout(checkApplication7dUpdates, 15000); // Initial check after startup

  // Validation Schemas
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    isEmployer: z.boolean().optional()
  });

  const registerSchema = z.object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    isEmployer: z.boolean(),
    phone: z.string().min(5),
    country: z.string().min(1),
    companyName: z.string().optional(),
    subUsers: z.array(z.any()).optional(),
    verificationCode: z.string().optional()
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, FINAL_JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  };
  let tablesReady = false;

  const seedMockUsers = async () => {
    // Check if required tables exist
    const requiredTables = ['users', 'jobs', 'blog_posts', 'applications', 'aptitude_tests'];
    let allExist = true;

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          console.error(`\n[CRITICAL] Supabase table '${table}' not found.`);
          allExist = false;
        } else {
          console.error(`[SYSTEM] Error checking table '${table}':`, error.message || error);
        }
      }
    }

    if (!allExist) {
      console.error(`[CRITICAL] Some required tables are missing.`);
      console.error(`[CRITICAL] Please follow the instructions in SUPABASE_SETUP.md to create the required tables.\n`);
      tablesReady = false;
      return;
    }

    tablesReady = true;
    const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    if (userError) {
      console.error("[SYSTEM] Error checking users table:", userError);
      return;
    }

    if (userCount === 0) {
      const mockUsers = [
        { ...MOCK_USER, idNumber: generateIdNumber('SKR'), password: "user123", joinedDate: new Date().toISOString(), isVerified: true },
        { ...MOCK_EMPLOYER, idNumber: generateIdNumber('CMP'), password: "employer123", joinedDate: new Date().toISOString(), isVerified: false },
        ...Object.values(STAFF_ACCOUNTS).map(s => ({ 
          ...s, 
          idNumber: generateIdNumber('USR'), 
          password: s.opRole === 'super_admin' ? "admin123" : "staff123",
          joinedDate: new Date().toISOString(),
          isAdmin: true
        }))
      ];
      const { error } = await supabase.from('users').insert(mockUsers);
      if (error) console.error("[SYSTEM] Seeding users error:", error);
    }

    const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    if (jobCount === 0) {
      const { data: users } = await supabase.from('users').select('id, companyName').eq('isEmployer', true);
      const employerId = users?.[0]?.id;

      const mockJobs = MOCK_JOBS.map(j => ({
        ...j,
        postedBy: employerId,
        postedAt: new Date().toISOString()
      }));
      const { error } = await supabase.from('jobs').insert(mockJobs);
      if (error) console.error("[SYSTEM] Seeding jobs error:", error);
    }

    const { count: blogCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
    if (blogCount === 0) {
      const mockPosts = MOCK_BLOG_POSTS.map(p => ({
        ...p,
        publishedAt: new Date().toISOString()
      }));
      const { error } = await supabase.from('blog_posts').insert(mockPosts);
      if (error) console.error("[SYSTEM] Seeding blog posts error:", JSON.stringify(error, null, 2));
    }

    const { count: testCount } = await supabase.from('aptitude_tests').select('*', { count: 'exact', head: true });
    if (testCount === 0) {
      const { data: jobs } = await supabase.from('jobs').select('id, idNumber');
      const mockTests = MOCK_APTITUDE_TESTS.map(t => {
        // Find the job by its original mock ID (which is now a UUID in constants.ts)
        const job = jobs?.find(j => j.id === t.jobId);
        return {
          ...t,
          jobId: job?.id || t.jobId,
          createdAt: new Date().toISOString()
        };
      });
      const { error } = await supabase.from('aptitude_tests').insert(mockTests);
      if (error) console.error("[SYSTEM] Seeding tests error:", JSON.stringify(error, null, 2));
    }
  };

  // In-memory verification codes
  const verificationCodes: Record<string, { code: string; expires: number }> = {};

  // Helper to hash passwords for new users
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  // Auth Middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'admin' && !req.user.opRole)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  // Rate Limiters
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register attempts per window
    message: { message: "Too many authentication attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
  });

  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per `window` (here, per hour)
    message: { message: "Too many password reset requests, please try again after an hour" },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.body.email || req.ip
  });

  app.post("/api/auth/reset-password", passwordResetLimiter, async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      // Mock password reset logic
      res.json({ message: "Password reset link sent if email exists." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/send-verification", async (req, res) => {
    const { email, phone } = req.body;
    const identifier = email || phone;
    
    if (!identifier) {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[identifier] = {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // In a real app, send via SMS/Email here
    res.json({ message: "Verification code sent successfully" });
  });

  app.post("/api/auth/verify-code", async (req, res) => {
    const { email, phone, code } = req.body;
    const identifier = email || phone;
    
    const record = verificationCodes[identifier];
    if (!record || record.code !== code || record.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    delete verificationCodes[identifier];
    res.json({ message: "Code verified successfully" });
  });

  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input data", errors: (validation.error as any).errors });
      }

      const { firstName, middleName, lastName, email, password, isEmployer, phone, country, companyName, subUsers, verificationCode } = validation.data;
      const name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
      
      if (email.toLowerCase().endsWith('@caliberdesk.com')) {
        return res.status(400).json({ message: "Staff accounts cannot be created directly. Please contact an administrator." });
      }

      if (!isEmployer) {
        if (!verificationCode) {
          return res.status(400).json({ message: "Verification code is required for seeker registration." });
        }
        const record = verificationCodes[email];
        if (!record || record.code !== verificationCode || record.expires < Date.now()) {
          return res.status(400).json({ message: "Invalid or expired verification code." });
        }
        delete verificationCodes[email];
      }

      // Check for duplicate account with SAME role in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('isEmployer', !!isEmployer)
        .single();

      if (existingUser) {
        return res.status(400).json({ message: `A ${isEmployer ? 'company' : 'seeker'} account already exists with this email.` });
      }

      if (isEmployer) {
        if (!companyName) {
          return res.status(400).json({ message: "Company name is required for employer accounts." });
        }
        if (!subUsers || subUsers.length === 0) {
          return res.status(400).json({ message: "Employers are required to add at least one user before the account can be created." });
        }
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
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
        isSuperUser: !!isEmployer,
        idNumber: generateIdNumber(isEmployer ? 'CMP' : 'SKR'),
        role: isEmployer ? "Employer" : "Seeker",
        country: country || "",
        profileCompleted: false,
        linkedInConnected: false,
        isSubscribed: false,
        subscriptionTier: "free",
        purchaseHistory: [],
        adOptIn: true,
        alerts: [],
        savedJobIds: [],
        autoApplyEnabled: false,
        profileImages: [],
        workHistory: [],
        education: [],
        stealthMode: false,
        notifications: [],
        subUsers: isEmployer ? (subUsers || []).map((u: any) => ({
          ...u,
          id: Math.random().toString(36).substr(2, 9),
          name: `${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}`,
          idNumber: generateIdNumber('USR'),
          joinedDate: new Date().toISOString(),
          lastLogin: 'Never'
        })) : []
      };

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
      }

      if (isEmployer) {
        notifyStaff(
          "New Employer Sign Up",
          `A new employer ${companyName} (${email}) has signed up and requires verification.`,
          { view: 'admin', params: { tab: 'verifications' } }
        );
      }

      const token = jwt.sign({ email: insertedUser.email, isEmployer: insertedUser.isEmployer, isAdmin: insertedUser.isAdmin, role: insertedUser.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      
      const { password: _, ...userWithoutPassword } = insertedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      const { email, password, isEmployer } = validation.data;
      
      // Find user by email AND role in Supabase
      let query = supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase());
      
      if (isEmployer !== undefined) {
        query = query.eq('isEmployer', !!isEmployer);
      }

      const { data: user, error } = await query.single();

      if (error || !user) {
        // Fallback for staff who might not have isEmployer set strictly
        const { data: staffUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('isAdmin', true)
          .single();
        
        if (!staffUser) {
          return res.status(401).json({ message: "Invalid credentials or account type" });
        }
        return handleLogin(staffUser, password, res);
      }

      return handleLogin(user, password, res);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
  });

  const handleLogin = async (user: any, password: any, res: any) => {
    if (user.email.toLowerCase().endsWith('@caliberdesk.com') && !user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized staff access. Please contact an administrator." });
    }

    const isMatch = user.password && await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isDeactivated) {
      return res.status(403).json({ 
        message: "Your account has been deactivated due to incomplete verification within 3 days. Please contact support@caliberdesk.com to reactivate." 
      });
    }

    const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  };

  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { access_token } = req.body;
      if (!access_token) {
        return res.status(400).json({ message: "Access token required" });
      }

      const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser(access_token);
      if (sbError || !sbUser) {
        return res.status(401).json({ message: "Invalid Supabase session" });
      }

      const email = sbUser.email?.toLowerCase();
      let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        // Create user if not exists (defaulting to Seeker)
        const newUser = {
          name: sbUser.user_metadata.full_name || sbUser.user_metadata.name || email?.split('@')[0],
          email,
          isEmployer: false,
          isVerified: true,
          role: "Seeker",
          joinedDate: new Date().toISOString(),
          idNumber: generateIdNumber('SKR'),
          profileCompleted: false
        };
        const { data: inserted, error: insertError } = await supabase.from('users').insert([newUser]).select().single();
        if (insertError) throw insertError;
        user = inserted;
      }

      const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth sync error:", error);
      res.status(500).json({ message: "Failed to synchronize session" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', req.user.email)
      .eq('isEmployer', !!req.user.isEmployer)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin Verification Routes
  app.get("/api/admin/pending-verifications", authenticateToken, requireAdmin, async (req: any, res, next) => {
    try {
      const { data: pending, error } = await supabase
        .from('users')
        .select('*')
        .eq('isEmployer', true)
        .eq('isVerified', false)
        .eq('isDeactivated', false);

      if (error) {
        if (error.code === '42P01') return res.json([]);
        throw error;
      }
      res.json(pending.map(({ password, ...u }) => u));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: any, res, next) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        if (error.code === '42P01') return res.json([]);
        throw error;
      }
      res.json(users.map(({ password, ...u }) => u));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employer/verify-email-request", authenticateToken, async (req: any, res) => {
    const { email } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    const freeEmailDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
      'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 
      'mail.com', 'gmx.com', 'yandex.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    if (freeEmailDomains.includes(domain)) {
      return res.status(400).json({ message: "Verification email must be a corporate domain." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = {
      code,
      expires: Date.now() + 10 * 60 * 1000
    };

    await supabase.from('users').update({ verificationEmail: email }).eq('id', user.id);
    res.json({ message: "Verification code sent to corporate email." });
  });

  app.post("/api/employer/verify-email-submit", authenticateToken, async (req: any, res) => {
    const { code } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    const identifier = user.verificationEmail;
    if (!identifier) return res.status(400).json({ message: "No verification request found." });

    const record = verificationCodes[identifier];
    if (!record || record.code !== code || record.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    await supabase.from('users').update({ isVerified: true, verificationMethod: 'email' }).eq('id', user.id);
    delete verificationCodes[identifier];

    res.json({ message: "Company verified successfully via email.", user: { ...user, isVerified: true, verificationMethod: 'email' } });
  });

  app.post("/api/employer/upload-documents", authenticateToken, async (req: any, res) => {
    const { documents } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    await supabase.from('users').update({ verificationDocuments: documents, verificationMethod: 'document' }).eq('id', user.id);

    notifyStaff(
      "Document Verification Request",
      `${user.companyName} has uploaded business registration documents for verification.`,
      { view: 'admin', params: { tab: 'verifications', userId: user.id || user.idNumber } }
    );

    res.json({ message: "Documents uploaded successfully. An admin will review them shortly.", user: { ...user, verificationDocuments: documents, verificationMethod: 'document' } });
  });

  app.post("/api/admin/verify-employer", authenticateToken, requireAdmin, async (req: any, res, next) => {
    try {
      const { userId } = req.body;
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`idNumber.eq.${userId},id.eq.${userId}`)
        .single();
      
      if (error || !user) return res.status(404).json({ message: "Employer not found" });
      
      await supabase.from('users').update({ isVerified: true }).eq('id', user.id);
      res.json({ message: "Employer verified successfully", user: { ...user, isVerified: true } });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ message: "Logged out successfully" });
  });

  // Jobs Routes
  app.get("/api/jobs", async (req, res) => {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('postedAt', { ascending: false });
    
    if (error) {
      return res.json([]);
    }
    res.json(jobs);
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, aptitude_tests(*)')
      .or(`id.eq.${req.params.id},idNumber.eq.${req.params.id}`)
      .single();
    
    if (error || !job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  app.post("/api/jobs", authenticateToken, async (req: any, res) => {
    if (!req.user.isEmployer && !req.user.isAdmin) {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const { data: user } = await supabase.from('users').select('id, companyName').eq('email', req.user.email).single();
    
    const newJob = {
      ...req.body,
      postedBy: user?.id,
      company: user?.companyName || req.body.company,
      postedAt: new Date().toISOString(),
      idNumber: generateIdNumber('JOB'),
      status: 'active'
    };

    const { data: insertedJob, error } = await supabase.from('jobs').insert([newJob]).select().single();
    if (error) {
      console.error("Failed to post job:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
    
    res.json(insertedJob);
  });

  // Blog Routes
  app.get("/api/blog", async (req, res) => {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('isDraft', false)
      .order('publishedAt', { ascending: false });
    
    if (error) {
      return res.json([]);
    }
    res.json(posts);
  });

  app.get("/api/blog/:id", async (req, res) => {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post("/api/blog", authenticateToken, async (req: any, res) => {
    // Only admins can post to blog
    const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
    if (!user?.isAdmin && user?.opRole !== 'super_admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data: post, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
    if (error) {
      console.error("Failed to create post:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
    res.json(post);
  });

  app.patch("/api/blog/:id", authenticateToken, async (req: any, res) => {
    const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
    if (!user?.isAdmin && user?.opRole !== 'super_admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data: post, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
    if (error) {
      console.error("Failed to update post:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
    res.json(post);
  });

  app.delete("/api/blog/:id", authenticateToken, async (req: any, res) => {
    const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
    if (!user?.isAdmin && user?.opRole !== 'super_admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
    if (error) {
      console.error("Failed to delete post:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
    res.json({ message: "Post deleted" });
  });

  // Aptitude Test Routes
  app.get("/api/aptitude-tests", async (req, res) => {
    const { data: tests, error } = await supabase.from('aptitude_tests').select('*');
    if (error) {
      return res.json([]);
    }
    res.json(tests);
  });

  app.post("/api/aptitude-tests", authenticateToken, async (req: any, res) => {
    const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
    if (!user?.isAdmin && user?.opRole !== 'super_admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data: test, error } = await supabase.from('aptitude_tests').insert([req.body]).select().single();
    if (error) {
      console.error("Failed to create aptitude test:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
    res.json(test);
  });

  // Application Routes
  app.post("/api/applications", authenticateToken, async (req: any, res) => {
    const { jobId, matchScore, matchReason, isAutoApplied } = req.body;
    
    const { data: user } = await supabase.from('users').select('*').eq('email', req.user.email).single();
    
    const newApplication = {
      jobId,
      userId: user?.id,
      status: 'applied',
      appliedDate: new Date().toISOString(),
      matchScore,
      matchReason,
      isAutoApplied: !!isAutoApplied,
      statusHistory: [{ status: 'applied', date: new Date().toISOString() }]
    };

    const { data: insertedApp, error } = await supabase.from('applications').insert([newApplication]).select('*, jobs(title, company)').single();
    if (error) {
      console.error("Failed to submit application:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }

    // Send confirmation notification
    const job = insertedApp.jobs;
    const confirmMsg = `Your application for ${job.title} at ${job.company} has been successfully submitted. We'll notify you of any updates.`;
    const notifications = user.notifications || [];
    notifications.unshift({
      id: Math.random().toString(36).substr(2, 9),
      title: 'Application Submitted',
      message: confirmMsg,
      type: 'both',
      category: 'application',
      date: new Date().toISOString(),
      isRead: false,
      actionLink: { label: 'Track Application', view: 'seeker-applications' }
    });
    await supabase.from('users').update({ notifications }).eq('id', user.id);
    console.log(`[APP-CONFIRM] To: ${user.email}, Message: ${confirmMsg}`);
    console.log(`[EMAIL] To: ${user.email}, Subject: Application Received - CaliberDesk, Body: ${confirmMsg}`);

    // Clean up pending assessment reminders for this job
    if (user && user.pendingAssessmentReminders) {
      const updatedReminders = user.pendingAssessmentReminders.filter((r: any) => r.jobId !== jobId);
      if (updatedReminders.length !== user.pendingAssessmentReminders.length) {
        await supabase.from('users').update({ pendingAssessmentReminders: updatedReminders }).eq('id', user.id);
      }
    }
    
    res.json(insertedApp);
  });

  app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
    const { data: user, error: fetchError } = await supabase.from('users').select('id').eq('email', req.user.email).single();
    if (fetchError || !user) return res.status(404).json({ message: "User not found" });

    const { error: updateError } = await supabase.from('users').update(req.body).eq('id', user.id);
    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return res.status(500).json({ message: "Failed to update profile" });
    }

    res.json({ message: "Profile updated successfully" });
  });

  app.post("/api/user/purchase-verification", authenticateToken, async (req: any, res) => {
    const { data: user, error: fetchError } = await supabase.from('users').select('*').eq('email', req.user.email).single();
    if (fetchError || !user) return res.status(404).json({ message: "User not found" });

    // Simulate payment processing
    const amount = 49.99;
    const transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      item: "Employment History Verification Service",
      amount,
      status: 'completed',
      paymentMethod: 'Credit Card'
    };

    const purchaseHistory = user.purchaseHistory || [];
    purchaseHistory.push(transaction);

    const { error: updateError } = await supabase.from('users').update({
      purchaseHistory,
      employmentVerificationStatus: 'pending'
    }).eq('id', user.id);

    if (updateError) {
      console.error("Failed to process verification purchase:", updateError);
      return res.status(500).json({ message: "Failed to process purchase" });
    }

    const notifications = user.notifications || [];
    notifications.unshift({
      id: Math.random().toString(36).substr(2, 9),
      title: 'Verification Service Purchased',
      message: 'You have successfully purchased the Employment History Verification Service. Our team will now reach out to your past employers.',
      type: 'both',
      category: 'system',
      date: new Date().toISOString(),
      isRead: false
    });
    await supabase.from('users').update({ notifications }).eq('id', user.id);

    res.json({ message: "Verification service purchased successfully", status: 'pending' });
  });

  app.post("/api/admin/verify-employment", authenticateToken, async (req: any, res) => {
    const { userId, experienceIndex, isVerified } = req.body;

    const { data: adminUser } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
    if (!adminUser?.isAdmin && adminUser?.opRole !== 'super_admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data: targetUser, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single();
    if (fetchError || !targetUser) return res.status(404).json({ message: "User not found" });

    const workHistory = [...(targetUser.workHistory || [])];
    if (experienceIndex < 0 || experienceIndex >= workHistory.length) {
      return res.status(400).json({ message: "Invalid experience index" });
    }

    workHistory[experienceIndex].isVerified = isVerified;

    const allVerified = workHistory.every(exp => exp.isVerified);
    const employmentVerificationStatus = allVerified ? 'completed' : 'pending';
    
    const updateData: any = { workHistory, employmentVerificationStatus };
    if (allVerified) {
      updateData.verificationCertificateUrl = `https://caliberdesk.com/certificates/verify-${targetUser.id}.pdf`;
    }

    const { error: updateError } = await supabase.from('users').update(updateData).eq('id', userId);

    if (updateError) {
      console.error("Failed to update employment verification:", updateError);
      return res.status(500).json({ message: "Failed to update verification" });
    }

    if (allVerified) {
      const notifications = targetUser.notifications || [];
      notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        title: 'Employment Verification Completed',
        message: 'Congratulations! Your employment history has been fully verified. You now have a verification badge and a digital certificate available on your profile.',
        type: 'both',
        category: 'system',
        date: new Date().toISOString(),
        isRead: false
      });
      await supabase.from('users').update({ notifications }).eq('id', userId);
    }

    res.json({ message: "Employment verification updated", status: employmentVerificationStatus });
  });

  app.get("/api/my-applications", authenticateToken, async (req: any, res) => {
    const { data: user } = await supabase.from('users').select('id').eq('email', req.user.email).single();
    
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('userId', user?.id)
      .order('appliedDate', { ascending: false });
    
    if (error) {
      return res.json([]);
    }
    res.json(apps);
  });

  app.patch("/api/jobs/:id", authenticateToken, async (req: any, res) => {
    const { status } = req.body;
    const { data: job, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      console.error("Failed to update job:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }

    // If job is closed, notify all applicants
    if (status === 'closed') {
      const { data: apps } = await supabase
        .from('applications')
        .select('*, users(*)')
        .eq('jobId', job.id);
      
      if (apps) {
        for (const app of apps) {
          const user = app.users;
          if (!user) continue;

          const closeMsg = `The job "${job.title}" at ${job.company} has officially closed for applications. The employer will reach out to you directly if you are successful. Thank you for applying!`;
          const notifications = user.notifications || [];
          notifications.unshift({
            id: Math.random().toString(36).substr(2, 9),
            title: 'Job Closed',
            message: closeMsg,
            type: 'both',
            category: 'application',
            date: new Date().toISOString(),
            isRead: false,
            actionLink: { label: 'Track Application', view: 'seeker-applications' }
          });
          await supabase.from('users').update({ notifications }).eq('id', user.id);
          console.log(`[JOB-CLOSED] To: ${user.email}, Message: ${closeMsg}`);
          console.log(`[EMAIL] To: ${user.email}, Subject: Job Closed - ${job.title}, Body: ${closeMsg}`);
        }
      }
    }

    res.json(job);
  });

  app.patch("/api/applications/:id", authenticateToken, async (req: any, res) => {
    const { status, dueDate } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = dueDate;

    const { data: app, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, jobs(title, company), users(*)')
      .single();
    
    if (error) {
      console.error("Failed to update application:", error);
      return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }

    // If status updated, notify seeker
    if (status) {
      const user = app.users;
      const job = app.jobs;
      if (user && job) {
        const statusMsg = `Your application for ${job.title} at ${job.company} has been updated to: ${status.toUpperCase()}.`;
        const notifications = user.notifications || [];
        notifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Application Status Updated',
          message: statusMsg,
          type: 'both',
          category: 'application',
          date: new Date().toISOString(),
          isRead: false,
          actionLink: { label: 'Track Application', view: 'seeker-applications' }
        });
        await supabase.from('users').update({ notifications }).eq('id', user.id);
        console.log(`[STATUS-UPDATE] To: ${user.email}, Message: ${statusMsg}`);
        console.log(`[EMAIL] To: ${user.email}, Subject: Application Status Updated - CaliberDesk, Body: ${statusMsg}`);
      }
    }

    res.json(app);
  });

  // OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    if (!googleClient) {
      return res.status(400).json({ message: "Google OAuth is not configured" });
    }
    const isEmployer = req.query.isEmployer === 'true';
    const redirectUri = getRedirectUri(req, "/auth/google/callback");
    
    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      redirect_uri: redirectUri,
      state: JSON.stringify({ isEmployer })
    });
    
    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!googleClient) {
      return res.status(400).send("Google OAuth is not configured");
    }
    const { isEmployer } = JSON.parse(state as string || '{}');
    const redirectUri = getRedirectUri(req, "/auth/google/callback");

    try {
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      googleClient.setCredentials(tokens);

      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const { name, email, picture, given_name, family_name } = userInfoResponse.data;
      
      let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('isEmployer', !!isEmployer)
        .single();

      if (!user) {
        if (isEmployer) {
          const freeEmailDomains = [
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
            'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 
            'mail.com', 'gmx.com', 'yandex.com'
          ];
          const domain = email.split('@')[1]?.toLowerCase();
          if (freeEmailDomains.includes(domain)) {
            return res.send(`
              <html>
                <body>
                  <script>
                    if (window.opener) {
                      window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', message: 'Employers must use a corporate email address.' }, '*');
                      window.close();
                    } else {
                      window.location.href = '/';
                    }
                  </script>
                </body>
              </html>
            `);
          }
        }

        const newUser = {
          name,
          firstName: given_name || name.split(' ')[0],
          middleName: "",
          lastName: family_name || name.split(' ').slice(1).join(' '),
          email: email.toLowerCase(),
          isEmployer: !!isEmployer,
          isVerified: !isEmployer,
          isSuperUser: !!isEmployer,
          role: isEmployer ? "Employer" : "Seeker",
          city: "",
          country: "",
          profileCompleted: false,
          linkedInConnected: false,
          isSubscribed: false,
          subscriptionTier: "free",
          purchaseHistory: [],
          adOptIn: true,
          alerts: [],
          savedJobIds: [],
          autoApplyEnabled: false,
          profileImages: picture ? [picture] : [],
          workHistory: [],
          education: [],
          stealthMode: false,
          phoneNumbers: [],
          subUsers: [],
          joinedDate: new Date().toISOString(),
          idNumber: generateIdNumber(isEmployer ? 'CMP' : 'SKR')
        };
        
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (insertError) throw insertError;
        user = inserted;
      }

      const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google OAuth Error:", error);
      res.status(500).send("An unexpected error occurred. Please try again later.");
    }
  });

  app.get("/api/auth/linkedin/url", (req, res) => {
    const isEmployer = req.query.isEmployer === 'true';
    const redirectUri = getRedirectUri(req, "/auth/linkedin/callback");
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID || "",
      redirect_uri: redirectUri,
      state: JSON.stringify({ isEmployer }),
      scope: "r_liteprofile r_emailaddress"
    });
    
    const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url });
  });

  app.get("/auth/linkedin/callback", async (req, res) => {
    const { code, state } = req.query;
    const { isEmployer } = JSON.parse(state as string || '{}');
    const redirectUri = getRedirectUri(req, "/auth/linkedin/callback");

    try {
      const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID || "",
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || ""
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const accessToken = tokenResponse.data.access_token;

      const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const emailResponse = await axios.get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const firstName = profileResponse.data.localizedFirstName;
      const lastName = profileResponse.data.localizedLastName;
      const name = `${firstName} ${lastName}`;
      const email = emailResponse.data.elements[0]["handle~"].emailAddress;

      let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('isEmployer', !!isEmployer)
        .single();

      if (!user) {
        if (isEmployer) {
          const freeEmailDomains = [
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
            'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 
            'mail.com', 'gmx.com', 'yandex.com'
          ];
          const domain = email.split('@')[1]?.toLowerCase();
          if (freeEmailDomains.includes(domain)) {
            return res.send(`
              <html>
                <body>
                  <script>
                    if (window.opener) {
                      window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', message: 'Employers must use a corporate email address.' }, '*');
                      window.close();
                    } else {
                      window.location.href = '/';
                    }
                  </script>
                </body>
              </html>
            `);
          }
        }

        const newUser = {
          name,
          firstName,
          middleName: "",
          lastName,
          email: email.toLowerCase(),
          isEmployer: !!isEmployer,
          isVerified: !isEmployer,
          isSuperUser: !!isEmployer,
          role: isEmployer ? "Employer" : "Seeker",
          city: "",
          country: "",
          profileCompleted: false,
          linkedInConnected: true,
          isSubscribed: false,
          subscriptionTier: "free",
          purchaseHistory: [],
          adOptIn: true,
          alerts: [],
          savedJobIds: [],
          autoApplyEnabled: false,
          profileImages: [],
          workHistory: [],
          education: [],
          stealthMode: false,
          phoneNumbers: [],
          subUsers: [],
          joinedDate: new Date().toISOString(),
          idNumber: generateIdNumber(isEmployer ? 'CMP' : 'SKR')
        };
        
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (insertError) throw insertError;
        user = inserted;
      }

      const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("LinkedIn OAuth Error:", error);
      res.status(500).send("An unexpected error occurred. Please try again later.");
    }
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        configFile: path.resolve(__dirname, "vite.config.ts"),
      });
      app.use(vite.middlewares);
      
      // Fallback for SPA routes in dev mode
      app.get("*", async (req, res, next) => {
        if (req.originalUrl.startsWith("/api")) return next();
        try {
          const template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
          const html = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e) {
          console.error("Vite transformation error:", e);
          next(e);
        }
      });
    } catch (viteError) {
      console.error("Vite initialization failed:", viteError);
    }
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
  });

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await checkSupabaseConnection();
    await seedMockUsers();
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
