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

// --- Utilities ---
const generateIdNumber = (prefix: string) => {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
};

const filterObject = (obj: any, validKeys: string[]) => {
  const filtered: any = {};
  validKeys.forEach(key => { if (key in obj && obj[key] !== undefined && obj[key] !== null) filtered[key] = obj[key]; });
  return filtered;
};

const USER_TABLE_KEYS = [
  'id','email','password','name','firstName','middleName','lastName','phoneNumbers',
  'isEmployer','isVerified','joinedDate','companyName','isSuperUser','idNumber',
  'role','city','country','skills','digitalSkills','certifications','hobbies',
  'projects','experienceSummary','profileCompleted','linkedInConnected','isSubscribed',
  'subscriptionTier','purchaseHistory','adOptIn','alerts','savedJobIds','autoApplyEnabled',
  'profileImages','workHistory','education','stealthMode','notifications','subUsers',
  'isAdmin','opRole','isDeactivated','deactivationDate','verificationEmail',
  'verificationMethod','verificationDocuments','pendingAssessmentReminders',
  'employmentVerificationStatus','verificationCertificateUrl'
];

// --- Schemas ---
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
  password: z.string().min(6),
  isEmployer: z.boolean(),
  phone: z.string().optional().default(""),
  country: z.string().optional().default(""),
  companyName: z.string().optional(),
  subUsers: z.array(z.any()).optional(),
  verificationCode: z.string().optional()
});

// --- Helpers ---
const hashPassword = async (password: string) => bcrypt.hash(password, 10);
const verificationCodes: Record<string, { code: string; expires: number }> = {};

// --- Middleware ---
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: "Too many attempts" }, standardHeaders: true, legacyHeaders: false });
const passwordResetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { message: "Too many reset requests" }, standardHeaders: true, legacyHeaders: false });

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, FINAL_JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (!req.user.isAdmin && !req.user.opRole)) return res.status(403).json({ message: "Admin access required" });
  next();
};

const notifyStaff = async (title: string, message: string, actionLink?: any) => {
  const { data: staff } = await supabase.from('users').select('*').or('isAdmin.eq.true,opRole.neq.null');
  if (!staff) return;
  for (const s of staff) {
    const notifications = s.notifications || [];
    notifications.unshift({ id: Math.random().toString(36).substr(2, 9), title, message, type: 'in-app', category: 'system', date: new Date().toISOString(), isRead: false, actionLink });
    await supabase.from('users').update({ notifications }).eq('id', s.id);
  }
};

// ============================================================================
// ROUTES
// ============================================================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Auth ---
app.post("/api/auth/send-verification", async (req, res) => {
  const { email, phone } = req.body;
  const identifier = email || phone;
  if (!identifier) return res.status(400).json({ message: "Email or phone is required" });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[identifier] = { code, expires: Date.now() + 10 * 60 * 1000 };
  res.json({ message: "Verification code sent", code }); // code returned for testing
});

