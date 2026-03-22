import React from 'react';
import { X, CheckCircle2, Target, Users, Zap } from 'lucide-react';
import { Job } from '../types';

interface MatchDetailsProps {
  job: Job;
  onClose: () => void;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ job, onClose }) => {
  const details = job.matchDetails || { technical: 0, culture: 0, experience: 0 };

  const Stat = ({ label, value, icon: Icon, colorClass, bgColorClass }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/60">
        <span className="flex items-center gap-2"><Icon size={14} className={colorClass} /> {label}</span>
        <span className={colorClass}>{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgColorClass} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-white/10 bg-[#06213f]">
          <h3 className="text-xl font-bold">Match Intelligence</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-8 space-y-8 bg-[#0a4179]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * (job.matchScore || 0)) / 100} className="text-[#41d599] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(65,213,153,0.3)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{job.matchScore}%</span>
                <span className="text-[10px] text-white/40 font-bold uppercase">Overall</span>
              </div>
            </div>
            <p className="text-white/80 italic text-sm">"{job.matchReason}"</p>
          </div>

          <div className="space-y-6">
            <Stat label="Technical Skills" value={details.technical} icon={Zap} colorClass="text-[#f1ca27]" bgColorClass="bg-[#f1ca27]" />
            <Stat label="Cultural Fit" value={details.culture} icon={Users} colorClass="text-[#41d599]" bgColorClass="bg-[#41d599]" />
            <Stat label="Industry Experience" value={details.experience} icon={Target} colorClass="text-[#1c7283]" bgColorClass="bg-[#1c7283]" />
          </div>

          <div className="bg-[#41d599]/10 border border-[#41d599]/20 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="text-[#41d599] mt-0.5" size={20} />
            <p className="text-sm text-white/90">AI verified: Your profile strongly aligns with the core requirements of this role.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;