// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Filter, MapPin, DollarSign, Calendar, Crown, Play, 
  ChevronRight, Sparkles, Send, Check, X, SlidersHorizontal, 
  Briefcase, Globe, Clock, Target, Trash2, LayoutGrid, Building2, Hammer, Rocket,
  Award, Users, ChevronDown, FileCheck, Bell, CheckCircle2, Building, Shield, Coins, Gift, Smartphone,
  Banknote, Zap, Loader2
} from 'lucide-react';
import { Job, UserProfile, Application } from '../types';
import BlogWidget from './BlogWidget';
import { 
  ALL_COUNTRIES, REGIONS_BY_COUNTRY, JOB_TYPES, 
  SALARY_RANGES, SENIORITY_LEVELS, EMPLOYMENT_TYPES, 
  ORGANIZATION_TYPES, JOB_RANKS, DATE_POSTED_OPTIONS, BENEFITS,
  INDUSTRIES
} from '../constants';

const CATEGORY_TABS = [
  { id: 'All Jobs', icon: LayoutGrid },
  { id: 'Formal Jobs', icon: Building2 },
  { id: 'Skilled Labour', icon: Hammer },
  { id: 'Gig Work', icon: Smartphone },
  { id: 'Growth & StartUps', icon: Rocket }
];

const COMPENSATION_STRUCTURES = ['Fixed', 'Commission Only', 'Commission + Salary'];

interface SeekerFeedProps {
  jobs: Job[];
  user: UserProfile;
  applications: Application[];
  onSelectJob: (job: Job) => void;
  onInspectMatch: (job: Job) => void;
  onApply: (job: Job) => void;
  onViewCompany: (companyName: string) => void;
  onToggleAutoApply: () => void;
  onOpenAlerts: (keywords: string, location: string, minSalary: number) => void;
  onNavigateToBlog: () => void;
  onDeleteJob?: (jobId: string) => void;
  onPostJob?: (job: any) => void;
  isLoading?: boolean;
  isAdminView?: boolean;
  isReadOnly?: boolean;
}

