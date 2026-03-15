import React, { useState, useRef } from 'react';
import { 
  Send, Mail, MessageCircle, Linkedin, Phone, 
  Clipboard, Copy, Check, Sparkles, Loader2, 
  ArrowLeft, Lock, Crown, Zap, FileText, 
  UserMinus, MessageSquare, AlertCircle, RefreshCw, Layers, Smartphone,
  Briefcase, ChevronRight, X, ChevronDown, Target, LinkIcon, FileStack, Info
} from 'lucide-react';
import { UserProfile, Job } from '../types';
import { generateProfessionalDraft } from '../services/geminiService';
import Toast from './Toast';

interface ProfessionalAIAssistantProps {
  user: UserProfile;
  jobs: Job[];
  onBack: () => void;
  onUpgrade: () => void;
}

const TEMPLATES = [
  { id: 'app-email', name: 'Job Application', icon: Mail, platforms: ['Email', 'LinkedIn', 'WhatsApp'], description: 'High-conversion reach-out.' },
  { id: 'rejection-reconsider', name: 'Reconsideration', icon: MessageSquare, platforms: ['Email', 'LinkedIn', 'WhatsApp'], description: 'Request profile review.' },
  { id: 'offer-negotiate', name: 'Negotiation', icon: Zap, platforms: ['Email', 'LinkedIn', 'Phone Call'], description: 'Negotiate pay & terms.' },
  { id: 'accept-offer', name: 'Accept Offer', icon: Check, platforms: ['Email', 'Formal Letter'], description: 'Formal acceptance.' },
  { id: 'resign', name: 'Resignation', icon: UserMinus, platforms: ['Email', 'Formal Letter'], description: 'Exit gracefully.' },
  { id: 'social-post', name: 'Networking Post', icon: Linkedin, platforms: ['LinkedIn', 'Twitter'], description: 'Viral search updates.' },
  { id: 'whatsapp-ping', name: 'Quick Ping', icon: MessageCircle, platforms: ['WhatsApp', 'Telegram', 'SMS'], description: 'Casual follow-up.' },
  { id: 'general-other', name: 'Custom Message', icon: Layers, platforms: ['Email', 'LinkedIn', 'WhatsApp'], description: 'Bespoke professional comms.' },
];