app.post("/api/auth/verify-code", async (req, res) => {
  const { email, phone, code } = req.body;
  const identifier = email || phone;
  const record = verificationCodes[identifier];
  if (!record || record.code !== code || record.expires < Date.now()) return res.status(400).json({ message: "Invalid or expired code" });
  delete verificationCodes[identifier];
  res.json({ message: "Code verified successfully" });
});

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ message: "Invalid input", errors: (validation.error as any).errors });

    const { firstName, middleName, lastName, email, password, isEmployer, phone, country, companyName, subUsers, verificationCode } = validation.data;
    const name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;

    if (!isEmployer) {
      if (!verificationCode) return res.status(400).json({ message: "Verification code is required for seeker registration." });
      const record = verificationCodes[email];
      if (!record || record.code !== verificationCode || record.expires < Date.now()) return res.status(400).json({ message: "Invalid or expired verification code." });
      delete verificationCodes[email];
    }

    if (isEmployer && !companyName) return res.status(400).json({ message: "Company name is required for employer accounts." });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).eq('isEmployer', !!isEmployer).single();
    if (existing) return res.status(400).json({ message: `A ${isEmployer ? 'company' : 'seeker'} account already exists with this email.` });

    const hashedPassword = await hashPassword(password);
    const userToInsert = {
      ...filterObject({
        name, firstName, middleName, lastName, email: email.toLowerCase(), password: hashedPassword,
        phoneNumbers: [phone], isEmployer: !!isEmployer, isVerified: !isEmployer,
        joinedDate: new Date().toISOString(), companyName: isEmployer ? companyName : null,
        isSuperUser: !!isEmployer, idNumber: generateIdNumber(isEmployer ? 'CMP' : 'SKR'),
        role: isEmployer ? "Employer" : "Seeker", country: country || "",
        profileCompleted: false, isSubscribed: false, subscriptionTier: "free",
        purchaseHistory: [], adOptIn: true, alerts: [], savedJobIds: [], notifications: [], subUsers: isEmployer ? (subUsers || []) : []
      }, USER_TABLE_KEYS),
      id: crypto.randomUUID()
    };

    const { data: insertedUser, error } = await supabase.from('users').insert([userToInsert]).select().single();
    if (error) return res.status(500).json({ message: "Registration failed", details: error.message });

    if (isEmployer) notifyStaff("New Employer Sign Up", `${companyName} (${email}) requires verification.`, { view: 'admin', params: { tab: 'verifications' } });

    const token = jwt.sign({ email: insertedUser.email, isEmployer: insertedUser.isEmployer, isAdmin: insertedUser.isAdmin, role: insertedUser.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    const { password: _, ...userWithoutPassword } = insertedUser;
    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password, isEmployer } = loginSchema.parse(req.body);
    let query: any = supabase.from('users').select('*').eq('email', email.toLowerCase());
    if (isEmployer !== undefined) query = query.eq('isEmployer', !!isEmployer);
    const { data: user, error } = await query.single();

    if (error || !user) {
      const { data: staffUser } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).eq('isAdmin', true).single();
      if (!staffUser) return res.status(401).json({ message: "Invalid credentials or account type" });
      return handleLogin(staffUser, password, res);
    }
    return handleLogin(user, password, res);
  } catch (err: any) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

const handleLogin = async (user: any, password: string, res: any) => {
  const isMatch = user.password && await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  if (user.isDeactivated) return res.status(403).json({ message: "Account deactivated. Contact support@caliberdesk.com." });
  const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

app.post("/api/auth/sync", async (req, res) => {
  try {
    const { access_token, isEmployer: intendedIsEmployer } = req.body;
    if (!access_token) return res.status(400).json({ message: "Access token required" });

    const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser(access_token);
    if (sbError || !sbUser) return res.status(401).json({ message: "Invalid Supabase session" });

    const email = sbUser.email?.toLowerCase();
    let user: any = null;

    if (intendedIsEmployer !== undefined) {
      const { data } = await supabase.from('users').select('*').eq('email', email).eq('isEmployer', !!intendedIsEmployer).maybeSingle();
      user = data;
    }
    if (!user) {
      const { data: existingUsers } = await supabase.from('users').select('*').eq('email', email);
      if (existingUsers && existingUsers.length > 0) {
        user = intendedIsEmployer !== undefined
          ? existingUsers.find(u => u.isEmployer === !!intendedIsEmployer) || existingUsers[0]
          : existingUsers.find(u => u.isAdmin) || existingUsers.find(u => u.isEmployer) || existingUsers[0];
      }
    }
    if (!user) {
      const isEmp = intendedIsEmployer !== undefined ? !!intendedIsEmployer : false;
      const newUser = { name: sbUser.user_metadata?.full_name || email?.split('@')[0], email, isEmployer: isEmp, isVerified: !isEmp, role: isEmp ? "Employer" : "Seeker", joinedDate: new Date().toISOString(), idNumber: generateIdNumber(isEmp ? 'CMP' : 'SKR'), profileCompleted: false, isSuperUser: isEmp };
      const { data: inserted, error: ie } = await supabase.from('users').insert([{ ...newUser, id: crypto.randomUUID() }]).select().single();
      if (ie) throw ie;
      user = inserted;
    }

    const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin, role: user.role }, FINAL_JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to synchronize session", error: err.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  const { data: user, error } = await supabase.from('users').select('*').eq('email', req.user.email).eq('isEmployer', !!req.user.isEmployer).single();
  if (error || !user) return res.status(404).json({ message: "User not found" });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ message: "Logged out successfully" });
});

app.post("/api/auth/reset-password", passwordResetLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  res.json({ message: "Password reset link sent if email exists." });
});

// --- Jobs ---
app.get("/api/jobs", async (req, res) => {
  const { data: jobs, error } = await supabase.from('jobs').select('*').eq('status', 'active').order('postedAt', { ascending: false });
  if (error) return res.json([]);
  res.json(jobs);
});

