
import React from 'react';
import { 
  Crown, Zap, Rocket, ShieldCheck, Star, Cpu, Video,
  Briefcase, TrendingUp, ArrowUpCircle, MessageSquare,
  Package, Check, Lock, Shield, Layers, Target,
  DollarSign, Globe, Smartphone, Sparkles, Award,
  Plus, AlertCircle, ShoppingCart, History,
  CheckCircle2, ChevronRight, Vault
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProductsAndServicesProps {
  user: UserProfile;
  onUpgradeRequest: (type?: 'seeker' | 'employer', tierId?: string) => void;
}

const seekerProducts = [
  {
    id: 'seeker_premium',
    creditKey: null,
    name: 'Seeker Premium',
    price: 'Activated',
    desc: 'Full AI career power.',
    icon: Crown,
    color: 'text-[#F0C927]',
    bgColor: 'bg-[#F0C927]/10',
    features: ['Match Intelligence', 'Video Intro Sync', 'Stealth Protocol']
  },
  {
    id: 'ai_interview_sim',
    creditKey: null,
    name: 'Interview Sim',
    price: 'Free',
    desc: 'Practice with Gemini 3.',
    icon: Video,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    features: ['Sentiment Analysis', 'STAR Method Grading']
  }
];

const employerProducts = [
  {
    id: 'employer_standard',
    creditKey: 'standard',
    name: 'Standard Post',
    price: 'Unlimited',
    desc: 'Listed in verified feed.',
    icon: Briefcase,
    color: 'text-[#41d599]',
    bgColor: 'bg-[#41d599]/10',
    features: ['7-Day Visibility', 'Basic Candidate ATS', 'Email Sync']
  },
  {
    id: 'employer_premium',
    creditKey: 'premium',
    name: 'Gold Tier',
    price: 'Unlimited',
    desc: '10x visibility boost.',
    icon: Award,
    color: 'text-[#F0C927]',
    bgColor: 'bg-[#F0C927]/10',
    features: ['Pinned Feed Header', 'Direct Push Alerts', 'AI Candidate Rank']
  },
  {
    id: 'employer_shortlist',
    creditKey: 'shortlist',
    name: 'Shortlist',
    price: 'Unlimited',
    desc: '24h vetted delivery.',
    icon: ShieldCheck,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    features: ['24h Screened Lists', 'Video Vetting Tools', 'Hiring Manager']
  },
  {
    id: 'employer_professional',
    creditKey: null,
    name: 'Elite Search',
    price: 'Unlimited',
    desc: 'Full executive search.',
    icon: Rocket,
    color: 'text-[#1F8E85]',
    bgColor: 'bg-[#1F8E85]/10',
    features: ['End-to-End Cycle', 'Confidential Search', 'Dedicated Handling']
  }
];

const ProductsAndServices: React.FC<ProductsAndServicesProps> = ({ user, onUpgradeRequest }) => {
  const isEmployer = user.isEmployer;

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700 text-white pb-10 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#F0C927]">
            <Sparkles size={10} /> Marketplace
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">
            {isEmployer ? 'Enterprise ' : 'Career '}
            Ecosystem
          </h1>
          <p className="text-white/30 text-xs font-medium leading-relaxed max-w-lg">
            High-performance recruitment tools and organizational licenses (All features enabled).
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#41d599]/10 border border-[#41d599]/20">
             <div className="w-1 h-1 rounded-full bg-[#41d599] animate-pulse"></div>
             <span className="text-xs font-black uppercase tracking-widest text-[#41d599]">Full Access Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1 rounded-md bg-[#F0C927]/10 text-[#F0C927] border border-[#F0C927]/20">
             <Package size={12} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight">Feature <span className="text-[#F0C927]">Inventory</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
           { (isEmployer ? employerProducts : seekerProducts).map(prod => (
               <div key={prod.id} className="flex flex-col">
                  <div className={`glass h-full rounded-[18px] p-3.5 border-white/5 space-y-3 shadow-lg flex flex-col relative overflow-hidden group transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]`}>
                     <div className="flex items-center gap-2 pt-1">
                        <div className={`w-7 h-7 rounded-lg ${prod.bgColor} ${prod.color} flex items-center justify-center shadow-md`}>
                           <prod.icon size={14} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-tight leading-tight flex-1 truncate">{prod.name}</h4>
                     </div>
                     <p className="text-xs text-white/40 font-medium leading-snug line-clamp-2">{prod.desc}</p>
                     <div className="space-y-1 py-1">
                        {prod.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                             <CheckCircle2 size={10} className={prod.color} />
                             <span className="truncate">{feature}</span>
                          </div>
                        ))}
                     </div>
                     <div className="pt-2.5 border-t border-white/5 space-y-3 mt-auto">
                        <div className="flex justify-between items-center px-0.5">
                           <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Status</span>
                           <span className="text-[10px] font-black text-[#41d599] uppercase tracking-widest">{prod.price}</span>
                        </div>
                        <button 
                          className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#41d599]/10 border border-[#41d599]/20 text-[#41d599] cursor-default`}
                        >
                           <Check size={12} /> Enabled
                        </button>
                     </div>
                  </div>
               </div>
             ))}
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border-white/10 bg-gradient-to-br from-[#0a4179] to-[#06213f] flex items-center justify-between gap-6 shadow-xl relative overflow-hidden group mt-4">
         <div className="absolute top-[-10px] left-[-10px] opacity-10 group-hover:rotate-6 transition-transform duration-1000">
            <Sparkles size={120} className="text-[#F0C927]" />
         </div>
         <div className="relative z-10 flex-1 space-y-2">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-[8px] font-black uppercase tracking-widest text-blue-400">
               <Target size={10} /> Strategic Advisory
            </div>
            <h3 className="text-sm md:text-lg font-black tracking-tight uppercase">
               Bespoke <span className="text-[#F0C927]">Talent Strategy?</span>
            </h3>
            <p className="text-xs text-white/40 leading-relaxed max-w-md font-medium">
               Custom hiring architecture for global firm partners. We specialize in high-stakes human capital deployment.
            </p>
         </div>
         <div className="relative z-10 shrink-0">
            <button className="group px-6 py-3.5 bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-[0.1em] text-xs rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
               <MessageSquare size={14} fill="currentColor" /> 
               Consultant
               <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductsAndServices;
