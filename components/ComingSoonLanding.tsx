import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, Zap, ShieldCheck, Sparkles, Mail, 
  ChevronRight, CheckCircle2, Rocket, Loader2, Globe, Cpu,
  Target, Info, Layers
} from 'lucide-react';
import Toast from './Toast';

interface ComingSoonLandingProps {
  module: 'hrm' | 'payroll' | 'vendor';
  onBack: () => void;
}

const MODULE_DATA = {
  hrm: {
    title: 'HRM Intelligence',
    subtitle: 'Human Capital Governance Protocol',
    desc: 'The next evolution in organizational management. CALIBERDESK HRM integrates seamlessly with your hiring manifest to manage employee lifecycle, engagement, and strategic performance tracking in one unified interface.',
    icon: Layers,
    color: 'text-[#41d599]',
    bgColor: 'bg-[#41d599]/10',
    benefits: [
      'Automated Onboarding: Sync candidates directly from the Job Board into corporate rosters.',
      'AI Performance Tracking: Neural sentiment analysis of internal professional trajectories.',
      'Cultural Analytics: Deep insights into organizational health and team cohesion.',
      'Compliance Guard: Automated regional labor law verification and document storage.'
    ]
  },
  payroll: {
    title: 'Payroll Studio',
    subtitle: 'Autonomous Remuneration Ecosystem',
    desc: 'Global payout synchronization simplified. From multi-currency compensation to high-stakes tax compliance, Payroll Studio provides a single source of truth for your organizational financial commitments.',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    benefits: [
      'Universal Gateway: Pay elite global talent in their preferred currency instantly.',
      'Automated Tax Engine: Built-in regional compliance for 160+ jurisdictions.',
      'Benefit Orchestration: Manage pension, health, and stock option manifests in one click.',
      'Real-time Cost Analysis: Predictive budgeting based on acquisition velocity.'
    ]
  },
  vendor: {
    title: 'Vendors Hub',
    subtitle: 'Multi-Directional Supply Marketplace',
    desc: 'The centralized marketplace where organization meets innovation. Discover elite service providers, manage procurement manifests, and automate vendor settlements within the CALIBERDESK corporate infrastructure.',
    icon: Rocket,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    benefits: [
      'B2B Marketplace: Discover verified service vendors pre-vetted by our AI.',
      'Procurement Ledger: Unified transaction history for all corporate acquisitions.',
      'Direct Bid Interface: Release service requests and manage vendor proposals.',
      'Escrow Settlements: Secure project milestones via our centralized financial gateway.'
    ]
  }
};

const ComingSoonLanding: React.FC<ComingSoonLandingProps> = ({ module, onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const data = MODULE_DATA[module];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    // Simulate API registration
    setTimeout(() => {
      setIsSubscribing(false);
      setToast({ message: "Identity registered. You are on the priority manifest.", type: 'success' });
      setEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start p-6 text-white animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-4xl w-full space-y-12 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Ecosystem</span>
        </button>

        <div className="text-center space-y-6">
          <div className={`w-20 h-20 rounded-[32px] ${data.bgColor} ${data.color} flex items-center justify-center mx-auto border border-white/5 shadow-2xl relative`}>
             <data.icon size={40} />
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F0C927] rounded-lg flex items-center justify-center text-[#0a4179] shadow-lg border border-[#0a4179]/20 animate-pulse">
                <Clock size={12} />
             </div>
          </div>

          <div className="space-y-2">
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{data.title}</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{data.subtitle}</p>
          </div>

          <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-2xl mx-auto font-medium">
             {data.desc}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 py-12 border-y border-white/5 relative">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Cpu size={180} /></div>
           
           <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                 <Target className={data.color} size={20} /> Solution Manifest
              </h3>
              <div className="space-y-5">
                 {data.benefits.map((benefit, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className={`shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${data.color} shadow-lg transition-all group-hover:scale-110`}>
                         <CheckCircle2 size={16} />
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-medium">
                         {benefit}
                      </p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass rounded-[40px] p-8 md:p-10 flex flex-col justify-center text-center space-y-6 border-[#F0C927]/10 bg-gradient-to-br from-[#06213f] to-transparent">
              <div className="w-12 h-12 rounded-2xl bg-[#F0C927]/10 text-[#F0C927] flex items-center justify-center mx-auto border border-[#F0C927]/20 shadow-xl">
                 <Mail size={24} />
              </div>
              <div>
                 <h4 className="text-xl font-black uppercase tracking-tight">Priority <span className="text-[#F0C927]">Waiting List</span></h4>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Be notified first at deployment</p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-4">
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   placeholder="Enter official email" 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#F0C927] transition-all shadow-inner"
                 />
                 <button 
                   disabled={isSubscribing || !email}
                   className="w-full py-5 rounded-[22px] bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                 >
                    {isSubscribing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} 
                    Register Interest
                 </button>
              </form>
              <div className="flex items-center gap-2 justify-center opacity-20">
                 <Globe size={12} />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em]">Universal API Integration</span>
              </div>
           </div>
        </div>

        <div className="text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">Connected Business Suite • CALIBERDESK Platform v4.2</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonLanding;