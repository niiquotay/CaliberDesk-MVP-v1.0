import express from "express";
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
import { MOCK_USER, MOCK_EMPLOYER, STAFF_ACCOUNTS } from "./constants";
import { UserProfile } from "./types";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

  const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  ) : null;

  const getRedirectUri = (req: any, path: string) => {
    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;
    return `${origin}${path}`;
  };

  app.use(express.json());
  app.use(cookieParser());

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
    const now = new Date();
    const { data: users, error } = await supabase.from('users').select('*');
    if (error || !users) return;

    for (const u of users) {
      if (u.isEmployer && !u.isVerified && !u.isDeactivated && u.joinedDate) {
        const joined = new Date(u.joinedDate);
        const diffDays = Math.ceil((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 35) {
          await supabase.from('users').update({ isDeactivated: true, deactivationDate: now.toISOString() }).eq('id', u.id);
          console.log(`[SYSTEM] Deactivated unverified employer account: ${u.email}`);
        }
      }
    }
  };

  // Run deactivation check every hour (simulated)
  setInterval(checkDeactivations, 60 * 60 * 1000);
  checkDeactivations(); // Initial check

  // Seed mock users if database is empty
  const seedMockUsers = async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (count === 0) {
      console.log("[SYSTEM] Seeding mock users to Supabase...");
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
      if (error) console.error("[SYSTEM] Seeding error:", error);
      else console.log("[SYSTEM] Mock users seeded successfully.");
    }
  };
  seedMockUsers();

  // In-memory verification codes
  const verificationCodes: Record<string, { code: string; expires: number }> = {};

  // Helper to hash passwords for new users
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // API Routes
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

    console.log(`[VERIFICATION] Code for ${identifier}: ${code}`);
    
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

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, middleName, lastName, email, password, isEmployer, phone, country, companyName, subUsers, verificationCode } = req.body;
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
        return res.status(500).json({ message: "Failed to create user account." });
      }

      if (isEmployer) {
        notifyStaff(
          "New Employer Sign Up",
          `A new employer ${companyName} (${email}) has signed up and requires verification.`,
          { view: 'admin', params: { tab: 'verifications' } }
        );
      }

      const token = jwt.sign({ email: insertedUser.email, isEmployer: insertedUser.isEmployer, isAdmin: insertedUser.isAdmin }, JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      
      const { password: _, ...userWithoutPassword } = insertedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, isEmployer } = req.body;
      
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
      res.status(500).json({ message: "Internal server error during login" });
    }
  });

  const handleLogin = async (user: any, password: any, res: any) => {
    if (user.email.toLowerCase().endsWith('@caliberdesk.com') && !user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized staff access. Please contact an administrator." });
    }

    const isMatch = user.password === password || (user.password && await bcrypt.compare(password, user.password));

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isDeactivated) {
      return res.status(403).json({ 
        message: "Your account has been deactivated due to incomplete verification within 35 days. Please contact support@caliberdesk.com to reactivate." 
      });
    }

    const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  };

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
  app.get("/api/admin/pending-verifications", authenticateToken, async (req: any, res) => {
    if (!req.user.isAdmin && !req.user.opRole) return res.status(403).json({ message: "Forbidden" });
    
    const { data: pending, error } = await supabase
      .from('users')
      .select('*')
      .eq('isEmployer', true)
      .eq('isVerified', false)
      .eq('isDeactivated', false);

    if (error) return res.status(500).json({ message: "Failed to fetch pending verifications" });
    res.json(pending.map(({ password, ...u }) => u));
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
    console.log(`[VERIFICATION] Code for ${email}: ${code}`);
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

  app.post("/api/admin/verify-employer", authenticateToken, async (req: any, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
    
    const { userId } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`idNumber.eq.${userId},id.eq.${userId}`)
      .single();
    
    if (error || !user) return res.status(404).json({ message: "Employer not found" });
    
    await supabase.from('users').update({ isVerified: true }).eq('id', user.id);
    res.json({ message: "Employer verified successfully", user: { ...user, isVerified: true } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ message: "Logged out successfully" });
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

      const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "24h" });
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
      res.status(500).send("Authentication failed");
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

      const token = jwt.sign({ email: user.email, isEmployer: user.isEmployer, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "24h" });
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
      res.status(500).send("Authentication failed");
    }
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite dev server...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        configFile: path.resolve(__dirname, "vite.config.ts"),
      });
      console.log("Vite dev server initialized.");
      app.use(vite.middlewares);
      
      // Fallback for SPA routes in dev mode
      app.use("*all", async (req, res, next) => {
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
    app.get("*all", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