const SeekerFeed: React.FC<SeekerFeedProps> = ({ 
  jobs, 
  user, 
  applications, 
  onSelectJob, 
  onInspectMatch, 
  onApply, 
  onViewCompany, 
  onToggleAutoApply, 
  onOpenAlerts, 
  onNavigateToBlog, 
  onDeleteJob,
  onPostJob,
  isLoading, 
  isAdminView = false,
  isReadOnly = false
}) => {
  const [searchQuery, setSearching] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('All Jobs');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const dropdownRefs = {
    country: useRef<HTMLDivElement>(null),
    city: useRef<HTMLDivElement>(null),
    modality: useRef<HTMLDivElement>(null),
    employment: useRef<HTMLDivElement>(null),
    entity: useRef<HTMLDivElement>(null),
    rank: useRef<HTMLDivElement>(null),
    salary: useRef<HTMLDivElement>(null),
    recency: useRef<HTMLDivElement>(null),
    structure: useRef<HTMLDivElement>(null),
    benefits: useRef<HTMLDivElement>(null),
    industry: useRef<HTMLDivElement>(null),
  };

  const [filters, setFilters] = useState({
    country: '',
    city: '',
    jobTypes: [] as string[],
    employmentType: '',
    organizationType: '',
    jobRank: '',
    minSalary: 0,
    minMatchScore: 0,
    salaryStructure: '',
    benefits: [] as string[],
    isPremium: false,
    datePosted: '',
    industry: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = Object.values(dropdownRefs).every(ref => ref.current && !ref.current.contains(target));
      if (isOutside) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableRegions = useMemo(() => filters.country ? (REGIONS_BY_COUNTRY[filters.country] || []) : [], [filters.country]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    return jobs
      .filter(job => {
        const isExpired = job.expiryDate && now > new Date(job.expiryDate);
        if (!isAdminView && (job.status !== 'active' || isExpired)) return false;
        const matchesTab = activeTab === 'All Jobs' || job.category === activeTab;
        if (!matchesTab) return false;
        const matchesSearch = (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              job.company?.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;
        const matchesCountry = !filters.country || job.country === filters.country;
        const matchesCity = !filters.city || job.city === filters.city;
        if (!matchesCountry || !matchesCity) return false;
        const matchesJobType = filters.jobTypes.length === 0 || filters.jobTypes.includes(job.location || '');
        if (!matchesJobType) return false;
        const matchesEmployment = !filters.employmentType || job.employmentType === filters.employmentType;
        if (!matchesEmployment) return false;
        const matchesOrg = !filters.organizationType || job.organizationType === filters.organizationType;
        if (!matchesOrg) return false;
        const matchesRank = !filters.jobRank || job.jobRank === filters.jobRank;
        if (!matchesRank) return false;
        const matchesStructure = !filters.salaryStructure || job.salaryStructure === filters.salaryStructure;
        if (!matchesStructure) return false;
        const matchesBenefits = filters.benefits.length === 0 || filters.benefits.some(b => job.benefits?.includes(b));
        if (!matchesBenefits) return false;
        const matchesPremium = !filters.isPremium || job.isPremium;
        if (!matchesPremium) return false;
        const matchesIndustry = !filters.industry || job.industry === filters.industry;
        if (!matchesIndustry) return false;
        const matchesDate = !filters.datePosted || filters.datePosted === 'all' || (() => {
          const postedTime = new Date(job.postedAt).getTime();
          const now = new Date().getTime();
          return (now - postedTime) / (1000 * 60 * 60) <= parseInt(filters.datePosted);
        })();
        if (!matchesDate) return false;
        const parseSalary = (s: string) => {
          const match = s.match(/(\d+)/);
          if (!match) return 0;
          let val = parseInt(match[1]);
          if (s.toLowerCase().includes('k')) val *= 1000;
          return val;
        };
        const matchesSalary = !filters.minSalary || parseSalary(job.salary) >= filters.minSalary;
        if (!matchesSalary) return false;
        const matchesMatchScore = !filters.minMatchScore || (job.matchScore || 0) >= filters.minMatchScore;
        if (!matchesMatchScore) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      });
  }, [jobs, searchQuery, filters, activeTab]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.country) count++;
    if (filters.city) count++;
    if (filters.jobTypes.length > 0) count++;
    if (filters.employmentType) count++;
    if (filters.organizationType) count++;
    if (filters.jobRank) count++;
    if (filters.minSalary > 0) count++;
    if (filters.minMatchScore > 0) count++;
    if (filters.salaryStructure) count++;
    if (filters.benefits.length > 0) count++;
    if (filters.industry) count++;
    if (filters.datePosted && filters.datePosted !== 'all') count++;
    return count;
  }, [filters]);

  const resetFilters = () => setFilters({ country: '', city: '', jobTypes: [], employmentType: '', organizationType: '', jobRank: '', minSalary: 0, minMatchScore: 0, salaryStructure: '', benefits: [], isPremium: false, datePosted: '', industry: '' });

  const Dropdown = ({ id, label, value, options, onSelect, displayValue, refObj, isMulti = false, onToggleMulti, disabled = false }: any) => {
    const isOpen = openDropdown === id;
    return (
      <div className={`space-y-1 ${disabled ? 'opacity-30' : ''}`} ref={refObj}>
        <label className="text-[10px] font-black text-white/30 ml-1 tracking-widest">{label}</label>
        <div className="relative">
          <div onClick={() => !disabled && setOpenDropdown(isOpen ? null : id)} className={`w-full bg-white border rounded-lg py-1.5 px-2.5 text-xs text-[#0a4179] flex items-center justify-between transition-all h-8 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#0a4179]/20'} ${isOpen ? 'border-[#F0C927]/50' : 'border-[#0a4179]/10'}`}>
            <span className="truncate pr-1 font-normal tracking-tighter">{displayValue || value || "Any"}</span>
            <ChevronDown size={10} className={`text-[#0a4179]/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-white rounded-lg border border-[#0a4179]/10 shadow-2xl p-1 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
              {options.map((opt: any) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = isMulti ? value.includes(optValue) : value === optValue;
                return (
                  <div key={optValue} onClick={() => { if (isMulti) onToggleMulti(optValue); else { onSelect(optValue); setOpenDropdown(null); } }} className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer mb-0.5 last:mb-0 ${isSelected ? 'bg-[#F0C927] text-[#0a4179]' : 'text-[#0a4179] hover:bg-[#0a4179]/5'}`}>
                    <span className="text-xs font-normal tracking-tight">{optLabel}</span>
                    {isSelected && <Check size={10} strokeWidth={4} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-row gap-2 md:gap-3 items-center px-1">
        <div className="relative flex-1 min-w-0 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F0C927] transition-colors" size={16} />
          <input type="text" value={searchQuery} onChange={(e) => setSearching(e.target.value)} placeholder="Search roles or companies..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-[#F0C927] outline-none shadow-md transition-all h-11" />
        </div>
        <div className="flex gap-2 shrink-0 items-center">
          {isAdminView && onPostJob && (
            <button 
              onClick={() => onPostJob({})} 
              className="flex items-center justify-center gap-2 px-3.5 md:px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest border transition-all bg-[#41d599] text-[#0a4179] border-[#41d599] shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <Briefcase size={14} />
              <span className="hidden sm:inline">Post Job</span>
            </button>
          )}
          {!isAdminView && !isReadOnly && (
            <>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 h-11 shadow-md group/auto-apply">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 hidden sm:inline">Auto Apply</span>
                <button 
                  onClick={onToggleAutoApply} 
                  className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 flex items-center cursor-pointer overflow-hidden border ${user.autoApplyEnabled ? 'bg-[#41d599]/20 border-[#41d599] shadow-[0_0_20px_rgba(65,213,153,0.4)]' : 'bg-white/5 border-white/10'}`}
                >
                  {/* Track Background Glow */}
                  <div className={`absolute inset-0 transition-opacity duration-500 ${user.autoApplyEnabled ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-transparent via-[#41d599]/10 to-transparent animate-pulse`} />
                  
                  {/* ON Label */}
                  <div className={`absolute left-2.5 text-[8px] font-black uppercase tracking-tighter transition-all duration-500 ${user.autoApplyEnabled ? 'opacity-100 translate-x-0 text-[#41d599]' : 'opacity-0 -translate-x-2'}`}>
                    ON
                  </div>
                  
                  {/* OFF Label */}
                  <div className={`absolute right-2.5 text-[8px] font-black uppercase tracking-tighter transition-all duration-500 ${user.autoApplyEnabled ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0 text-white/20'}`}>
                    OFF
                  </div>
                  
                  {/* Futuristic Knob */}
                  <div className={`relative w-6 h-6 rounded-lg shadow-2xl transform transition-all duration-500 z-10 flex items-center justify-center ${user.autoApplyEnabled ? 'translate-x-8 bg-[#41d599] rotate-0' : 'translate-x-0 bg-white/10 rotate-90'}`}>
                    <Zap size={12} className={`${user.autoApplyEnabled ? 'text-[#06213f] fill-current' : 'text-white/40'}`} />
                    
                    {/* Knob Glow */}
                    {user.autoApplyEnabled && (
                      <div className="absolute inset-0 rounded-lg bg-[#41d599] blur-md opacity-50 -z-10 animate-pulse" />
                    )}
                  </div>
                </button>
              </div>
              <button onClick={() => onOpenAlerts(searchQuery, filters.country, filters.minSalary)} className="p-3 rounded-xl bg-white/5 text-[#F0C927] border border-white/10 hover:bg-white/10 transition-all shadow-md active:scale-95 flex items-center justify-center h-11 w-11"><Bell size={20} /></button>
            </>
          )}
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center justify-center gap-2 px-3.5 md:px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${showFilters || activeFilterCount > 0 ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927] shadow-lg' : 'bg-white/5 text-white/40 border-white/10'}`}>
            <SlidersHorizontal size={14} /> 
            <span className="hidden sm:inline">Filters</span> {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 mx-1 pb-2">
        {CATEGORY_TABS.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`h-10 flex-1 flex items-center justify-center gap-2 px-2 rounded-xl border transition-all group ${activeTab === tab.id ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927] font-black shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <tab.icon size={14} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{tab.id}</span>
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="glass-premium rounded-[2rem] p-8 border-white/10 animate-in slide-in-from-top-2 space-y-8 mx-1 z-30 relative shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Dropdown id="country" label="Geography" value={filters.country} options={ALL_COUNTRIES} displayValue={filters.country || "Global"} onSelect={(val) => setFilters({...filters, country: val, city: ''})} refObj={dropdownRefs.country} />
            <Dropdown id="city" label="Region" value={filters.city} options={availableRegions} displayValue={!filters.country ? "Select Country" : filters.city || "All Regions"} onSelect={(val) => setFilters({...filters, city: val})} refObj={dropdownRefs.city} disabled={!filters.country} />
            <Dropdown id="industry" label="Industry" value={filters.industry} options={INDUSTRIES} onSelect={(val) => setFilters({...filters, industry: val})} refObj={dropdownRefs.industry} />
            <Dropdown id="employment" label="Engagement" value={filters.employmentType} options={EMPLOYMENT_TYPES} onSelect={(val) => setFilters({...filters, employmentType: val})} refObj={dropdownRefs.employment} />
            <Dropdown id="rank" label="Operational Rank" value={filters.jobRank} options={JOB_RANKS} onSelect={(val) => setFilters({...filters, jobRank: val})} refObj={dropdownRefs.rank} />
            <div className="space-y-1 col-span-full bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-white/30 tracking-widest">AI Match Score</label>
                <span className="text-[10px] font-black text-[#F0C927]">{filters.minMatchScore}%+</span>
              </div>
              <div className="relative flex items-center h-8">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={filters.minMatchScore} 
                  onChange={(e) => setFilters({...filters, minMatchScore: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F0C927] hover:bg-white/20 transition-all"
                />
              </div>
            </div>
          </div>
          <button onClick={resetFilters} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all duration-300">Reset Deployment Parameters</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mx-1 pb-10">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-[20px] p-4 border border-white/5 shadow-xl relative overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0"></div>
                        <div className="space-y-2">
                          <div className="h-5 w-48 bg-white/10 rounded-lg"></div>
                          <div className="h-3 w-32 bg-white/5 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 w-24 bg-white/5 rounded-lg"></div>
                      <div className="h-6 w-20 bg-white/5 rounded-lg"></div>
                      <div className="h-6 w-28 bg-white/5 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center min-w-[140px] space-y-2">
                    <div className="w-16 h-16 rounded-full bg-white/10"></div>
                    <div className="h-3 w-20 bg-white/5 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="glass rounded-[2rem] py-24 px-8 text-center space-y-4 border-dashed border-white/10 opacity-50">
              <Search size={48} className="mx-auto text-white/10" />
              <p className="text-xs font-black uppercase tracking-widest text-white/40">No matching manifests found in the sector</p>
            </div>
          ) : filteredJobs.map(job => {
            const isApplied = applications.some(a => a.jobId === job.id && a.candidateProfile?.email === user.email);
            const appCount = applications.filter(a => a.jobId === job.id).length;
            const timeSince = (() => {
              const diff = Date.now() - new Date(job.postedAt).getTime();
              const hours = Math.floor(diff / (1000 * 60 * 60));
              if (hours < 1) return 'just now';
              if (hours < 24) return `${hours}h ago`;
              return `${Math.floor(hours / 24)}d ago`;
            })();

            return (
              <div key={job.id} onClick={() => onSelectJob(job)} className={`glass backdrop-blur-xl group transition-all duration-500 rounded-[20px] p-4 border cursor-pointer shadow-xl relative overflow-hidden ${isApplied ? 'opacity-60 grayscale-[0.3]' : job.isPremium ? 'bg-[#F0C927]/5 border-[#F0C927]/20 hover:border-[#F0C927]/40 hover:bg-[#F0C927]/10' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:-translate-y-1'}`}>
                
                {/* Desktop Row/Column Layout */}
                <div className="hidden md:flex md:items-start md:gap-8">
                  {/* Identity Logo */}
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-lg shrink-0 overflow-hidden shadow-2xl transition-all duration-500 hover:bg-[#F0C927] hover:text-[#0a4179] group-hover:scale-110 group-hover:border-[#F0C927]/60 mt-1 ${job.isPremium ? 'border-[#F0C927]/40 bg-[#0a4179]' : 'border-white/10 bg-[#0a4179]'}`}>
                    {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Row 1: Job Title (Full Width) */}
                    <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                      {job.isPremium && <Crown size={14} className="text-[#F0C927] shrink-0" />}
                      <h3 className={`text-lg font-black tracking-tight transition-colors leading-tight ${job.isPremium ? 'text-[#F0C927]' : 'text-white'}`}>
                        {job.title}
                      </h3>
                      {isAdminView && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                          job.status === 'active' ? 'bg-[#41d599]/10 text-[#41d599] border-[#41d599]/20' : 
                          job.status === 'closed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-white/10 text-white/40 border-white/20'
                        }`}>
                          {job.status}
                        </span>
                      )}
                      {job.aptitudeTestId && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest shadow-lg">
                          <FileCheck size={10} /> Assessment Required
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 gap-x-8 items-center">
                      {/* Row 2: Company, Salary */}
                      <div className="flex items-center gap-2 text-[13px] font-bold text-white/40">
                        <Building2 size={14} className="text-[#F0C927]" /> {job.company}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#41d599] tracking-tight">
                        <Banknote size={14} className="text-[#41d599]" /> {job.salary}
                      </div>

                      {/* Row 3: Location, Applicants */}
                      <div className="flex items-center gap-2 text-[13px] font-bold text-white/40">
                        <MapPin size={14} className="text-purple-400" /> {job.city}, {job.country}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-white/30">
                        <Users size={14} className="text-blue-400" /> {appCount} Applicants
                      </div>

                      {/* Row 4: Job Type, Post Date */}
                      <div className="flex items-center gap-2 text-[12px] font-bold text-white/20">
                        <Briefcase size={14} className="text-blue-400" /> {job.employmentType || 'Full-time'}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-white/20">
                        <Clock size={14} className="text-blue-400" /> Posted {timeSince}
                      </div>
                    </div>
                  </div>

                  {/* Action Column (Right End) */}
                  {isAdminView ? (
                    <div className="flex flex-col items-center justify-center self-stretch py-1 min-w-[140px] gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}
                        className="w-full h-10 rounded-xl bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center font-black text-[11px] uppercase tracking-widest"
                      >
                        Manage
                      </button>
                      {onDeleteJob && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Are you sure you want to delete this job?')) onDeleteJob(job.id); }}
                          className="w-full h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center font-black text-[11px] uppercase tracking-widest"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-between self-stretch py-1 min-w-[140px]">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onInspectMatch(job); }}
                        className="flex flex-col items-center justify-center px-3 h-12 rounded-xl group/match-desk transition-all shrink-0"
                      >
                        <span className="text-[15px] font-black leading-none">
                          {job.matchScore ? `${job.matchScore}%` : (
                            <span className="flex items-center gap-1 text-[#F0C927] animate-pulse">
                              <Loader2 size={12} className="animate-spin" />
                              <span className="text-[10px]">AI</span>
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-60 mt-1 whitespace-nowrap">Matching Score</span>
                      </button>

                      <div className="mt-auto w-full">
                        {isApplied ? (
                          <div className="w-full h-10 rounded-xl bg-[#41d599]/10 text-[#41d599] font-black border border-[#41d599]/20 flex flex-col items-center justify-center shadow-lg text-[11px] uppercase tracking-widest leading-none">
                             <div className="flex items-center gap-1.5">
                               <Check size={14} /> Applied
                             </div>
                             {applications.find(a => a.jobId === job.id && a.candidateProfile?.email === user.email)?.isAutoApplied && (
                               <span className="text-[7px] mt-1 text-[#41d599]/60 flex items-center gap-1">
                                 <Zap size={8} className="fill-current" /> via Auto-Apply
                               </span>
                             )}
                          </div>
                        ) : !isReadOnly ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onApply(job); }} 
                            className={`h-10 w-full rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center font-black text-[11px] uppercase tracking-widest transition-all ${job.isPremium ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927] shadow-[#F0C927]/20 hover:bg-[#41d599] hover:text-[#06213f] hover:border-[#41d599]' : 'bg-white/5 text-[#F0C927] border border-white/10 hover:bg-[#F0C927] hover:text-[#0a4179]'}`}
                          >
                            {job.applicationType === 'external' ? 'Apply Externally' : 'Apply'}
                          </button>
                        ) : (
                          <div className="h-10 w-full rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-white/20">
                            Read Only
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile View specialized layout (Visible only on mobile) */}
                <div className="md:hidden flex flex-col gap-2">
                  <div className="flex items-start gap-3 w-full">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-xl ${job.isPremium ? 'border-[#F0C927]/40 bg-[#0a4179]' : 'border-white/10 bg-[#0a4179]'}`}>
                      {job.logoUrl ? <img src={job.logoUrl} className="w-full h-full object-cover" /> : job.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <h3 className={`text-[15px] font-black truncate tracking-tight transition-colors leading-tight ${job.isPremium ? 'text-[#F0C927]' : 'text-white'}`}>{job.title}</h3>
                            {isAdminView && (
                              <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${
                                job.status === 'active' ? 'bg-[#41d599]/10 text-[#41d599] border-[#41d599]/20' : 
                                job.status === 'closed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                'bg-white/10 text-white/40 border-white/20'
                              }`}>
                                {job.status}
                              </span>
                            )}
                            {job.aptitudeTestId && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[7px] font-black uppercase tracking-widest">
                                <FileCheck size={8} /> Assessment
                              </span>
                            )}
                          </div>
                        </div>
                        {!isAdminView && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onInspectMatch(job); }}
                            className="flex flex-col items-center justify-center px-2 h-10 rounded-lg group/match-mobile transition-all shrink-0 ml-2"
                          >
                            <span className="text-[11px] font-black leading-none">
                              {job.matchScore ? `${job.matchScore}%` : (
                                <span className="flex items-center gap-0.5 text-[#F0C927] animate-pulse">
                                  <Loader2 size={10} className="animate-spin" />
                                  <span className="text-[8px]">AI</span>
                                </span>
                              )}
                            </span>
                            <span className="text-[6px] font-black uppercase tracking-wider opacity-60 mt-0.5 whitespace-nowrap">Matching Score</span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold text-white/40 tracking-tight">
                          <span className="flex items-center gap-1"><Building2 size={10} className="text-[#F0C927]" /> {job.company}</span>
                          <span className="opacity-20">•</span>
                          <span className="flex items-center gap-1"><MapPin size={10} className="text-purple-400" /> {job.city}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex flex-col gap-1">
                            <div className="text-white/40 font-semibold text-[11px] leading-none tracking-tight flex items-center gap-1.5">
                               <Banknote size={11} className="text-[#41d599]" />
                               {job.salary}
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px] text-white/40 font-semibold tracking-tight">
                              <span className="flex items-center gap-1 truncate"><Users size={11} className="text-blue-400" /> {appCount}</span>
                              <span className="flex items-center gap-1 truncate"><Clock size={11} className="text-blue-400" /> {timeSince}</span>
                            </div>
                          </div>
                        {isAdminView ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}
                              className="px-3 py-1.5 rounded-md bg-white/5 text-white/40 border border-white/10 text-[9px] font-black uppercase tracking-widest"
                            >
                              Manage
                            </button>
                            {onDeleteJob && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Are you sure?')) onDeleteJob(job.id); }}
                                className="p-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ) : isApplied ? (
                          <div className="flex flex-col items-center justify-center px-3 py-1.5 text-[#41d599] bg-[#41d599]/10 border border-[#41d599]/20 rounded-md text-[10px] font-black uppercase tracking-tighter leading-none">
                             <span>Applied</span>
                             {applications.find(a => a.jobId === job.id && a.candidateProfile?.email === user.email)?.isAutoApplied && (
                               <span className="text-[6px] text-[#41d599]/60 flex items-center gap-0.5 mt-0.5">
                                 <Zap size={6} className="fill-current" /> Auto
                               </span>
                             )}
                          </div>
                        ) : !isReadOnly ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onApply(job); }}
                            className={`px-4 py-2 rounded-md bg-[#F0C927] text-[#0a4179] flex items-center justify-center shadow-2xl active:scale-95 transition-all shadow-[#F0C927]/20 text-[10px] font-black uppercase tracking-widest ${job.isPremium ? 'hover:bg-[#41d599] hover:text-[#06213f]' : 'hover:brightness-110'}`}
                          >
                            {job.applicationType === 'external' ? 'Apply Ext.' : 'Apply'}
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/20">
                            Read Only
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeekerFeed;
