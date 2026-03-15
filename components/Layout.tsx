import React, { useState } from 'react';
import { 
  User, Briefcase, LayoutDashboard, Bell, Search, Settings as SettingsIcon,
  LogOut, UserCircle, Megaphone, Zap, ClipboardList, 
  Bookmark, Send, BarChart3, Users, Receipt, Video, PlusCircle, FileStack, ShieldCheck,
  MessageSquareCode, MessageSquareShare, Menu, X, BarChart, FileCheck, Lock, Building2, Building, Package,
  BookOpen, Mail
} from 'lucide-react';
import { ViewType, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewType;
  setView: (view: any) => void;
  user: UserProfile;
  onLogout?: () => void;
  onFilterBlog?: (category: string | null) => void;
  currentBlogCategory?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, view, setView, user, onLogout, onFilterBlog, currentBlogCategory }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isEmployer = user.isEmployer;
  const isAdmin = user.isAdmin || !!user.opRole;

  const isMobileMenuOpenOpen = isMobileMenuOpen;
  const unreadCount = (user.notifications || []).filter(n => !n.isRead).length;

  const getRoleColor = () => {
    if (isAdmin) return 'text-[#41d599]';
    if (isEmployer) return 'text-[#F0C927]';
    return 'text-[#F0C927]';
  };

  const getRoleBg = () => {
    return 'bg-white';
  };

  const handleNavClick = (targetView: string) => {
    setView(targetView);
    setIsMobileMenuOpen(false);
  };

  const isPublicView = [
    'home', 
    'signin', 
    'hrm-landing', 
    'payroll-landing', 
    'vendor-landing',
    'blog'
  ].includes(view);

  if (isPublicView) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#0a4179]">
        {view === 'blog' && (
          <header className="w-full glass-nav sticky top-0 z-[100] px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="cursor-pointer group" onClick={() => view === 'blog' ? onFilterBlog?.('Market Data') : handleNavClick('home')}>
                <div className="text-[16px] font-black tracking-[0.3em] text-[#F0C927]">
                  CALIBER<span className="text-white">DESK</span>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-8">
                <button 
                  onClick={() => onFilterBlog?.('Market Data')} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentBlogCategory === 'Market Data' ? 'text-[#F0C927]' : 'text-white/60 hover:text-white'}`}
                >
                  Market Data
                </button>
                <button 
                  onClick={() => onFilterBlog?.('Job Seekers')} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentBlogCategory === 'Job Seekers' ? 'text-[#F0C927]' : 'text-white/60 hover:text-white'}`}
                >
                  Job Seekers
                </button>
                <button 
                  onClick={() => onFilterBlog?.('Employers')} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentBlogCategory === 'Employers' ? 'text-[#F0C927]' : 'text-white/60 hover:text-white'}`}
                >
                  Employers
                </button>
                <button 
                  onClick={() => onFilterBlog?.('Thought Leadership')} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentBlogCategory === 'Thought Leadership' ? 'text-[#F0C927]' : 'text-white/60 hover:text-white'}`}
                >
                  Thought Leadership
                </button>
                <button 
                  onClick={() => onFilterBlog?.('Events')} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentBlogCategory === 'Events' ? 'text-[#F0C927]' : 'text-white/60 hover:text-white'}`}
                >
                  Events
                </button>
              </nav>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleNavClick('notifications')}
                  className="relative p-2 rounded-xl bg-white/5 text-[#F0C927] border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-[#0a4179]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => {
                    if (user.email) {
                      handleNavClick(user.isEmployer ? 'employer' : 'seeker');
                    } else {
                      handleNavClick('signin');
                    }
                  }} 
                  className="px-6 py-2 rounded-xl bg-[#F0C927] text-[#0a4179] text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#F0C927]/20"
                >
                  {user.email ? 'Home' : 'Sign In'}
                </button>
                
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-white/5 text-[#F0C927] border border-white/10"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu for Public View */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-[#0a4179]/95 backdrop-blur-xl border-b border-white/5 p-6 animate-in slide-in-from-top-4 duration-300">
                <nav className="flex flex-col gap-4">
                  <button onClick={() => { onFilterBlog?.('Market Data'); setIsMobileMenuOpen(false); }} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#F0C927]">Market Data</button>
                  <button onClick={() => { onFilterBlog?.('Job Seekers'); setIsMobileMenuOpen(false); }} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#F0C927]">Job Seekers</button>
                  <button onClick={() => { onFilterBlog?.('Employers'); setIsMobileMenuOpen(false); }} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#F0C927]">Employers</button>
                  <button onClick={() => { onFilterBlog?.('Thought Leadership'); setIsMobileMenuOpen(false); }} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#F0C927]">Thought Leadership</button>
                  <button onClick={() => { onFilterBlog?.('Events'); setIsMobileMenuOpen(false); }} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#F0C927]">Events</button>
                </nav>
              </div>
            )}
          </header>
        )}
        <main className="w-full flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a4179]">
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-nav sticky top-0 z-[60]">
        <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
          <div className="text-[10px] font-black tracking-[0.2em] text-[#F0C927]">
            CALIBER<span className="text-white">DESK</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.email && (
            <button 
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full border border-white/10 overflow-hidden"
            >
              <img 
                src={user.enhancedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </button>
          )}
          <button 
            onClick={() => handleNavClick('notifications')}
            className="relative p-2 rounded-xl bg-white/5 text-[#F0C927] border border-white/10 active:scale-95 transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-[#0a4179]">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 text-[#F0C927] border border-white/10 active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 h-screen w-56 bg-[#06213f]/80 backdrop-blur-2xl border-r border-white/5 p-6 z-50 
        transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col overflow-y-auto custom-scrollbar text-white
      `}>
        <div className="flex flex-col mb-8 px-2">
          <div className="cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="text-[14px] font-black tracking-[0.3em] mb-1 text-[#F0C927] group-hover:scale-105 transition-transform">
              CALIBER<span className="text-white">DESK</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
              {isAdmin ? 'ADMIN CONSOLE' : isEmployer ? 'EMPLOYER DASHBOARD' : 'SEEKER PORTAL'}
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        {user.email && (
          <div className="space-y-4 mb-8">
            <div 
              className="p-3 rounded-2xl bg-white group cursor-pointer transition-all hover:scale-[1.02] shadow-xl" 
              onClick={() => handleNavClick(isEmployer ? 'employer-profile' : 'profile')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 shadow-sm">
                  <img 
                    src={user.enhancedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#0a4179] truncate">{user.name}</p>
                  {user.idNumber && (
                    <p className="text-[9px] font-bold text-[#0a4179]/60 tracking-wider uppercase mt-0.5">
                      ID: {user.idNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!user.profileCompleted && !isAdmin && (
              <div 
                className="p-3 rounded-2xl bg-[#F0C927]/10 border border-[#F0C927]/20 cursor-pointer hover:bg-[#F0C927]/20 transition-all group"
                onClick={() => handleNavClick('settings')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#F0C927]">Profile Calibration</span>
                  <span className="text-[8px] font-black text-[#F0C927]">40%</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-[#F0C927] shadow-[0_0_10px_#F0C927]" />
                </div>
                <p className="text-[7px] font-bold text-white/40 mt-2 uppercase tracking-tighter group-hover:text-white transition-colors">
                  Complete setup to unlock AI matching
                </p>
              </div>
            )}
          </div>
        )}

        <nav className="space-y-1 flex-1">
          {isAdmin ? (
            <>
              <button onClick={() => handleNavClick('admin')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'admin' ? 'bg-[#41d599] text-[#0a4179] font-black shadow-xl shadow-[#41d599]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <BarChart3 size={18} /> <span className="text-xs font-bold text-left">Admin Console</span>
              </button>
              <button onClick={() => handleNavClick('admin-jobs')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'admin-jobs' ? 'bg-[#41d599] text-[#0a4179] font-black shadow-xl shadow-[#41d599]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <ClipboardList size={18} /> <span className="text-xs font-bold text-left tracking-wider">Job Postings</span>
              </button>
            </>
          ) : isEmployer ? (
            <>
              <button onClick={() => handleNavClick('employer')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'employer' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <LayoutDashboard size={18} /> <span className="text-xs font-bold text-left tracking-wider">Dashboard</span>
              </button>
              <button onClick={() => handleNavClick('employer-management')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'employer-management' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <ClipboardList size={18} /> <span className="text-xs font-bold text-left tracking-wider">Job Postings</span>
              </button>
              <button onClick={() => handleNavClick('employer-live-jobs')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'employer-live-jobs' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Search size={18} /> <span className="text-xs font-bold text-left tracking-wider">Live Jobs</span>
              </button>
              <button onClick={() => handleNavClick('employer-aptitude')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'employer-aptitude' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <FileCheck size={18} /> <span className="text-xs font-bold text-left tracking-wider">Assessments</span>
              </button>
              <button onClick={() => handleNavClick('employer-org')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'employer-org' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Building2 size={18} /> <span className="text-xs font-bold text-left tracking-wider">User Access</span>
              </button>
              <button onClick={() => handleNavClick('employer-post-job')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#F0C927]/30 hover:scale-[1.02] transition-all active:scale-95 mt-2">
                <PlusCircle size={18} /> CREATE JOB
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('seeker')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'seeker' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Search size={18} /> <span className="text-xs font-bold text-left">Search Jobs</span>
              </button>
              <button onClick={() => handleNavClick('seeker-insights')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'seeker-insights' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <BarChart size={18} /> <span className="text-xs font-bold text-left">Career Analytics</span>
              </button>
              <button onClick={() => handleNavClick('cv-prep')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'cv-prep' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <FileStack size={18} /> <span className="text-xs font-bold text-left">CV Builder</span>
              </button>
              <button onClick={() => handleNavClick('interview-prep')} className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'interview-prep' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <div className="flex items-center gap-3">
                  <Video size={18} /> <span className="text-xs font-bold text-left">Interview Practice</span>
                </div>
              </button>
              <button onClick={() => handleNavClick('seeker-applications')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'seeker-applications' ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Send size={18} /> <span className="text-xs font-bold text-left">Applications</span>
              </button>
              <button onClick={() => handleNavClick('cv-prep')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#F0C927]/30 hover:scale-[1.02] transition-all active:scale-95">
                <PlusCircle size={18} /> Update CV
              </button>
            </>
          ) }

          <button onClick={() => handleNavClick('blog')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'blog' ? (isEmployer ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'bg-white/10 text-white shadow-lg') : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <BookOpen size={16} /> <span className="text-xs font-bold text-left tracking-wider">{isEmployer ? 'Mind & Method' : 'Insights & Reports'}</span>
          </button>

          <button 
            onClick={() => handleNavClick(isEmployer ? 'employer-profile' : 'profile')} 
            className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === (isEmployer ? 'employer-profile' : 'profile') ? (isEmployer ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'bg-white/10 text-white shadow-lg') : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          >
            {isEmployer ? <Building size={16} /> : <UserCircle size={16} />}
            <span className="text-xs font-bold text-left tracking-wider">{isEmployer ? 'Company Page' : 'My Profile'}</span>
          </button>
          <button 
            onClick={() => handleNavClick('settings')} 
            className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'settings' ? (isEmployer ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'bg-white/10 text-white shadow-lg') : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          >
            <SettingsIcon size={16} />
            <span className="text-xs font-bold text-left tracking-wider">{isEmployer ? 'Settings' : 'Account Settings'}</span>
          </button>
          <button 
            onClick={() => handleNavClick('notifications')} 
            className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 ${view === 'notifications' ? (isEmployer ? 'bg-[#F0C927] text-[#0a4179] font-black shadow-xl shadow-[#F0C927]/20' : 'bg-white/10 text-white shadow-lg') : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Bell size={16} />
              <span className="text-xs font-bold text-left tracking-wider">Inbox</span>
            </div>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${view === 'notifications' && isEmployer ? 'bg-[#0a4179] text-white' : 'bg-red-500 text-white'}`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-red-400/40 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold text-left">Logout</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-5 py-2 text-white/40">
            <Mail size={14} />
            <span className="text-[10px] font-bold truncate">info@caliberdesk.com</span>
          </div>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto custom-scrollbar ${view === 'blog' ? '' : 'p-6 md:p-10'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;