const ProfessionalAIAssistant: React.FC<ProfessionalAIAssistantProps> = ({ user, jobs, onBack, onUpgrade }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [platform, setPlatform] = useState(TEMPLATES[0].platforms[0]);
  const [context, setContext] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'internal' | 'external' | 'paste' | 'upload'>('internal');
  const [externalJobUrl, setExternalJobUrl] = useState('');
  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const isGeneralTrack = selectedTemplate.id === 'general-other';

  const handleGenerate = async () => {
    if (!context.trim()) {
      setToast({ message: "Context required for neural synthesis.", type: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      let jobContext: Job | undefined;
      if (selectionMode === 'internal') {
        jobContext = jobs.find(j => j.id === selectedJobId);
      } else if (selectionMode === 'external') {
        jobContext = { title: 'External Role', company: 'External Company', description: `External Link: ${externalJobUrl}` } as Job;
      } else if (selectionMode === 'paste') {
        jobContext = { title: 'Target Role', company: 'Target Company', description: pastedJobDescription } as Job;
      } else if (selectionMode === 'upload') {
        jobContext = { title: 'Uploaded Role', company: 'Uploaded Company', description: `Uploaded File: ${uploadedFileName}` } as Job;
      }

      const result = await generateProfessionalDraft(
        selectedTemplate.name,
        platform,
        context,
        user,
        jobContext
      );
      setDraft(result);
      setToast({ message: "Intelligence manifest synthesized.", type: 'success' });
    } catch (err) {
      setToast({ message: "Synthesis synchronization failed.", type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft).catch(err => {
        console.error("Clipboard write failed:", err);
        setToast({ message: "Failed to copy to clipboard.", type: 'error' });
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setToast({ message: "Draft cached to clipboard", type: 'success' });
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto min-h-[calc(100vh-140px)] flex flex-col gap-6 text-white animate-in fade-in duration-500 relative pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between shrink-0 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">AI Comm Studio</h1>
          <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.25em] mt-1">Strategic Multi-Channel Drafting Environment • Enterprise v4.2</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-3.5 rounded-2xl bg-white/5 text-white/30 hover:text-white transition-all border border-white/5 shadow-md">
             <ArrowLeft size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 overflow-hidden px-2">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <section className="glass rounded-[40px] p-8 border-white/5 space-y-6 shadow-2xl">
                <h3 className="text-sm font-black tracking-widest text-[#F0C927] border-b border-white/5 pb-4 flex items-center gap-2">
                  <Target size={16} /> Strategy Config
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setSelectionMode('internal')}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'internal' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                    >
                      CALIBERDESK Jobs
                    </button>
                    <button 
                      onClick={() => setSelectionMode('external')}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'external' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                    >
                      Link
                    </button>
                    <button 
                      onClick={() => setSelectionMode('paste')}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'paste' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setSelectionMode('upload')}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'upload' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                    >
                      Upload
                    </button>
                  </div>

                  {selectionMode === 'internal' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-widest text-white/40 px-1">Target Job Track</label>
                      <select 
                        value={selectedJobId} 
                        onChange={e => setSelectedJobId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none appearance-none cursor-pointer font-bold"
                      >
                        <option value="" className="bg-[#0a4179]">Select Job</option>
                        {jobs.map(j => <option key={j.id} value={j.id} className="bg-[#0a4179]">{j.title} @ {j.company}</option>)}
                      </select>
                    </div>
                  )}

                  {selectionMode === 'external' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-widest text-white/40 px-1">External Job Link</label>
                      <div className="relative">
                        <input 
                          type="url"
                          value={externalJobUrl}
                          onChange={e => setExternalJobUrl(e.target.value)}
                          placeholder="https://linkedin.com/jobs/view/..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10 font-bold"
                        />
                        <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                      </div>
                    </div>
                  )}

                  {selectionMode === 'paste' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-widest text-white/40 px-1">Paste Job Description</label>
                      <textarea 
                        value={pastedJobDescription}
                        onChange={e => setPastedJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10 resize-none font-bold"
                      />
                    </div>
                  )}

                  {selectionMode === 'upload' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black tracking-widest text-white/40 px-1">Upload Job Description</label>
                      <div className="relative group">
                        <input 
                          type="file"
                          onChange={e => setUploadedFileName(e.target.files?.[0]?.name || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl py-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#F0C927]/50 transition-all">
                          <FileStack size={20} className="text-white/20 group-hover:text-[#F0C927]/50 transition-all" />
                          <p className="text-xs font-black tracking-widest text-white/20">
                            {uploadedFileName || 'Drop file or click'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || (
                    selectionMode === 'internal' ? !selectedJobId : 
                    selectionMode === 'external' ? !externalJobUrl :
                    selectionMode === 'paste' ? !pastedJobDescription :
                    !uploadedFileName
                  )}
                  className="w-full py-4 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                  Generate Manifest
                </button>
             </section>

             <div className="glass rounded-[32px] p-6 border-white/5 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  <Info size={16} />
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-tight">
                  Gemini 3 Pro will synthesize a high-impact professional message based on your target job and specific context.
                </p>
             </div>
          </div>

          <main className="lg:col-span-3 glass rounded-[48px] border-white/5 shadow-2xl overflow-hidden flex flex-col relative min-h-[700px] border border-white/10">
             <div className="p-6 border-b border-white/10 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                   <p className="text-[11px] font-black tracking-[0.2em] text-[#F0C927]/50 ml-1">Message Category</p>
                   <div className="relative h-14">
                     <select 
                       value={selectedTemplate.id}
                       onChange={(e) => {
                         const t = TEMPLATES.find(temp => temp.id === e.target.value);
                         if (t) {
                           setSelectedTemplate(t);
                           setPlatform(t.platforms[0]);
                           setDraft(null);
                         }
                       }}
                       className="w-full h-full bg-white/5 border border-white/10 rounded-xl px-6 text-sm text-white outline-none focus:border-[#F0C927] transition-all cursor-pointer appearance-none shadow-inner font-bold"
                     >
                       {TEMPLATES.map(t => (
                         <option key={t.id} value={t.id} className="bg-[#0a4179]">
                           {t.name.toLowerCase()}
                         </option>
                       ))}
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                       <ChevronDown size={16} />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[11px] font-black tracking-[0.2em] text-[#F0C927]/50 ml-1">Deploy Platform</p>
                   <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 h-14">
                     {selectedTemplate.platforms.map(p => (
                       <button 
                         key={p}
                         onClick={() => setPlatform(p)}
                         className={`flex-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${platform === p ? 'bg-[#F0C927] text-[#0a4179] shadow-lg' : 'text-white/40 hover:text-white'}`}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             <div className="flex-1 flex flex-col p-10 space-y-8 relative overflow-hidden bg-gradient-to-b from-transparent to-black/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] border border-[#41d599]/10"><MessageSquare size={22} /></div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest">Synthesis Directives</h3>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Provide specific context for the AI Agent</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-white/5 text-white/20 hover:text-[#F0C927] transition-all cursor-help">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <div className="flex-1 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#F0C927]/20 to-transparent rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>
                  <textarea 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={`Describe your strategic intent... (e.g. "Draft a message to the Hiring Lead at Nexa. I want to emphasize my 5 years of React experience and mention I'm available for a call this Thursday between 2-4 PM.")`}
                    className="relative z-10 w-full h-full bg-white/[0.03] border border-white/5 rounded-[32px] p-10 text-base text-white/90 placeholder:text-white/10 outline-none resize-none leading-relaxed font-semibold transition-all focus:border-[#F0C927]/40 shadow-inner"
                  />
                </div>
                
                <div className="pt-8 border-t border-white/10 flex items-center justify-between gap-10">
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                     <div className="w-2.5 h-2.5 rounded-full bg-[#41d599] animate-pulse"></div>
                     Neural Sync Protocol Active
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-3 rounded-[18px] bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-[0.3em] text-[9px] shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-20"
                  >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    {isGenerating ? 'Synthesizing...' : 'Generate Manifest'}
                  </button>
                </div>
             </div>

             {draft && (
               <div className="absolute inset-0 z-[60] bg-[#0a4179] animate-in slide-in-from-right-full duration-700 flex flex-col">
                  <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                     <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] border border-[#41d599]/20 shadow-xl"><FileText size={28} /></div>
                       <div>
                         <h3 className="text-2xl font-black uppercase tracking-tight text-[#41d599]">Generated Manifest</h3>
                         <p className="text-xs text-white/30 uppercase font-black tracking-[0.3em] mt-1">Ready for deployment via {platform}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={handleCopy}
                          className="flex items-center gap-3 px-10 py-4 rounded-[22px] bg-[#41d599] text-[#0a4179] text-xs font-black uppercase tracking-widest shadow-2xl shadow-[#41d599]/20 hover:brightness-110 transition-all active:scale-95"
                        >
                          {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Cached' : 'Copy Draft'}
                        </button>
                        <button 
                          onClick={() => setDraft(null)}
                          className="p-4 rounded-2xl bg-white/5 text-white/30 hover:text-white transition-all border border-white/5"
                        >
                          <X size={28} />
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-white shadow-inner flex justify-center">
                     <div className="max-w-6xl w-full">
                        <div className="prose prose-slate max-w-none text-slate-800 font-sans whitespace-pre-wrap leading-relaxed text-base md:text-lg font-medium">
                          {draft}
                        </div>
                     </div>
                  </div>
                  <div className="p-8 border-t border-white/10 bg-[#06213f] text-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Strategic Identity Protocol • CALIBERDESK G-Studio v4.2</p>
                  </div>
               </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAIAssistant;