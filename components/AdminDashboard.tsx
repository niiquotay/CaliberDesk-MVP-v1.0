
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Users, Briefcase, DollarSign, 
  TrendingUp, Search, ShieldCheck, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Globe, Activity,
  Clock, CheckCircle2, MoreHorizontal, Filter,
  Eye, Download, RefreshCw, Layers, Zap, Crown, Calendar,
  FileText, PieChart, Shield, Lock, AlertTriangle, ChevronRight,
  UserCheck, UserX, FileSearch, ArrowRight, Check,
  ArrowLeft, Target, ClipboardCheck, MessageSquare, Mail,
  Ticket as TicketIcon, Wallet, TrendingDown, Package, BadgeCheck, PhoneOutgoing,
  UserPlus, UserCog, Building2, XCircle, Trash2, EyeOff, Sparkles
} from 'lucide-react';
import { Job, UserProfile, Transaction, Application, ApplicationStatus, OperationalRole, Ticket } from '../types';
import { MOCK_LEADS, MOCK_APPLICANTS, MOCK_TICKETS, MOCK_USER_DIRECTORY } from '../constants';
import BlogWidget from './BlogWidget';
import SeekerFeed from './SeekerFeed';
import JobManagement from './JobManagement';

interface AdminDashboardProps {
  user: UserProfile;
  jobs: Job[];
  applications: Application[];
  transactions: Transaction[];
  onBack: () => void;
  pendingVerifications: UserProfile[];
  onVerifyEmployer: (userId: string) => void;
  onApproveJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onUpdateApplicationDueDate: (appId: string, dueDate: string) => void;
  onUpdateJobStatus: (jobId: string, status: 'active' | 'closed' | 'draft') => void;
  onDeleteJob: (jobId: string) => void;
  onPostJob?: (job: any) => void;
  onNavigateToBlog?: () => void;
  onSelectJob?: (job: Job) => void;
  onVerifyEmployment?: (userId: string, workIndex: number) => void;
  initialTab?: string;
  allUsers: UserProfile[];
}

