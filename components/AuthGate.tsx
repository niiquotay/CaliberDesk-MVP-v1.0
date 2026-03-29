import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Building2, ArrowRight, Zap, ShieldCheck, 
  Sparkles, LogIn, ChevronRight, Briefcase, Users,
  Globe, Cpu, Rocket, Shield, Mail, Lock, Loader2, ArrowLeft,
  User, Check, Info, X, AlertCircle
} from 'lucide-react';

import { supabase } from '../src/lib/supabase';

interface AuthGateProps {
  initialRole?: 'seeker' | 'employer';
  onSelectSeeker: (user: any) => void;
  onSelectEmployer: (user: any) => void;
  onSignIn: () => void;
  onBack: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ initialRole = 'seeker', onSelectSeeker, onSelectEmployer, onSignIn, onBack }) => {
  const [role, setRole] = useState<'seeker' | 'employer'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if initialRole changes externally
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSendCode = async () => {
    if (!email) {
      setError("Email is required for verification.");
      return;
    }
    setIsSendingCode(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send verification code.");
      setIsVerifying(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Security hashes do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Security hash must be at least 6 characters.");
      return;
    }

    if (role === 'seeker' && !isVerifying) {
      handleSendCode();
      return;
    }

    setIsLoading(true);

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName,
          lastName,
          email, 
          password, 
          isEmployer: role === 'employer',
          verificationCode: role === 'seeker' ? verificationCode : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (role === 'seeker') {
        onSelectSeeker(data);
      } else {
        onSelectEmployer(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[500] bg-[#0a4179] min-h-screen flex flex-col items-center justify-start pt-10 md:pt-16 pb-12 px-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#41d599]/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#F0C927]/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <div className="glass w-full max-w-md rounded-[40px] p-8 md:p-10 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Top Navigation & Close Action */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-[#F0C927] shadow-lg">
              <Sparkles size={10} className="animate-pulse" /> System Active
            </div>
            <button 
              onClick={onBack}
              className="p-2 rounded-2xl bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-xl active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Create Identity</h2>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mt-2">System synchronization v5.0</p>
        </div>

        {/* Role Segmented Control */}
        <div className="p-1.5 bg-[#06213f]/80 rounded-2xl border border-white/5 flex mb-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) shadow-xl ${
              role === 'seeker' ? 'left-1.5 bg-[#F0C927]' : 'left-[calc(50%+4.5px)] bg-[#41d599]'
            }`}
          />
          <button 
            onClick={() => setRole('seeker')}
            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              role === 'seeker' ? 'text-[#0a4179]' : 'text-white/30 hover:text-white/50'
            }`}
          >
            Job Seeker
          </button>
          <button 
            onClick={() => setRole('employer')}
            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              role === 'employer' ? 'text-[#0a4179]' : 'text-white/30 hover:text-white/50'
            }`}
          >
            Organization
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
            <span className="bg-[#0a4179] px-4 text-white/10 italic">register with email</span>
          </div>
        </div>

        {/* Credentials Form */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 shadow-lg ring-1 ring-red-500/20">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-[10px] text-red-400 font-black uppercase tracking-tight leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5 md:space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
              <User size={12} className="text-[#F0C927]/40" /> Full Name
            </label>
            <div className="relative group">
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner ${
                  role === 'seeker' ? 'focus:border-[#F0C927]/50 focus:bg-white/[0.05]' : 'focus:border-[#41d599]/50 focus:bg-white/[0.05]'
                }`}
                placeholder="John Doe"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
              <Mail size={12} className="text-[#F0C927]/40" /> Official Email
            </label>
            <div className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner ${
                  role === 'seeker' ? 'focus:border-[#F0C927]/50 focus:bg-white/[0.05]' : 'focus:border-[#41d599]/50 focus:bg-white/[0.05]'
                }`}
                placeholder="name@organization.com"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                <Lock size={12} className="text-[#F0C927]/40" /> Password
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner ${
                    role === 'seeker' ? 'focus:border-[#F0C927]/50 focus:bg-white/[0.05]' : 'focus:border-[#41d599]/50 focus:bg-white/[0.05]'
                  }`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                <Shield size={12} className="text-[#F0C927]/40" /> Confirm Hash
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner ${
                    role === 'seeker' ? 'focus:border-[#F0C927]/50 focus:bg-white/[0.05]' : 'focus:border-[#41d599]/50 focus:bg-white/[0.05]'
                  }`}
                  placeholder="••••••••"
                />
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927]/40 transition-colors" size={20} />
              </div>
            </div>
          </div>

          {isVerifying && role === 'seeker' && (
            <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#F0C927] px-2 flex items-center gap-2">
                <ShieldCheck size={12} /> Verification Code
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                  className="w-full bg-white/[0.05] border border-[#F0C927]/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/10 shadow-inner focus:border-[#F0C927]/50"
                  placeholder="Enter 6-digit code"
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0C927]/40" size={20} />
              </div>
              <div className="flex items-center justify-between px-2">
                <p className="text-[9px] text-white/40">A code has been sent to {email}.</p>
                <button 
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="text-[9px] font-black uppercase tracking-widest text-[#F0C927] hover:underline disabled:opacity-50"
                >
                  {isSendingCode ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || isSendingCode}
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 hover:scale-[1.02] duration-300 ${
              role === 'seeker' 
                ? 'bg-[#F0C927] text-[#0a4179] shadow-[#F0C927]/30' 
                : 'bg-[#41d599] text-[#0a4179] shadow-[#41d599]/30'
            }`}
          >
            {isLoading || isSendingCode ? <Loader2 className="animate-spin" size={20} /> : (isVerifying && role === 'seeker' ? <ShieldCheck size={20} /> : <UserPlus size={20} />)}
            {isLoading ? 'Connecting...' : (isSendingCode ? 'Sending Code...' : (isVerifying && role === 'seeker' ? 'Verify & Initialize' : 'Initialize Session'))}
          </button>
        </form>

        {/* Footer Shortcut */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={onSignIn}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#F0C927] transition-all duration-300"
          >
            Authorized? <span className="text-[#F0C927] underline underline-offset-8 decoration-[#F0C927]/30 font-black">Sign In Here</span>
          </button>
        </div>
      </div>
      
      {/* Global Status HUD */}
      <div className="flex justify-center gap-8 md:gap-12 opacity-10 pointer-events-none mt-10 pb-4">
        <div className="flex items-center gap-2">
          <Shield size={12} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">Encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe size={12} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">Global Hub</span>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;