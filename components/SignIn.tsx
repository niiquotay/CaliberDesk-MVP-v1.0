import React, { useState } from 'react';
import { 
  Mail, Lock, LogIn, ArrowLeft, 
  AlertCircle, Loader2, Linkedin, Users, Sparkles, 
  X, ArrowRight, Phone, ShieldCheck, Briefcase, Building2, Globe
} from 'lucide-react';
import { UserProfile, OperationalRole } from '../types';
import { MOCK_USER, MOCK_EMPLOYER, STAFF_ACCOUNTS, ALL_COUNTRIES } from '../constants';
import { validatePhoneNumber } from '../utils';
import { supabase } from '../src/lib/supabase';

interface SignInProps {
  onSignIn: (user: UserProfile) => void;
  onBack: () => void;
  initialIsEmployer?: boolean;
  initialShowStaffPortal?: boolean;
  onStaffPortalToggle?: (isStaff: boolean) => void;
  initialIsForgotPassword?: boolean;
  initialEmail?: string;
  initialResetCode?: string;
}

const SignIn: React.FC<SignInProps> = ({ 
  onSignIn, onBack, initialIsEmployer = false, initialShowStaffPortal = false, 
  onStaffPortalToggle, initialIsForgotPassword = false, initialEmail = '', initialResetCode = '' 
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('USA');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState(initialResetCode);
  const [isEmployer, setIsEmployer] = useState(initialIsEmployer);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(initialIsForgotPassword);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(initialResetCode ? 2 : 1); // 1: Email, 2: Code & New Password
  const [signUpStep, setSignUpStep] = useState(1); // 1: Basic, 2: Verification, 3: Sub-Users (Employer only)
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStaffPortal, setShowStaffPortal] = useState(initialShowStaffPortal);

  React.useEffect(() => {
    setShowStaffPortal(initialShowStaffPortal);
  }, [initialShowStaffPortal]);
  const handleStaffPortalToggle = (isStaff: boolean) => {
    setShowStaffPortal(isStaff);
    if (onStaffPortalToggle) {
      onStaffPortalToggle(isStaff);
    }
  };
  const [subUsers, setSubUsers] = useState<{ 
    firstName: string; 
    middleName: string; 
    lastName: string; 
    email: string; 
    phone: string; 
    role: 'admin' | 'recruiter' | 'viewer' 
  }[]>([]);
  const [newSubUserFirstName, setNewSubUserFirstName] = useState('');
  const [newSubUserMiddleName, setNewSubUserMiddleName] = useState('');
  const [newSubUserLastName, setNewSubUserLastName] = useState('');
  const [newSubUserEmail, setNewSubUserEmail] = useState('');
  const [newSubUserPhone, setNewSubUserPhone] = useState('');
  const [newSubUserRole, setNewSubUserRole] = useState<'admin' | 'recruiter' | 'viewer'>('recruiter');

  const addSubUser = () => {
    if (!newSubUserFirstName || !newSubUserLastName || !newSubUserEmail || !newSubUserPhone) return;
    setSubUsers([...subUsers, { 
      firstName: newSubUserFirstName, 
      middleName: newSubUserMiddleName, 
      lastName: newSubUserLastName, 
      email: newSubUserEmail, 
      phone: newSubUserPhone, 
      role: newSubUserRole 
    }]);
    setNewSubUserFirstName('');
    setNewSubUserMiddleName('');
    setNewSubUserLastName('');
    setNewSubUserEmail('');
    setNewSubUserPhone('');
  };

  const removeSubUser = (index: number) => {
    setSubUsers(subUsers.filter((_, i) => i !== index));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (forgotPasswordStep === 1) {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to send reset code");
        }
        setForgotPasswordStep(2);
      } else {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode, newPassword: password }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to reset password");
        }
        setIsForgotPassword(false);
        setForgotPasswordStep(1);
        setError(null);
        // Show success message
        alert("Password reset successfully. You can now log in.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (forgotPasswordStep === 2) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.");
        }
      }
      await handleForgotPassword(e);
      return;
    }

    if (isSignUp && signUpStep === 1) {
      setIsLoading(true);
      setError(null);
      try {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.");
        }
        
        // Staff domain restriction for general sign-up
        if (email.toLowerCase().endsWith('@caliberdesk.com')) {
          throw new Error("Staff accounts cannot be created directly. Please contact an administrator.");
        }

        // Validate phone number
        if (!validatePhoneNumber(phone, country)) {
          throw new Error(`Invalid phone number for ${country}. Please check the format and digits.`);
        }
        
        // Check if seeker using gmail skips verification
        const isGmail = email.toLowerCase().endsWith('@gmail.com');
        if (!isEmployer && isGmail) {
          // Skip verification and finalize registration for Gmail seekers
          await finalizeRegistration();
          return;
        }

        // Send verification code
        const response = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to send verification code");
        }
        setSignUpStep(2);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isSignUp && signUpStep === 2) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, code: verificationCode }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Invalid verification code");
        }
        
        if (isEmployer) {
          setSignUpStep(3);
        } else {
          // Finalize seeker registration
          await finalizeRegistration();
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isSignUp && isEmployer && signUpStep === 3) {
      await finalizeRegistration();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If staff portal, we don't strictly enforce isEmployer flag on the backend
      const payload = showStaffPortal ? { email, password } : { email, password, isEmployer }; 

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onSignIn(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeRegistration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Frontend validation for employer email
      if (isEmployer) {
        const freeEmailDomains = [
          'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
          'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 
          'mail.com', 'gmx.com', 'yandex.com'
        ];
        const domain = email.split('@')[1]?.toLowerCase();
        if (freeEmailDomains.includes(domain)) {
          throw new Error("Employers must use a corporate email address. Free providers like Gmail are not permitted.");
        }

        if (subUsers.length === 0) {
          throw new Error("Employers are required to add at least one user before the account can be created.");
        }
      }

      const payload = { 
        firstName, 
        middleName, 
        lastName, 
        email, 
        phone, 
        password, 
        isEmployer, 
        country,
        companyName: isEmployer ? companyName : undefined,
        subUsers 
      };

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            isEmployer,
            companyName: isEmployer ? companyName : undefined,
          }
        }
      });

      if (authError) throw authError;

      // 2. Directly update the 'profiles' table (and 'users' table for backward compatibility)
      if (authData.user) {
        const profileData = { 
          id: authData.user.id, 
          email: authData.user.email,
          last_sign_in: new Date(),
          firstName,
          middleName,
          lastName,
          name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
          phoneNumbers: [phone],
          isEmployer,
          companyName: isEmployer ? companyName : null,
          country,
          role: isEmployer ? "Employer" : "Seeker",
          joinedDate: new Date().toISOString(),
          profileCompleted: false,
          isVerified: !isEmployer, // Seekers are auto-verified in this flow
          idNumber: `SKR-${Math.floor(10000 + Math.random() * 90000)}` // Simple ID generation for client-side
        };

        // Update 'profiles' table as requested
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData);
        
        if (profileError) console.error("Profiles sync failed:", profileError.message);

        // Also update 'users' table to ensure the rest of the app continues to work
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            ...profileData,
            password: '', // Don't store password in plain text, Supabase Auth handles it
            subUsers: isEmployer ? subUsers : []
          });

        if (userError) console.error("Users sync failed:", userError.message);
      }

      // After successful sign-up, the onAuthStateChange in App.tsx will handle the session sync
      // However, we can also manually call onSignIn if we have the data
      // But since we want to set the JWT cookie, it's better to let App.tsx handle it via /api/auth/sync
      
      // We don't call onSignIn(data) here because we want the sync to happen first
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLoginShortcut = async (role: OperationalRole) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: STAFF_ACCOUNTS[role].email, 
          password: role === 'super_admin' ? 'admin123' : 'staff123' 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onSignIn(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F0C927]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#41d599]/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="glass w-full max-w-md rounded-[40px] p-6 md:p-8 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F0C927]/30 to-transparent opacity-50"></div>
        
        <div className="flex items-center justify-between mb-4">
        {!showStaffPortal ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Back</span>
          </button>
        ) : (
          <div className="w-18"></div> // Spacer to keep layout consistent
        )}
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-[#F0C927] shadow-lg">
              <ShieldCheck size={10} className="text-[#F0C927]" /> Secure Access
            </div>
          </div>
        </div>


        {!showStaffPortal ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
                {isForgotPassword ? "Reset Password" : (isEmployer ? "Employer Access" : "Seeker Access")}
              </h2>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
                {isForgotPassword ? "Account recovery v5.0" : (isSignUp ? "Account registration v5.0" : "Account verification v5.0")}
              </p>
            </div>

            {!isForgotPassword && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
                  <span className="bg-[#0a4179] px-4 text-white/10 italic">use credentials</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4 animate-in slide-in-from-top-4 shadow-lg ring-1 ring-red-500/20">
                <AlertCircle className="text-red-400 shrink-0" size={18} />
                <p className="text-[10px] text-red-400 font-black uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && signUpStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                        <Users size={12} className="text-[#F0C927]/40" /> First Name
                      </label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                          placeholder="John"
                        />
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                        <Users size={12} className="text-[#F0C927]/40" /> Middle Name(s)
                      </label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                          placeholder="Quincy"
                        />
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Users size={12} className="text-[#F0C927]/40" /> Surname
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="Doe"
                      />
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  {isEmployer && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                        <Building2 size={12} className="text-[#F0C927]/40" /> Company Name
                      </label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                          placeholder="Acme Corp"
                        />
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Globe size={12} className="text-[#F0C927]/40" /> Country
                    </label>
                    <div className="relative group">
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 appearance-none focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                      >
                        {ALL_COUNTRIES.map(c => <option key={c} value={c} className="bg-[#06213f]">{c}</option>)}
                      </select>
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Phone size={12} className="text-[#F0C927]/40" /> Phone Number
                    </label>
                    <div className="relative group">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className={`w-full bg-white/[0.03] border ${phone && !validatePhoneNumber(phone, country) ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]`}
                        placeholder="+1 (555) 000-0000"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                    {phone && !validatePhoneNumber(phone, country) && (
                      <p className="text-[8px] text-red-400 font-bold ml-2 uppercase tracking-widest">Invalid number for {country}</p>
                    )}
                  </div>
                </div>
              )}

              {isSignUp && signUpStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-3xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] mx-auto mb-3 shadow-2xl ring-1 ring-[#41d599]/20">
                      <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Verify Identity</h3>
                    <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.3em] leading-relaxed">
                      Enter the 6-digit code sent to <br />
                      <span className="text-white/60">{email || phone}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.6em] outline-none transition-all duration-300 placeholder:text-white/5 shadow-inner focus:border-[#41d599]/50 focus:bg-white/[0.05]"
                        placeholder="000000"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSignUpStep(1)}
                      className="w-full text-[10px] font-black uppercase tracking-widest text-[#41d599] hover:underline underline-offset-8 decoration-[#41d599]/30 transition-all"
                    >
                      Change Email/Phone
                    </button>
                  </div>
                </div>
              )}

              {isSignUp && signUpStep === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#F0C927]">Add Account Users</h3>
                    <button 
                      type="button" 
                      onClick={() => setSignUpStep(2)}
                      className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-white/[0.02] rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={newSubUserFirstName}
                        onChange={(e) => setNewSubUserFirstName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                        placeholder="First Name"
                      />
                      <input 
                        type="text" 
                        value={newSubUserMiddleName}
                        onChange={(e) => setNewSubUserMiddleName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                        placeholder="Middle Name(s)"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={newSubUserLastName}
                      onChange={(e) => setNewSubUserLastName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                      placeholder="Surname"
                    />
                    <input 
                      type="email" 
                      value={newSubUserEmail}
                      onChange={(e) => setNewSubUserEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                      placeholder="User Email"
                    />
                    <input 
                      type="tel" 
                      value={newSubUserPhone}
                      onChange={(e) => setNewSubUserPhone(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                      placeholder="User Phone"
                    />
                    <div className="flex gap-3">
                      <select 
                        value={newSubUserRole}
                        onChange={(e) => setNewSubUserRole(e.target.value as any)}
                        className="flex-1 bg-[#0a4179] border border-white/10 rounded-2xl py-3 px-6 text-sm font-bold outline-none text-white/80 focus:border-[#F0C927]/50 transition-all appearance-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button 
                        type="button"
                        onClick={addSubUser}
                        className="px-6 py-3 bg-[#F0C927] text-[#0a4179] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                    {subUsers.map((u, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest">{u.firstName} {u.lastName}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">{u.email} • <span className="text-[#F0C927]/60">{u.role}</span></p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeSubUser(i)}
                          className="p-2 text-white/10 hover:text-red-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {subUsers.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-[2rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">
                          No users added yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(!isForgotPassword || forgotPasswordStep === 1) && signUpStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Mail size={12} className="text-[#F0C927]/40" /> {isSignUp ? "Professional Email" : "Email Address"}
                    </label>
                    <div className="relative group">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="name@company.com"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  {!isSignUp && !isForgotPassword && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Lock size={12} className="text-[#F0C927]/40" /> Password
                        </label>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotPasswordStep(1);
                            setError(null);
                          }}
                          className="text-[9px] font-black uppercase text-[#F0C927]/60 hover:text-[#F0C927] transition-colors hover:underline underline-offset-4"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative group">
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                          placeholder="••••••••"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {isForgotPassword && forgotPasswordStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#F0C927] px-2 flex items-center gap-2">
                      <ShieldCheck size={12} /> Verification Code from Email
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-[#F0C927]/30 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="6-digit code"
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0C927]/40" size={20} />
                    </div>
                  </div>

                    <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Lock size={12} className="text-[#F0C927]/40" /> New Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <ShieldCheck size={12} className="text-[#F0C927]/40" /> Confirm New Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="••••••••"
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>
                </div>
              )}

              {!isForgotPassword && isSignUp && signUpStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <Lock size={12} className="text-[#F0C927]/40" /> Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                      <ShieldCheck size={12} className="text-[#F0C927]/40" /> Confirm Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                        placeholder="••••••••"
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isEmployer ? 'bg-[#F0C927]/20 text-[#F0C927]' : 'bg-white/5 text-white/20'}`}>
                        <Briefcase size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {isSignUp ? "Employer Account" : "Employer Access"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmployer(!isEmployer)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isEmployer ? (isSignUp ? 'bg-[#41d599]' : 'bg-[#F0C927]') : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all ${isEmployer ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </>
              )}

              {!isForgotPassword && !isSignUp && signUpStep === 1 && (
                <div className="flex items-center justify-between px-2 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isEmployer ? 'bg-[#F0C927]/20 text-[#F0C927]' : 'bg-white/5 text-white/20'}`}>
                      <Briefcase size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      Employer Access
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEmployer(!isEmployer)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isEmployer ? 'bg-[#F0C927]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all ${isEmployer ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 hover:scale-[1.02] ${
                  isSignUp 
                    ? 'bg-[#41d599] text-[#0a4179] shadow-[#41d599]/30' 
                    : 'bg-[#F0C927] text-[#0a4179] shadow-[#F0C927]/30'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  isForgotPassword ? (forgotPasswordStep === 1 ? <ArrowRight size={20} /> : <Sparkles size={20} />) :
                  (isSignUp ? (signUpStep < (isEmployer ? 3 : 2) ? <ArrowRight size={20} /> : <Sparkles size={20} />) : <LogIn size={20} />)
                )}
                {isLoading ? "Connecting..." : (
                  isForgotPassword ? (forgotPasswordStep === 1 ? "Send Reset Code" : "Reset Password") :
                  (isSignUp ? (signUpStep === 1 ? "Next: Verify" : signUpStep === 2 ? (isEmployer ? "Next: Users" : "Create Identity") : "Create Identity") : "Authorize Session")
                )}
              </button>

              <div className="text-center pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                      setForgotPasswordStep(1);
                    } else {
                      setIsSignUp(!isSignUp);
                      setSignUpStep(1);
                    }
                    setError(null);
                  }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#F0C927] transition-all duration-300"
                >
                  {isForgotPassword ? "Back to " : (isSignUp ? "Authorized? " : "New Identity? ")}
                  <span className="text-[#F0C927] underline underline-offset-8 decoration-[#F0C927]/30 font-black">
                    {isForgotPassword ? "Sign In" : (isSignUp ? "Sign In Here" : "Register Here")}
                  </span>
                </button>
              </div>
            </form>

          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-[#F0C927]">Staff <span className="text-white">Portal</span></h2>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mt-3">Authorized Personnel Only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-top-4 shadow-lg ring-1 ring-red-500/20">
                  <AlertCircle className="text-red-400 shrink-0" size={18} />
                  <p className="text-[10px] text-red-400 font-black uppercase tracking-tight leading-tight">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                  <Mail size={12} className="text-[#F0C927]/40" /> Staff Email
                </label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                    placeholder="name@caliberdesk.com"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                  <Lock size={12} className="text-[#F0C927]/40" /> Password
                </label>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50 focus:bg-white/[0.05]"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-[2rem] bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#F0C927]/30 transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 hover:scale-[1.02]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                {isLoading ? "Authenticating..." : "Staff Login"}
              </button>
            </form>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F0C927]/40">Secure Terminal Access</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
