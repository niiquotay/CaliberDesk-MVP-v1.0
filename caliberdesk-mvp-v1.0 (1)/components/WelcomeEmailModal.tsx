import React from 'react';
import { 
  X, Mail, Sparkles, Rocket, Globe, Target, 
  ShieldCheck, ArrowRight, Zap, Briefcase, 
  ChevronRight, ExternalLink
} from 'lucide-react';
import { ViewType } from '../types';

interface WelcomeEmailModalProps {
  userName: string;
  onClose: () => void;
  onAction: (view: ViewType) => void;
}

const WelcomeEmailModal: React.FC<WelcomeEmailModalProps> = ({ userName, onClose, onAction }) => {
  return (
    <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="glass w-full max-w-2xl rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]">
        
        {/* Email Header HUD */}
        <div className="bg-[#06213f] px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] border border-[#F0C927]/20 shadow-xl">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F0C927]">Notification</p>
              <h3 className="text-sm font-bold text-white">Official Welcome: CALIBERDESK Integration</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-white/30 hover:text-white transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Email Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-8 md:p-12">
          <div className="max-w-xl mx-auto space-y-10 text-slate-800">
            
            {/* Subject Line Rendering */}
            <div className="border-b border-slate-100 pb-6">
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">Subject</p>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                Welcome to CALIBERDESK 🚀 Your Professional Journey Starts Now!
              </h1>
            </div>

            <div className="space-y-6 text-base md:text-lg leading-relaxed font-medium">
              <p>Hello <span className="text-[#0a4179] font-black">{userName}</span>,</p>
              
              <p>
                Welcome to <span className="font-black text-[#0a4179]">CALIBERDESK</span>—the premier job search platform built specifically for Africa’s next generation of professionals and leaders. 🌍
              </p>

              <p className="text-slate-500">
                We understand the complexities of the modern job search. That’s why we’ve built a platform focused on providing professional tools that help you stand out and connect with top-tier employers across the continent.
              </p>

              <div className="pt-4 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#F0C927] bg-[#0a4179] w-fit px-4 py-1 rounded-lg flex items-center gap-2">
                  <Zap size={14} fill="currentColor" /> Your Professional Toolkit
                </h3>
                
                <div className="grid gap-4">
                  <div className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0a4179] group-hover:bg-[#F0C927]/10 transition-colors">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Optimize Your CV</p>
                      <p className="text-sm text-slate-500">Our builder helps you create a professional profile that resonates with modern hiring managers.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0a4179] group-hover:bg-[#41d599]/10 transition-colors">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Search Your Way</p>
                      <p className="text-sm text-slate-500">Whether you are looking for remote, hybrid, or onsite roles, we have verified listings ready for you.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0a4179] group-hover:bg-blue-50 transition-colors">
                      <Rocket size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Global Connectivity</p>
                      <p className="text-sm text-slate-500">Access opportunities at top global firms curated specifically for professional talent.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0a4179] group-hover:bg-emerald-50 transition-colors">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Transparent Data</p>
                      <p className="text-sm text-slate-500">We provide clear information on salary and compensation packages so you can make informed decisions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#F0C927]" /> Your First Step
                </h3>
                <p className="text-slate-500 text-sm">
                  To ensure you don't miss an opportunity, set up your job alerts today. Whether you’re looking for entry-level roles or high-impact leadership positions, we’ll notify you as soon as a match is found.
                </p>
                <p className="text-slate-400 text-[11px] font-bold uppercase leading-relaxed">
                  Connecting Africa’s brightest minds with the future of global employment.
                </p>
              </div>

              <div className="py-10">
                <button 
                  onClick={() => onAction('profile')}
                  className="w-full bg-[#0a4179] text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Complete Your Profile Now <ArrowRight size={18} />
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 italic">Best regards,</p>
                <p className="font-black text-[#0a4179] mt-2">The CALIBERDESK Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer HUD */}
        <div className="bg-[#0a4179] px-10 py-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => onAction('cv-prep')}
                className="text-[9px] font-black uppercase tracking-widest text-[#F0C927] hover:text-white transition-colors"
              >
                Resources
              </button>
              <button 
                onClick={() => onAction('seeker')}
                className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Alert Settings
              </button>
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 italic">
              Official Communication • CALIBERDESK Platform v4.2
           </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeEmailModal;