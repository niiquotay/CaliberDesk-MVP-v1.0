// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { 
  FileStack, Sparkles, Wand2, FileText, ArrowLeft, 
  Loader2, CheckCircle2, Copy, Download, Zap, 
  Target, Briefcase, RefreshCw, Plus, Trash2, 
  BookOpen, Rocket, Check, X, Info,
  ShieldCheck, User, Mail, Smartphone, MapPin, Globe, Linkedin, Link as LinkIcon,
  Palette, Eye, LayoutGrid, ChevronDown
} from 'lucide-react';
import { UserProfile, Job, WorkExperience, Education, Project } from '../types';
import { ALL_COUNTRIES, REGIONS_BY_COUNTRY } from '../constants';
import { generateTailoredResume } from '../services/geminiService';
import Toast from './Toast';

interface CVPrepProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  jobs: Job[];
  onBack: () => void;
}

const CVPrep: React.FC<CVPrepProps> = ({ user, setUser, jobs, onBack }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [externalJobUrl, setExternalJobUrl] = useState('');
  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'internal' | 'external' | 'paste' | 'upload'>('internal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const handleGenerate = async () => {
    if (selectionMode === 'internal' && !selectedJobId) {
      setToast({ message: "Please select a target job track.", type: 'error' });
      return;
    }
    if (selectionMode === 'external' && !externalJobUrl) {
      setToast({ message: "Please provide an external job link.", type: 'error' });
      return;
    }
    if (selectionMode === 'paste' && !pastedJobDescription) {
      setToast({ message: "Please paste the job description.", type: 'error' });
      return;
    }
    if (selectionMode === 'upload' && !uploadedFileName) {
      setToast({ message: "Please upload a job description file.", type: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      let jobContext;
      if (selectionMode === 'internal') {
        jobContext = selectedJob;
      } else if (selectionMode === 'external') {
        jobContext = { title: 'External Role', description: `Targeting role at: ${externalJobUrl}` };
      } else if (selectionMode === 'paste') {
        jobContext = { title: 'Pasted Role', description: pastedJobDescription };
      } else {
        jobContext = { title: 'Uploaded Role', description: `Analyzing uploaded file: ${uploadedFileName}` };
      }
      
      const result = await generateTailoredResume(user, jobContext);
      setTailoredResume(result);
      setToast({ message: "Resume manifest tailored to job requirements.", type: 'success' });
    } catch (err) {
      setToast({ message: "AI synthesis failed.", type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateIdentity = (field: keyof UserProfile, value: any) => {
    setUser(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'country') {
            next.city = ''; // Reset region/state when country changes
        }
        return next;
    });
  };

  const copyToClipboard = () => {
    if (tailoredResume) {
      const cleanText = tailoredResume.replace(/\*\*/g, '');
      navigator.clipboard.writeText(cleanText).catch(err => {
        console.error("Clipboard write failed:", err);
        setToast({ message: "Failed to copy to clipboard.", type: 'error' });
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setToast({ message: "Tailored CV cached to clipboard.", type: 'success' });
    }
  };

  const renderTailoredResume = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-20 text-white animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black">AI CV Studio</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Tailor your professional trajectory manifest</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 px-2">
        <div className="space-y-6">
           <section className="glass rounded-[40px] p-10 border-white/5 space-y-6 shadow-2xl">
              <h3 className="text-sm font-black tracking-widest text-[#F0C927] border-b border-white/5 pb-4 flex items-center gap-2">
                <Target size={16} /> Strategy Config
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setSelectionMode('internal')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'internal' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                  >
                    CaliberDesk Jobs
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none appearance-none cursor-pointer"
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10"
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
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10 resize-none"
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
                Run AI Tailoring
              </button>
           </section>

           <section className="glass rounded-[40px] border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Tailored Resume Manifest</h3>
                 {tailoredResume && (
                   <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase text-white/40 hover:text-white transition-all border border-white/10"
                   >
                     {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Cached' : 'Copy'}
                   </button>
                 )}
              </div>
              
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-white shadow-inner">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-400 opacity-60">
                    <Loader2 size={48} className="animate-spin" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Synthesizing Manifest...</p>
                  </div>
                ) : tailoredResume ? (
                  <div className="text-slate-900 font-sans whitespace-pre-wrap leading-relaxed text-sm selection:bg-[#F0C927]/30">
                    {renderTailoredResume(tailoredResume)}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-300">
                    <FileText size={64} className="opacity-10" />
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Awaiting Strategy Config</p>
                  </div>
                )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default CVPrep;