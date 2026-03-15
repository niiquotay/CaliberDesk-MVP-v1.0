// @ts-nocheck
import React, { useState, useRef } from 'react';
import { 
  User, FileText, Upload, Loader2, ArrowLeft, Trash2, Crown, Cpu, Wand2, Plus, X, GraduationCap, History, Award, Heart, Rocket, Check, Lock, ArrowRight, ShieldCheck, EyeOff, Eye, Info, AlertTriangle, MapPin, Fingerprint, Linkedin, Zap, Star, Download, Save, Briefcase, BookOpen, Layers, ImageIcon, Mail, Smartphone, MessageCircle, ExternalLink, Sparkles, RefreshCw, Phone,
  FileStack, ShieldAlert, Award as AwardIcon, Lightbulb, Globe, Link as LinkIcon, Target, Camera, Scissors, Palette, Monitor, Users, ChevronDown, Instagram, Facebook, MessageSquare
} from 'lucide-react';
import { UserProfile, WorkExperience, Education, Project, Job } from '../types';
import { parseResume, enhanceProfileSection, editProfileImage, generateTailoredResume, analyzeSkillGaps } from '../services/geminiService';
import Toast from './Toast';
import { 
  ALL_COUNTRIES, REGIONS_BY_COUNTRY, COMMON_TITLES, GENDER_OPTIONS, 
  RACE_OPTIONS, MOCK_USER, AGE_RANGES, DISABILITY_OPTIONS, 
  RELIGION_OPTIONS, MARITAL_STATUS_OPTIONS, VETERAN_STATUS_OPTIONS,
  JOB_TYPES, INDUSTRIES
} from '../constants';
import { validatePhoneNumber } from '../utils';

interface ProfileProps {
  user: UserProfile & { isReadOnly?: boolean };
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  jobs?: Job[];
  onBack: () => void;
  isSignUp?: boolean;
}

const calculateYears = (start?: string, end?: string) => {
  if (!start) return 0;
  const s = parseInt(start);
  const e = end ? parseInt(end) : new Date().getFullYear();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(0, e - s);
};

