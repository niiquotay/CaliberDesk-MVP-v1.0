import React from 'react';
import { 
  Activity, Target, Eye, Zap, 
  TrendingUp, Search, Briefcase, 
  CheckCircle2, Loader2, Sparkles,
  BarChart, Globe, Shield, ArrowLeft
} from 'lucide-react';
import { UserProfile, Application } from '../types';

interface SeekerAnalyticsProps {
  user: UserProfile;
  applications: Application[];
  onViewOverseas?: () => void;
  onBack?: () => void;
}

const SeekerAnalytics: React.FC<SeekerAnalyticsProps> = ({ user, applications, onViewOverseas, onBack }) => {
  const successRate = applications.length > 0 
    ? Math.round((applications.filter(a => a.status !== 'applied' && a.status !== 'rejected').length / applications.length) * 100)
    : 0;

  const ActivityChart = () => (
    <div className="h-20 w-full flex items-end gap-1 px-1">
      {[30, 45, 25, 60, 80, 50, 95].map((h, i) => (
        <div key={i} className="flex-1 bg-white/5 hover:bg-[#41d599]/40 transition-all rounded-t-sm group relative" style={{ height: `${h}%` }}>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-black">Career Analytics</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Real-time professional performance data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
           <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] animate-pulse"></div>
           <span className="text-[7px] font-black uppercase tracking-widest text-[#41d599]">Live Data Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Application Funnel', value: `${applications.length}`, sub: 'Jobs Applied', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Role Match Rating', value: '88%', sub: 'High Quality Fit', icon: Target, color: 'text-[#41d599]', bg: 'bg-[#41d599]/10' },
          { label: 'Profile Interest', value: user.stealthMode ? 'Private' : '142', sub: 'Employer Views', icon: Eye, color: 'text-[#F0C927]', bg: 'bg-[#F0C927]/10' },
          { label: 'Response Rate', value: `${successRate}%`, sub: 'Interview Success', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-[20px] p-4 border-white/5 space-y-3 hover:-translate-y-0.5 transition-all shadow-lg">
             <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} />
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                <h3 className="text-xl font-black">{stat.value}</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-[28px] p-5 border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Activity size={100} /></div>
           <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase">Application Activity</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">Rolling 7-day job search history</p>
              </div>
           </div>
           <ActivityChart />
           <div className="pt-3 border-t border-white/5">
              <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                Your profile interest is <span className="text-[#41d599] font-black">15% higher</span> this week. Consider highlighting your "Growth Mindset" in more applications.
              </p>
           </div>
        </div>

        <div className="glass rounded-[28px] p-5 border-white/5 space-y-4 shadow-2xl">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">Skill Alignment</h3>
              <BarChart size={14} className="text-[#F0C927]" />
           </div>
           <div className="space-y-4">
              {[
                { skill: 'Partnership Negotiations', fit: 95, color: 'bg-[#41d599]' },
                { skill: 'SaaS Management', fit: 82, color: 'bg-blue-400' },
                { skill: 'Stakeholder Mgmt', fit: 91, color: 'bg-[#41d599]' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">{item.skill}</span>
                      <span className="text-white">{item.fit}% Fit</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.fit}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full py-2 rounded-lg bg-white/5 text-[7px] font-black uppercase tracking-widest hover:bg-[#F0C927] hover:text-[#0a4179] transition-all">Review Global Fit</button>
        </div>
      </div>

      <div className="glass rounded-[28px] p-6 border-white/10 bg-gradient-to-r from-[#0a4179] to-[#06213f] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 p-4 opacity-5"><Globe size={100} /></div>
         <div className="relative z-10 flex-1 space-y-2">
            <h3 className="text-xl font-black uppercase">Global <span className="text-[#41d599]">Career Reach</span></h3>
            <p className="text-[10px] text-white/50 leading-relaxed max-w-md font-medium uppercase tracking-widest">
               High demand for your skill set identified in <span className="text-[#41d599] font-black uppercase">UAE</span> and <span className="text-[#41d599] font-black uppercase">Singapore</span>.
            </p>
         </div>
         <button onClick={onViewOverseas} className="relative z-10 px-6 py-2.5 bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-widest text-[8px] rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all">Explore International Roles</button>
      </div>
    </div>
  );
};

export default SeekerAnalytics;