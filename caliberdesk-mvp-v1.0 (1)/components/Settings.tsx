import React, { useState } from 'react';
import { 
  Lock, ShieldCheck, Eye, EyeOff, Loader2, Save, 
  Trash2, Bell, Shield, Key, AlertTriangle, Fingerprint,
  Smartphone, Mail, CheckCircle2, Crown, Star, ArrowRight,
  CreditCard, Zap, Settings as SettingsIcon, Activity, Globe,
  RefreshCw, Database, Terminal, Calendar, Receipt, ExternalLink,
  User, ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import Toast from './Toast';

interface SettingsProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onUpgradeRequest: () => void;
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser, onUpgradeRequest, onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match", type: 'error' });
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setUser(prev => ({ ...prev, password: newPassword }));
      setToast({ message: "Security credentials updated successfully", type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdating(false);
    }, 1500);
  };

  const isStaff = !!user.opRole;
  
  const nextBillingDate = new Date();
  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
  const formattedNextCycle = nextBillingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 text-white animate-in fade-in duration-500 px-2 md:px-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black">Account Settings</h1>
            <p className="text-white/40 text-[10px] font-black mt-1">Account Governance & Security Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-4 shadow-2xl ring-1 ring-white/5">
           <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isStaff ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-[#41d599] shadow-[0_0_10px_rgba(65,213,153,0.5)]'}`}></div>
           <span className={`text-[11px] font-black ${isStaff ? 'text-blue-400' : 'text-[#41d599]'}`}>
              {isStaff ? 'Staff Cluster Active' : 'User Session Secure'}
           </span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Automation Preferences (Seeker Only) */}
            {!isStaff && !user.isEmployer && (
              <section className="glass-premium rounded-[40px] p-6 space-y-4 border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5 mb-4">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white pointer-events-none"><Zap size={120} /></div>
                 
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black flex items-center gap-3">
                       <Zap className="text-[#F0C927]" size={16} /> Automation Preferences
                    </h3>
                 </div>

                 <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#F0C927]/30 transition-all duration-500 group shadow-inner">
                    <div className="space-y-0.5">
                       <h4 className="text-xs font-black tracking-tight">Auto-Apply Protocol</h4>
                       <p className="text-[9px] text-white/40 font-black">Automatically apply to jobs with ≥80% match score (excludes external sites)</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newState = !user.autoApplyEnabled;
                        setUser(prev => ({ 
                          ...prev, 
                          autoApplyEnabled: newState,
                          autoApplyEnabledAt: newState ? new Date().toISOString() : prev.autoApplyEnabledAt
                        }));
                        setToast({ 
                          message: newState ? "Auto-Apply Protocol Activated" : "Auto-Apply Protocol Deactivated", 
                          type: 'success' 
                        });
                      }}
                      className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 flex items-center cursor-pointer overflow-hidden border ${user.autoApplyEnabled ? 'bg-[#F0C927]/20 border-[#F0C927] shadow-[0_0_20px_rgba(240,201,39,0.4)]' : 'bg-white/5 border-white/10'}`}
                    >
                       {/* Track Background Glow */}
                       <div className={`absolute inset-0 transition-opacity duration-500 ${user.autoApplyEnabled ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-transparent via-[#F0C927]/10 to-transparent animate-pulse`} />
                       
                       {/* ON Label */}
                       <div className={`absolute left-2.5 text-[8px] font-black transition-all duration-500 ${user.autoApplyEnabled ? 'opacity-100 translate-x-0 text-[#F0C927]' : 'opacity-0 -translate-x-2'}`}>
                         ON
                       </div>
                       
                       {/* OFF Label */}
                       <div className={`absolute right-2.5 text-[8px] font-black transition-all duration-500 ${user.autoApplyEnabled ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0 text-white/20'}`}>
                         OFF
                       </div>
                       
                       {/* Futuristic Knob */}
                       <div className={`relative w-6 h-6 rounded-lg shadow-2xl transform transition-all duration-500 z-10 flex items-center justify-center ${user.autoApplyEnabled ? 'translate-x-8 bg-[#F0C927] rotate-0' : 'translate-x-0 bg-white/10 rotate-90'}`}>
                         <Zap size={12} className={`${user.autoApplyEnabled ? 'text-[#0a4179] fill-current' : 'text-white/40'}`} />
                         
                         {/* Knob Glow */}
                         {user.autoApplyEnabled && (
                           <div className="absolute inset-0 rounded-lg bg-[#F0C927] blur-md opacity-50 -z-10 animate-pulse" />
                         )}
                       </div>
                    </button>
                 </div>
              </section>
            )}

            {/* Combined Account & Security Section */}
            <section className="glass-premium rounded-[40px] p-6 space-y-4 border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white pointer-events-none"><Key size={120} /></div>
               
               <div className="space-y-4">
                  <div>
                     <h3 className="text-xs font-black flex items-center gap-3 border-b border-white/5 pb-2">
                        <User className="text-[#F0C927]" size={16} /> Account Identity
                     </h3>
                     <div className="grid md:grid-cols-2 gap-2 mt-2">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-white/40 px-1">Registered Identity</label>
                           <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-black shadow-inner">
                              {user.name}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-white/40 px-1">Primary Auth Email</label>
                           <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-medium shadow-inner italic">
                              {user.email}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="text-xs font-black flex items-center gap-3">
                           <Lock className="text-[#F0C927]" size={16} /> Security Credentials
                        </h3>
                        <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-[9px] font-black text-white/40 hover:text-white transition-all duration-300 flex items-center gap-1.5">
                           {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />} 
                           {showPasswords ? 'Hide Inputs' : 'Show Inputs'}
                        </button>
                     </div>

                     <form onSubmit={handlePasswordUpdate} className="space-y-3 relative z-10 mt-3">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-white/40 px-1">Current Password Verification</label>
                           <input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-[#F0C927] transition-all duration-300 shadow-inner" placeholder="Enter current hash" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/40 px-1">New Security Credential</label>
                              <input type={showPasswords ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-[#F0C927] transition-all duration-300 shadow-inner" placeholder="New string" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/40 px-1">Verify New Credential</label>
                              <input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-[#F0C927] transition-all duration-300 shadow-inner" placeholder="Confirm string" />
                           </div>
                        </div>
                        <button disabled={isUpdating || !newPassword} className="w-full py-3 rounded-xl bg-[#F0C927] text-[#0a4179] font-black text-[9px] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#F0C927]/20">
                           {isUpdating ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Commit Security Change
                        </button>
                     </form>
                  </div>
               </div>
            </section>
          </div>

         <div className="space-y-4">
            {/* Subscription Logic Card */}
            {!isStaff && !user.isEmployer && (
               <section className="glass-premium rounded-[40px] p-6 space-y-3 border-white/10 bg-gradient-to-br from-[#0a4179] to-[#06213f] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                  <div className="absolute top-[-10px] right-[-10px] opacity-[0.05] rotate-12 text-white pointer-events-none"><Crown size={80} /></div>
                  <div className="relative z-10 space-y-2">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#F0C927]">Active Tier Status</p>
                     <h3 className="text-xl font-black capitalize tracking-tight">{user.subscriptionTier || 'Standard'}</h3>
                     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                        <Calendar size={12} className="text-[#F0C927]" /> Renewal: {formattedNextCycle}
                     </div>
                     <div className="pt-2">
                        <button onClick={onUpgradeRequest} className="w-full py-3 rounded-xl bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-widest text-[9px] shadow-xl shadow-[#F0C927]/20 hover:scale-105 transition-all duration-300">
                           {user.isSubscribed ? 'Adjust License' : 'Upgrade to Premium'}
                        </button>
                     </div>
                  </div>
               </section>
            )}

            {/* Payment Information Card */}
            {!isStaff && !user.isEmployer && (
               <section className="glass-premium rounded-[40px] p-6 border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5 pb-3 mb-3 flex items-center gap-3">
                     <CreditCard size={16} className="text-[#41d599]" /> Settlement Method
                  </h3>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 group hover:border-[#41d599]/30 transition-all duration-500 cursor-pointer shadow-inner">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-black italic text-[10px] tracking-tighter border border-white/10 shadow-lg">
                        VISA
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight">•••• 4242</p>
                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-0.5">Exp 12/28</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-white/20 group-hover:text-white transition-colors" />
                  </div>
                  <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all duration-300 mt-4">
                    Link New Gateway
                  </button>
               </section>
            )}

            {/* System Info */}
            <section className="glass-premium rounded-[40px] p-6 border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-3 mb-3 flex items-center gap-3">
                  <Activity size={16} className="text-blue-400" /> Global Telemetry
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/20">Sync Latency</span>
                     <span className="text-[#41d599] shadow-[0_0_10px_rgba(65,213,153,0.2)]">18ms</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/20">Identity Check</span>
                     <span className="text-[#41d599] shadow-[0_0_10px_rgba(65,213,153,0.2)]">Verified</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-white/20">AI Neural Link</span>
                     <span className="text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]">Stable</span>
                  </div>
               </div>
               <div className="pt-4 border-t border-white/5 mt-4">
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Environment: Stable-v4.2.1</p>
               </div>
            </section>

            <button onClick={() => window.location.reload()} className="w-full py-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl">
               Close Active Session
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;