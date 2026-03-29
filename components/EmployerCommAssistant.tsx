// @ts-nocheck
import React, { useState, useRef } from 'react';
import { 
  Send, Mail, MessageCircle, Linkedin, Phone, 
  Clipboard, Copy, Check, Sparkles, Loader2, 
  ArrowLeft, Lock, Crown, Zap, FileText, 
  UserMinus, MessageSquare, AlertCircle, RefreshCw, Layers, Smartphone,
  Briefcase, Megaphone, UserX, UserCheck, ChevronRight, X
} from 'lucide-react';
import { UserProfile, Job } from '../types';
import { generateProfessionalDraft } from '../services/geminiService';
import Toast from './Toast';

interface EmployerCommAssistantProps {
  user: UserProfile;
  jobs: Job[];
  onBack: () => void;
  onUpgrade: () => void;
}

const TEMPLATES = [
  { id: 'jd-post', name: 'JD Draft', icon: FileText, platforms: ['LinkedIn', 'Company Site', 'Email'], description: 'High-conversion role requirements.' },
  { id: 'interview-invite', name: 'Invite', icon: Megaphone, platforms: ['Email', 'LinkedIn', 'WhatsApp', 'SMS'], description: 'Engage top-tier talent.' },
  { id: 'candidate-rejection', name: 'Rejection', icon: UserX, platforms: ['Email', 'LinkedIn', 'WhatsApp', 'SMS'], description: 'Professional exit messaging.' },
  { id: 'offer-letter', name: 'Offer', icon: UserCheck, platforms: ['Email', 'Formal Letter', 'LinkedIn'], description: 'Strategic close-out terms.' },
  { id: 'announcement', name: 'Shoutout', icon: Linkedin, platforms: ['LinkedIn', 'Twitter', 'Facebook'], description: 'Public hiring growth.' },
  { id: 'candidate-ping', name: 'Follow-up', icon: MessageCircle, platforms: ['WhatsApp', 'Telegram', 'SMS'], description: 'Quick pipeline check-ins.' },
  { id: 'general-other', name: 'Bespoke', icon: Layers, platforms: ['Email', 'LinkedIn', 'WhatsApp'], description: 'Any other general messaging.' },
];

const EmployerCommAssistant: React.FC<EmployerCommAssistantProps> = ({ user, jobs, onBack, onUpgrade }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [platform, setPlatform] = useState(TEMPLATES[0].platforms[0]);
  const [context, setContext] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setToast({ message: "Draft copied to clipboard.", type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setToast({ message: "Failed to copy.", type: 'error' });
    }
  };

  const handleGenerate = async () => {
    if (!user.isSubscribed) { onUpgrade(); return; }
    if (!context.trim()) { setToast({ message: "Context required.", type: 'error' }); return; }
    setIsGenerating(true);
    try {
      const job = selectedTemplate.id !== 'general-other' ? jobs.find(j => j.id === selectedJobId) : undefined;
      const result = await generateProfessionalDraft(`Employer communication: ${selectedTemplate.name}`, platform, context, user, job);
      setDraft(result); setToast({ message: "Manifest synthesized.", type: 'success' });
    } catch (err) { setToast({ message: "Link failure.", type: 'error' }); } finally { setIsGenerating(false); }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-4 text-white animate-in fade-in duration-500 relative pb-10 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black">Smart Hiring Studio</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Strategic Drafting Suite & Acquisition Strategy Telemetry</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        <aside className="xl:w-64 shrink-0 flex flex-col gap-2">
           {TEMPLATES.map((t) => (
             <button key={t.id} onClick={() => { setSelectedTemplate(t); setPlatform(t.platforms[0]); setDraft(null); }} className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center gap-2.5 ${selectedTemplate.id === t.id ? 'bg-[#F0C927]/10 border-[#F0C927]/40 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}>
               <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedTemplate.id === t.id ? 'bg-[#F0C927] text-[#0a4179]' : 'bg-white/5 text-white/20'}`}><t.icon size={14} /></div>
               <div className="min-w-0"><h4 className={`text-[10px] font-black uppercase tracking-tight ${selectedTemplate.id === t.id ? 'text-[#F0C927]' : 'text-white/80'}`}>{t.name}</h4></div>
             </button>
           ))}
        </aside>

        <main className="flex-1 glass rounded-[24px] border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-6 bg-white/[0.01]">
              <div className="flex gap-1 p-1 bg-black/20 rounded-lg">
                {selectedTemplate.platforms.map(p => <button key={p} onClick={() => setPlatform(p)} className={`px-4 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${platform === p ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/20'}`}>{p}</button>)}
              </div>
              <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-4 text-[9px] font-black uppercase text-white outline-none flex-1">
                <option value="" className="bg-[#0a4179]">General Organization Outreach</option>
                {jobs.map(j => <option key={j.id} value={j.id} className="bg-[#0a4179]">{j.title}</option>)}
              </select>
           </div>
           <div className="flex-1 p-6 flex flex-col space-y-4">
              <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Provide synthesis directives..." className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm italic font-medium outline-none resize-none focus:border-[#F0C927]/40" />
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#F0C927] text-[#0a4179] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                 {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                 {isGenerating ? 'Synthesizing...' : 'Generate Strategy'}
              </button>
           </div>

           {draft && (
             <div className="absolute inset-0 z-50 bg-[#0a4179] flex flex-col animate-in slide-in-from-bottom-2 duration-500">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#41d599]">Acquisition Strategy</h3>
                   <div className="flex gap-2">
                      <button onClick={handleCopy} className="px-5 py-2 bg-[#41d599] text-[#0a4179] rounded-lg text-[8px] font-black uppercase tracking-widest">{copied ? 'Cached' : 'Copy'}</button>
                      <button onClick={() => setDraft(null)} className="p-2 rounded-lg bg-white/5"><X size={14} /></button>
                   </div>
                </div>
                <div className="flex-1 p-10 overflow-y-auto bg-white"><p className="text-slate-800 text-lg font-medium leading-relaxed whitespace-pre-wrap">{draft}</p></div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default EmployerCommAssistant;