const STAGES: { value: ApplicationStatus; label: string; icon: any; color: string; bgColor: string }[] = [
  { value: 'applied', label: 'Applied', icon: ClipboardCheck, color: 'text-white/40', bgColor: 'bg-white/5' },
  { value: 'shortlisted', label: 'Shortlisted', icon: CheckCircle2, color: 'text-[#41d599]', bgColor: 'bg-[#41d599]/10' },
  { value: 'assessment', label: 'Assessment', icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  { value: 'interview-invitation', label: 'Interview', icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  { value: 'final-interview', label: 'Final Interview', icon: Target, color: 'text-[#F0C927]', bgColor: 'bg-[#F0C927]/10' },
  { value: 'offer-letter', label: 'Offer', icon: Mail, color: 'text-[#f1ca27]', bgColor: 'bg-[#f1ca27]/10' },
  { value: 'hired', label: 'Hired', icon: UserCheck, color: 'text-[#41d599]', bgColor: 'bg-[#41d599]/20' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user,
  jobs, 
  applications,
  transactions, 
  onBack,
  pendingVerifications,
  onVerifyEmployer,
  onApproveJob,
  onUpdateApplicationStatus,
  onUpdateApplicationDueDate,
  onUpdateJobStatus,
  onDeleteJob,
  onPostJob,
  onNavigateToBlog,
  onSelectJob,
  onVerifyEmployment,
  initialTab,
  allUsers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const opRole = user.opRole || 'super_admin';
  const [viewTab, setViewTab] = useState<string>(initialTab || 'overview');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'sales_exec' });
  const [staffMembers, setStaffMembers] = useState([
    { id: '1', name: 'Sarah Sales', email: 'sarah@jobconnect.ai', role: 'sales_exec' },
    { id: '2', name: 'Mark Manager', email: 'mark@jobconnect.ai', role: 'sales_manager' },
    { id: '3', name: 'Rachel Head-Rec', email: 'rachel@jobconnect.ai', role: 'recruiter_head' },
    { id: '4', name: 'Fiona Head-Finance', email: 'fiona@jobconnect.ai', role: 'finance_head' },
  ]);

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) return;
    setStaffMembers([...staffMembers, { ...newStaff, id: Math.random().toString(36).substr(2, 9) }]);
    setNewStaff({ name: '', email: '', role: 'sales_exec' });
    setShowAddStaff(false);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffMembers(staffMembers.filter(s => s.id !== id));
  };

  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const pendingApprovals = jobs.filter(j => j.status === 'pending_approval');
    const shortlistJobs = jobs.filter(j => j.isShortlistService);
    
    return { 
      totalRevenue, 
      activeJobs, 
      pendingApprovals: pendingApprovals.length,
      shortlistCount: shortlistJobs.length,
      profHiring: pendingApprovals.filter(j => j.isProfessionalHiring).length,
      unverifiedPending: pendingApprovals.filter(j => !j.isProfessionalHiring).length,
      totalSeekers: 12450, 
      totalEmployers: 840,
      leadVolume: MOCK_LEADS.length,
      avgTicketTime: '1.4h',
      csat: '4.8/5'
    };
  }, [jobs, transactions]);

  const shortlistServiceApplications = useMemo(() => {
    return applications.filter(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return job?.isShortlistService || job?.isProfessionalHiring;
    });
  }, [applications, jobs]);

  // Dynamic Navigation based on role
  const navItems = useMemo(() => {
    const base = [{ id: 'overview', label: 'Performance', icon: Layers }];
    
    // Only Head roles and Super Admin can manage staff
    if (['super_admin', 'recruiter_head', 'cs_head', 'finance_head', 'sales_manager'].includes(opRole)) {
      base.push({ id: 'staff', label: 'Staff hub', icon: UserCog });
    }

    if (opRole.includes('sales')) {
      base.push({ id: 'crm', label: 'Pipeline CRM', icon: Target });
    }
    if (opRole.includes('recruiter') || opRole === 'super_admin') {
      base.push({ id: 'jobs', label: 'All Jobs', icon: Briefcase });
      base.push({ id: 'shortlist', label: 'Shortlist desk', icon: Target });
      base.push({ id: 'oversight', label: 'Hiring oversight', icon: FileSearch });
    }
    if (opRole.includes('cs') || opRole === 'super_admin') {
      base.push({ id: 'verifications', label: 'Employer Verifications', icon: ShieldCheck });
      base.push({ id: 'employment_verifications', label: 'Employment Verifications', icon: ClipboardCheck });
      base.push({ id: 'tickets', label: 'Service desk', icon: TicketIcon });
    }
    if (opRole.includes('finance') || opRole === 'super_admin') {
      base.push({ id: 'ledger', label: 'Financial ledger', icon: Wallet });
    }
    base.push({ id: 'users', label: 'User directory', icon: Users });
    return base;
  }, [opRole]);

  React.useEffect(() => {
    if (initialTab && navItems.find(n => n.id === initialTab)) {
      setViewTab(initialTab);
    }
  }, [initialTab, navItems]);

  // Initial tab correction
  React.useEffect(() => {
    if (!navItems.find(n => n.id === viewTab)) {
      setViewTab(navItems[0].id);
    }
  }, [navItems, viewTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 text-white pb-32 relative">
      {/* Strategic Header */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#41d599] to-[#F0C927] flex items-center justify-center text-[#0a4179] shadow-lg">
              <Activity size={16} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-white">
                ADMIN CONSOLE
              </h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-0.5">
                {opRole.replace('_', ' ')} • Platform Intelligence
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#41d599] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <RefreshCw size={16} className="text-[#0a4179]" /> 
             Refresh Data
           </button>
           <button 
            onClick={onBack}
            className="px-6 py-3 bg-[#F0C927] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <ArrowLeft size={16} /> Back to Home
           </button>
        </div>
      </div>

      {/* Advanced KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {opRole.includes('sales') ? (
          <>
            <KPICard label="Pipeline value" value={`$${(stats.leadVolume * 1200).toLocaleString()}`} sub="Projected Revenue" icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-400/10" />
            <KPICard label="Active leads" value={stats.leadVolume} sub="Qualified prospects" icon={Target} color="text-emerald-400" bg="bg-emerald-400/10" />
            <KPICard label="Goal achievement" value="92%" sub="Quarterly target" icon={Crown} color="text-emerald-400" bg="bg-emerald-400/10" />
            <KPICard label="Conversion" value="14.2%" sub="Lead to deal" icon={Zap} color="text-emerald-400" bg="bg-emerald-400/10" />
          </>
        ) : opRole.includes('finance') ? (
          <>
            <KPICard label="Annual recurring" value="$4.2M" sub="Total ARR" icon={DollarSign} color="text-indigo-400" bg="bg-indigo-400/10" />
            <KPICard label="Pending invoices" value="18" sub="Awaiting settlement" icon={FileText} color="text-indigo-400" bg="bg-indigo-400/10" />
            <KPICard label="Burn rate" value="-$12k/mo" sub="Operating expense" icon={TrendingDown} color="text-red-400" bg="bg-red-400/10" />
            <KPICard label="Tax liability" value="$84k" sub="Estimated Q1" icon={Shield} color="text-indigo-400" bg="bg-indigo-400/10" />
          </>
        ) : opRole.includes('cs') ? (
          <>
            <KPICard label="CSAT score" value={stats.csat} sub="Customer satisfaction" icon={BadgeCheck} color="text-teal-400" bg="bg-teal-400/10" />
            <KPICard label="Avg response" value={stats.avgTicketTime} sub="Support latency" icon={Clock} color="text-teal-400" bg="bg-teal-400/10" />
            <KPICard label="Verification queue" value={pendingVerifications.length} sub="Pending audits" icon={ShieldAlert} color="text-teal-400" bg="bg-teal-400/10" />
            <KPICard label="Active chats" value="4" sub="Live support" icon={MessageSquare} color="text-teal-400" bg="bg-teal-400/10" />
          </>
        ) : (
          <>
            <KPICard label="Global revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub="Total settlement" icon={DollarSign} color="text-[#41d599]" bg="bg-[#41d599]/10" />
            <KPICard label="Shortlist tasks" value={stats.shortlistCount} sub="Active mandates" icon={Zap} color="text-purple-400" bg="bg-purple-400/10" />
            <KPICard label="Verified talent" value={stats.totalSeekers.toLocaleString()} sub="Neural profiles" icon={Users} color="text-[#F0C927]" bg="bg-[#F0C927]/10" />
            <KPICard label="System load" value="14%" sub="Infrastructure" icon={Activity} color="text-blue-400" bg="bg-blue-400/10" />
          </>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#06213f] rounded-3xl w-fit border border-white/5">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setViewTab(item.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${viewTab === item.id ? 'bg-[#41d599] text-[#0a4179] shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </div>

      {/* VIEW: STAFF MANAGEMENT */}
      {viewTab === 'staff' && (
        <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Staff administration hub</h3>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Provision access for regional and departmental operators</p>
            </div>
            <button 
              onClick={() => setShowAddStaff(true)}
              className="px-6 py-3 bg-[#41d599] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <UserPlus size={16} /> Create staff account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Full name</th>
                  <th className="px-6 py-4">Operational role</th>
                  <th className="px-6 py-4">Security level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                {staffMembers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[#41d599] text-[10px] border border-white/10">
                          {s.name[0]}
                        </div>
                        <div>
                           <p className="font-black text-white">{s.name}</p>
                           <p className="text-[8px] text-white/20 font-mono uppercase">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-[#41d599]/10 text-[#41d599] text-[8px] font-black uppercase tracking-widest border border-[#41d599]/20">
                        {s.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/40">
                         <Shield size={12} className={s.role.includes('head') || s.role.includes('manager') ? 'text-[#41d599]' : 'text-blue-400'} />
                         {s.role.includes('head') || s.role.includes('manager') ? 'Executive Oversight' : 'Standard Operator'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDeleteStaff(s.id)} className="p-2 rounded-lg bg-white/5 text-red-400/40 hover:text-red-400 transition-all border border-white/10"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CRM PIPELINE */}
      {viewTab === 'crm' && (
        <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Sales pipeline (Kanban)</h3>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Active deals for premium and shortlist services</p>
            </div>
            <button className="px-6 py-3 bg-[#41d599] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <TrendingUp size={16} /> + New deal
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Company account</th>
                  <th className="px-6 py-4">Deal stage</th>
                  <th className="px-6 py-4">Est. value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                {MOCK_LEADS.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[#41d599] text-[10px] border border-white/10">{lead.company[0]}</div>
                        <p className="font-black text-white">{lead.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-blue-400/10 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-400/20">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-black text-white">${lead.value}</p>
                       <p className="text-[8px] text-white/40 uppercase font-black">Contract Value</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-white transition-all border border-white/10"><ArrowUpRight size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: ALL JOBS */}
      {viewTab === 'jobs' && (
        <JobManagement
          jobs={jobs}
          user={user}
          applications={applications}
          onUpdateApplicationStatus={onUpdateApplicationStatus}
          onUpdateApplicationDueDate={onUpdateApplicationDueDate}
          onUpdateJobStatus={onUpdateJobStatus}
          onUpgradeJob={() => {}}
          onDeleteJob={onDeleteJob}
          onPostJob={onPostJob || (() => {})}
          onUpgradeRequest={() => {}}
          activeTab="listings"
          onSelectJob={onSelectJob}
          onNavigateToBlog={onNavigateToBlog}
        />
      )}

      {/* VIEW: FINANCIAL LEDGER */}
      {viewTab === 'ledger' && (
        <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Financial settlement ledger</h3>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Audit global transactions and subscription revenue</p>
            </div>
            <div className="flex items-center gap-2">
               <button className="px-4 py-2 bg-white/5 text-white/60 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                 Export CSV
               </button>
               <button className="px-4 py-2 bg-[#41d599] text-[#0a4179] text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-[1.02] transition-all">
                 Generate Report
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-white">{tx.id.toUpperCase()}</p>
                      <p className="text-[8px] text-white/20 uppercase font-black">{tx.item}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-[#41d599]">${tx.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-[#41d599]/10 text-[#41d599] text-[8px] font-black uppercase tracking-widest border border-[#41d599]/20">
                        Settled
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-white/60">{new Date(tx.date).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SERVICE DESK */}
      {viewTab === 'tickets' && (
        <TicketsTable />
      )}

      {/* VIEW: OVERVIEW */}
      {viewTab === 'overview' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Performance Visualization - Animated */}
            <div className="lg:col-span-2 glass-premium rounded-2xl p-8 border border-white/5 space-y-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none text-white"><Activity size={60} /></div>
               <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Platform activity speed</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-0.5">System flow dynamics (Rolling 7-week)</p>
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
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/40">AI operational recommendations</p>
                     <p className="text-xs text-white/60 leading-relaxed font-medium italic">
                       "Platform engagement is <span className="text-[#41d599] font-black">12% above quarterly projection</span>. Talent verification throughput indicates optimal operational efficiency."
                     </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center p-1 border border-[#41d599]/20 rounded-full">
                     <div className="w-8 h-8 rounded-full bg-[#41d599]/10 flex items-center justify-center text-[#41d599] animate-spin-slow">
                        <Sparkles size={12} />
                     </div>
                  </div>
               </div>
            </div>

            <SystemHealth />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">System oversight list</h3>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Review platform listings for operational audit</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-400/10 border border-blue-400/20 text-[8px] font-black uppercase tracking-widest text-blue-400 shadow-sm">
                          <ShieldCheck size={8} /> Audit status
                       </div>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">Listing title</th>
                            <th className="px-6 py-4 text-center">Engagement</th>
                            <th className="px-6 py-4 text-center">Applicants</th>
                            <th className="px-6 py-4">Health score</th>
                            <th className="px-6 py-4 text-right">Oversight</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                          {jobs.slice(0, 5).map(job => {
                            return (
                              <tr key={job.id} className="hover:bg-white/5 border-b border-white/5 last:border-0 group transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[8px] transition-all overflow-hidden border ${job.isPremium ? 'bg-[#F0C927]/10 border-[#F0C927]/30 text-[#F0C927]' : 'bg-white/10 border-white/20 text-white/50'}`}>
                                      {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`font-black truncate max-w-[250px] text-[10px] ${job.isPremium ? 'text-[#F0C927]' : 'text-white'}`}>{job.title}</p>
                                      <p className="text-[8px] text-white/40 uppercase font-black truncate">{job.company} • {job.city}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-black text-[10px] text-white">{Math.floor(Math.random() * 500) + 100}</span>
                                    <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">Views</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-black text-[10px] text-[#41d599]">{applications.filter(a => a.jobId === job.id).length}</span>
                                    <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">Applicants</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-0.5 w-16">
                                     <div className="flex justify-between text-[6px] font-black uppercase tracking-widest">
                                        <span className="text-white/40 text-[7px]">Health</span>
                                        <span className="text-[#41d599] text-[7px]">92%</span>
                                     </div>
                                     <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-[#41d599] w-[92%]"></div>
                                     </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-1">
                                       <button className="p-1 rounded-md bg-white/5 text-white/40 hover:text-[#41d599] hover:bg-[#41d599]/10 transition-all border border-white/10 hover:border-[#41d599]/20 shadow-sm">
                                          <FileSearch size={12} />
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
                    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40 italic">Secure Operational Data • Encrypted</p>
                 </div>
              </div>
            </div>
            <RecentActivity />
          </div>
        </div>
      )}

      {/* Legacy Views Correctly Filtered (Shortlist, Oversights, etc) */}
      {viewTab === 'shortlist' && (
        <ShortlistTable applications={shortlistServiceApplications} jobs={jobs} onUpdate={onUpdateApplicationStatus} onUpdateDueDate={onUpdateApplicationDueDate} />
      )}
      
      {viewTab === 'verifications' && (
        <VerificationTable accounts={pendingVerifications} onVerify={onVerifyEmployer} />
      )}

      {viewTab === 'employment_verifications' && (
        <EmploymentVerificationTable users={allUsers.filter(u => u.employmentVerificationStatus === 'pending' || u.employmentVerificationStatus === 'completed')} onVerify={onVerifyEmployment} />
      )}

      {viewTab === 'oversight' && (
        <OversightTable jobs={jobs.filter(j => j.status === 'pending_approval')} onApprove={onApproveJob} />
      )}

      {viewTab === 'users' && (
        <UserDirectoryTable users={allUsers} />
      )}

      {/* MODAL: ADD STAFF */}
      {showAddStaff && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="glass-premium w-full max-w-lg rounded-[40px] p-10 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowAddStaff(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><XCircle size={24} /></button>
              
              <div className="mb-8">
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Provision staff access</h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Authorized creation of departmental operators</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full name</label>
                    <input 
                      type="text" 
                      value={newStaff.name}
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                      placeholder="e.g. John Operator" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#41d599] transition-all text-white"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Corporate email</label>
                    <input 
                      type="email" 
                      value={newStaff.email}
                      onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                      placeholder="john@jobconnect.ai" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#41d599] transition-all text-white"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Operational role</label>
                    <select 
                      value={newStaff.role}
                      onChange={e => setNewStaff({...newStaff, role: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#41d599] transition-all text-white appearance-none"
                    >
                      <option value="sales_exec" className="bg-[#0a4179]">Sales Executive</option>
                      <option value="sales_manager" className="bg-[#0a4179]">National Sales Manager</option>
                      <option value="cs_operator" className="bg-[#0a4179]">CS Operator</option>
                      <option value="cs_head" className="bg-[#0a4179]">Head of CS</option>
                      <option value="recruiter" className="bg-[#0a4179]">Recruiter</option>
                      <option value="recruiter_head" className="bg-[#0a4179]">Head of Recruitment</option>
                      <option value="finance_manager" className="bg-[#0a4179]">Finance Manager</option>
                      <option value="finance_head" className="bg-[#0a4179]">Head of Finance</option>
                    </select>
                 </div>
              </div>

              <div className="mt-10">
                 <button 
                   onClick={handleAddStaff}
                   className="w-full py-5 rounded-[22px] bg-[#41d599] text-[#0a4179] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#41d599]/20 active:scale-95 transition-all"
                 >
                   Deploy user credentials
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for cleaner structure
const KPICard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
  <div className="glass-premium rounded-2xl p-6 border border-white/5 space-y-1.5 shadow-sm group hover:-translate-y-0.5 transition-all">
     <div className={`w-6 h-6 rounded-md ${bg || 'bg-white/5'} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={12} />
     </div>
     <div>
        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{label}</p>
        <h3 className="text-lg font-black mt-0.5 text-white">{value}</h3>
        <p className="text-[7px] font-bold text-white/40 uppercase mt-0.5">{sub || 'Live Telemetry'}</p>
     </div>
  </div>
);

const ShortlistTable = ({ applications, jobs, onUpdate, onUpdateDueDate }: any) => (
  <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-white/5 bg-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Shortlist service pipeline</h3>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Move candidates to "Final Interview" to reveal them to employers. Set deadlines for task completion.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Candidate</th>
            <th className="px-6 py-4 w-1/3">Role / company</th>
            <th className="px-6 py-4">Stage</th>
            <th className="px-6 py-4">Deadline</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[10px] font-medium">
          {applications.map(app => (
            <tr key={app.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.candidateProfile?.name}`} alt="" referrerPolicy="no-referrer" />
                  </div>
                  <p className="font-black text-white">{app.candidateProfile?.name}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-black text-white">{jobs.find(j => j.id === app.jobId)?.title}</p>
                <p className="text-[8px] text-white/20 uppercase font-black">{jobs.find(j => j.id === app.jobId)?.company}</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">{app.status}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-white/20" />
                  <input 
                    type="date" 
                    value={app.dueDate ? app.dueDate.split('T')[0] : ''}
                    onChange={(e) => onUpdateDueDate(app.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black uppercase text-white outline-none focus:border-purple-400"
                  />
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                 <select 
                    value={app.status}
                    onChange={(e) => onUpdate(app.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black uppercase text-white outline-none focus:border-purple-400"
                 >
                   {STAGES.map(s => <option key={s.value} value={s.value} className="bg-[#0a4179]">{s.label}</option>)}
                 </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const VerificationTable = ({ accounts, onVerify }: any) => (
  <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-white/5 bg-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Employer identity queue</h3>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Verify corporate credentials before publishing listings.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Company / contact</th>
            <th className="px-6 py-4">Method</th>
            <th className="px-6 py-4">Documents</th>
            <th className="px-6 py-4 text-right">Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[10px] font-medium">
          {accounts.map(emp => (
            <tr key={emp.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <p className="font-black text-white">{emp.companyName}</p>
                <p className="text-[8px] text-white/20 uppercase font-black">{emp.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  emp.verificationMethod === 'email' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {emp.verificationMethod || 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4">
                {emp.verificationDocuments && emp.verificationDocuments.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {emp.verificationDocuments.map((doc: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={doc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 rounded border border-white/10 text-[#41d599] hover:bg-white/10 transition-all"
                        title="View Document"
                      >
                        <FileText size={12} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="text-white/20 text-[8px] uppercase font-black">No Docs</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onVerify(emp.id)} 
                  className="px-4 py-2 bg-[#41d599] text-[#0a4179] text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Verify Account
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EmploymentVerificationTable = ({ users, onVerify }: any) => (
  <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-white/5 bg-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Employment history verification queue</h3>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Verify seeker work history after service purchase.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Seeker</th>
            <th className="px-6 py-4">Work Experience to Verify</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[10px] font-medium">
          {users.map((u: any) => (
            <React.Fragment key={u.id}>
              {u.workHistory?.map((work: any, idx: number) => (
                <tr key={`${u.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-black text-white">{u.name}</p>
                        <p className="text-[8px] text-white/20 uppercase font-black">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-black text-white">{work.role}</p>
                      <p className="text-[8px] text-[#F0C927] font-black uppercase tracking-widest">{work.company}</p>
                      <p className="text-[8px] text-white/40 uppercase">{work.period || `${work.startYear} - ${work.endYear}`}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {work.isVerified ? (
                      <span className="px-3 py-1.5 bg-[#41d599]/10 text-[#41d599] text-[8px] font-black uppercase tracking-widest rounded-lg border border-[#41d599]/20">
                        Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => onVerify(u.id, idx)}
                        className="px-4 py-2 bg-[#F0C927] text-[#0a4179] text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all"
                      >
                        Mark Verified
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-white/20 font-black uppercase tracking-widest text-xs">
                No pending employment verifications
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const OversightTable = ({ jobs, onApprove }: any) => (
  <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-white/5 bg-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Job oversight desk</h3>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Professional and pending listings audit.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Role / company</th>
            <th className="px-6 py-4">Tier</th>
            <th className="px-6 py-4 text-right">Release</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[10px] font-medium">
          {jobs.map(job => (
            <tr key={job.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <p className="font-black text-white">{job.title}</p>
                <p className="text-[8px] text-white/20 uppercase font-black">{job.company}</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[8px] font-black uppercase tracking-widest border border-orange-500/20">
                  {job.isProfessionalHiring ? 'Professional' : 'Standard'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onApprove(job.id)} 
                  className="px-4 py-2 bg-orange-400 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Approve JD
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SystemHealth = () => (
  <div className="glass-premium rounded-2xl p-6 border border-white/5 space-y-4 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">System health matrix</h3>
      <div className="flex items-center gap-1.5 text-[#41d599] text-[8px] font-black uppercase">
        <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] animate-pulse" />
        Operational
      </div>
    </div>
    <div className="space-y-4">
      {[
        { label: 'API Gateway', status: '99.99%', health: 100 },
        { label: 'Neural Engine', status: 'Optimal', health: 98 },
        { label: 'Database Cluster', status: '12ms latency', health: 95 },
        { label: 'Auth Service', status: 'Active', health: 100 }
      ].map((item, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
            <span className="text-white/40">{item.label}</span>
            <span className="text-white/60">{item.status}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#41d599]" style={{ width: `${item.health}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecentActivity = () => (
  <div className="glass-premium rounded-2xl p-6 border border-white/5 space-y-4 shadow-sm">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Global activity feed</h3>
    <div className="space-y-4">
      {[
        { type: 'hire', user: 'James Miller', action: 'hired', target: 'Sarah Jenkins', time: '2m ago' },
        { type: 'verify', user: 'System', action: 'verified', target: 'TechFlow Inc', time: '15m ago' },
        { type: 'ticket', user: 'Support', action: 'resolved', target: 'TKT-1003', time: '1h ago' },
        { type: 'lead', user: 'Sales', action: 'qualified', target: 'Solara Energy', time: '3h ago' }
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
            item.type === 'hire' ? 'bg-[#41d599]/10 border-[#41d599]/20 text-[#41d599]' :
            item.type === 'verify' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            item.type === 'ticket' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
            'bg-orange-500/10 border-orange-500/20 text-orange-400'
          }`}>
            {item.type === 'hire' ? <UserCheck size={14} /> : 
             item.type === 'verify' ? <ShieldCheck size={14} /> :
             item.type === 'ticket' ? <TicketIcon size={14} /> :
             <TrendingUp size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/80 leading-tight">
              <span className="font-black text-white">{item.user}</span> {item.action} <span className="font-black text-white">{item.target}</span>
            </p>
            <p className="text-[8px] text-white/20 font-black uppercase mt-0.5">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UserDirectoryTable = ({ users }: { users: UserProfile[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">User identity management</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Global directory of talent and employers</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white outline-none focus:border-[#41d599] w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">User profile</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[10px] font-medium">
            {filteredUsers.map((u, idx) => (
              <tr key={u.id || idx} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-black text-white">{u.name}</p>
                    <p className="text-[8px] text-white/20 uppercase font-black">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  u.role === 'employer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  u.role === 'staff' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {u.role === 'staff' ? (u as any).opRole || 'Staff' : u.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-white/60">{u.city || 'N/A'}, {u.country || 'N/A'}</p>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1.5 text-[#41d599]">
                  <div className="w-1 h-1 rounded-full bg-[#41d599] animate-pulse" />
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="px-3 py-1.5 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 hover:text-white transition-all">
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

const TicketsTable = () => {
  return (
    <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">Service desk tickets</h3>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Manage support requests and system feedback</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[10px] font-medium">
            {MOCK_TICKETS.map(t => (
              <tr key={t.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-black text-white">{t.id}</td>
                <td className="px-6 py-4 text-white/80">{t.subject}</td>
                <td className="px-6 py-4 text-white/60">{t.userName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    t.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    t.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    t.status === 'open' ? 'bg-[#41d599]/10 text-[#41d599] border-[#41d599]/20' : 
                    t.status === 'in-progress' ? 'bg-white/10 text-white/40 border-white/20' : 
                    'bg-white/5 text-white/20 border-white/5'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all border border-white/10">
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const JobPostingsTable = ({ jobs, onUpdateJobStatus, onDeleteJob }: any) => (
  <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-white">Global job postings</h3>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">Manage and audit all active listings across the platform</p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Job title / company</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Tier</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[10px] font-medium">
          {jobs.map((job: any) => (
            <tr key={job.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <p className="font-black text-white">{job.title}</p>
                <p className="text-[8px] text-white/20 uppercase font-black">{job.company}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  job.status === 'active' ? 'bg-[#41d599]/10 text-[#41d599] border-[#41d599]/20' : 
                  job.status === 'closed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                  'bg-white/10 text-white/40 border-white/20'
                }`}>
                  {job.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  job.isPremium ? 'bg-[#F0C927]/10 text-[#F0C927] border-[#F0C927]/20' : 'bg-white/10 text-white/40 border-white/20'
                }`}>
                  {job.isPremium ? 'Premium' : 'Standard'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onUpdateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all border border-white/10">
                    {job.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => onDeleteJob(job.id)} className="p-2 rounded-lg bg-white/5 text-red-400/40 hover:text-red-400 transition-all border border-white/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;
