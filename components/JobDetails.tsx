// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Job, UserProfile, Application } from '../types';
import { 
  ArrowLeft, MapPin, Globe, DollarSign, Calendar, Briefcase, 
  ChevronRight, Crown, Check, Play, Send, ShieldCheck, Share2, Info, Users,
  Linkedin, Facebook, MessageCircle, Mail, Copy, Link as LinkIcon, AlertTriangle, MessageSquare,
  CheckCircle2, ExternalLink, ClipboardList, FileStack, Lock, Heart, Wand2, FileCheck, Zap,
  Clock, Building, Shield, Gift, Coins, Sparkles, Edit, Target, Brain, Download, Activity, UserCheck, FileText, X
} from 'lucide-react';
import Toast from './Toast';
import { isJobActuallyActive } from '../constants';
import { calculateProfileCompletion } from '../utils';
import AutomatedInterviewer from './AutomatedInterviewer';
import Profile from './Profile';
import JobSearchGrounding from './JobSearchGrounding';

interface JobDetailsProps {
  job: Job;
  allJobs: Job[];
  user: UserProfile;
  applications: Application[];
  onBack: () => void;
  onApply: (job: Job) => void;
  onSelectJob: (job: Job) => void;
  onInspectMatch: (job: Job) => void;
  onViewCompany: (companyName: string) => void;
  onLaunchCoach: () => void;
  onTakeTest: (job: Job) => void;
  onEdit?: (job: Job) => void;
  isAdminView?: boolean;
}

