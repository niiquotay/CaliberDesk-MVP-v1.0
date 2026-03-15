
// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Profile from './components/Profile';
import Settings from './components/Settings';
import EmployerProfile from './components/EmployerProfile';
import VideoRecorder from './components/VideoRecorder';
import CareerCoach from './components/CareerCoach';
import MatchDetails from './components/MatchDetails';
import JobDetails from './components/JobDetails';
import JobManagement from './components/JobManagement';
import SeekerFeed from './components/SeekerFeed';
import JobAlertsModal from './components/JobAlertsModal';
import InterviewPrep from './components/InterviewPrep';
import CVPrep from './components/CVPrep';
import Toast from './components/Toast';
import SignIn from './components/SignIn';
import CompanyProfileView from './components/CompanyProfileView';
import CompanyVerificationModal from './components/CompanyVerificationModal';
import SeekerAnalytics from './components/SeekerAnalytics';
import SeekerApplications from './components/SeekerApplications';
import AptitudeTestManager from './components/AptitudeTestManager';
import AptitudeTestPlayer from './components/AptitudeTestPlayer';
import OrganizationManagement from './components/OrganizationManagement';
import ProductsAndServices from './components/ProductsAndServices';
import ComingSoonLanding from './components/ComingSoonLanding';
import AuthGate from './components/AuthGate';
import Background3D from './components/Background3D';
import WelcomeEmailModal from './components/WelcomeEmailModal';
import OnboardingWizard from './components/OnboardingWizard';
import Blog from './components/Blog';
import Notifications from './components/Notifications';

import { analyzeMatch } from './services/geminiService';
import { Job, ViewType, UserProfile, Application, Transaction, JobAlert, ApplicationStatus, AptitudeTest, SubUser, Subsidiary, AppNotification } from './types';
import { calculateProfileCompletion } from './utils';
import { 
  MOCK_JOBS, ALL_COUNTRIES, MOCK_USER, GLOBAL_TRANSACTIONS, 
  INDUSTRIES, SENIORITY_LEVELS, SALARY_RANGES, JOB_TYPES, 
  DATE_POSTED_OPTIONS, JOB_FUNCTIONS, BENEFITS, AGE_RANGES, REGIONS_BY_COUNTRY,
  MOCK_APTITUDE_TESTS, isJobActuallyActive, MOCK_APPLICATIONS, MOCK_EMPLOYER
} from './constants';
import { 
  Sparkles, MapPin, DollarSign, Plus, ShieldCheck, 
  Loader2, Search, Zap, Crown, Globe, ChevronRight,
  TrendingUp, Rocket, Check, Cpu, EyeOff, Shield, Bell, Hammer, Briefcase as BriefcaseIcon,
  ToggleLeft, ToggleRight, Info, CheckCircle2, Mail, Smartphone, LayoutDashboard, BarChart3,
  SlidersHorizontal, X, Target, Calendar, Award, User, UsersPlus, Lock, Truck, Layout as LayoutIcon,
  MessageCircle, AlertCircle
} from 'lucide-react';