const Profile: React.FC<ProfileProps> = ({ user, setUser, jobs = [], onBack }) => {
  const isReadOnly = user.isReadOnly;
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [activeRewriteId, setActiveRewriteId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [showCVModal, setShowCVModal] = useState(false);
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [isAnalyzingSkills, setIsAnalyzingSkills] = useState(false);
  const [skillAnalysis, setSkillAnalysis] = useState<{ gaps: string[], recommendations: string[] } | null>(null);
  const cvUploadRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeSkills = async () => {
    if (!jobs || jobs.length === 0) {
      setToast({ message: "No saved jobs to analyze against.", type: 'info' });
      return;
    }
    const savedJobs = jobs.filter(j => user.savedJobIds?.includes(j.id));
    if (savedJobs.length === 0) {
      setToast({ message: "Save some jobs first to analyze skill gaps.", type: 'info' });
      return;
    }
    
    setIsAnalyzingSkills(true);
    try {
      const analysis = await analyzeSkillGaps(user, savedJobs);
      setSkillAnalysis(analysis);
      setToast({ message: "Skill analysis complete.", type: 'success' });
    } catch (err) {
      setToast({ message: "Failed to analyze skills.", type: 'error' });
    } finally {
      setIsAnalyzingSkills(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newImages = [...user.profileImages];
      newImages[0] = base64;
      setUser(prev => ({ ...prev, profileImages: newImages }));
      setToast({ message: "Identity visual updated.", type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    try {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = (reader.result as string).split(',')[1];
                const parsedData = await parseResume({ base64, mimeType: file.type });
                setUser(prev => ({ ...prev, ...parsedData, profileCompleted: true }));
                setToast({ message: "Neural sync complete. Manifest populated.", type: 'success' });
            } catch (err) {
                console.error("Resume parsing error:", err);
                setToast({ message: "Parsing fault detected. Ensure using PDF or TXT.", type: 'error' });
            } finally {
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
            setToast({ message: "File read error.", type: 'error' });
            setIsParsing(false);
        };
        reader.readAsDataURL(file);
    } catch (err) { 
        setToast({ message: "Upload initialization failed.", type: 'error' }); 
        setIsParsing(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => setUser(prev => ({ ...prev, [field]: value }));
  const handleSave = () => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setToast({ message: "Identity manifest synced.", type: 'success' }); onBack(); }, 1000); };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 text-white pb-32 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Hub</span>
        </button>
      </div>

      {/* IDENTITY CARD - MERGED HEADER */}
      <section className="glass-premium rounded-[40px] p-8 border-[#0a4179]/30 bg-[#0a4179]/10 relative overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-700">
         <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-[#F0C927] pointer-events-none -rotate-12 scale-150"><Fingerprint size={150} /></div>
         
         <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
            {/* Left: Identity & Metadata */}
            <div className="md:col-span-2 space-y-4">
               <div className="space-y-2">
                  <div className="flex items-center gap-4">
                     <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none uppercase font-montserrat text-white">
                        {user.name}
                     </h1>
                     <div className="text-[#41d599]">
                        <ShieldCheck size={24} />
                     </div>
                     {user.idNumber && (
                        <div className="px-3 py-1 rounded-xl bg-[#F0C927]/10 border border-[#F0C927]/20 text-[10px] font-black tracking-widest text-[#F0C927]">
                          ID: {user.idNumber}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                     <p className="text-base md:text-lg font-black tracking-tight text-[#F0C927] uppercase tracking-widest font-mono">
                        {user.role}
                     </p>
                     {user.jobTitle && (
                        <div className="flex items-center gap-3">
                           <span className="text-white/20 text-lg">|</span>
                           <p className="text-base md:text-lg font-bold tracking-tight text-white/40 font-poppins">
                              {user.jobTitle}
                           </p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                     <MapPin size={14} className="text-[#F0C927]" />
                     {user.city}, {user.country}
                  </div>
                  {user.languages && user.languages.length > 0 && (
                     <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                        <Globe size={14} className="text-blue-400" />
                        {user.languages.join(', ')}
                     </div>
                  )}

                  {/* Social Links Icons - Integrated into metadata row */}
                  <div className="flex items-center gap-6 pl-6 border-l border-white/10">
                     {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                          <a href={`tel:${user.phoneNumbers[0]}`} className="text-white/40 hover:text-[#F0C927] transition-colors" title={`Phone: ${user.phoneNumbers[0]}`}>
                             <Phone size={16} />
                          </a>
                       )}
                       {user.email && (
                          <a href={`mailto:${user.email}`} className="text-white/40 hover:text-red-400 transition-colors" title={`Email: ${user.email}`}>
                             <Mail size={16} />
                          </a>
                       )}
                       <button className="text-white/40 hover:text-blue-400 transition-colors" title="In-App Messaging">
                          <MessageSquare size={16} />
                       </button>
                       {user.whatsapp && (
                          <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#41d599] transition-colors" title="WhatsApp">
                             <MessageCircle size={16} />
                          </a>
                       )}
                       {user.linkedinUrl && (
                          <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-blue-400 transition-colors" title="LinkedIn">
                             <Linkedin size={16} />
                          </a>
                       )}
                    </div>
                 </div>
               </div>

            {/* Right: Avatar */}
            <div className="flex flex-col items-center md:items-end justify-center">
               <div className="relative group">
                  <input 
                     type="file" 
                     ref={imageUploadRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleImageUpload} 
                  />
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-[#0b2e52] border-4 border-[#F0C927]/30 overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-[#F0C927] flex items-center justify-center">
                     <img 
                        src={user.profileImages[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                     />
                  </div>
                  {!isReadOnly && (
                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                       <button 
                          onClick={() => {
                             const newImages = [...user.profileImages];
                             newImages[0] = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name + Math.random()}`;
                             setUser(prev => ({ ...prev, profileImages: newImages }));
                             setToast({ message: "Avatar regenerated.", type: 'info' });
                          }} 
                          className="p-2.5 rounded-xl bg-white/10 text-white shadow-2xl hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/10"
                          title="Regenerate Avatar"
                       >
                          <RefreshCw size={16} />
                       </button>
                       <button 
                          onClick={() => imageUploadRef.current?.click()} 
                          className="p-2.5 rounded-xl bg-[#F0C927] text-[#0a4179] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[#0b2e52]"
                          title="Upload Image"
                       >
                          <Camera size={16} />
                       </button>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Full Width: Summary & Actions */}
         <div className="pt-6 space-y-3 relative z-10">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#F0C927]/60">Executive Profile Summary</label>
            </div>
            <textarea 
               value={user.experienceSummary} 
               onChange={e => !isReadOnly && updateField('experienceSummary', e.target.value)}
               readOnly={isReadOnly}
               placeholder="Describe your professional manifest..."
               className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium outline-none focus:border-[#F0C927] focus:bg-white/[0.03] transition-all min-h-[120px] resize-none leading-relaxed"
            />
            {!isReadOnly && (
              <div className="flex flex-wrap gap-3 pt-4">
                 <button 
                    onClick={() => cvUploadRef.current?.click()} 
                    className="flex-1 min-w-[120px] py-3 bg-[#0a4179] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
                 >
                    <Upload size={14} /> Sync Neural CV
                 </button>
                 <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="flex-1 min-w-[120px] py-3 bg-[#F0C927] text-[#0a4179] rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                 >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Commit Changes</>}
                 </button>
                 <button 
                    onClick={() => setShowCVModal(true)} 
                    className="flex-1 min-w-[120px] py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                 >
                    <Download size={14} /> Export Identity
                 </button>
              </div>
            )}
         </div>
      </section>

      {/* CORE MANIFEST GRID */}
      <div className="max-w-6xl mx-auto space-y-6">
         <div className="space-y-6">
            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-[#F0C927] mb-8">
                  <Users size={18} /> Demographics & Preferences
               </h3>
               <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Title</label>
                     <div className="relative">
                        <select 
                           value={user.personalTitle || ''} 
                           onChange={e => !isReadOnly && updateField('personalTitle', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           <option value="" className="bg-[#06213f]">Select Title</option>
                           {["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Hon.", "Rev."].map(t => <option key={t} value={t} className="bg-[#06213f]">{t}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Gender</label>
                     <div className="relative">
                        <select 
                           value={user.gender || ''} 
                           onChange={e => !isReadOnly && updateField('gender', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           <option value="" className="bg-[#06213f]">Select Gender</option>
                           {GENDER_OPTIONS.map(g => <option key={g} value={g} className="bg-[#06213f]">{g}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Race</label>
                     <div className="relative">
                        <select 
                           value={user.race || ''} 
                           onChange={e => !isReadOnly && updateField('race', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           <option value="" className="bg-[#06213f]">Select Race</option>
                           {RACE_OPTIONS.map(r => <option key={r} value={r} className="bg-[#06213f]">{r}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Disability Status</label>
                     <div className="relative">
                        <select 
                           value={user.disabilityStatus || ''} 
                           onChange={e => !isReadOnly && updateField('disabilityStatus', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           <option value="" className="bg-[#06213f]">Select Status</option>
                           {DISABILITY_OPTIONS.map(d => <option key={d} value={d} className="bg-[#06213f]">{d}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Age Range</label>
                     <div className="relative">
                        <select 
                           value={user.ageRange || ''} 
                           onChange={e => !isReadOnly && updateField('ageRange', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           <option value="" className="bg-[#06213f]">Select Age Range</option>
                           {AGE_RANGES.map(a => <option key={a} value={a} className="bg-[#06213f]">{a}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                     <button 
                        onClick={() => !isReadOnly && updateField('openToTravel', !user.openToTravel)}
                        disabled={isReadOnly}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${user.openToTravel ? 'bg-[#F0C927]/10 border-[#F0C927]/30 text-[#F0C927]' : 'bg-white/5 border-white/10 text-white/40'}`}
                     >
                        <Rocket size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Open to Travel</span>
                        {user.openToTravel && <Check size={14} />}
                     </button>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[#F0C927]/60 ml-1">Job Preferences</label>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-white/20 ml-1">Preferred Industries</label>
                           <div className="flex flex-wrap gap-2">
                              {INDUSTRIES.slice(0, 12).map(ind => (
                                 <button 
                                    key={ind}
                                    onClick={() => {
                                       if (isReadOnly) return;
                                       const current = user.jobPreferences?.industries || [];
                                       const next = current.includes(ind) ? current.filter(x => x !== ind) : [...current, ind];
                                       updateField('jobPreferences', { ...user.jobPreferences, industries: next });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${user.jobPreferences?.industries?.includes(ind) ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-white/30'}`}
                                 >
                                    {ind}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-white/20 ml-1">Preferred Job Types</label>
                           <div className="flex flex-wrap gap-2">
                              {JOB_TYPES.map(type => (
                                 <button 
                                    key={type}
                                    onClick={() => {
                                       if (isReadOnly) return;
                                       const current = user.jobPreferences?.types || [];
                                       const next = current.includes(type) ? current.filter(x => x !== type) : [...current, type];
                                       updateField('jobPreferences', { ...user.jobPreferences, types: next });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${user.jobPreferences?.types?.includes(type) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white/30'}`}
                                 >
                                    {type}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">First Name</label>
                     <input 
                        type="text" 
                        value={user.firstName || ''} 
                        onChange={e => !isReadOnly && setUser(prev => ({ ...prev, firstName: e.target.value, name: `${e.target.value} ${prev.middleName || ''} ${prev.lastName || ''}`.replace(/\s+/g, ' ').trim() }))}
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Middle Name</label>
                     <input 
                        type="text" 
                        value={user.middleName || ''} 
                        onChange={e => !isReadOnly && setUser(prev => ({ ...prev, middleName: e.target.value, name: `${prev.firstName || ''} ${e.target.value} ${prev.lastName || ''}`.replace(/\s+/g, ' ').trim() }))}
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Last Name</label>
                     <input 
                        type="text" 
                        value={user.lastName || ''} 
                        onChange={e => !isReadOnly && setUser(prev => ({ ...prev, lastName: e.target.value, name: `${prev.firstName || ''} ${prev.middleName || ''} ${e.target.value}`.replace(/\s+/g, ' ').trim() }))}
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Titles and Qualifications</label>
                     <input 
                        type="text" 
                        value={user.role} 
                        onChange={e => !isReadOnly && updateField('role', e.target.value)} 
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Primary Email</label>
                     <input 
                        type="email" 
                        value={user.email} 
                        onChange={e => !isReadOnly && updateField('email', e.target.value)} 
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Contact Identifiers (Primary, Secondary, WhatsApp)</label>
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <input 
                             type="text" 
                             placeholder="Primary Phone"
                             value={user.phoneNumbers?.[0] || ''} 
                             onChange={e => {
                                if (isReadOnly) return;
                                const newPhones = [...(user.phoneNumbers || [])];
                                newPhones[0] = e.target.value;
                                updateField('phoneNumbers', newPhones);
                             }} 
                             readOnly={isReadOnly}
                             className={`w-full bg-white/5 border ${user.phoneNumbers?.[0] && !validatePhoneNumber(user.phoneNumbers[0], user.country) ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all`} 
                          />
                          {user.phoneNumbers?.[0] && !validatePhoneNumber(user.phoneNumbers[0], user.country) && (
                            <p className="text-[8px] text-red-400 font-bold uppercase tracking-tighter ml-1">Invalid for {user.country}</p>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <input 
                             type="text" 
                             placeholder="Secondary Phone"
                             value={user.phoneNumbers?.[1] || ''} 
                             onChange={e => {
                                if (isReadOnly) return;
                                const newPhones = [...(user.phoneNumbers || [])];
                                newPhones[1] = e.target.value;
                                updateField('phoneNumbers', newPhones);
                             }} 
                             readOnly={isReadOnly}
                             className={`w-full bg-white/5 border ${user.phoneNumbers?.[1] && !validatePhoneNumber(user.phoneNumbers[1], user.country) ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all`} 
                          />
                          {user.phoneNumbers?.[1] && !validatePhoneNumber(user.phoneNumbers[1], user.country) && (
                            <p className="text-[8px] text-red-400 font-bold uppercase tracking-tighter ml-1">Invalid for {user.country}</p>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <input 
                             type="text" 
                             placeholder="WhatsApp Number"
                             value={user.whatsapp || ''} 
                             onChange={e => !isReadOnly && updateField('whatsapp', e.target.value)} 
                             readOnly={isReadOnly}
                             className={`w-full bg-white/5 border ${user.whatsapp && !validatePhoneNumber(user.whatsapp, user.country) ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all`} 
                          />
                          {user.whatsapp && !validatePhoneNumber(user.whatsapp, user.country) && (
                            <p className="text-[8px] text-red-400 font-bold uppercase tracking-tighter ml-1">Invalid for {user.country}</p>
                          )}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Region/State</label>
                     <input 
                        type="text" 
                        value={user.city} 
                        onChange={e => !isReadOnly && updateField('city', e.target.value)} 
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Country</label>
                     <div className="relative">
                        <select 
                           value={user.country} 
                           onChange={e => !isReadOnly && updateField('country', e.target.value)} 
                           disabled={isReadOnly}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all appearance-none"
                        >
                           {ALL_COUNTRIES.map(c => <option key={c} value={c} className="bg-[#06213f]">{c}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Languages (comma separated)</label>
                     <input 
                        type="text" 
                        value={user.languages?.join(', ') || ''} 
                        onChange={e => !isReadOnly && updateField('languages', e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))} 
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">LinkedIn URL</label>
                     <input 
                        type="text" 
                        value={user.linkedinUrl || ''} 
                        onChange={e => !isReadOnly && updateField('linkedinUrl', e.target.value)} 
                        readOnly={isReadOnly}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                     />
                  </div>
               </div>
            </section>

            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-[#F0C927]">
                     <History size={18} /> Career Trajectory
                  </h3>
                  {!isReadOnly && (
                    <button 
                       onClick={() => setUser(p => ({...p, workHistory: [{ role: '', company: '', startYear: '', endYear: '', description: '', period: '' }, ...p.workHistory]}))} 
                       className="p-2 rounded-xl bg-[#F0C927]/10 text-[#F0C927] hover:bg-[#F0C927]/20 transition-all"
                    >
                       <Plus size={18} />
                    </button>
                  )}
               </div>
               <div className="space-y-6">
                  {user.workHistory.map((work, i) => (
                    <div key={i} className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all duration-500">
                       {!isReadOnly && (
                         <button 
                            onClick={() => setUser(p => ({...p, workHistory: p.workHistory.filter((_, idx) => idx !== i)}))} 
                            className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                         >
                            <Trash2 size={16} />
                         </button>
                       )}
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Role</label>
                             <input 
                                value={work.role} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, role: e.target.value} : w)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Company</label>
                             <input 
                                value={work.company} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, company: e.target.value} : w)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Start Year</label>
                             <input 
                                value={work.startYear} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, startYear: e.target.value} : w)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">End Year</label>
                             <input 
                                value={work.endYear} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, endYear: e.target.value} : w)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Period (Optional)</label>
                             <input 
                                value={work.period} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, period: e.target.value} : w)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-white/20 ml-1">Description</label>
                          <textarea 
                             value={work.description} 
                             onChange={e => !isReadOnly && setUser(p => ({...p, workHistory: p.workHistory.map((w, idx) => idx === i ? {...w, description: e.target.value} : w)}))} 
                             readOnly={isReadOnly}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium outline-none focus:border-[#F0C927] transition-all min-h-[100px] resize-none" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-[#F0C927]">
                     <GraduationCap size={18} /> Educational Background
                  </h3>
                  {!isReadOnly && (
                    <button 
                       onClick={() => setUser(p => ({...p, education: [{ degree: '', school: '', year: '', description: '' }, ...p.education]}))} 
                       className="p-2 rounded-xl bg-[#F0C927]/10 text-[#F0C927] hover:bg-[#F0C927]/20 transition-all"
                    >
                       <Plus size={18} />
                    </button>
                  )}
               </div>
               <div className="space-y-6">
                  {user.education.map((edu, i) => (
                    <div key={i} className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all duration-500">
                       {!isReadOnly && (
                         <button 
                            onClick={() => setUser(p => ({...p, education: p.education.filter((_, idx) => idx !== i)}))} 
                            className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                         >
                            <Trash2 size={16} />
                         </button>
                       )}
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Degree / Certification</label>
                             <input 
                                value={edu.degree} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, education: p.education.map((ed, idx) => idx === i ? {...ed, degree: e.target.value} : ed)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Institution</label>
                             <input 
                                value={edu.school} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, education: p.education.map((ed, idx) => idx === i ? {...ed, school: e.target.value} : ed)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Year of Completion</label>
                             <input 
                                value={edu.year} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, education: p.education.map((ed, idx) => idx === i ? {...ed, year: e.target.value} : ed)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Description</label>
                             <textarea 
                                value={edu.description || ''} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, education: p.education.map((ed, idx) => idx === i ? {...ed, description: e.target.value} : ed)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium outline-none focus:border-[#F0C927] transition-all min-h-[80px] resize-none" 
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-[#F0C927]">
                     <Heart size={18} /> Voluntary Activities
                  </h3>
                  {!isReadOnly && (
                    <button 
                       onClick={() => setUser(p => ({...p, voluntaryActivities: [{ role: '', organization: '', year: '', description: '' }, ...(p.voluntaryActivities || [])]}))} 
                       className="p-2 rounded-xl bg-[#F0C927]/10 text-[#F0C927] hover:bg-[#F0C927]/20 transition-all"
                    >
                       <Plus size={18} />
                    </button>
                  )}
               </div>
               <div className="space-y-6">
                  {(user.voluntaryActivities || []).map((vol, i) => (
                    <div key={i} className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all duration-500">
                       {!isReadOnly && (
                         <button 
                            onClick={() => setUser(p => ({...p, voluntaryActivities: (p.voluntaryActivities || []).filter((_, idx) => idx !== i)}))} 
                            className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                         >
                            <Trash2 size={16} />
                         </button>
                       )}
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Role</label>
                             <input 
                                value={vol.role} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, voluntaryActivities: (user.voluntaryActivities || []).map((v, idx) => idx === i ? {...v, role: e.target.value} : v)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/20 ml-1">Organization</label>
                             <input 
                                value={vol.organization} 
                                onChange={e => !isReadOnly && setUser(p => ({...p, voluntaryActivities: (user.voluntaryActivities || []).map((v, idx) => idx === i ? {...v, organization: e.target.value} : v)}))} 
                                readOnly={isReadOnly}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#F0C927] transition-all" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-white/20 ml-1">Description</label>
                          <textarea 
                             value={vol.description || ''} 
                             onChange={e => !isReadOnly && setUser(p => ({...p, voluntaryActivities: (user.voluntaryActivities || []).map((v, idx) => idx === i ? {...v, description: e.target.value} : v)}))} 
                             readOnly={isReadOnly}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium outline-none focus:border-[#F0C927] transition-all min-h-[80px] resize-none" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="glass-premium p-8 rounded-[40px] border-[#0a4179]/30 bg-[#0a4179]/5">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-[#F0C927]">
                     <Target size={18} /> Core Competencies
                  </h3>
                  <button 
                    onClick={handleAnalyzeSkills}
                    disabled={isAnalyzingSkills}
                    className="px-4 py-2 rounded-xl bg-[#F0C927]/10 border border-[#F0C927]/20 text-[#F0C927] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0C927]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzingSkills ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Analyze Gaps
                  </button>
               </div>
               <div className="flex flex-wrap gap-2 mb-8">
                  {user.skills.map((s, i) => {
                    const isShortlisted = user.shortlistedSkills?.includes(s);
                    return (
                      <span 
                        key={i} 
                        onClick={() => {
                           if (isReadOnly) return;
                           const current = user.shortlistedSkills || [];
                           const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                           setUser(p => ({...p, shortlistedSkills: next}));
                        }}
                        className={`px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                          isShortlisted 
                            ? "bg-[#F0C927]/10 border-[#F0C927]/30 text-[#F0C927] shadow-[0_0_15px_rgba(240,201,39,0.1)]" 
                            : "bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isShortlisted && <div className="w-1.5 h-1.5 rounded-full bg-[#F0C927] animate-pulse" />}
                        <span className="text-[11px] font-bold">{s}</span>
                      </span>
                    );
                  })}
                  {!isReadOnly && (
                    <button className="px-4 py-2 rounded-xl border border-dashed border-white/10 text-[11px] font-bold text-white/20 hover:text-white hover:border-white/40 transition-all">
                       + Add Skill
                    </button>
                  )}
               </div>
               
               {skillAnalysis && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                   {skillAnalysis.gaps.length > 0 && (
                     <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4 flex items-center gap-3">
                         <AlertTriangle size={16} /> Missing Skills for Saved Jobs
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {skillAnalysis.gaps.map((gap, i) => (
                           <span key={i} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 text-[11px] font-bold">
                             {gap}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   {skillAnalysis.recommendations.length > 0 && (
                     <div className="p-6 rounded-3xl bg-[#F0C927]/5 border border-[#F0C927]/10">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F0C927] mb-4 flex items-center gap-3">
                         <Lightbulb size={16} /> Development Recommendations
                       </h4>
                       <ul className="space-y-3">
                         {skillAnalysis.recommendations.map((rec, i) => (
                           <li key={i} className="text-sm text-white/70 flex items-start gap-3">
                             <div className="w-2 h-2 rounded-full bg-[#F0C927]/50 mt-1.5 shrink-0" />
                             <span className="leading-relaxed">{rec}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
               )}
            </section>
         </div>
      </div>
    </div>
  );
};

export default Profile;