const STAGES: { value: ApplicationStatus; label: string; icon: any; color: string; bgColor: string }[] = [
  { value: 'applied', label: 'Applied', icon: CheckCircle2, color: 'text-white/40', bgColor: 'bg-white/5' },
  { value: 'shortlisted', label: 'Shortlisted', icon: CheckCircle2, color: 'text-[#41d599]', bgColor: 'bg-[#41d599]/10' },
  { value: 'assessment', label: 'Assessment', icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  { value: 'interview-invitation', label: 'Interview', icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  { value: 'final-interview', label: 'Final Interview', icon: Target, color: 'text-[#F0C927]', bgColor: 'bg-[#F0C927]/10' },
  { value: 'offer-letter', label: 'Offer', icon: Mail, color: 'text-[#f1ca27]', bgColor: 'bg-[#f1ca27]/10' },
  { value: 'hired', label: 'Hired', icon: UserCheck, color: 'text-[#41d599]', bgColor: 'bg-[#41d599]/20' },
];

const JobDetails: React.FC<JobDetailsProps> = ({ job, allJobs, user, applications, onBack, onApply, onSelectJob, onInspectMatch, onViewCompany, onLaunchCoach, onTakeTest, onEdit, isAdminView = false }) => {
  const application = applications.find(a => a.jobId === job.id);
  const isApplied = !!application;
  const isActive = isJobActuallyActive(job);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showInterviewer, setShowInterviewer] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  const profileCompletion = calculateProfileCompletion(user);
  const canApply = profileCompletion >= 80;

  const handleApply = () => {
    if (!canApply) {
      setToast({ 
        message: `Profile incomplete (${profileCompletion}%). Minimum 80% required to apply. Please update your profile.`, 
        type: 'error' 
      });
      return;
    }
    onApply(job);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20 text-white animate-in fade-in duration-500 px-4 md:px-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showInterviewer && <AutomatedInterviewer job={job} user={user} onClose={() => setShowInterviewer(false)} />}
      
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold tracking-wide">Back to Hub</span>
        </button>
        {!user.isEmployer && (
          <div className="px-3 py-1 rounded-xl bg-[#41d599]/10 text-[#41d599] border border-[#41d599]/20 flex items-center gap-1.5">
             <ShieldCheck size={14} />
             <span className="text-[8px] font-bold tracking-wide">Verified Role</span>
          </div>
        )}
      </div>

      <div className="glass-premium rounded-[1.5rem] p-5 md:p-6 relative overflow-hidden shadow-2xl border-white/10 ring-1 ring-white/5">
        <div className="relative z-10 flex flex-col md:flex-row gap-5 md:items-center">
           <div onClick={() => onViewCompany(job.company)} className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-[#0a4179] flex items-center justify-center text-xl font-black border border-white/20 shadow-2xl cursor-pointer hover:bg-[#F0C927] hover:text-[#0a4179] transition-all duration-500 overflow-hidden shrink-0 group">
             {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <span>{job.company[0]}</span>}
           </div>
           <div className="flex-1 space-y-1">
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                 <span onClick={() => onViewCompany(job.company)} className="text-xs font-bold text-[#F0C927] cursor-pointer hover:underline decoration-[#F0C927]/30 underline-offset-4">{job.company}</span>
                 {job.idNumber && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[9px] font-bold tracking-wide text-white/60">
                      ID: {job.idNumber}
                    </span>
                 )}
                 {job.isPremium && <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F0C927]/10 text-[#F0C927] border border-[#F0C927]/20 text-[9px] font-bold tracking-wide shadow-lg"><Crown size={10} /> Premium</span>}
                 {job.aptitudeTestId && <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold tracking-wide shadow-lg"><FileCheck size={10} /> Assessment Required</span>}
                 <span className="text-[9px] font-bold text-white/50 tracking-wide flex items-center gap-1.5"><MapPin size={12} className="text-[#F0C927]" /> {job.city}, {job.country}</span>
              </div>
           </div>
           {user.isEmployer && (job.postedBy === user.id || isAdminView) && (
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => onEdit?.(job)} 
                  className="px-8 py-3 rounded-xl bg-purple-500 text-white font-bold tracking-wide text-[11px] shadow-2xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2"
                >
                  <Edit size={16} /> Edit Job Posting
                </button>
              </div>
            )}
           {!user.isEmployer && !isAdminView && (
             <div className="flex gap-2 shrink-0">
                {isApplied ? (
                  <div className="px-6 py-3 rounded-xl bg-[#41d599]/10 text-[#41d599] font-bold tracking-wide text-[11px] border border-[#41d599]/20 flex items-center gap-2 shadow-lg"><Check size={16} /> Applied</div>
                ) : (
                  <button onClick={handleApply} className="px-8 py-3 rounded-xl bg-[#F0C927] text-[#0a4179] font-bold tracking-wide text-[11px] shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all duration-300">
                    {job.applicationType === 'external' ? 'Apply Externally' : 'Initialize Deployment'}
                  </button>
                )}
                <button onClick={() => onInspectMatch(job)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#F0C927] hover:bg-white/10 transition-all duration-300 flex items-center justify-center shadow-lg">
                  <Sparkles size={18} fill={job.matchScore ? "currentColor" : "none"} className={job.matchScore ? "animate-pulse" : ""} />
                </button>
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 mt-4 border-t border-white/5">
           <div className="space-y-0.5"><p className="text-[8px] font-bold text-white/30 tracking-wide">Remuneration</p><p className="text-xs font-bold text-[#41d599]">{job.salary}</p></div>
           <div className="space-y-0.5"><p className="text-[8px] font-bold text-white/30 tracking-wide">Protocol</p><p className="text-xs font-bold text-white/90">{job.employmentType || 'Full-time'}</p></div>
           <div className="space-y-0.5"><p className="text-[8px] font-bold text-white/30 tracking-wide">Operational Rank</p><p className="text-xs font-bold text-white/90">{job.jobRank || 'Mid-Level'}</p></div>
           <div className="space-y-0.5"><p className="text-[8px] font-bold text-white/30 tracking-wide">Modality</p><p className="text-xs font-bold text-white/90">{job.location}</p></div>
           <div className="space-y-0.5"><p className="text-[8px] font-bold text-white/30 tracking-wide">Industry</p><p className="text-xs font-bold text-white/90">{job.industry || 'General'}</p></div>
           {user.isEmployer && job.postedBy && (
             <div className="space-y-0.5">
               <p className="text-[8px] font-bold text-white/30 tracking-wide">Posted By</p>
               <p className="text-xs font-bold text-blue-400 flex items-center gap-1">
                 <Users size={12} /> {job.postedBy}
               </p>
             </div>
           )}
        </div>

        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/5">
           <span className="text-[10px] font-bold text-white/40 tracking-wide mr-2">Share Job:</span>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Download PDF">
             <Download size={14} />
           </button>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-colors" title="Share on LinkedIn">
             <Linkedin size={14} />
           </button>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#1877f2] hover:bg-[#1877f2]/10 transition-colors" title="Share on Facebook">
             <Facebook size={14} />
           </button>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors" title="Share via WhatsApp">
             <MessageCircle size={14} />
           </button>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors" title="Share via Email">
             <Mail size={14} />
           </button>
           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Copy Link">
             <Copy size={14} />
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        <div className="space-y-8">
           {(isAdminView || user.isEmployer) && (
             <section className="glass-premium rounded-[40px] p-8 border-[#41d599]/20 bg-[#41d599]/5">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-base font-bold tracking-wide flex items-center gap-2.5 text-[#41d599]">
                   <Activity size={18} /> Operational Insights
                 </h2>
                 <div className="flex items-center gap-2">
                   {!job.isPremium && (
                     <button className="px-4 py-1.5 rounded-xl bg-[#F0C927] text-[#0a4179] text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                       Upgrade to Premium
                     </button>
                   )}
                   <button 
                     onClick={() => setShowApplicants(true)}
                     className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all" 
                     title="View All Applicants"
                   >
                     <Users size={16} />
                   </button>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="space-y-1">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Posting Date</p>
                   <p className="text-xs font-bold text-white">{new Date(job.postedAt).toLocaleDateString()}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Expiry Date</p>
                   <p className="text-xs font-bold text-white">{job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Views</p>
                   <p className="text-xs font-bold text-white">1,248</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Applicants</p>
                   <p className="text-xs font-bold text-[#41d599]">{applications.filter(a => a.jobId === job.id).length}</p>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-4">Pipeline Distribution</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                   {STAGES.map(stage => {
                     const count = applications.filter(a => a.jobId === job.id && a.status === stage.value).length;
                     return (
                       <div key={stage.value} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${stage.bgColor.replace('/10', '')}`}></div>
                         <div>
                           <p className="text-[7px] font-black uppercase tracking-tighter text-white/40">{stage.label}</p>
                           <p className="text-[10px] font-black text-white">{count}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             </section>
           )}

           <section className="glass-premium rounded-[40px] p-8 space-y-8">
              <div>
                <h2 className="text-sm font-bold tracking-wide flex items-center gap-2 text-[#F0C927] mb-4"><ClipboardList size={16} /> Roles & Responsibilities</h2>
                <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{job.responsibilities || job.description}</div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h2 className="text-sm font-bold tracking-wide flex items-center gap-2 text-[#41d599] mb-4"><FileStack size={16} /> Candidate Requirements</h2>
                <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{job.requirements}</div>
              </div>
           </section>

           {user.isEmployer && (job.company === user.companyName || job.company === user.name) && (
             <section className="glass-premium rounded-[40px] border-purple-500/20 bg-purple-500/5 p-8">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-base font-bold tracking-wide flex items-center gap-2.5 text-purple-400">
                   <Target size={18} /> Ideal Candidate Definition <span className="text-[10px] opacity-60 lowercase font-medium tracking-normal">(Internal Only - Hidden from Seekers)</span>
                 </h2>
                 <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[8px] font-bold tracking-wide text-purple-400">
                   Employer View
                 </div>
               </div>
               {job.idealCandidateDefinition ? (
                 <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">
                   {job.idealCandidateDefinition}
                 </div>
               ) : (
                 <div className="text-sm text-white/50">
                   No definition provided yet. Define your ideal candidate to improve smart matching and ranking accuracy.
                 </div>
               )}
               {onEdit && (
                 <button 
                   onClick={() => onEdit(job)}
                   className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-wide text-purple-400 hover:text-purple-300 transition-colors"
                 >
                   <Edit size={14} /> Update Definition
                 </button>
               )}
             </section>
           )}

           {!user.isEmployer && !isAdminView && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button onClick={() => setShowInterviewer(true)} className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 flex flex-col items-center text-center gap-4 group hover:bg-blue-500/10 transition-all duration-500 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-lg"><Brain size={24} /></div>
                    <div><p className="text-xs font-bold tracking-wide">Automated Interviewer</p><p className="text-[9px] text-white/30 font-bold mt-1">Simulate real interview</p></div>
                 </button>
                <button onClick={onLaunchCoach} className="p-8 rounded-[2rem] bg-[#F0C927]/5 border border-[#F0C927]/20 flex flex-col items-center text-center gap-4 group hover:bg-[#F0C927]/10 transition-all duration-500 shadow-xl">
                   <div className="w-12 h-12 rounded-2xl bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] group-hover:scale-110 transition-transform duration-500 shadow-lg"><Zap size={24} /></div>
                   <div><p className="text-xs font-bold tracking-wide">Consult Smart Coach</p><p className="text-[9px] text-white/30 font-bold mt-1">Optimize pitch for this role</p></div>
                </button>
             </div>
           )}
        </div>
      </div>

      {!user.isEmployer && !isAdminView && (
        <aside className="space-y-4 pt-8 border-t border-white/5">
           <h3 className="text-[10px] font-bold tracking-wide text-white/40 px-2">Market Relatives</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {allJobs.filter(j => j.id !== job.id && j.status === 'active').slice(0, 4).map(sj => (
               <div key={sj.id} onClick={() => onSelectJob(sj)} className="glass-premium rounded-2xl p-4 border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 cursor-pointer flex flex-col justify-between group shadow-xl">
                 <div className="flex items-center gap-4 min-w-0 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0a4179] flex items-center justify-center text-xs font-black text-[#F0C927] border border-white/10 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">{sj.company[0]}</div>
                    <div className="min-w-0"><p className="text-xs font-bold truncate leading-tight group-hover:text-[#F0C927] transition-colors">{sj.title}</p><p className="text-[8px] text-white/30 font-bold mt-0.5">{sj.company}</p></div>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-white/50">{sj.location}</span>
                   <ChevronRight size={14} className="text-white/10 group-hover:text-white transition-colors" />
                 </div>
               </div>
             ))}
           </div>
        </aside>
      )}

      {showApplicants && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="glass-premium w-full max-w-4xl rounded-[40px] p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
            <button onClick={() => setShowApplicants(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-[#F0C927]">Job Applicants</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Operational pipeline for <span className="text-white">{job.title}</span></p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#050505] z-10 text-[8px] font-black uppercase tracking-[0.2em] text-[#F0C927]/50 border-b border-[#F0C927]/10">
                  <tr>
                    <th className="px-4 py-4">Candidate</th>
                    <th className="px-4 py-4">Stage</th>
                    <th className="px-4 py-4 text-center">Smart Match</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.filter(a => a.jobId === job.id).map((app) => (
                    <tr key={app.id} className="group hover:bg-[#F0C927]/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden group-hover:border-[#F0C927]/30 transition-colors">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.candidateProfile?.name || app.id}`} alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white group-hover:text-[#F0C927] transition-colors">{app.candidateProfile?.name || 'Anonymous Candidate'}</p>
                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-tight">{app.candidateProfile?.jobTitle || 'Talent'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60 group-hover:border-[#F0C927]/20 group-hover:text-white transition-colors">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#41d599]" style={{ width: `${app.matchScore || 75}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-[#41d599]">{app.matchScore || 75}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#F0C927] hover:border-[#F0C927]/30 hover:bg-[#F0C927]/10 transition-all" title="Download CV">
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => setSelectedApplicant(app)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#F0C927] hover:border-[#F0C927]/30 hover:bg-[#F0C927]/10 transition-all" 
                            title="View Profile"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col relative glass-premium rounded-[40px] border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[#F0C927]">Candidate Profile</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">
                  Full dossier for <span className="text-white">{selectedApplicant.candidateProfile?.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Profile 
                user={{ ...selectedApplicant.candidateProfile, isReadOnly: true }} 
                setUser={() => {}} 
                onBack={() => setSelectedApplicant(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;