const INITIAL_GUEST: UserProfile = {
  name: 'Guest Explorer',
  firstName: 'Guest',
  middleName: '',
  lastName: 'Explorer',
  email: '',
  password: '',
  role: '',
  city: '',
  country: 'Global',
  skills: [],
  shortlistedSkills: [],
  digitalSkills: [],
  certifications: [],
  hobbies: [],
  projects: [],
  experienceSummary: '',
  jobTitle: '',
  stealthMode: false,
  profileCompleted: false,
  linkedInConnected: false,
  isSubscribed: true,
  subscriptionTier: 'premium',
  productCredits: { standard: 999, premium: 999, shortlist: 999 },
  purchaseHistory: [],
  adOptIn: false,
  alerts: [],
  savedJobIds: [],
  autoApplyEnabled: false,
  joinedDate: new Date().toISOString(),
  workHistory: [],
  education: [],
  voluntaryActivities: [],
  profileImages: [],
  isSuperUser: false,
  subUsers: [],
  subsidiaries: [],
  demographicVisibility: {
    gender: true, ageRange: true, race: true, disabilityStatus: true,
    religion: true, maritalStatus: true, veteranStatus: true
  },
  notifications: [
    {
      id: 'welcome-notif',
      title: 'Welcome to CaliberDesk',
      message: 'Welcome to the future of recruitment. Your neural profile is ready for calibration. Explore jobs or set up your career preferences to get started.',
      type: 'in-app',
      category: 'system',
      date: new Date().toISOString(),
      isRead: false,
      actionLink: { label: 'Complete Profile', view: 'profile' }
    },
    {
      id: 'auto-apply-tip',
      title: 'Pro Tip: Auto-Apply',
      message: 'Did you know you can enable Auto-Apply in your settings? Our AI will automatically apply to jobs that match your profile by 80% or more.',
      type: 'in-app',
      category: 'auto-apply',
      date: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      actionLink: { label: 'Go to Search', view: 'seeker' }
    }
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'profile') return 'profile';
    if (window.location.pathname === '/admin' || window.location.pathname === '/staff-login' || window.location.pathname === '/signin') return 'signin';
    return 'home';
  });
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [user, setUser] = useState<UserProfile>(INITIAL_GUEST);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [aptitudeTests, setAptitudeTests] = useState<AptitudeTest[]>(MOCK_APTITUDE_TESTS);
  const [detailedJob, setDetailedJob] = useState<Job | null>(null);
  const [inspectJob, setInspectJob] = useState<Job | null>(null);
  const [showJobAlerts, setShowJobJobAlerts] = useState(false);
  const [alertDefaults, setAlertDefaults] = useState({ keywords: '', location: '', minSalary: 0 });
  const [showCoach, setShowCoach] = useState(false);
  const [activeTestJob, setActiveTestJob] = useState<Job | null>(null);
  const [blogCategory, setBlogCategory] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [activeCompanyProfile, setActiveCompanyProfile] = useState<string | null>(null);
  const [autoOpenJobCreate, setAutoOpenJobCreate] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateRole, setAuthGateRole] = useState<'seeker' | 'employer'>('seeker');
  const [signInIsEmployer, setSignInIsEmployer] = useState(false);
  const [signInIsStaff, setSignInIsStaff] = useState(() => window.location.pathname === '/admin' || window.location.pathname === '/staff-login');
  const [showWelcomeEmail, setShowWelcomeEmail] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<UserProfile[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.pathname === '/staff-login') {
        if (user.isAdmin || user.opRole) {
          setView('admin');
        } else {
          setSignInIsStaff(true);
          setView('signin');
        }
      } else if (window.location.pathname === '/signin') {
        setSignInIsStaff(false);
        setView('signin');
      } else if (window.location.pathname === '/') {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingJobs(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } catch (error) {
          console.error("Error checking API key:", error);
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(true); // Not in AI Studio environment
      }
    };
    checkKey();
    
    // Listen for errors that might indicate an invalid key
    const handleError = (event: ErrorEvent) => {
      const errorMsg = event.message || "";
      console.error("Global Error Event:", errorMsg);
      
      if (errorMsg.includes("Requested entity was not found") || 
          errorMsg.toLowerCase().includes("origin not allowed") ||
          errorMsg.toLowerCase().includes("api key not allowed") ||
          errorMsg.toLowerCase().includes("api_key_invalid")) {
        setHasApiKey(false);
        setToast({ 
          message: "API Key Restriction: Please select a valid key with no origin restrictions.", 
          type: 'error' 
        });
      }
    };

    const handleGeminiError = (event: any) => {
      const errorMsg = event.detail?.message || "";
      console.error("Gemini Error Event:", errorMsg);
      
      if (errorMsg.includes("Requested entity was not found") || 
          errorMsg.toLowerCase().includes("origin not allowed") ||
          errorMsg.toLowerCase().includes("api key not allowed")) {
        setHasApiKey(false);
        setToast({ 
          message: "API Key Restriction: The selected key is not allowed for this origin. Please select a different key.", 
          type: 'error' 
        });
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const reason = event.reason;
      let errorMsg = "Unknown Promise Rejection";
      
      if (reason instanceof Error) {
        errorMsg = reason.message || "Empty Error Message";
      } else if (typeof reason === 'string') {
        errorMsg = reason || "Empty String Rejection";
      } else if (reason) {
        try {
          errorMsg = JSON.stringify(reason);
          if (errorMsg === '{}') errorMsg = "Empty Object Rejection";
        } catch (e) {
          errorMsg = String(reason);
        }
      } else {
        errorMsg = "Undefined/Null Rejection";
      }
      
      if (errorMsg.includes("Requested entity was not found") || 
          errorMsg.toLowerCase().includes("origin not allowed") ||
          errorMsg.toLowerCase().includes("api key not allowed") ||
          errorMsg.toLowerCase().includes("api_key_invalid")) {
        setHasApiKey(false);
        setToast({ 
          message: "API Key Restriction: The current key is not allowed for this origin. Please select a valid key.", 
          type: 'error' 
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('gemini-error', handleGeminiError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('gemini-error', handleGeminiError);
    };
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true); // Assume success as per guidelines
      } catch (error) {
        console.error("Error opening key selector:", error);
        setToast({ message: "Failed to open API key selector. Please try again.", type: 'error' });
      }
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      isRead: false
    };
    setUser(prev => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])]
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setUser(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  };

  const deleteNotification = (id: string) => {
    setUser(prev => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== id)
    }));
  };
  
  const isAuthenticated = !!user.email;

  // Automation logic for Match Scores
  const backgroundProcessRef = useRef(false);

  useEffect(() => {
    if (backgroundProcessRef.current) return;

    const processSeekerMatches = async () => {
      if (view !== 'seeker' || !user.email) return;
      
      const jobToProcess = jobs.find(j => j.status === 'active' && !j.matchScore);
      if (!jobToProcess) return;

      backgroundProcessRef.current = true;
      try {
        const result = await analyzeMatch(user, jobToProcess);
        const updatedJob = { 
          ...jobToProcess, 
          matchScore: result.score, 
          matchReason: result.reason, 
          matchDetails: result.details 
        };
        
        setJobs(prev => prev.map(j => j.id === jobToProcess.id ? updatedJob : j));

        // Trigger automations for this newly matched job
        const isPreferenceMatch = user.alerts?.some(alert => 
          (alert.keywords && updatedJob.title.toLowerCase().includes(alert.keywords.toLowerCase())) ||
          (alert.location && updatedJob.location.toLowerCase().includes(alert.location.toLowerCase()))
        ) || (user.jobPreferences?.categories?.includes(updatedJob.category || '') || 
              user.jobPreferences?.locations?.includes(updatedJob.city || '') ||
              user.jobPreferences?.roles?.includes(updatedJob.title));

        if (result.score >= 80 || isPreferenceMatch) {
          // Notification & Email
          const msg = `New job recommendation: ${updatedJob.title} at ${updatedJob.company}. Apply now!`;
          addNotification({
            title: 'New Job Recommendation',
            message: msg,
            type: 'both',
            category: 'recommendation',
            actionLink: { label: 'View Job', view: 'job-details', params: updatedJob }
          });
          console.log(`[NOTIFICATION] To: ${user.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${user.email}, Subject: Job Recommendation - CaliberDesk, Body: A new job matching your profile has been listed: ${updatedJob.title} at ${updatedJob.company}.`);
          
          // Auto Apply
          if (user.autoApplyEnabled && result.score >= 80 && updatedJob.applicationType !== 'external') {
            const alreadyApplied = applications.some(a => a.jobId === updatedJob.id && a.candidateProfile?.email === user.email);
            if (!alreadyApplied) {
              if (updatedJob.aptitudeTestId) {
                const assessmentMsg = `Auto-Apply paused for ${updatedJob.title} at ${updatedJob.company}. This role requires an assessment. Please complete the assessment to finalize your application.`;
                addNotification({
                  title: 'Assessment Required',
                  message: assessmentMsg,
                  type: 'in-app',
                  category: 'application',
                  actionLink: { label: 'Take Assessment', view: 'job-details', params: updatedJob }
                });
                console.log(`[NOTIFICATION] To: ${user.email}, Message: ${assessmentMsg}`);
              } else {
                const newApp: Application = {
                  id: Math.random().toString(36).substr(2, 9),
                  jobId: updatedJob.id,
                  status: 'applied',
                  appliedDate: new Date().toISOString(),
                  candidateProfile: user,
                  matchScore: result.score,
                  matchReason: result.reason,
                  isAutoApplied: true,
                  statusHistory: [{ status: 'applied', date: new Date().toISOString() }]
                };
                setApplications(prev => [...prev, newApp]);
                setToast({ message: `Auto-applied to ${updatedJob.title} (Match: ${result.score}%)`, type: 'success' });
                const autoMsg = `Auto-Apply triggered! We've automatically applied for ${updatedJob.title} at ${updatedJob.company} on your behalf.`;
                addNotification({
                  title: 'Auto-Apply Triggered',
                  message: autoMsg,
                  type: 'in-app',
                  category: 'auto-apply',
                  actionLink: { label: 'My Applications', view: 'seeker-applications' }
                });
                console.log(`[NOTIFICATION] To: ${user.email}, Message: ${autoMsg}`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Seeker match automation failed", err);
      } finally {
        backgroundProcessRef.current = false;
      }
    };

    const processEmployerMatches = async () => {
      if (!user.isEmployer || !user.email) return;

      const appToProcess = applications.find(a => !a.matchScore && a.candidateProfile);
      if (!appToProcess) return;

      const associatedJob = jobs.find(j => j.id === appToProcess.jobId);
      if (!associatedJob) return;

      backgroundProcessRef.current = true;
      try {
        const result = await analyzeMatch(appToProcess.candidateProfile!, associatedJob);
        setApplications(prev => prev.map(a => a.id === appToProcess.id ? { 
          ...a, 
          matchScore: result.score, 
          matchReason: result.reason 
        } : a));
      } catch (err) {
        console.error("Employer match automation failed", err);
      } finally {
        backgroundProcessRef.current = false;
      }
    };

    const interval = setInterval(() => {
      if (!backgroundProcessRef.current) {
        processSeekerMatches().catch(err => console.error("Interval processSeekerMatches failed:", err));
        processEmployerMatches().catch(err => console.error("Interval processEmployerMatches failed:", err));
      }
    }, 3000); // Check for tasks every 3 seconds

    return () => clearInterval(interval);
  }, [view, user.email, user.isEmployer, jobs, applications]);

  useEffect(() => {
    const checkAutomations = () => {
      const now = new Date();
      
      // 90-day auto-off check
      if (user.autoApplyEnabled && user.autoApplyEnabledAt) {
        const enabledAt = new Date(user.autoApplyEnabledAt);
        const diffDays = Math.floor((now.getTime() - enabledAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 90) {
          setUser(prev => ({ ...prev, autoApplyEnabled: false }));
          const msg = "Auto-apply feature has been automatically turned off after 90 days.";
          addNotification({
            title: 'Auto-Apply Disabled',
            message: msg,
            type: 'both',
            category: 'auto-apply',
            actionLink: { label: 'Settings', view: 'settings' }
          });
          console.log(`[NOTIFICATION] To: ${user.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${user.email}, Subject: Auto-Apply Feature Status, Body: Your auto-apply feature has been automatically turned off as it has been active for 90 days.`);
          setToast({ message: "Auto-apply disabled (90-day limit reached)", type: 'info' });
        }
      }

      // 180-day reminder check
      if (!user.autoApplyEnabled && !user.isEmployer && user.email) {
        const lastReminder = user.lastAutoApplyReminderAt ? new Date(user.lastAutoApplyReminderAt) : new Date(user.joinedDate || now);
        const diffDays = Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 180) {
          const msg = "Boost your job search! Turn on Auto-Apply to never miss an opportunity.";
          addNotification({
            title: 'Feature Recommendation',
            message: msg,
            type: 'in-app',
            category: 'system',
            actionLink: { label: 'Enable Auto-Apply', view: 'seeker' }
          });
          console.log(`[NOTIFICATION] To: ${user.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${user.email}, Subject: Optimize Your Job Search - CaliberDesk, Body: It's been a while! Turn on our Auto-Apply feature to automatically apply for jobs that match your profile.`);
          setUser(prev => ({ ...prev, lastAutoApplyReminderAt: now.toISOString() }));
        }
      }
    };

    const interval = setInterval(checkAutomations, 1000 * 60 * 60 * 24); // Check daily
    checkAutomations(); // Run once on mount
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const scrollableElement = document.querySelector('main');
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: 0, behavior: 'auto' });
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view, detailedJob, activeCompanyProfile]);

  useEffect(() => {
    const checkAutoRejections = () => {
      const now = new Date();
      setApplications(prev => {
        let changed = false;
        const updated = prev.map(app => {
          const job = jobs.find(j => j.id === app.jobId);
          if (job && job.expiryDate) {
            const expiry = new Date(job.expiryDate);
            const rejectionThreshold = new Date(expiry.getTime() + 20 * 24 * 60 * 60 * 1000);
            
            if (now > rejectionThreshold && (app.status === 'applied' || app.status === 'viewed')) {
              changed = true;
              // Simulate notification and email for auto-rejection
              console.log(`[AUTO-REJECTION] Application ${app.id} for ${job.title} rejected due to inactivity 20 days after job expiry.`);
              console.log(`[NOTIFICATION] To: ${app.candidateProfile?.email}, Message: Your application for ${job.title} has been automatically rejected as the position has been filled or the recruitment window has closed.`);
              console.log(`[EMAIL] To: ${app.candidateProfile?.email}, Subject: Application Update - CaliberDesk, Body: Unfortunately, your application for ${job.title} at ${job.company} has been automatically rejected as the position has been filled or the recruitment window has closed.`);
              return { 
                ...app, 
                status: 'rejected' as ApplicationStatus,
                statusHistory: [...(app.statusHistory || []), { status: 'rejected', date: now.toISOString() }]
              };
            }
          }
          return app;
        });
        return changed ? updated : prev;
      });
    };

    const interval = setInterval(checkAutoRejections, 60000); // Check every minute
    checkAutoRejections(); // Initial check
    return () => clearInterval(interval);
  }, [jobs]);

  useEffect(() => {
    if (view === 'home' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    } else if (view === 'signin') {
      if (signInIsStaff) {
        if (window.location.pathname !== '/staff-login') {
          window.history.pushState({}, '', '/staff-login');
        }
      } else {
        if (window.location.pathname !== '/signin') {
          window.history.pushState({}, '', '/signin');
        }
      }
    } else if (view.startsWith('admin')) {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      }
    }
  }, [view, signInIsStaff]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          if (data.isAdmin || data.opRole) {
            setView('admin');
            fetchPendingVerifications();
          }
          else if (data.isEmployer) {
            setView('employer');
            if (!data.isVerified && !data.verificationDocuments) {
              setShowVerificationReminder(true);
            }
          }
          else setView('seeker');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/admin/pending-verifications');
      if (response.ok) {
        const data = await response.json();
        setPendingVerifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch pending verifications:', err);
    }
  };

  const handleVerifyEmployer = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/verify-employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        setToast({ message: "Employer verified successfully", type: "success" });
        setPendingVerifications(prev => prev.filter(u => u.id === userId || u.idNumber === userId));
        // Refresh jobs to update expiry dates if needed (though the rule says new jobs)
        // Actually, the user said "until the company of verified before the job will be up for 28 days"
        // This might mean existing jobs should be updated.
        setJobs(prev => prev.map(j => {
          const employer = pendingVerifications.find(u => u.id === userId || u.idNumber === userId);
          if (j.company === employer?.companyName || j.postedBy === employer?.name) {
            const newExpiry = new Date(j.postedAt);
            newExpiry.setDate(newExpiry.getDate() + 28);
            return { ...j, expiryDate: newExpiry.toISOString() };
          }
          return j;
        }));
        fetchPendingVerifications();
      }
    } catch (err) {
      setToast({ message: "Verification failed", type: "error" });
    }
  };

  const handleSignIn = (signedInUser: UserProfile, customMessage?: string) => {
    setUser({ ...signedInUser, isSubscribed: true, subscriptionTier: 'premium' });
    setShowAuthGate(false);
    setToast({ message: customMessage || `Authorized. Accessing as ${(signedInUser.name || 'User').split(' ')[0]}`, type: 'success' });
    if (signedInUser.isAdmin || signedInUser.opRole) setView('admin');
    else if (signedInUser.isEmployer) setView('employer');
    else setView('seeker');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser({} as UserProfile);
      setView('home');
      setToast({ message: 'Logged out successfully', type: 'info' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const requireAuth = useCallback((actionName: string, preferredRole: 'seeker' | 'employer' = 'seeker') => {
    if (!user.email) {
      setAuthGateRole(preferredRole);
      setShowAuthGate(true);
      setToast({ message: `Identity Required: Please sign up to ${actionName}.`, type: 'info' });
      return false;
    }
    return true;
  }, [user.email]);

  const handleApplyRequest = (job: Job) => {
    if (!requireAuth("apply for this position", 'seeker')) return;

    const profileCompletion = calculateProfileCompletion(user);
    if (profileCompletion < 80) {
      setToast({ 
        message: `Profile incomplete (${profileCompletion}%). Minimum 80% required to apply. Please update your profile.`, 
        type: 'error' 
      });
      setView('profile');
      return;
    }

    if (job.applicationType === 'external') {
      window.open(job.externalApplyUrl || 'https://google.com', '_blank');
      return;
    }
    
    if (applications.some(a => a.jobId === job.id && a.candidateProfile?.email === user.email)) {
      setToast({ message: "Profile already deployed to this job", type: 'info' });
      return;
    }

    if (!job.aptitudeTestId) {
      const newApp: Application = {
        id: Math.random().toString(36).substr(2, 9),
        jobId: job.id,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        candidateProfile: user,
        statusHistory: [{ status: 'applied', date: new Date().toISOString() }]
      };
      setApplications(prev => [...prev, newApp]);
      setToast({ message: "Profile Deployed Successfully", type: 'success' });
      return;
    }

    setApplyingJob(job);
  };

  const handleVideoComplete = (videoUrl: string) => {
    if (!applyingJob) return;

    const newApp: Application = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: applyingJob.id,
      status: 'applied',
      appliedDate: new Date().toISOString(),
      candidateProfile: user,
      videoUrl: videoUrl,
      statusHistory: [{ status: 'applied', date: new Date().toISOString() }]
    };

    setApplications(prev => [...prev, newApp]);
    setToast({ message: "Video Pitch & Profile Deployed Successfully", type: 'success' });
    setApplyingJob(null);
  };

  const handleInspectMatch = async (job: Job) => {
    if (!requireAuth("analyze match compatibility", 'seeker')) return;
    if (job.matchScore) {
      setInspectJob(job);
      return;
    }
    
    setIsMatching(true);
    try {
      const result = await analyzeMatch(user, job);
      const updatedJob = { ...job, matchScore: result.score, matchReason: result.reason, matchDetails: result.details };
      setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
      setInspectJob(updatedJob);
    } catch (err) {
      setToast({ message: "Neural match sync failed.", type: 'error' });
    } finally {
      setIsMatching(false);
    }
  };

  const processJobAutomations = async (job: Job) => {
    try {
      // In a real app, this would query all seekers.
      // For this demo, we'll process the current user if they are a seeker.
      if (!user.isEmployer && user.email) {
        const match = await analyzeMatch(user, job);
        
        const isPreferenceMatch = user.alerts?.some(alert => 
          (alert.keywords && job.title.toLowerCase().includes(alert.keywords.toLowerCase())) ||
          (alert.location && job.location.toLowerCase().includes(alert.location.toLowerCase()))
        ) || (user.jobPreferences?.categories?.includes(job.category || '') || 
              user.jobPreferences?.locations?.includes(job.city || '') ||
              user.jobPreferences?.roles?.includes(job.title));

        if (match.score >= 80 || isPreferenceMatch) {
          // Notification & Email
          const msg = `New job recommendation: ${job.title} at ${job.company}. Apply now!`;
          addNotification({
            title: 'New Job Recommendation',
            message: msg,
            type: 'both',
            category: 'recommendation',
            actionLink: { label: 'View Job', view: 'job-details', params: job }
          });
          console.log(`[NOTIFICATION] To: ${user.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${user.email}, Subject: Job Recommendation - CaliberDesk, Body: A new job matching your profile has been listed: ${job.title} at ${job.company}.`);
          
          // Auto Apply
          if (user.autoApplyEnabled && match.score >= 80 && job.applicationType !== 'external') {
            // Check if already applied
            const alreadyApplied = applications.some(a => a.jobId === job.id && a.candidateProfile?.email === user.email);
            if (!alreadyApplied) {
              if (job.aptitudeTestId) {
                const assessmentMsg = `Auto-Apply paused for ${job.title} at ${job.company}. This role requires an assessment. Please complete the assessment to finalize your application.`;
                addNotification({
                  title: 'Assessment Required',
                  message: assessmentMsg,
                  type: 'in-app',
                  category: 'application',
                  actionLink: { label: 'Take Assessment', view: 'job-details', params: job }
                });
                console.log(`[NOTIFICATION] To: ${user.email}, Message: ${assessmentMsg}`);
              } else {
                const newApp: Application = {
                  id: Math.random().toString(36).substr(2, 9),
                  jobId: job.id,
                  status: 'applied',
                  appliedDate: new Date().toISOString(),
                  candidateProfile: user,
                  matchScore: match.score,
                  matchReason: match.reason,
                  isAutoApplied: true,
                  statusHistory: [{ status: 'applied', date: new Date().toISOString() }]
                };
                setApplications(prev => [...prev, newApp]);
                console.log(`[AUTO-APPLY] Applied for ${job.title} at ${job.company} on behalf of ${user.name}`);
                setToast({ message: `Auto-applied to ${job.title} (Match: ${match.score}%)`, type: 'success' });
                
                // Notification for auto-apply
                const autoMsg = `Auto-Apply triggered! We've automatically applied for ${job.title} at ${job.company} on your behalf.`;
                addNotification({
                  title: 'Auto-Apply Triggered',
                  message: autoMsg,
                  type: 'in-app',
                  category: 'auto-apply',
                  actionLink: { label: 'My Applications', view: 'seeker-applications' }
                });
                console.log(`[NOTIFICATION] To: ${user.email}, Message: ${autoMsg}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Job automation failed", err);
    }
  };

  const handleToggleAutoApply = () => {
    if (!requireAuth("enable auto-apply", 'seeker')) return;
    const newState = !user.autoApplyEnabled;
    setUser(prev => ({ 
      ...prev, 
      autoApplyEnabled: newState,
      autoApplyEnabledAt: newState ? new Date().toISOString() : prev.autoApplyEnabledAt
    }));
    setToast({ 
      message: newState ? "Auto-Apply Protocol Activated" : "Auto-Apply Protocol Deactivated", 
      type: newState ? 'success' : 'info' 
    });
    
    if (newState) {
      const msg = `Auto-Apply feature has been turned on. We will automatically apply for jobs that match your profile by 80% or more.`;
      addNotification({
        title: 'Auto-Apply Activated',
        message: msg,
        type: 'in-app',
        category: 'auto-apply'
      });
      console.log(`[NOTIFICATION] To: ${user.email}, Message: ${msg}`);
    }
  };

  const handlePostJob = (job: Job) => {
    setJobs(prev => {
      const existing = prev.find(j => j.id === job.id);
      if (existing) {
        return prev.map(j => j.id === job.id ? job : j);
      }
      return [job, ...prev];
    });
    setEditingJob(null);
    processJobAutomations(job).catch(err => console.error("processJobAutomations unhandled error:", err));
  };

  const handleUpdateJobStatus = (jobId: string, status: 'active' | 'closed' | 'draft') => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status };
      }
      return j;
    }));
    setToast({ message: `Job marked as ${status.toUpperCase()}.`, type: 'success' });
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setToast({ message: "Job permanently removed.", type: 'success' });
  };

  const handleUpgradeJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, isPremium: true, postedAt: new Date().toISOString(), status: 'active' };
      }
      return j;
    }));
    setToast({ message: "Job Upgraded to Premium Tier. $28 Settlement Processed.", type: 'success' });
  };

  const handleTestComplete = (score: number, proctorFlags: number) => {
    if (!activeTestJob) return;
    setApplications(prev => prev.map(app => {
      if (app.jobId === activeTestJob.id && app.candidateProfile?.email === user.email) {
        return { ...app, testScore: score, proctorFlags };
      }
      return app;
    }));
    setToast({ message: `Assessment Processed: ${score}% Score.`, type: 'success' });
    setActiveTestJob(null);
  };

  const handleLaunchAssessment = (job: Job) => {
    if (!requireAuth("take assessments", 'seeker')) return;
    const test = aptitudeTests.find(t => t.id === job.aptitudeTestId);
    if (!test) {
      setToast({ message: "Neural Link Error: Assessment manifest not found.", type: 'error' });
      return;
    }
    setActiveTestJob(job);
  };

  const handleNavClick = (targetView: ViewType) => {
    setDetailedJob(null); 
    setActiveCompanyProfile(null);
    setEditingJob(null);
    setShowAuthGate(false);
    
    if (targetView === 'blog') {
      setBlogCategory(null);
    }
    
    const publicViews = ['home', 'seeker', 'signin', 'hrm-landing', 'payroll-landing', 'vendor-landing', 'about-caliberdesk'];
    
    if (targetView === 'employer-post-job') {
      if (!requireAuth("post job vacancies", 'employer')) return;
      setView('employer-management');
      setAutoOpenJobCreate(true);
      setTimeout(() => setAutoOpenJobCreate(false), 500);
      return;
    }

    if (!user.email && !publicViews.includes(targetView)) {
      setAuthGateRole('seeker');
      setShowAuthGate(true);
      return;
    }
    
    if (targetView === 'home' && user.email) {
      setUser(INITIAL_GUEST);
      setToast({ message: "Session Terminated.", type: 'info' });
    }

    setView(targetView);
  };

  const handleEditJob = (job: Job) => {
    if (!requireAuth("modify recruitment manifests", 'employer')) return;
    setEditingJob(job);
    setDetailedJob(null);
    setAutoOpenJobCreate(true);
    if (view !== 'employer-management') {
      setView('employer-management');
    }
  };

  const handleSelectDetailedJob = (job: Job) => {
    setEditingJob(null);
    setDetailedJob(job);
  };

  const handleAddSubUser = (sub: Partial<SubUser>) => {
    const fullName = `${sub.firstName} ${sub.middleName ? sub.middleName + ' ' : ''}${sub.lastName}`;
    const newSub: SubUser = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: sub.firstName || '',
      middleName: sub.middleName || '',
      lastName: sub.lastName || '',
      name: fullName,
      email: sub.email || '',
      phone: sub.phone || '',
      role: sub.role || 'recruiter',
      isSuperUser: false,
      joinedDate: new Date().toISOString(),
      lastLogin: 'Never'
    };
    setUser(prev => ({
      ...prev,
      subUsers: [...(prev.subUsers || []), newSub]
    }));
    
    // Simulate Invitation Email
    const inviteMsg = `Hello ${sub.firstName}, you have been invited to join ${user.companyName} on CaliberDesk. Your role is ${sub.role}.`;
    console.log(`[INVITATION EMAIL] To: ${sub.email}, Message: ${inviteMsg}`);
    
    addNotification({
      title: 'Member Invited',
      message: `An invitation email has been sent to ${sub.email}`,
      type: 'in-app',
      category: 'account'
    });
  };

  const handleRemoveSubUser = (id: string) => {
    setUser(prev => ({
      ...prev,
      subUsers: (prev.subUsers || []).filter(s => s.id !== id)
    }));
    setToast({ message: "Member access revoked.", type: 'info' });
  };

  const handleAddSubsidiary = (subs: Partial<Subsidiary>) => {
    const newSubs: Subsidiary = {
      id: Math.random().toString(36).substr(2, 9),
      name: subs.name || '',
      industry: subs.industry || '',
      location: subs.location || '',
      activeJobs: 0,
      joinedDate: new Date().toISOString()
    };
    setUser(prev => ({
      ...prev,
      subsidiaries: [...(prev.subsidiaries || []), newSubs]
    }));
  };

  const handleSaveAlert = (alertData: Omit<JobAlert, 'id' | 'isActive'>) => {
    if (!requireAuth("save job alerts", 'seeker')) return;
    const newAlert: JobAlert = {
      id: Math.random().toString(36).substr(2, 9),
      isActive: true,
      ...alertData
    };
    setUser(prev => ({
      ...prev,
      alerts: [...(prev.alerts || []), newAlert]
    }));
    setToast({ message: "Job Alert Manifest Synchronized", type: 'success' });
  };

  const handleDeleteAlert = (id: string) => {
    setUser(prev => ({
      ...prev,
      alerts: (prev.alerts || []).filter(a => a.id !== id)
    }));
    setToast({ message: "Alert Criterion Purged", type: 'info' });
  };

  const handleUpdateApplicationStatus = useCallback((appId: string, status: ApplicationStatus) => {
    setApplications(prev => {
      const appToUpdate = prev.find(a => a.id === appId);
      if (!appToUpdate) return prev;

      const isRejection = status === 'rejected';
      // If it's not a rejection and it's a move to a new stage, it needs acceptance
      const needsAcceptance = !isRejection && status !== appToUpdate.status && status !== 'applied' && status !== 'viewed';

      let updatedApp;
      if (needsAcceptance) {
        updatedApp = { ...appToUpdate, proposedStatus: status };
      } else {
        updatedApp = { 
          ...appToUpdate, 
          status, 
          proposedStatus: undefined,
          statusHistory: [...(appToUpdate.statusHistory || []), { status, date: new Date().toISOString() }]
        };
      }

      const updated = prev.map(app => app.id === appId ? updatedApp : app);
      const job = jobs.find(j => j.id === updatedApp.jobId);
      
      if (job) {
        if (needsAcceptance) {
          setToast({ message: `Invitation to ${status.replace('-', ' ')} stage sent. Seeker must accept.`, type: 'info' });
          const msg = `You have been invited to the ${status.replace('-', ' ')} stage for ${job.title} at ${job.company}. Please accept to proceed.`;
          addNotification({
            title: 'Stage Advancement Invitation',
            message: msg,
            type: 'both',
            category: 'application',
            actionLink: { label: 'Review Invitation', view: 'seeker-applications' }
          });
          console.log(`[NOTIFICATION] To: ${updatedApp.candidateProfile?.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${updatedApp.candidateProfile?.email}, Subject: Stage Advancement Invitation - CALIBERDESK, Body: Hello ${updatedApp.candidateProfile?.name}, you have been invited to move to the ${status.replace('-', ' ')} stage for ${job.title} at ${job.company}. Please log in to accept.`);
        } else {
          setToast({ message: `Status updated to ${status.replace('-', ' ')}. Notifications transmitted.`, type: 'success' });
          const msg = `Your application status for ${job.title} at ${job.company} has been updated to ${status.replace('-', ' ')}.`;
          addNotification({
            title: 'Application Update',
            message: msg,
            type: 'both',
            category: 'application',
            actionLink: { label: 'View Application', view: 'seeker-applications' }
          });
          console.log(`[NOTIFICATION] To: ${updatedApp.candidateProfile?.email}, Message: ${msg}`);
          console.log(`[EMAIL] To: ${updatedApp.candidateProfile?.email}, Subject: Application Update - CALIBERDESK, Body: Hello ${updatedApp.candidateProfile?.name}, your application status for the position of ${job.title} at ${job.company} is now: ${status.replace('-', ' ')}.`);
        }
      }
      return updated;
    });
  }, [jobs]);

  const handleUpdateApplicationDueDate = (appId: string, dueDate: string) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, dueDate } : app));
    setToast({ message: "Task deadline synchronized.", type: 'success' });
  };

  const handleAcceptStatusChange = (appId: string) => {
    setApplications(prev => {
      const app = prev.find(a => a.id === appId);
      if (!app || !app.proposedStatus) return prev;
      
      const newStatus = app.proposedStatus;
      const updated = prev.map(a => a.id === appId ? { 
        ...a, 
        status: newStatus, 
        proposedStatus: undefined,
        statusHistory: [...(a.statusHistory || []), { status: newStatus, date: new Date().toISOString() }]
      } : a);
      
      const job = jobs.find(j => j.id === app.jobId);
      if (job) {
        setToast({ message: `Stage advancement to ${newStatus.replace('-', ' ')} accepted.`, type: 'success' });
        // Notify employer
        console.log(`[NOTIFICATION] To Employer: Seeker ${user.name} accepted move to ${newStatus} for ${job.title}`);
      }
      return updated;
    });
  };

  const handleDeclineStatusChange = (appId: string) => {
    setApplications(prev => {
      const app = prev.find(a => a.id === appId);
      if (!app || !app.proposedStatus) return prev;
      
      const declinedStatus = app.proposedStatus;
      const updated = prev.map(a => a.id === appId ? { ...a, proposedStatus: undefined } : a);
      
      const job = jobs.find(j => j.id === app.jobId);
      if (job) {
        setToast({ message: `Stage advancement to ${declinedStatus.replace('-', ' ')} declined.`, type: 'info' });
        // Notify employer
        console.log(`[NOTIFICATION] To Employer: Seeker ${user.name} declined move to ${declinedStatus} for ${job.title}`);
      }
      return updated;
    });
  };

  const handleOnboardingComplete = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setToast({ message: "Neural Profile Calibration Complete", type: 'success' });
    
    // Save to backend
    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
    }
  };

  const employerJobs = useMemo(() => 
    jobs.filter(j => j.company === (user.companyName || user.name)), 
  [jobs, user]);

  const employerTests = useMemo(() => 
    aptitudeTests.filter(t => employerJobs.some(j => j.id === t.jobId)), 
  [aptitudeTests, employerJobs]);

  const isDetailActive = !!(detailedJob || activeCompanyProfile);

  const showOnboarding = user.email && !user.profileCompleted && !user.isAdmin && !user.opRole;

  if (hasApiKey === false) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a4179] p-4">
        <div className="glass-premium max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-[#F0C927]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-[#F0C927]" />
          </div>
          <h1 className="text-3xl font-black text-white">API Key Required</h1>
          <p className="text-xl text-white/70 leading-relaxed">
            To enable AI-powered matching, CV parsing, and career coaching, you need to select a valid Gemini API key.
          </p>
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-5 text-xs text-left text-white mb-4 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="font-black uppercase tracking-widest">Critical: Origin Restriction Detected</p>
            </div>
            <div className="leading-relaxed opacity-90">
              The <span className="text-red-400 font-bold">"Origin not allowed"</span> error means your API key has domain restrictions that prevent it from working on this URL.
              <br /><br />
              <strong className="text-red-400">How to fix:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline">Google Cloud Console</a>.</li>
                <li>Edit your API Key.</li>
                <li>Under <span className="font-bold">"Website restrictions"</span>, either remove all restrictions or add this domain: <span className="bg-black/40 px-1 rounded">{window.location.hostname}</span></li>
                <li>Alternatively, select a key from a <span className="underline">paid project</span> with no restrictions.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-sm text-left border border-white/10">
            <p className="text-white/50 mb-2 font-medium uppercase tracking-wider text-[10px]">Setup Instructions</p>
            <ol className="list-decimal list-inside space-y-2 text-white/70">
              <li>Click the button below to open the key selector.</li>
              <li>Select a paid Google Cloud project key.</li>
              <li>Ensure billing is enabled for the project.</li>
            </ol>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-[#F0C927] hover:underline flex items-center gap-1"
            >
              Billing Documentation <Globe className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 px-6 bg-[#F0C927] text-[#0a4179] font-bold rounded-xl hover:bg-[#F0C927]/90 transition-all shadow-lg shadow-[#F0C927]/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a4179]">
      <Background3D />
      
      {showAuthGate && !isAuthenticated ? (
        <AuthGate 
          initialRole={authGateRole}
          onSelectSeeker={(signedInUser) => {
            setUser(signedInUser);
            setView('seeker');
            setShowAuthGate(false);
            // Onboarding will trigger automatically because profileCompleted is false
          }}
          onSelectEmployer={(signedInUser) => {
            setUser(signedInUser);
            setView('employer-profile');
            setShowAuthGate(false);
          }}
          onSignIn={() => {
            setView('signin');
            setShowAuthGate(false);
          }}
          onBack={() => setShowAuthGate(false)}
        />
      ) : null}

      {showOnboarding && (
        <OnboardingWizard 
          user={user} 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {showVerificationModal && user && (
        <CompanyVerificationModal 
          user={user} 
          onClose={() => setShowVerificationModal(false)} 
          onVerified={(updated) => {
            setUser(updated);
            setShowVerificationReminder(false);
          }} 
        />
      )}

      {showVerificationReminder && user?.isEmployer && !user.isVerified && view === 'employer' && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-right duration-500">
          <div className="glass-premium border border-[#F0C927]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#F0C927] group-hover:scale-110 transition-transform">
              <ShieldCheck size={80} />
            </div>
            <button 
              onClick={() => setShowVerificationReminder(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0C927]/20 flex items-center justify-center text-[#F0C927]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black tracking-tighter uppercase text-sm">Verify Your Company</h3>
                  <p className="text-[10px] text-[#F0C927] font-bold uppercase tracking-widest">Action Required</p>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Complete your verification to unlock unlimited job postings, 28-day listings, and a verified badge.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowVerificationModal(true)}
                  className="flex-1 py-3 bg-[#F0C927] text-[#0a213f] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Verify Now
                </button>
                <button 
                  onClick={() => setShowVerificationReminder(false)}
                  className="px-4 py-3 bg-white/5 text-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Layout 
        view={view} 
        setView={handleNavClick} 
        user={user}
        onLogout={handleLogout}
        onFilterBlog={setBlogCategory}
        currentBlogCategory={blogCategory}
      >
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        {isMatching && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <Loader2 size={64} className="text-[#F0C927] animate-spin" />
              <Sparkles size={24} className="absolute inset-0 m-auto text-[#41d599] animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-widest">Neural Calibration</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Gemini is analyzing market fit for {user.name}...</p>
            </div>
          </div>
        )}

        {view === 'home' && (
          <Home 
            onSeekerSignUp={() => { setAuthGateRole('seeker'); setShowAuthGate(true); }} 
            onEmployerSignUp={() => { setAuthGateRole('employer'); setShowAuthGate(true); }} 
            onSeekerSignIn={() => { setSignInIsEmployer(false); setView('signin'); }}
            onEmployerSignIn={() => { setSignInIsEmployer(true); setView('signin'); }}
            onViewCompany={(name) => setActiveCompanyProfile(name)}
            onNavigateToModule={(v) => handleNavClick(v)}
            onNavigateToBlog={() => setView('blog')}
            premiumJobs={jobs.filter(j => j.isPremium)} 
          />
        )}

        {view === 'blog' && (
          <Blog 
            user={user} 
            category={blogCategory} 
            jobs={jobs} 
            applications={applications} 
          />
        )}

        {view === 'notifications' && !isDetailActive && (
          <Notifications 
            user={user} 
            onNavigate={(v, p) => {
              if (v === 'job-details' && p) {
                handleSelectDetailedJob(p);
              } else {
                setView(v);
              }
            }}
            onMarkAsRead={markNotificationAsRead}
            onDelete={deleteNotification}
            onBack={() => setView(user.isEmployer ? 'employer' : 'seeker')}
          />
        )}

        {view === 'seeker' && !isDetailActive && (
          <div className="space-y-6">
            <SeekerFeed 
              jobs={jobs} 
              user={user} 
              applications={applications}
              isLoading={isLoadingJobs}
              onSelectJob={handleSelectDetailedJob} 
              onInspectMatch={handleInspectMatch} 
              onApply={handleApplyRequest}
              onViewCompany={setActiveCompanyProfile}
              onToggleAutoApply={handleToggleAutoApply}
              onNavigateToBlog={() => setView('blog')}
              onOpenAlerts={(k, l, s) => {
                if(requireAuth("create job alerts", 'seeker')) {
                  setAlertDefaults({ keywords: k, location: l, minSalary: s });
                  setShowJobJobAlerts(true);
                }
              }}
            />
          </div>
        )}

        {view === 'seeker-insights' && !isDetailActive && (
          <SeekerAnalytics 
            user={user} 
            applications={applications} 
            onViewOverseas={() => {
              setView('seeker');
              setToast({ message: "Showing Global Market Opportunities", type: 'info' });
            }}
            onBack={() => setView('seeker')}
          />
        )}

        {(detailedJob && !activeCompanyProfile) && (
          <JobDetails 
            job={detailedJob} 
            allJobs={jobs} 
            user={user} 
            applications={applications} 
            onBack={() => { setDetailedJob(null); setEditingJob(null); }} 
            onApply={handleApplyRequest} 
            onSelectJob={handleSelectDetailedJob} 
            onInspectMatch={handleInspectMatch} 
            onViewCompany={setActiveCompanyProfile} 
            onLaunchCoach={() => {
              if (requireAuth("access the AI Career Coach", 'seeker')) {
                setShowCoach(true);
              }
            }} 
            onTakeTest={handleLaunchAssessment} 
            onEdit={handleEditJob}
            isAdminView={view.startsWith('admin')}
          />
        )}

        {activeCompanyProfile && (
          <CompanyProfileView
            companyName={activeCompanyProfile}
            allJobs={jobs}
            employerProfile={
              user.companyName === activeCompanyProfile ? user : undefined
            }
            onBack={() => setActiveCompanyProfile(null)}
            onSelectJob={(j) => {
              handleSelectDetailedJob(j);
              setActiveCompanyProfile(null);
            }}
            onViewCompany={(name) => setActiveCompanyProfile(name)}
            onApply={(job) => {
              handleApplyRequest(job);
            }}
          />
        )}

        {view === 'seeker-applications' && !isDetailActive && (
          <SeekerApplications 
            applications={applications} 
            jobs={jobs} 
            onSelectJob={handleSelectDetailedJob} 
            onViewCompany={setActiveCompanyProfile} 
            onBack={() => setView('seeker')} 
            onAcceptStatus={handleAcceptStatusChange} 
            onDeclineStatus={handleDeclineStatusChange}
            onUpdateApplicationDueDate={handleUpdateApplicationDueDate}
          />
        )}
        {view === 'cv-prep' && !isDetailActive && <CVPrep user={user} setUser={setUser} jobs={jobs} onBack={() => setView('seeker')} />}
        {view === 'interview-prep' && !isDetailActive && <InterviewPrep user={user} jobs={jobs} onBack={() => setView('seeker')} />}
        
        {view === 'employer' && !isDetailActive && <JobManagement activeTab="overview" jobs={employerJobs} user={user} applications={applications} onUpdateApplicationStatus={handleUpdateApplicationStatus} onUpdateApplicationDueDate={handleUpdateApplicationDueDate} onUpdateJobStatus={handleUpdateJobStatus} onUpgradeJob={handleUpgradeJob} onDeleteJob={handleDeleteJob} onPostJob={handlePostJob} onUpgradeRequest={handleUpgradeJob} autoOpenCreate={autoOpenJobCreate} onSelectJob={handleSelectDetailedJob} initialJobData={editingJob} onNavigateToBlog={() => setView('blog')} onCloseModal={() => { setEditingJob(null); }} />}
        {view === 'employer-management' && !isDetailActive && <JobManagement activeTab="listings" jobs={employerJobs} user={user} applications={applications} onUpdateApplicationStatus={handleUpdateApplicationStatus} onUpdateApplicationDueDate={handleUpdateApplicationDueDate} onUpdateJobStatus={handleUpdateJobStatus} onUpgradeJob={handleUpgradeJob} onDeleteJob={handleDeleteJob} onPostJob={handlePostJob} onUpgradeRequest={handleUpgradeJob} autoOpenCreate={autoOpenJobCreate} onSelectJob={handleSelectDetailedJob} initialJobData={editingJob} onNavigateToBlog={() => setView('blog')} onCloseModal={() => { setEditingJob(null); }} />}
        {view === 'employer-aptitude' && !isDetailActive && <AptitudeTestManager user={user} jobs={employerJobs} tests={employerTests} applications={applications} onSaveTest={(test) => setAptitudeTests(prev => [...prev, test])} onDeployTest={(jobId, testId) => setJobs(prev => prev.map(j => j.id === jobId ? { ...j, aptitudeTestId: testId } : j))} />}
        {view === 'employer-org' && !isDetailActive && <OrganizationManagement user={user} onAddSubUser={handleAddSubUser} onRemoveSubUser={handleRemoveSubUser} onAddSubsidiary={handleAddSubsidiary} onViewCompany={setActiveCompanyProfile} />}
        {view === 'employer-live-jobs' && !isDetailActive && (
          <div className="space-y-6">
            <SeekerFeed 
              jobs={jobs} 
              user={user} 
              applications={applications}
              isLoading={isLoadingJobs}
              onSelectJob={handleSelectDetailedJob} 
              onInspectMatch={handleInspectMatch} 
              onApply={() => {}}
              onViewCompany={setActiveCompanyProfile}
              onToggleAutoApply={() => {}}
              onOpenAlerts={() => {}}
              onNavigateToBlog={() => setView('blog')}
              isReadOnly={true}
            />
          </div>
        )}
        {view === 'services' && !isDetailActive && <ProductsAndServices user={user} onUpgradeRequest={() => { setToast({ message: "All features currently active (Free Tier)", type: 'info' }) }} />}
        
        {view === 'hrm-landing' && <ComingSoonLanding module="hrm" onBack={() => setView('home')} />}
        {view === 'payroll-landing' && <ComingSoonLanding module="payroll" onBack={() => setView('home')} />}
        {view === 'vendor-landing' && <ComingSoonLanding module="vendor" onBack={() => setView('home')} />}

        {view === 'admin' && !isDetailActive && <AdminDashboard user={user} jobs={jobs} applications={applications} transactions={GLOBAL_TRANSACTIONS} onBack={() => setView('home')} pendingVerifications={pendingVerifications} onVerifyEmployer={handleVerifyEmployer} onApproveJob={() => {}} onUpdateApplicationStatus={handleUpdateApplicationStatus} onUpdateApplicationDueDate={handleUpdateApplicationDueDate} onUpdateJobStatus={handleUpdateJobStatus} onDeleteJob={handleDeleteJob} onPostJob={handlePostJob} onNavigateToBlog={() => setView('blog')} onSelectJob={handleSelectDetailedJob} />}
        {view === 'admin-jobs' && !isDetailActive && (
          <JobManagement
            jobs={jobs}
            user={user}
            applications={applications}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateApplicationDueDate={handleUpdateApplicationDueDate}
            onUpdateJobStatus={handleUpdateJobStatus}
            onUpgradeJob={handleUpgradeJob}
            onDeleteJob={handleDeleteJob}
            onPostJob={handlePostJob}
            onUpgradeRequest={handleUpgradeJob}
            activeTab="listings"
            onSelectJob={handleSelectDetailedJob}
            onNavigateToBlog={() => setView('blog')}
          />
        )}
        {view === 'admin-staff' && !isDetailActive && <AdminDashboard user={user} jobs={jobs} applications={applications} transactions={GLOBAL_TRANSACTIONS} onBack={() => setView('home')} pendingVerifications={pendingVerifications} onVerifyEmployer={handleVerifyEmployer} onApproveJob={() => {}} onUpdateApplicationStatus={handleUpdateApplicationStatus} onUpdateApplicationDueDate={handleUpdateApplicationDueDate} onUpdateJobStatus={handleUpdateJobStatus} onDeleteJob={handleDeleteJob} onPostJob={handlePostJob} onNavigateToBlog={() => setView('blog')} onSelectJob={handleSelectDetailedJob} initialTab="staff" />}
        {view === 'profile' && !isDetailActive && (() => {
          const params = new URLSearchParams(window.location.search);
          const appId = params.get('appId');
          const viewingApp = appId ? applications.find(a => a.id === appId) : null;
          const profileUser = viewingApp?.candidateProfile ? { ...viewingApp.candidateProfile, isReadOnly: true } : user;
          
          return (
            <Profile 
              user={profileUser as UserProfile} 
              setUser={appId ? () => {} : setUser} 
              jobs={jobs} 
              onBack={() => setView(user.isEmployer ? 'employer' : user.isAdmin ? 'admin' : 'seeker')} 
            />
          );
        })()}
        {view === 'settings' && !isDetailActive && <Settings user={user} setUser={setUser} onUpgradeRequest={() => {}} onBack={() => setView('seeker')} />}
        {view === 'signin' && <SignIn onSignIn={handleSignIn} onBack={() => setView('home')} initialIsEmployer={signInIsEmployer} initialShowStaffPortal={signInIsStaff} onStaffPortalToggle={setSignInIsStaff} />}
        {view === 'employer-profile' && !isDetailActive && <EmployerProfile user={user} setUser={setUser} onViewCompany={(name) => setActiveCompanyProfile(name)} onAddSubsidiary={handleAddSubsidiary} onComplete={() => setView('employer')} onBack={() => setView('employer')} />}

        {showJobAlerts && (
          <JobAlertsModal 
            alerts={user.alerts || []} 
            onSave={handleSaveAlert} 
            onDelete={handleDeleteAlert} 
            onClose={() => setShowJobJobAlerts(false)}
            initialKeywords={alertDefaults.keywords}
            initialLocation={alertDefaults.location}
          />
        )}
        {inspectJob && <MatchDetails job={inspectJob} onClose={() => setInspectJob(null)} />}
        
        {applyingJob && (
          <VideoRecorder 
            onComplete={handleVideoComplete} 
            onCancel={() => setApplyingJob(null)} 
          />
        )}

        {activeTestJob && (
          <AptitudeTestPlayer 
            test={aptitudeTests.find(t => t.id === activeTestJob.aptitudeTestId)}
            onComplete={handleTestComplete}
            onCancel={() => setActiveTestJob(null)}
          />
        )}

        <CareerCoach user={user} isSubscribed={true} onUpgrade={() => {}} currentJob={detailedJob} isOpen={showCoach} setIsOpen={setShowCoach} />

        {showWelcomeEmail && (
          <WelcomeEmailModal 
            userName={user.name} 
            onClose={() => setShowWelcomeEmail(false)}
            onAction={(targetView) => {
              setShowWelcomeEmail(false);
              setView(targetView);
              if (targetView === 'seeker') {
                setAlertDefaults({ keywords: '', location: '', minSalary: 0 });
                setShowJobJobAlerts(true);
              }
            }}
          />
        )}

      </Layout>
    </div>
  );
};

export default App;