app.get("/api/jobs/:id", async (req, res) => {
  const { data: job, error } = await supabase.from('jobs').select('*, aptitude_tests(*)').or(`id.eq.${req.params.id},idNumber.eq.${req.params.id}`).single();
  if (error || !job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
});

app.post("/api/jobs", authenticateToken, async (req: any, res) => {
  if (!req.user.isEmployer && !req.user.isAdmin) return res.status(403).json({ message: "Only employers can post jobs" });
  const { data: user } = await supabase.from('users').select('id, companyName').eq('email', req.user.email).single();
  const newJob = { ...req.body, postedBy: user?.id, company: user?.companyName || req.body.company, postedAt: new Date().toISOString(), idNumber: req.body.idNumber || generateIdNumber('JOB'), status: 'active' };
  const { data: inserted, error } = await supabase.from('jobs').insert([newJob]).select().single();
  if (error) return res.status(500).json({ message: "Failed to post job", details: error.message });
  res.json(inserted);
});

app.patch("/api/jobs/:id", authenticateToken, async (req: any, res) => {
  const { status } = req.body;
  const { data: job, error } = await supabase.from('jobs').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: "Failed to update job" });
  if (status === 'closed') {
    const { data: apps } = await supabase.from('applications').select('*, users(*)').eq('jobId', job.id);
    if (apps) {
      for (const app of apps) {
        const user: any = app.users;
        if (!user) continue;
        const msg = `The job "${job.title}" at ${job.company} has closed. Thank you for applying!`;
        const notifications = user.notifications || [];
        notifications.unshift({ id: Math.random().toString(36).substr(2, 9), title: 'Job Closed', message: msg, type: 'both', category: 'application', date: new Date().toISOString(), isRead: false });
        await supabase.from('users').update({ notifications }).eq('id', user.id);
      }
    }
  }
  res.json(job);
});

// --- Applications ---
app.get("/api/my-applications", authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('id').eq('email', req.user.email).single();
  const { data: apps, error } = await supabase.from('applications').select('*, jobs(*)').eq('userId', user?.id).order('appliedDate', { ascending: false });
  if (error) return res.json([]);
  res.json(apps);
});

app.post("/api/applications", authenticateToken, async (req: any, res) => {
  const { jobId, matchScore, matchReason, isAutoApplied } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', req.user.email).single();
  const newApp = { jobId, userId: user?.id, status: 'applied', appliedDate: new Date().toISOString(), matchScore, matchReason, isAutoApplied: !!isAutoApplied, statusHistory: [{ status: 'applied', date: new Date().toISOString() }] };
  const { data: inserted, error } = await supabase.from('applications').insert([newApp]).select('*, jobs(title, company)').single();
  if (error) return res.status(500).json({ message: "Failed to submit application", details: error.message });
  res.json(inserted);
});

app.patch("/api/applications/:id", authenticateToken, async (req: any, res) => {
  const { status, dueDate } = req.body;
  const updateData: any = {};
  if (status) updateData.status = status;
  if (dueDate) updateData.dueDate = dueDate;
  const { data: app, error } = await supabase.from('applications').update(updateData).eq('id', req.params.id).select('*, jobs(title, company), users(*)').single();
  if (error) return res.status(500).json({ message: "Failed to update application" });
  res.json(app);
});

// --- User Profile ---
app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
  const { data: user, error: fe } = await supabase.from('users').select('id').eq('email', req.user.email).single();
  if (fe || !user) return res.status(404).json({ message: "User not found" });
  const { error } = await supabase.from('users').update(req.body).eq('id', user.id);
  if (error) return res.status(500).json({ message: "Failed to update profile", details: error.message });
  res.json({ message: "Profile updated successfully" });
});

// --- Blog ---
app.get("/api/blog", async (req, res) => {
  const { data: posts, error } = await supabase.from('blog_posts').select('*').eq('isDraft', false).order('publishedAt', { ascending: false });
  if (error) return res.json([]);
  res.json(posts);
});

app.get("/api/blog/:id", async (req, res) => {
  const { data: post, error } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

app.post("/api/blog", authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
  if (!user?.isAdmin && user?.opRole !== 'super_admin') return res.status(403).json({ message: "Unauthorized" });
  const { data: post, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: "Failed to create post" });
  res.json(post);
});

app.patch("/api/blog/:id", authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
  if (!user?.isAdmin && user?.opRole !== 'super_admin') return res.status(403).json({ message: "Unauthorized" });
  const { data: post, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: "Failed to update post" });
  res.json(post);
});

