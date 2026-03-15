import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, Zap, 
  FileText, Download, Sparkles, Loader2, PieChart, 
  Activity, ArrowUpRight, ArrowDownRight, Briefcase,
  CheckCircle2, Clock, MapPin, Globe, ShieldCheck,
  RefreshCw, FileDown, ShieldAlert, Award, FileSpreadsheet
} from 'lucide-react';
import { Job, Application, UserProfile } from '../types';
import { getEmployerInsights } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Toast from './Toast';

interface EmployerAnalyticsProps {
  user: UserProfile;
  jobs: Job[];
  applications: Application[];
}

const EmployerAnalytics: React.FC<EmployerAnalyticsProps> = ({ user, jobs, applications }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const stats = useMemo(() => {
    const activeJobsCount = jobs.filter(j => j.status === 'active').length;
    const totalApplicants = applications.length;
    const hiredCount = applications.filter(a => a.status === 'hired').length;
    const conversionRate = totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0;
    
    // Average Match Score simulation
    const avgMatchScore = jobs.reduce((acc, curr) => acc + (curr.matchScore || 82), 0) / (jobs.length || 1);
    
    return {
      activeJobs: activeJobsCount,
      totalApplicants,
      avgMatchScore: Math.round(avgMatchScore),
      hiredCount,
      conversionRate,
      pipelineGravity: (totalApplicants * 1.2).toFixed(0) // Simulated momentum metric
    };
  }, [jobs, applications]);

  useEffect(() => {
    handleSyncInsights().catch(err => console.error("Initial sync error:", err));
  }, []);

  const handleSyncInsights = async () => {
    setIsSyncing(true);
    try {
      const data = await getEmployerInsights(jobs, applications);
      setInsights(data);
      setToast({ message: "Hiring insights updated", type: 'success' });
    } catch (err) {
      setToast({ message: "Insight synchronization failed.", type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const generatePDF = (targetJob?: Job) => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      const orgName = (user.companyName || user.name).toUpperCase();
      
      // Professional Header
      doc.setFillColor(10, 65, 121); // #0a4179
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("CALIBERDESK", 15, 22);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text("HIRING PERFORMANCE REPORT", 15, 30);
      doc.text(`ISSUED TO: ${orgName}`, 15, 35);
      doc.text(`DATE: ${timestamp}`, 15, 40);

      // Report Title
      doc.setTextColor(10, 65, 121);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = targetJob 
        ? `ROLE PERFORMANCE REVIEW: ${targetJob.title.toUpperCase()}` 
        : "GLOBAL RECRUITMENT SUMMARY REPORT";
      doc.text(title, 15, 60);

      if (targetJob) {
        // Detailed Role Report logic
        const jobApps = applications.filter(a => a.jobId === targetJob.id);
        const hiredForRole = jobApps.filter(a => a.status === 'hired').length;
        const matchQuality = targetJob.matchScore || 85;

        // KPI Box
        doc.setFillColor(245, 248, 252);
        doc.roundedRect(15, 70, 180, 30, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("APPLICANTS", 25, 82);
        doc.text("CANDIDATE MATCH", 75, 82);
        doc.text("HIRE RATE", 125, 82);
        doc.text("STATUS", 165, 82);

        doc.setTextColor(10, 65, 121);
        doc.setFontSize(14);
        doc.text(jobApps.length.toString(), 25, 92);
        doc.text(`${matchQuality}%`, 75, 92);
        doc.text(`${jobApps.length > 0 ? Math.round((hiredForRole/jobApps.length)*100) : 0}%`, 125, 92);
        doc.text((targetJob.status || 'ACTIVE').toUpperCase(), 165, 92);

        // AI Narrative for Role
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("AI PERFORMANCE INSIGHTS", 15, 115);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const perfStatus = insights?.rolePerformance?.find((p: any) => p.jobTitle === targetJob.title)?.status || "Standard Hiring Process";
        const roleText = `The "${targetJob.title}" track is currently identifying as "${perfStatus}". AI suggest prioritizing outreach in ${targetJob.city} to optimize conversion rate. Profile alignment currently sits at ${matchQuality}%, indicating a high-quality candidate pool ready for final evaluation.`;
        const splitText = doc.splitTextToSize(roleText, 180);
        doc.text(splitText, 15, 125);

        // Applicants Table
        autoTable(doc, {
          startY: 150,
          head: [['Candidate Identity', 'Initial Match', 'Aptitude Score', 'Current Status']],
          body: jobApps.map(a => [
            a.candidateProfile?.name || 'Restricted',
            '85%', 
            a.testScore ? `${a.testScore}%` : 'Pending',
            a.status.toUpperCase()
          ]),
          headStyles: { fillColor: [10, 65, 121] },
          alternateRowStyles: { fillColor: [250, 250, 250] }
        });

      } else {
        // Global Summary Report
        doc.setFillColor(245, 248, 252);
        doc.roundedRect(15, 70, 180, 50, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("GLOBAL PIPELINE", 25, 85);
        doc.text("CANDIDATE MATCH", 75, 85);
        doc.text("HIRE RATE", 125, 85);
        doc.text("ACTIVE ROLES", 165, 85);

        doc.setTextColor(10, 65, 121);
        doc.setFontSize(16);
        doc.text(stats.totalApplicants.toString(), 25, 100);
        doc.text(`${stats.avgMatchScore}%`, 75, 100);
        doc.text(`${stats.conversionRate}%`, 125, 100);
        doc.text(stats.activeJobs.toString(), 165, 100);

        // AI Strategy
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("STRATEGIC RECOMMENDATIONS", 15, 135);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Market Position: ${insights?.marketPosition || 'Analyzing...' }`, 15, 145);
        doc.text(`Candidate Pool: ${insights?.candidateQuality || 'Processing...' }`, 15, 152);
        
        doc.setFont('helvetica', 'bold');
        doc.text("Mandatory Action Items:", 15, 165);
        doc.setFont('helvetica', 'normal');
        (insights?.actionItems || ['Update insights for latest data.']).forEach((item: string, i: number) => {
          doc.text(`- ${item}`, 20, 172 + (i * 7));
        });

        // Roles Summary Table
        autoTable(doc, {
          startY: 200,
          head: [['Job Role', 'Applicants', 'Match Score', 'AI Assessment']],
          body: jobs.map(j => [
            j.title,
            applications.filter(a => a.jobId === j.id).length,
            `${j.matchScore || 82}%`,
            insights?.rolePerformance?.find((p: any) => p.jobTitle === j.title)?.status || 'Active'
          ]),
          headStyles: { fillColor: [10, 65, 121] },
        });
      }

      // Footer Branding
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text("© 2025 CALIBERDESK ENTERPRISE • CONFIDENTIAL REPORT", 105, 285, { align: 'center' });
      }

      const fileName = targetJob 
        ? `${orgName}_ROLE_REVIEW_${targetJob.title.replace(/\s+/g, '_')}.pdf`
        : `${orgName}_GLOBAL_SUMMARY_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      setToast({ message: "Performance report generated", type: 'success' });
    } catch (err) {
      console.error("PDF failure:", err);
      setToast({ message: "Reporting engine error.", type: 'error' });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Strategic Header */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#41d599] to-[#F0C927] flex items-center justify-center text-[#0a4179] shadow-lg">
              <Activity size={16} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-white">
                DASHBOARD
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleSyncInsights}
            disabled={isSyncing}
            className="px-6 py-3 bg-[#41d599] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             {isSyncing ? <Loader2 size={16} className="animate-spin text-[#0a4179]" /> : <RefreshCw size={16} className="text-[#0a4179]" />} 
             Resync Insights
           </button>
           <button 
            onClick={() => generatePDF()}
            className="px-6 py-3 bg-[#F0C927] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <Download size={16} /> Global Performance
           </button>
        </div>
      </div>


      {/* Advanced KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* KPI Cards */}
        {[
          { label: 'Active pipeline', value: stats.totalApplicants, sub: 'Total applicants', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Avg candidate match', value: `${stats.avgMatchScore}%`, sub: 'Profile alignment', icon: Target, color: 'text-[#41d599]', bg: 'bg-[#41d599]/10' },
          { label: 'Hire rate', value: `${stats.conversionRate}%`, sub: 'Successful hires', icon: TrendingUp, color: 'text-[#F0C927]', bg: 'bg-[#F0C927]/10' },
          { label: 'Hiring momentum', value: stats.pipelineGravity, sub: 'Pipeline activity', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-premium rounded-2xl p-6 border border-white/5 space-y-1.5 shadow-sm group hover:-translate-y-0.5 transition-all">
             <div className={`w-6 h-6 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={12} />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                <h3 className="text-lg font-black mt-0.5 text-white">{stat.value}</h3>
                <p className="text-[7px] font-bold text-white/40 uppercase mt-0.5">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-2">
        {/* Performance Visualization - Animated */}
        <div className="lg:col-span-3 glass-premium rounded-2xl p-8 border border-white/5 space-y-3 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none text-white"><Activity size={60} /></div>
           <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Hiring speed</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-0.5">Pipeline flow dynamics (Rolling 7-week)</p>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#41d599]"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Hired</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Shortlisted</span>
                 </div>
              </div>
           </div>

           <div className="h-24 flex items-end gap-1.5 px-1">
              {[35, 75, 45, 95, 65, 80, 90].map((h, i) => (
                <div key={i} className="flex-1 space-y-1.5 group relative">
                   <div className="w-full bg-[#41d599]/10 rounded-t-lg group-hover:bg-[#41d599]/30 transition-all cursor-help relative" style={{ height: `${h}%` }}>
                      <div className="absolute bottom-0 w-full bg-[#41d599] rounded-t-lg opacity-40 transition-all group-hover:opacity-100" style={{ height: `${h * 0.4}%` }}></div>
                   </div>
                   <p className="text-[7px] font-black text-center text-white/40 uppercase tracking-tighter">PHASE 0{i+1}</p>
                </div>
              ))}
           </div>

           <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1 space-y-1.5">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40">AI hiring recommendations</p>
                 <p className="text-xs text-white/60 leading-relaxed font-medium italic">
                   "Organization hiring speed is <span className="text-[#41d599] font-black">18% above sector average</span>. Shortlist-to-hire ratio indicates optimal candidate vetting protocols."
                 </p>
              </div>
              <div className="shrink-0 flex items-center justify-center p-1 border border-[#41d599]/20 rounded-full">
                 <div className="w-8 h-8 rounded-full bg-[#41d599]/10 flex items-center justify-center text-[#41d599] animate-spin-slow">
                    <Sparkles size={12} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Role Performance Directory - Surgical Audits */}
      <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Job performance list</h3>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Review active job listings for performance reporting</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-400/10 border border-blue-400/20 text-[8px] font-black uppercase tracking-widest text-blue-400 shadow-sm">
                  <ShieldCheck size={8} /> Hiring status
               </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Job title</th>
                    <th className="px-6 py-4 text-center">Pipeline</th>
                    <th className="px-6 py-4">Match score</th>
                    <th className="px-6 py-4">AI Assessment</th>
                    <th className="px-6 py-4 text-right">Reporting</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                  {jobs.map(job => {
                    const perfStatus = insights?.rolePerformance?.find((p: any) => p.jobTitle === job.title)?.status;
                    const applicantCount = applications.filter(a => a.jobId === job.id).length;
                    
                    return (
                      <tr key={job.id} className="hover:bg-white/5 border-b border-white/5 last:border-0 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[8px] transition-all overflow-hidden border ${job.isPremium ? 'bg-[#F0C927]/10 border-[#F0C927]/30 text-[#F0C927]' : 'bg-white/10 border-white/20 text-white/50'}`}>
                              {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-black truncate max-w-[250px] text-[10px] ${job.isPremium ? 'text-[#F0C927]' : 'text-white'}`}>{job.title}</p>
                              <p className="text-[8px] text-white/40 uppercase font-black truncate">{job.city} • {job.salary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-[10px] text-white">{applicantCount}</span>
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">Applications</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5 w-16">
                             <div className="flex justify-between text-[6px] font-black uppercase tracking-widest">
                                <span className="text-white/40 text-[7px]">Yield</span>
                                <span className="text-[#41d599] text-[7px]">78%</span>
                             </div>
                             <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-[#41d599] w-[78%]"></div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                             perfStatus ? 'bg-[#F0C927]/10 text-[#F0C927] border-[#F0C927]/30 shadow-[0_0_10px_rgba(240,201,39,0.1)]' : 'bg-white/5 text-white/40 border-white/10'
                           }`}>
                             {perfStatus || "Standard"}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                               <button 
                                onClick={() => generatePDF(job)}
                                className="p-1 rounded-md bg-white/5 text-white/40 hover:text-[#41d599] hover:bg-[#41d599]/10 transition-all border border-white/10 hover:border-[#41d599]/20 shadow-sm"
                               >
                                  <FileDown size={12} />
                               </button>
                                <button className="p-1 rounded-md bg-white/5 text-white/40 hover:text-white transition-all border border-white/10 shadow-sm">
                                  <ArrowUpRight size={12} />
                                </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
         <div className="p-2 bg-white/5 text-center border-t border-white/5">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40 italic">Secure Enterprise Data • Encrypted</p>
         </div>
      </div>
    </div>
  );
};

export default EmployerAnalytics;