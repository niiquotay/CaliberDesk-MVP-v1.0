import React from 'react';
import { 
  Briefcase, ArrowRight, Shield, Zap, Sparkles, Globe, UserCheck, 
  BarChart3, FileText, Search, Crown, MapPin, DollarSign, 
  ChevronRight, Target, Video, EyeOff, BellRing, Wand2, Users, Cpu,
  UserPlus, Building, LogIn, FileStack, MessageSquare, ShieldCheck,
  Fingerprint, Layers, Receipt, Smartphone, Package, Award, Check,
  ShoppingCart, Landmark, Settings, CheckCircle2, ShieldAlert,
  Monitor, Building2, FileCheck, Rocket, BookOpen
} from 'lucide-react';
import { Job, ViewType } from '../types';

interface HomeProps {
  onSeekerSignUp: () => void;
  onEmployerSignUp: () => void;
  onSeekerSignIn: () => void;
  onEmployerSignIn: () => void;
  onViewCompany: (name: string) => void;
  onNavigateToModule: (view: ViewType) => void;
  onNavigateToBlog: () => void;
  premiumJobs: Job[];
  userCountry?: string;
}

const Home: React.FC<HomeProps> = ({ 
  onSeekerSignUp, 
  onEmployerSignUp, 
  onSeekerSignIn,
  onEmployerSignIn,
  onViewCompany, 
  onNavigateToModule,
  onNavigateToBlog,
  premiumJobs, 
  userCountry 
}) => {
  const companies = [
    "Nexus AI", "FinFlow", "Loom Studio", "Quantum Dynamics", "Stripe", "Airbnb", 
    "Vercel", "Linear", "Raycast", "Arc Browser", "OpenAI", "Anthropic"
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start p-6 custom-scrollbar text-white">
      <div className="max-w-5xl w-full space-y-8 relative z-10 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#F0C927] mb-1 animate-bounce">
            <Sparkles size={12} /> Smart Solutions for Hiring
          </div>
          <h1 className="text-[3.5rem] md:text-[5.5rem] font-black tracking-tighter leading-[0.95] uppercase text-white">
            NO PLAY <br />
            JUST JOBS
          </h1>
          <p 
            className="text-white/60 text-base md:text-lg max-w-2xl mx-auto font-black tracking-tight leading-relaxed transition-all"
          >
            Your Future Isn’t Waiting. It’s on CALIBERDESK.
          </p>
          <div className="pt-2 flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={onSeekerSignUp}
                  className="group flex items-center gap-3 bg-[#F0C927] hover:bg-[#F0C927]/90 text-[#0a4179] px-6 py-3 rounded-2xl transition-all duration-300 font-black text-xs shadow-xl shadow-[#F0C927]/20 active:scale-95 hover:-translate-y-1"
                >
                  <UserPlus size={18} />
                  Get Started as a Job Seeker
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              
                <button 
                  onClick={onEmployerSignUp}
                  className="group relative flex items-center gap-3 bg-[#1F8E85] hover:bg-[#1F8E85]/90 text-white px-6 py-3 rounded-2xl border border-white/10 transition-all duration-300 font-black text-xs active:scale-95 hover:-translate-y-1 shadow-xl"
                >
                  <Building size={18} />
                  Get Started as Employer
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={onSeekerSignIn}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all group"
                >
                  <LogIn size={14} className="group-hover:translate-x-1 transition-transform text-[#F0C927]" />
                  Seeker <span className="underline decoration-[#F0C927]/30 underline-offset-8">Sign In</span>
                </button>
 
                <button 
                  onClick={onEmployerSignIn}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all group"
                >
                  <Building size={14} className="group-hover:translate-x-1 transition-transform text-[#1F8E85]" />
                  Employer <span className="underline decoration-[#1F8E85]/30 underline-offset-8">Sign In</span>
                </button>
              </div>
 
              <button 
                onClick={onNavigateToBlog}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all group"
              >
                <BookOpen size={14} className="group-hover:translate-x-1 transition-transform text-[#41d599]" />
                Read our <span className="underline decoration-[#41d599]/30 underline-offset-8">Insights & Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Services & Solutions Section */}
        <section className="space-y-6 py-8 border-t border-white/5 relative">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Our <span className="text-[#41d599]">Solutions</span></h2>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">SPECIALIZED SERVICES FOR PROFESSIONAL HIRING</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* For Talent */}
            <div className="glass-card group !p-4">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Target size={100} />
              </div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#F0C927]/10 text-[#F0C927] flex items-center justify-center border border-[#F0C927]/20 shadow-xl shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">For Job Seekers</h3>
                  <p className="text-[8px] text-[#F0C927] font-black uppercase tracking-widest mt-0.5">Improve search visibility</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                {[
                  { label: 'Role Matching', icon: Zap },
                  { label: 'Video Introductions', icon: Video },
                  { label: 'CV Optimization', icon: FileStack },
                  { label: 'Interview Preparation', icon: Monitor }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex items-center gap-2 group-hover:bg-white/[0.05] transition-colors">
                    <item.icon size={18} className="text-[#F0C927] shrink-0" />
                    <span className="text-[10px] font-bold text-white/70 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={onSeekerSignUp} className="relative z-10 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-[#F0C927] hover:text-[#0a4179] transition-all duration-300 shadow-xl">Start Job Search</button>
            </div>

            {/* For Organizations */}
            <div className="glass-card group !p-4">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Building2 size={100} />
              </div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 text-[#41d599] flex items-center justify-center border border-[#41d599]/20 shadow-xl shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">For Employers</h3>
                  <p className="text-[8px] text-[#41d599] font-black uppercase tracking-widest mt-0.5">Advanced talent acquisition</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                {[
                  { label: 'Candidates Ranking', icon: Cpu },
                  { label: 'AI Assisted Instant Shortlisting', icon: Award },
                  { label: 'Aptitude Testing', icon: FileCheck },
                  { label: 'Candidates Management', icon: BarChart3 }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex items-center gap-2 group-hover:bg-white/[0.05] transition-colors">
                    <item.icon size={18} className="text-[#41d599] shrink-0" />
                    <span className="text-[10px] font-bold text-white/70 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={onEmployerSignUp} className="relative z-10 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-[#41d599] hover:text-[#0a4179] transition-all duration-300 shadow-xl">Launch Recruitment</button>
            </div>
          </div>
        </section>

        {/* Global Footer Logos */}
        <div className="py-6 border-b border-white/5 relative overflow-hidden">
          <div className="text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Trusted by industry-leading teams</p>
          </div>
           <div className="relative flex items-center">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-32">
              {[...companies, ...companies].map((name, i) => (
                  <div 
                    key={i}
                    onClick={() => onViewCompany(name)}
                    className="flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-2xl text-[#F0C927] group-hover:bg-[#F0C927]/10 transition-all shadow-inner">
                      {name[0]}
                    </div>
                    <span className="text-[10px] font-bold tracking-tight text-white/40 group-hover:text-white transition-colors">{name}</span>
                  </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a4179] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a4179] to-transparent z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;