app.delete("/api/blog/:id", authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
  if (!user?.isAdmin && user?.opRole !== 'super_admin') return res.status(403).json({ message: "Unauthorized" });
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: "Failed to delete post" });
  res.json({ message: "Post deleted" });
});

// --- Aptitude Tests ---
app.get("/api/aptitude-tests", async (req, res) => {
  const { data: tests, error } = await supabase.from('aptitude_tests').select('*');
  if (error) return res.json([]);
  res.json(tests);
});

app.post("/api/aptitude-tests", authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('isAdmin, opRole').eq('email', req.user.email).single();
  if (!user?.isAdmin && user?.opRole !== 'super_admin') return res.status(403).json({ message: "Unauthorized" });
  const { data: test, error } = await supabase.from('aptitude_tests').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: "Failed to create aptitude test" });
  res.json(test);
});

// --- Employer ---
app.post("/api/employer/verify-email-request", authenticateToken, async (req: any, res) => {
  const { email } = req.body;
  const freeEmailDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com','protonmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (freeEmailDomains.includes(domain)) return res.status(400).json({ message: "Verification email must be a corporate domain." });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  const { data: user } = await supabase.from('users').select('*').eq('email', req.user.email).single();
  if (user) await supabase.from('users').update({ verificationEmail: email }).eq('id', user.id);
  res.json({ message: "Verification code sent to corporate email." });
});

app.post("/api/employer/verify-email-submit", authenticateToken, async (req: any, res) => {
  const { code } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', req.user.email).single();
  if (!user) return res.status(404).json({ message: "User not found" });
  const identifier = user.verificationEmail;
  if (!identifier) return res.status(400).json({ message: "No verification request found." });
  const record = verificationCodes[identifier];
  if (!record || record.code !== code || record.expires < Date.now()) return res.status(400).json({ message: "Invalid or expired code." });
  await supabase.from('users').update({ isVerified: true, verificationMethod: 'email' }).eq('id', user.id);
  delete verificationCodes[identifier];
  res.json({ message: "Company verified successfully." });
});

app.post("/api/employer/upload-documents", authenticateToken, async (req: any, res) => {
  const { documents } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', req.user.email).single();
  if (!user) return res.status(404).json({ message: "User not found" });
  await supabase.from('users').update({ verificationDocuments: documents, verificationMethod: 'document' }).eq('id', user.id);
  notifyStaff("Document Verification Request", `${user.companyName} uploaded documents for verification.`, { view: 'admin', params: { tab: 'verifications', userId: user.id } });
  res.json({ message: "Documents uploaded. An admin will review them shortly." });
});

// --- Admin ---
app.get("/api/admin/pending-verifications", authenticateToken, requireAdmin, async (req: any, res) => {
  const { data: pending, error } = await supabase.from('users').select('*').eq('isEmployer', true).eq('isVerified', false).eq('isDeactivated', false);
  if (error) return res.json([]);
  res.json(pending.map(({ password, ...u }) => u));
});

app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: any, res) => {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) return res.json([]);
  res.json(users.map(({ password, ...u }) => u));
});

app.post("/api/admin/verify-employer", authenticateToken, requireAdmin, async (req: any, res) => {
  const { userId } = req.body;
  const { data: user, error } = await supabase.from('users').select('*').or(`idNumber.eq.${userId},id.eq.${userId}`).single();
  if (error || !user) return res.status(404).json({ message: "Employer not found" });
  await supabase.from('users').update({ isVerified: true }).eq('id', user.id);
  res.json({ message: "Employer verified successfully" });
});

app.post("/api/user/purchase-verification", authenticateToken, async (req: any, res) => {
  const { data: user, error: fe } = await supabase.from('users').select('*').eq('email', req.user.email).single();
  if (fe || !user) return res.status(404).json({ message: "User not found" });
  const transaction = { id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), item: "Employment History Verification Service", amount: 49.99, status: 'completed', paymentMethod: 'Credit Card' };
  const purchaseHistory = [...(user.purchaseHistory || []), transaction];
  const { error } = await supabase.from('users').update({ purchaseHistory, employmentVerificationStatus: 'pending' }).eq('id', user.id);
  if (error) return res.status(500).json({ message: "Failed to process purchase" });
  res.json({ message: "Verification service purchased successfully", status: 'pending' });
});

export default app;
