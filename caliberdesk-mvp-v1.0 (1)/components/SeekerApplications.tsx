import React, { useState } from 'react';
import { Send, Clock, CheckCircle2, XCircle, Search, Filter, Briefcase, Calendar, ChevronRight, MapPin, DollarSign, Building2, Crown, ArrowLeft, Sparkles, Zap, Edit2, Check, X, History, LayoutGrid, List } from 'lucide-react';
import { Application, Job, ApplicationStatus } from '../types';

interface SeekerApplicationsProps {
  applications: Application[];
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onViewCompany: (companyName: string) => void;
  onBack?: () => void;
  onAcceptStatus?: (appId: string) => void;
  onDeclineStatus?: (appId: string) => void;
  onUpdateApplicationDueDate?: (appId: string, dueDate: string) => void;
}

const SeekerApplications: React.FC<SeekerApplicationsProps> = ({ 
  applications, 
  jobs, 
  onSelectJob, 
  onViewCompany, 
  onBack, 
  onAcceptStatus, 
  onDeclineStatus,
  onUpdateApplicationDueDate 
}) => {
  const [editingFollowUp, setEditingFollowUp] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const kanbanColumns = [
    { title: 'Applied', statuses: ['applied', 'viewed'] as ApplicationStatus[], color: 'bg-blue-500' },
    { title: 'Shortlisted', statuses: ['shortlisted', 'assessment'] as ApplicationStatus[], color: 'bg-[#F0C927]' },
    { title: 'Interview', statuses: ['interview-invitation', 'selected', 'final-interview'] as ApplicationStatus[], color: 'bg-purple-500' },
    { title: 'Offer', statuses: ['offer-letter', 'salary-negotiating', 'approval'] as ApplicationStatus[], color: 'bg-orange-500' },
    { title: 'Hired', statuses: ['hired'] as ApplicationStatus[], color: 'bg-[#41d599]' },
    { title: 'Rejected', statuses: ['rejected'] as ApplicationStatus[], color: 'bg-red-500' },
  ];

  const handleSetFollowUp = (appId: string, job: Job) => {
    setEditingFollowUp(appId);
    // Default to job expiry if available, otherwise today + 7 days
    const defaultDate = job.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setTempDate(defaultDate.split('T')[0]);
  };

  const saveFollowUp = (appId: string) => {
    onUpdateApplicationDueDate?.(appId, new Date(tempDate).toISOString());
    setEditingFollowUp(null);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500 text-white pb-32 px-4 md:px-0">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h1 className="text-5xl font-black tracking-tight">My Applications</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Application tracking and status history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
              title="Pipeline View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase text-[#41d599] tracking-widest">
            Submitted: {applications.length}
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass rounded-[32px] p-16 text-center border-dashed border-white/5 mt-8 opacity-40">
          <Briefcase size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">No Applications Found</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-2">
          {applications.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            if (!job) return null;
            const isRejected = app.status === 'rejected';
            const isHired = app.status === 'hired';

            return (
              <div key={app.id} onClick={() => onSelectJob(job)} className="glass group transition-all rounded-2xl p-3 border border-white/5 flex flex-row items-center gap-4 shadow-lg cursor-pointer relative overflow-hidden hover:bg-white/[0.05]">
                <div className={`absolute top-0 left-0 w-1 h-full opacity-60 ${isRejected ? 'bg-red-500' : isHired ? 'bg-[#41d599]' : 'bg-[#F0C927]'}`}></div>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0a4179] border border-white/10 flex items-center justify-center font-black text-[#F0C927] text-lg shrink-0 overflow-hidden shadow-inner`}>
                  {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black truncate">{job.title}</h4>
                    {app.isAutoApplied && (
                      <span className="px-1.5 py-0.5 rounded bg-[#41d599]/10 text-[#41d599] text-[7px] font-black uppercase tracking-widest border border-[#41d599]/20 flex items-center gap-1">
                        <Zap size={8} className="fill-current" /> Auto-Applied
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
                    <span className="truncate text-white/60">{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} /> {job.city}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(app.appliedDate).toLocaleDateString()}</span>
                    
                    {editingFollowUp === app.id ? (
                      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="date" 
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          className="bg-transparent text-[10px] text-white outline-none border-none"
                        />
                        <button 
                          onClick={() => saveFollowUp(app.id)}
                          className="p-1 hover:bg-[#41d599]/20 rounded text-[#41d599]"
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          onClick={() => setEditingFollowUp(null)}
                          className="p-1 hover:bg-white/10 rounded text-white/40"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {app.dueDate ? (
                          <span className="flex items-center gap-1 text-[#F0C927]">
                            <Clock size={10} /> Follow-up: {new Date(app.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-white/20 italic">No follow-up set</span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSetFollowUp(app.id, job); }}
                          className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
                          title="Set follow-up date"
                        >
                          <Edit2 size={10} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setExpandedHistory(expandedHistory === app.id ? null : app.id); }}
                          className={`p-1 rounded transition-colors ${expandedHistory === app.id ? 'bg-[#F0C927]/20 text-[#F0C927]' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
                          title="View status history"
                        >
                          <History size={10} />
                        </button>
                      </div>
                    )}

                    <span className={`flex items-center gap-1 ${app.matchScore && app.matchScore > 70 ? 'text-[#41d599]' : 'text-[#F0C927]'}`}>
                      <Sparkles size={10} /> {app.matchScore || '??'}% Match
                    </span>
                  </div>

                  {app.isAutoApplied && (
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-[#41d599]/20 border border-[#41d599]/40 flex items-center justify-center">
                          <CheckCircle2 size={8} className="text-[#41d599]" />
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-white/40">AI Analysis</span>
                      </div>
                      <div className="w-4 h-px bg-white/10 shrink-0"></div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-[#41d599]/20 border border-[#41d599]/40 flex items-center justify-center">
                          <CheckCircle2 size={8} className="text-[#41d599]" />
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-white/40">CV Tailoring</span>
                      </div>
                      <div className="w-4 h-px bg-white/10 shrink-0"></div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-[#41d599]/20 border border-[#41d599]/40 flex items-center justify-center">
                          <CheckCircle2 size={8} className="text-[#41d599]" />
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-white/40">Submission</span>
                      </div>
                    </div>
                  )}

                  {app.proposedStatus && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-400 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                          Invitation to <span className="text-white font-black">{app.proposedStatus.replace('-', ' ')}</span> stage
                        </p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAcceptStatus?.(app.id); }}
                          className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeclineStatus?.(app.id); }}
                          className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedHistory === app.id && (
                    <div className="mt-4 p-4 rounded-2xl bg-black/20 border border-white/5 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#F0C927] flex items-center gap-2">
                          <History size={12} /> Status Timeline
                        </h5>
                        <button onClick={() => setExpandedHistory(null)} className="text-white/20 hover:text-white transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                      <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        {(app.statusHistory || [{ status: 'applied', date: app.appliedDate }]).map((entry, idx) => (
                          <div key={idx} className="relative pl-6 flex items-start justify-between gap-4">
                            <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a4179] z-10 ${
                              idx === (app.statusHistory?.length || 1) - 1 ? 'bg-[#41d599] shadow-[0_0_10px_rgba(65,213,153,0.5)]' : 'bg-white/20'
                            }`}></div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                {entry.status.replace('-', ' ')}
                              </p>
                              <p className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">
                                {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {idx === (app.statusHistory?.length || 1) - 1 && (
                              <div className="px-2 py-0.5 rounded bg-[#41d599]/10 border border-[#41d599]/20 text-[#41d599] text-[7px] font-black uppercase tracking-widest">
                                Current
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 pr-2">
                   <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                     isRejected ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                     isHired ? 'bg-[#41d599]/10 border-[#41d599]/20 text-[#41d599]' : 
                     'bg-[#F0C927]/10 border-[#F0C927]/20 text-[#F0C927]'
                   }`}>
                     {app.status.replace('-', ' ')}
                   </div>
                   <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white transition-all"><ChevronRight size={14} /></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar min-h-[600px]">
          {kanbanColumns.map((column, idx) => {
            const columnApps = applications.filter(app => column.statuses.includes(app.status));
            
            return (
              <div key={idx} className="flex-shrink-0 w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/80">{column.title}</h3>
                  </div>
                  <span className="text-[10px] font-black text-white/20">{columnApps.length}</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 min-h-[200px]">
                  {columnApps.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-2xl m-2">
                      <p className="text-[8px] font-black uppercase tracking-widest">Empty</p>
                    </div>
                  ) : (
                    columnApps.map(app => {
                      const job = jobs.find(j => j.id === app.jobId);
                      if (!job) return null;
                      
                      return (
                        <div 
                          key={app.id} 
                          onClick={() => onSelectJob(job)}
                          className="glass p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0a4179] border border-white/10 flex items-center justify-center font-black text-[#F0C927] text-xs shrink-0 overflow-hidden">
                              {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black truncate leading-tight">{job.title}</h4>
                              <p className="text-[9px] font-bold text-white/40 truncate uppercase tracking-tighter">{job.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/30">
                              <MapPin size={8} /> {job.city}
                            </span>
                            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/30">
                              <Calendar size={8} /> {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${column.color}`}></div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                                {app.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black text-[#41d599]">
                              <Sparkles size={8} /> {app.matchScore || '??'}%
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerApplications;