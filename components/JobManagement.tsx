// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Users,
  Briefcase,
  ChevronRight,
  BarChart3,
  Filter,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Play,
  ArrowLeft,
  Crown,
  Clock,
  Calendar,
  MapPin,
  Power,
  PowerOff,
  ArrowUpCircle,
  FileText,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  Banknote,
  ShieldCheck,
  Mail,
  Download,
  FileArchive,
  Loader2,
  LayoutGrid,
  List,
  TrendingUp,
  PieChart,
  Activity,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  X,
  Sparkles,
  Zap,
  Lock,
  Target,
  ExternalLink,
  Globe,
  AlertCircle,
  FileStack,
  ClipboardList,
  Package,
  CreditCard,
  CheckCircle,
  ArrowUpRight,
  Wand2,
  RefreshCw,
  DollarSign,
  ChevronDown,
  Linkedin,
  MessageCircle,
  Phone,
  Smartphone,
  User as UserIcon,
  Megaphone,
  BadgeCheck,
  Check,
  Send,
  Archive,
  Layers,
  Star,
  GraduationCap,
  Building2,
  History,
  Plus,
  Heart,
  Coins,
  Building,
  Shield,
  Map,
  Locate,
  MapPinned,
  Gift,
  Gem,
  AlertTriangle,
  Edit,
  UserCheck2,
  CheckSquare,
  Square,
  Info,
  Upload,
  Brain,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import {
  Job,
  Application,
  ApplicationStatus,
  UserProfile,
  Transaction,
} from "../types";
import {
  isJobActuallyActive,
  ORGANIZATION_TYPES,
  EMPLOYMENT_TYPES,
  JOB_RANKS,
  BENEFITS,
} from "../constants";
import {
  ALL_COUNTRIES,
  REGIONS_BY_COUNTRY,
  GENDER_OPTIONS,
  AGE_RANGES,
  RACE_OPTIONS,
  DISABILITY_OPTIONS,
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  VETERAN_STATUS_OPTIONS,
  POST_SALARY_RANGES,
  COUNTRY_CURRENCY_SYMBOLS,
  GLOBAL_CURRENCIES,
  INDUSTRIES
} from "../constants";
import Toast from "./Toast";
import EmployerAnalytics from "./EmployerAnalytics";
import Profile from "./Profile";
import {
  generateJobSection,
  parseJobDescription,
  generateFullJobManifest,
} from "../services/geminiService";

const CATEGORIES = [
  "Formal Jobs",
  "Skilled Labour",
  "Gig Work",
  "Growth & StartUps",
];
const JOB_LOCATION_TYPES = ["Remote", "Onsite", "Hybrid"];
const SALARY_STRUCTURES = ["Fixed", "Commission Only", "Commission + Salary"];
const AVAILABILITY_OPTIONS = [
  "Immediate",
  "Within 2 Weeks",
  "1 Month Notice",
  "Negotiable",
  "Specific Date",
];
const ELIGIBILITY_PROTOCOLS = [
  "Global (No Restriction)",
  "Specific Country Only",
  "EMEA (Europe, Middle East, Africa)",
  "SWANA (South West Asia & North Africa)",
  "MENA (Middle East & North Africa)",
  "MENAP (Middle East, North Africa, Afghanistan, Pakistan)",
  "WANA (West Asia & North Africa)",
  "North Africa",
  "West Africa",
  "Central Africa",
  "East Africa",
  "Southern Africa",
  "Sub-Saharan Africa",
  "APAC (Asia Pacific)",
  "ASEAN (Southeast Asia)",
  "South Asia",
  "East Asia",
  "Central Asia",
  "North America",
  "LATAM (Latin America)",
  "South America",
  "Central America & Caribbean",
  "European Union (EU)",
  "Nordics",
  "DACH (DE, AT, CH)",
  "Benelux",
  "Oceania",
];

interface JobManagementProps {
  jobs: Job[];
  user: UserProfile;
  applications: Application[];
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onUpdateApplicationDueDate: (appId: string, dueDate: string) => void;
  onUpdateJobStatus: (
    jobId: string,
    status: "active" | "closed" | "draft",
  ) => void;
  onUpgradeJob: (jobId: string) => void;
  onUpgradeRequest: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onPostJob: (job: Job) => void;
  onCloseModal?: () => void;
  autoOpenCreate?: boolean;
  activeTab?: "overview" | "listings";
  onSelectJob?: (job: Job) => void;
  initialJobData?: Job | null;
  onNavigateToBlog?: () => void;
}

const calculateYears = (start?: string, end?: string) => {
  if (!start) return 0;
  const s = parseInt(start);
  const e = end ? parseInt(end) : new Date().getFullYear();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(0, e - s);
};

const JobManagement: React.FC<JobManagementProps> = ({
  jobs,
  user,
  applications,
  onUpdateApplicationStatus,
  onUpdateApplicationDueDate,
  onUpdateJobStatus,
  onUpgradeJob,
  onDeleteJob,
  onPostJob,
  onUpgradeRequest,
  onCloseModal,
  autoOpenCreate = false,
  activeTab = "overview",
  onSelectJob,
  initialJobData,
  onNavigateToBlog,
}) => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(autoOpenCreate);
  const [modalStep, setModalStep] = useState<"form" | "preview">("form");
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [viewingJobApplicants, setViewingJobApplicants] = useState<Job | null>(
    null,
  );
  const [reviewingApplicant, setReviewingApplicant] =
    useState<Application | null>(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [listStatusFilter, setListStatusFilter] = useState<
    "all" | "active" | "closed" | "draft"
  >("all");
  const [sortField, setSortField] = useState<"status" | "title" | "company">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [applicantViewMode, setApplicantViewMode] = useState<'list' | 'kanban'>('list');
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadFilter, setDownloadFilter] = useState<
    ApplicationStatus | "all"
  >("all");
  const [isUploadingJD, setIsUploadingJD] = useState(false);
  const jdUploadRef = useRef<HTMLInputElement>(null);

  const [tempCountry, setTempCountry] = useState("");
  const [tempRegions, setTempRegions] = useState<string[]>([]);
  const [deploymentManifest, setDeploymentManifest] = useState<
    { country: string; region: string }[]
  >([]);

  const [isCustomSalary, setIsCustomSalary] = useState(false);
  const [salaryRaw, setSalaryRaw] = useState("");
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("USD");

  const [newJob, setNewJob] = useState<Partial<Job>>(
    initialJobData || {
      title: "",
      category: "Formal Jobs",
      city: "",
      country: "USA",
      salary: "",
      salaryStructure: "Fixed",
      location: "Remote",
      roleDefinition: "",
      description: "",
      responsibilities: "",
      requirements: "",
      benefits: [],
      applicationType: "in-app",
      employmentType: "Full-time",
      organizationType: "Private",
      jobRank: "Entry Level",
      allowedCountries: ["Global (No Restriction)"],
      targetGender: "Any",
      targetRace: "Any",
      targetReligion: "Any",
      availabilityRequirement: "Immediate",
      idealCandidateDefinition: "",
      industry: "",
      externalApplyUrl: "",
      tags: [],
    },
  );

  useEffect(() => {
    if (newJob.country) {
      const match = GLOBAL_CURRENCIES.find((c) =>
        c.label.includes(newJob.country!),
      );
      if (match) setSelectedCurrencyCode(match.code);
    }
  }, [newJob.country]);

  useEffect(() => {
    if (newJob.salary) {
      const activeSymbol =
        GLOBAL_CURRENCIES.find((c) => c.code === selectedCurrencyCode)
          ?.symbol || "$";
      const stripped = newJob.salary.replace(activeSymbol, "").trim();
      const inDropdown = POST_SALARY_RANGES.includes(stripped);
      setIsCustomSalary(!inDropdown);
      setSalaryRaw(stripped);
    }
  }, [newJob.salary, selectedCurrencyCode]);

  const handleCreateJobClick = () => {
    const hasName = !!user?.companyName;
    const hasLocation = !!user?.city && !!user?.country;
    const hasPhone = !!user?.companyContactPhone || !!(user?.phoneNumbers && user.phoneNumbers.length > 0);
    const hasEmail = !!user?.companyContactEmail || !!user?.email;
    const hasIndustry = !!user?.industry;
    const hasCompanyUser = !!user?.subUsers?.length || !!user?.name;

    if (!hasName || !hasLocation || !hasPhone || !hasEmail || !hasIndustry || !hasCompanyUser) {
      setToast({
        message: "Mandatory company profile information (Name, Location, Phone, Email, Industry, and at least one company user) is required to post a job.",
        type: "error"
      });
      return;
    }
    setIsCreatingJob(true);
  };

  useEffect(() => {
    if (autoOpenCreate) {
      handleCreateJobClick();
      setModalStep("form");
    }
  }, [autoOpenCreate]);

  useEffect(() => {
    if (initialJobData) {
      setNewJob({
        ...initialJobData,
        roleDefinition:
          initialJobData.roleDefinition || initialJobData.description || "",
        benefits: initialJobData.benefits || [],
      });
      handleCreateJobClick();
    }
  }, [initialJobData]);

  const handleReviewApplicant = (app: Application) => {
    if (app.status === "applied") {
      onUpdateApplicationStatus(app.id, "viewed");
    }
    setReviewingApplicant(app);
  };

  const handleUpdateStatus = (appId: string, status: ApplicationStatus) => {
    setIsUpdatingStatus(true);
    setTimeout(() => {
      onUpdateApplicationStatus(appId, status);
      setIsUpdatingStatus(false);
      setReviewingApplicant(null);
    }, 1500);
  };

  const handleBulkDownload = () => {
    if (!viewingJobApplicants) return;
    const relevantApps = applications.filter((a) => {
      const isCorrectJob = a.jobId === viewingJobApplicants.id;
      const matchesFilter =
        downloadFilter === "all" || a.status === downloadFilter;
      return isCorrectJob && matchesFilter;
    });
    if (relevantApps.length === 0) {
      setToast({ message: `No candidates found for export.`, type: "error" });
      return;
    }
    setIsBulkDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsBulkDownloading(false);
            setToast({ message: `Talent Pack Exported.`, type: "success" });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const isFormComplete = useMemo(() => {
    const sectionIValid = !!(newJob.title && newJob.category && newJob.jobRank && newJob.industry);
    const hasModalityConfig =
      newJob.location === "Onsite"
        ? !!newJob.country && !!newJob.city
        : newJob.allowedCountries?.[0] !== "Specific Country Only" ||
          deploymentManifest.length > 0;
    const sectionIIValid = !!(
      newJob.employmentType &&
      newJob.organizationType &&
      newJob.location &&
      newJob.allowedCountries?.[0] &&
      hasModalityConfig
    );
    const sectionIIIValid = !!(
      selectedCurrencyCode &&
      salaryRaw &&
      newJob.salaryStructure &&
      newJob.availabilityRequirement
    );
    const sectionVValid = !!(newJob.description && newJob.responsibilities && newJob.requirements);
    const sectionVIIValid = newJob.applicationType === "external" ? !!newJob.externalApplyUrl : true;
    return sectionIValid && sectionIIValid && sectionIIIValid && sectionVValid && sectionVIIValid;
  }, [newJob, deploymentManifest, selectedCurrencyCode, salaryRaw]);

  const handleAISupport = async (
    field: "definition" | "responsibilities" | "requirements" | "summary" | "full_rewrite",
  ) => {
    if (!newJob.title) {
      setToast({ message: "Professional title required.", type: "error" });
      return;
    }
    setIsGenerating((prev) => ({ ...prev, [field]: true }));
    try {
      const result = await generateJobSection(
        field,
        newJob.title,
        user.companyName || user.name,
      );
      if (field === "definition")
        setNewJob((prev) => ({ ...prev, roleDefinition: result }));
      else if (field === "summary")
        setNewJob((prev) => ({ ...prev, description: result }));
      else if (field === "responsibilities")
        setNewJob((prev) => ({ ...prev, responsibilities: result }));
      else if (field === "requirements")
        setNewJob((prev) => ({ ...prev, requirements: result }));
      setToast({
        message: "Job details generated.",
        type: "success",
      });
    } catch (err) {
      setToast({ message: "AI generation failed.", type: "error" });
    } finally {
      setIsGenerating((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleFullAIGeneration = async () => {
    if (!newJob.title) {
      setToast({
        message: "Professional title required for AI Assistant.",
        type: "error",
      });
      return;
    }

    setIsGenerating((prev) => ({ ...prev, full: true }));
    try {
      const result = await generateFullJobManifest(
        newJob.title,
        user.companyName || user.name,
        user.companyBio || "A leading organization in its sector.",
      );

      setNewJob((prev) => ({
        ...prev,
        description: result.description,
        responsibilities: result.responsibilities,
        requirements: result.requirements,
      }));

      setToast({ message: "Job description generated successfully.", type: "success" });
    } catch (err) {
      setToast({ message: "AI Assistant failed to generate content.", type: "error" });
    } finally {
      setIsGenerating((prev) => ({ ...prev, full: false }));
    }
  };

  const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingJD(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const parsedData = await parseJobDescription({
            base64,
            mimeType: file.type,
          });
          setNewJob((prev) => ({ ...prev, ...parsedData }));
          setToast({
            message: "Job description parsed successfully.",
            type: "success",
          });
        } catch (err) {
          console.error("JD parsing error:", err);
          setToast({
            message: "Error parsing job description. Please use PDF or TXT.",
            type: "error",
          });
        } finally {
          setIsUploadingJD(false);
        }
      };
      reader.onerror = () => {
        setToast({ message: "File read error.", type: "error" });
        setIsUploadingJD(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setToast({
        message: "Upload initialization failed.",
        type: "error",
      });
      setIsUploadingJD(false);
    } finally {
      if (jdUploadRef.current) jdUploadRef.current.value = "";
    }
  };

  const addDeploymentLocale = () => {
    if (!tempCountry || tempRegions.length === 0) return;
    const newLocales = tempRegions.map((r) => ({
      country: tempCountry,
      region: r,
    }));
    const filteredNewLocales = newLocales.filter(
      (nl) =>
        !deploymentManifest.some(
          (dm) => dm.country === nl.country && dm.region === nl.region,
        ),
    );
    if (filteredNewLocales.length === 0) {
      setToast({
        message: "Selected locales already added to manifest.",
        type: "info",
      });
      return;
    }
    setDeploymentManifest([...deploymentManifest, ...filteredNewLocales]);
    setTempRegions([]);
  };

  const toggleTempRegion = (region: string) => {
    setTempRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region],
    );
  };

  const removeDeploymentLocale = (idx: number) => {
    setDeploymentManifest(deploymentManifest.filter((_, i) => i !== idx));
  };

  const handleSalaryChange = (val: string) => {
    if (val === "CUSTOM") {
      setIsCustomSalary(true);
      return;
    }
    const symbol =
      GLOBAL_CURRENCIES.find((c) => c.code === selectedCurrencyCode)?.symbol ||
      "$";
    setNewJob((prev) => ({ ...prev, salary: `${symbol} ${val}` }));
    setSalaryRaw(val);
  };

  const handleManualSalaryInput = (val: string) => {
    const symbol =
      GLOBAL_CURRENCIES.find((c) => c.code === selectedCurrencyCode)?.symbol ||
      "$";
    setNewJob((prev) => ({ ...prev, salary: `${symbol} ${val}` }));
    setSalaryRaw(val);
  };

  const handleSaveDraft = () => {
    const finalAllowed =
      newJob.allowedCountries?.[0] === "Specific Country Only"
        ? deploymentManifest.map((d) => `${d.country} (${d.region})`)
        : newJob.allowedCountries;
    const job: Job = {
      ...(newJob as Job),
      id: newJob.id || Math.random().toString(36).substr(2, 9),
      company: user.companyName || user.name,
      postedBy: user.name,
      postedAt: new Date().toISOString(),
      status: "draft",
      allowedCountries: finalAllowed,
    };
    onPostJob(job);
    setIsCreatingJob(false);
    setToast({ message: "Draft cached successfully.", type: "success" });
  };

  const handleProceedToPublication = () => {
    if (!isFormComplete) {
      setToast({
        message:
          "Please complete all mandatory sections (I, II, III, V) before deployment.",
        type: "error",
      });
      return;
    }
    setModalStep("preview");
  };

  const handlePublishListing = () => {
    const employerJobs = jobs.filter(j => j.postedBy === user.name || j.company === user.companyName);
    
    // Enforce 1-job limit for unverified employers
    if (!user.isVerified && employerJobs.length >= 1) {
      setToast({ 
        message: "Unverified companies can only post one job. Please verify your account to post more.", 
        type: "error" 
      });
      return;
    }

    const finalAllowed =
      newJob.allowedCountries?.[0] === "Specific Country Only"
        ? deploymentManifest.map((d) => `${d.country} (${d.region})`)
        : newJob.allowedCountries;

    // Set expiry date based on verification status
    const expiryDate = new Date();
    if (user.isVerified) {
      expiryDate.setDate(expiryDate.getDate() + 28);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 3);
    }

    const job: Job = {
      ...(newJob as Job),
      id: newJob.id || Math.random().toString(36).substr(2, 9),
      company: user.companyName || user.name,
      postedBy: user.name,
      postedAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: "active",
      allowedCountries: finalAllowed,
    };
    onPostJob(job);
    setIsCreatingJob(false);
    setToast({ 
      message: user.isVerified 
        ? "Listing published for 28 days." 
        : "Initial listing published for 3 days. Verification required for standard duration.", 
      type: "success" 
    });
  };

  const toggleBenefit = (benefit: string) => {
    setNewJob((prev) => {
      const current = prev.benefits || [];
      const updated = current.includes(benefit)
        ? current.filter((b) => b !== benefit)
        : [...current, benefit];
      return { ...prev, benefits: updated };
    });
  };

  const filteredManagementJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      if (listStatusFilter === "all") return true;
      return job.status === listStatusFilter;
    });

    result.sort((a, b) => {
      const valA = (a[sortField] || "").toLowerCase();
      const valB = (b[sortField] || "").toLowerCase();
      
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [jobs, listStatusFilter, sortField, sortDirection]);

  const availableRegions = useMemo(
    () => (tempCountry ? REGIONS_BY_COUNTRY[tempCountry] || [] : []),
    [tempCountry],
  );
  const activeCurrencySymbol = useMemo(
    () =>
      GLOBAL_CURRENCIES.find((c) => c.code === selectedCurrencyCode)?.symbol ||
      "$",
    [selectedCurrencyCode],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500 text-white pb-32 px-4 md:px-0">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {activeTab === "overview" ? (
        <EmployerAnalytics
          user={user}
          jobs={jobs}
          applications={applications}
        />
      ) : (
        <div className="space-y-4">
          {viewingJobApplicants ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <button
                  onClick={() => setViewingJobApplicants(null)}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors group w-fit"
                >
                  <ArrowLeft size={14} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Back to Listings
                  </span>
                </button>
                <div className="flex items-center gap-2 bg-[#0a4179]/40 p-1.5 rounded-2xl border border-white/5 shadow-lg">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                    <button 
                      onClick={() => setApplicantViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${applicantViewMode === 'list' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                      title="List View"
                    >
                      <List size={14} />
                    </button>
                    <button 
                      onClick={() => setApplicantViewMode('kanban')}
                      className={`p-1.5 rounded-lg transition-all ${applicantViewMode === 'kanban' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                      title="Pipeline View"
                    >
                      <LayoutGrid size={14} />
                    </button>
                  </div>
                  <select
                    value={downloadFilter}
                    onChange={(e) => setDownloadFilter(e.target.value as ApplicationStatus | "all")}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase text-white outline-none"
                  >
                    <option value="all" className="bg-[#0a4179]">All Statuses</option>
                    <option value="applied" className="bg-[#0a4179]">Applied</option>
                    <option value="viewed" className="bg-[#0a4179]">Viewed</option>
                    <option value="shortlisted" className="bg-[#0a4179]">Shortlisted</option>
                    <option value="assessment" className="bg-[#0a4179]">Assessment</option>
                    <option value="interview-invitation" className="bg-[#0a4179]">Interview Invite</option>
                    <option value="selected" className="bg-[#0a4179]">Selected</option>
                    <option value="final-interview" className="bg-[#0a4179]">Final Interview</option>
                    <option value="offer-letter" className="bg-[#0a4179]">Offer Letter</option>
                    <option value="salary-negotiating" className="bg-[#0a4179]">Negotiating</option>
                    <option value="approval" className="bg-[#0a4179]">Approval</option>
                    <option value="hired" className="bg-[#0a4179]">Hired</option>
                    <option value="rejected" className="bg-[#0a4179]">Rejected</option>
                  </select>
                  <button
                    onClick={handleBulkDownload}
                    disabled={isBulkDownloading}
                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-[#41d599] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    {isBulkDownloading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <FileArchive size={12} />
                    )}
                    {isBulkDownloading
                      ? `Compiling ${downloadProgress}%`
                      : `Download Pack`}
                  </button>
                </div>
              </div>
              {applicantViewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-3">
                  {applications
                    .filter((a) => a.jobId === viewingJobApplicants.id)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="glass-premium group transition-all duration-500 rounded-2xl p-4 border flex flex-col md:flex-row items-center gap-3 shadow-xl relative overflow-hidden hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1.5 h-full ${app.status === "rejected" ? "bg-red-500/40" : "bg-[#F0C927]"}`}
                        ></div>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#0a4179] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <img
                              src={
                                app.candidateProfile?.profileImages[0] ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.candidateProfile?.name}`
                              }
                              alt=""
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black truncate tracking-tight">
                              {app.candidateProfile?.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
                              <span className="flex items-center gap-1 text-[#F0C927]">
                                <Briefcase size={10} />{" "}
                                {app.candidateProfile?.role}
                              </span>
                              <span className="flex items-center gap-1 text-[#41d599]">
                                <Zap size={10} />{" "}
                                {app.matchScore
                                  ? `${app.matchScore}% Match`
                                  : "Analyzing Fit..."}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleReviewApplicant(app)}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-[#F0C927] hover:text-[#0a4179] transition-all duration-300 shadow-lg"
                        >
                          Review Application
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar min-h-[500px]">
                  {[
                    { title: 'New', statuses: ['applied', 'viewed'], color: 'bg-blue-500' },
                    { title: 'Shortlisted', statuses: ['shortlisted', 'assessment'], color: 'bg-[#F0C927]' },
                    { title: 'Interview', statuses: ['interview-invitation', 'selected', 'final-interview'], color: 'bg-purple-500' },
                    { title: 'Offer', statuses: ['offer-letter', 'salary-negotiating', 'approval'], color: 'bg-orange-500' },
                    { title: 'Hired', statuses: ['hired'], color: 'bg-[#41d599]' },
                    { title: 'Rejected', statuses: ['rejected'], color: 'bg-red-500' },
                  ].map((column, idx) => {
                    const columnApps = applications.filter(a => a.jobId === viewingJobApplicants.id && column.statuses.includes(a.status));
                    return (
                      <div key={idx} className="flex-shrink-0 w-72 flex flex-col gap-3">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">{column.title}</h3>
                          </div>
                          <span className="text-[10px] font-black text-white/20">{columnApps.length}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 p-2 rounded-[1.5rem] bg-white/[0.02] border border-white/5 min-h-[200px]">
                          {columnApps.map(app => (
                            <div 
                              key={app.id}
                              onClick={() => handleReviewApplicant(app)}
                              className="glass-premium p-2 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg bg-[#0a4179] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  <img
                                    src={app.candidateProfile?.profileImages[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.candidateProfile?.name}`}
                                    alt=""
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-[9px] font-black truncate text-white/90">{app.candidateProfile?.name}</h4>
                                  <p className="text-[7px] font-bold text-white/30 truncate uppercase tracking-tighter">{app.candidateProfile?.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <div className="flex items-center gap-1 text-[7px] font-black text-[#41d599]">
                                  <Zap size={8} /> {app.matchScore || '??'}%
                                </div>
                                <div className="text-[7px] font-black text-white/20 uppercase">
                                  {new Date(app.appliedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#41d599] to-[#F0C927] flex items-center justify-center text-[#0a4179] shadow-lg">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-tighter uppercase text-white">
                        JOB POSTINGS
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Sort:</span>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as any)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/60 outline-none cursor-pointer hover:text-white transition-colors"
                    >
                      <option value="title" className="bg-[#0a4179]">Title</option>
                      <option value="status" className="bg-[#0a4179]">Status</option>
                      <option value="company" className="bg-[#0a4179]">Company</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                      title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                    >
                      {sortDirection === 'asc' ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    </button>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                    <button 
                      onClick={() => setViewMode('kanban')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                      title="Pipeline View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                  <button
                    onClick={handleCreateJobClick}
                    className="px-6 py-3 bg-[#F0C927] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    + New Vacancy
                  </button>
                </div>
              </div>

              {/* Pipeline Visualizer - Removed as per request */}
              <div className="hidden">
              </div>

              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-2">
                  {filteredManagementJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob?.(job)}
                      className={`glass-premium group transition-all duration-500 rounded-2xl p-4 border cursor-pointer flex items-center justify-between gap-2 shadow-xl relative overflow-hidden ${job.status === "draft" ? "border-white/5 opacity-60" : "border-white/5 hover:bg-white/[0.06] hover:border-white/10"}`}
                    >
                      <div
                        className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-2 ${job.status === "active" ? "bg-[#41d599]" : "bg-orange-400"}`}
                      ></div>
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-1">
                        <div className={`w-8 h-8 rounded-lg bg-[#0a4179] border-2 border-white/5 flex items-center justify-center font-black transition-all shrink-0 text-sm shadow-lg overflow-hidden ${job.status === "active" ? "text-[#F0C927] group-hover:scale-105" : "text-white/20"}`}>
                          {job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-black truncate leading-tight tracking-tight group-hover:text-[#41d599] transition-colors ${job.status === "active" ? "text-white" : "text-white/40"}`}>
                            {job.title}
                            {job.idNumber && (
                              <span className="ml-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                ID: {job.idNumber}
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/30">
                              <span className="flex items-center gap-1">
                                <MapPin size={10} /> {job.city}
                              </span>
                              {job.postedBy && (
                                <span className="flex items-center gap-1 text-blue-400">
                                  <Users size={10} /> {job.postedBy}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={10} className="text-[#F0C927]" /> {Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/30">
                              {job.expiryDate && (
                                <span className="flex items-center gap-1 text-orange-400">
                                  <Clock size={10} /> {Math.max(0, Math.ceil((new Date(job.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye size={10} /> {Math.floor(Math.random() * 500) + 100}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={10} /> {applications.filter(a => a.jobId === job.id).length} Applicants
                              </span>
                              <span className="flex items-center gap-1 text-[#F0C927]">
                                <Activity size={10} /> {job.matchScore || 82}%
                              </span>
                              <span className="flex items-center gap-1 text-blue-400">
                                <Brain size={10} /> AI
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                          {(["active", "closed", "draft"] as const).map(
                            (status) => {
                              const isRestrictedReopen = status === 'active' && job.status === 'closed' && 
                                (Date.now() - new Date(job.postedAt).getTime()) >= (28 * 24 * 60 * 60 * 1000);
                              
                              return (
                                <button
                                  key={status}
                                  disabled={isRestrictedReopen}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateJobStatus(job.id, status);
                                  }}
                                  title={isRestrictedReopen ? "Job cannot be re-opened as it ran for more than 28 days." : ""}
                                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${job.status === status ? "bg-[#F0C927] text-[#0a4179] shadow-md" : isRestrictedReopen ? "text-white/10 cursor-not-allowed" : "text-white/30 hover:text-white/60"}`}
                                >
                                  {status}
                                </button>
                              );
                            }
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {job.status === "active" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!job.isPremium) onUpgradeJob(job.id);
                              }}
                              className={`p-2 rounded-lg transition-all shadow-md ${job.isPremium ? 'bg-[#F0C927] text-[#0a4179] scale-110' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                              title={job.isPremium ? "Premium Active" : "Upgrade ($28)"}
                            >
                              <Crown size={14} />
                            </button>
                          )}
                          {job.status !== "draft" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingJobApplicants(job);
                              }}
                              className="p-2 rounded-lg bg-[#41d599] text-[#0a4179] hover:scale-105 transition-all shadow-md"
                              title="Pipeline"
                            >
                              <Users size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this job posting?')) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 shadow-md"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar min-h-[500px]">
                  {[
                    { title: 'Draft', status: 'draft', color: 'bg-orange-400' },
                    { title: 'Active', status: 'active', color: 'bg-[#41d599]' },
                    { title: 'Closed', status: 'closed', color: 'bg-red-500' },
                  ].map((column, idx) => {
                    const columnJobs = jobs.filter(j => j.status === column.status);
                    return (
                      <div key={idx} className="flex-shrink-0 w-80 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/60">{column.title}</h3>
                          </div>
                          <span className="text-[10px] font-black text-white/20">{columnJobs.length}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[200px]">
                          {columnJobs.map(job => (
                            <div 
                              key={job.id}
                              onClick={() => onSelectJob?.(job)}
                              className="glass-premium p-2 rounded-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden"
                            >
                              <div className={`absolute top-0 left-0 w-1 h-full ${column.color} opacity-40`}></div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-md bg-[#0a4179] border border-white/10 flex items-center justify-center font-black text-[#F0C927] text-[10px] shrink-0">
                                  {job.company[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-[10px] font-black truncate text-white/90">{job.title}</h4>
                                  <p className="text-[8px] font-bold text-white/40 truncate uppercase tracking-tighter">{job.city}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                <div className="flex flex-wrap items-center gap-2 text-[8px] font-black text-white/40 uppercase tracking-widest">
                                  <span className="flex items-center gap-1 text-[#41d599]">
                                    <DollarSign size={8} /> {job.salary}
                                  </span>
                                  {job.postedBy && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                      <Users size={8} /> {job.postedBy}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar size={8} /> {new Date(job.postedAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye size={8} /> {Math.floor(Math.random() * 500) + 100}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users size={8} /> {applications.filter(a => a.jobId === job.id).length} Applicants
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-black uppercase tracking-widest text-orange-400">
                                    {job.expiryDate ? `Exp: ${new Date(job.expiryDate).toLocaleDateString()}` : ''}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingJobApplicants(job);
                                    }}
                                    className="text-[7px] font-black uppercase tracking-widest text-white/40 hover:text-[#41d599] transition-colors"
                                  >
                                    View Pipeline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isCreatingJob && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#0a4179]/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-[1400px] rounded-3xl overflow-hidden border border-slate-200 shadow-[0_32px_64px_rgba(0,0,0,0.1)] flex flex-col h-[96vh] animate-in zoom-in-95 relative ring-1 ring-black/5">
            <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a4179] flex items-center justify-center text-[#41d599] border border-[#0a4179]/20 shadow-sm">
                  <Briefcase size={18} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      {modalStep === "form"
                        ? "Create Job Listing"
                        : "Review Job Listing"}
                    </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {modalStep === "form" && (
                  <>
                    <button
                      onClick={handleFullAIGeneration}
                      disabled={isGenerating.full || !newJob.title}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a4179] text-white border border-[#0a4179]/20 text-[11px] font-bold tracking-wide hover:bg-[#0a4179]/90 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isGenerating.full ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} className="text-[#41d599]" />
                      )}
                      AI Assistant (Generate All)
                    </button>
                    <button
                      onClick={() => jdUploadRef.current?.click()}
                      disabled={isUploadingJD}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-bold tracking-wide hover:bg-slate-100 transition-all shadow-sm"
                    >
                      {isUploadingJD ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} className="text-[#0a4179]" />
                      )}
                      Job Description Upload
                    </button>
                    <input
                      ref={jdUploadRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt"
                      onChange={handleJDUpload}
                    />
                  </>
                )}
                <button
                  onClick={() => {
                    setIsCreatingJob(false);
                    onCloseModal?.();
                  }}
                  className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all border border-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50/50" style={{ scrollbarColor: '#0a4179 transparent' }}>
              {modalStep === "form" ? (
                <div className="max-w-[1200px] mx-auto space-y-4">
                  {/* Merged Sections I, II, III, IV */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-8">
                    {/* Section I */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FileText size={20} className="text-slate-400" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                          I. Job Details{" "}
                          <span className="text-red-500 ml-1">
                            *
                          </span>
                        </h4>
                      </div>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Professional Job Title{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newJob.title}
                          onChange={(e) =>
                            setNewJob({ ...newJob, title: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 hover:border-blue-400 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                          placeholder="e.g. Lead Infrastructure Architect"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.category}
                          onChange={(e) =>
                            setNewJob({ ...newJob, category: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map((l) => (
                            <option
                              key={l}
                              value={l}
                              className="bg-white text-slate-800"
                            >
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.industry}
                          onChange={(e) =>
                            setNewJob({ ...newJob, industry: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select Industry</option>
                          {INDUSTRIES.map((i) => (
                            <option
                              key={i}
                              value={i}
                              className="bg-white text-slate-800"
                            >
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Job Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.jobRank}
                          onChange={(e) =>
                            setNewJob({ ...newJob, jobRank: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                          {JOB_RANKS.map((r) => (
                            <option
                              key={r}
                              value={r}
                              className="bg-white text-slate-800"
                            >
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                    {/* Section II */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Globe size={20} className="text-slate-400" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                        II. Location & Employment Type{" "}
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Employment Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.employmentType}
                          onChange={(e) =>
                            setNewJob({
                              ...newJob,
                              employmentType: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option
                              key={t}
                              value={t}
                              className="bg-white text-slate-800"
                            >
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Organization Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.organizationType}
                          onChange={(e) =>
                            setNewJob({
                              ...newJob,
                              organizationType: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                        >
                          {ORGANIZATION_TYPES.map((o) => (
                            <option
                              key={o}
                              value={o}
                              className="bg-white text-slate-800"
                            >
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Work Mode <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.location}
                          onChange={(e) =>
                            setNewJob({ ...newJob, location: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                        >
                          {JOB_LOCATION_TYPES.map((l) => (
                            <option
                              key={l}
                              value={l}
                              className="bg-white text-slate-800"
                            >
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Hiring Regions <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newJob.allowedCountries?.[0]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewJob({ ...newJob, allowedCountries: [val] });
                            if (val !== "Specific Country Only")
                              setDeploymentManifest([]);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                        >
                          {ELIGIBILITY_PROTOCOLS.map((p) => (
                            <option
                              key={p}
                              value={p}
                              className="bg-white text-slate-800"
                            >
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      {newJob.allowedCountries?.[0] === "Specific Country Only" && (
                        <div className="col-span-full space-y-4 p-6 rounded-2xl bg-blue-50/50 border border-blue-100 animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-blue-600" />
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-900">Configure Deployment Locales</h5>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Select Country</label>
                              <select
                                value={tempCountry}
                                onChange={(e) => {
                                  setTempCountry(e.target.value);
                                  setTempRegions([]);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                              >
                                <option value="">Choose Country...</option>
                                {ALL_COUNTRIES.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Select Regions</label>
                              <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[42px]">
                                {tempCountry ? (
                                  REGIONS_BY_COUNTRY[tempCountry]?.map(r => (
                                    <button
                                      key={r}
                                      onClick={() => toggleTempRegion(r)}
                                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${tempRegions.includes(r) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                                    >
                                      {r}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-[9px] text-slate-300 italic">Select a country first...</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={addDeploymentLocale}
                              disabled={!tempCountry || tempRegions.length === 0}
                              className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                            >
                              Add to Manifest
                            </button>
                          </div>
                          {deploymentManifest.length > 0 && (
                            <div className="pt-4 border-t border-blue-100">
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">Active Deployment Manifest</p>
                              <div className="flex flex-wrap gap-2">
                                {deploymentManifest.map((dm, idx) => (
                                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-xl shadow-sm">
                                    <span className="text-[9px] font-black text-blue-900 uppercase tracking-tighter">{dm.country}</span>
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">({dm.region})</span>
                                    <button 
                                      onClick={() => removeDeploymentLocale(idx)}
                                      className="ml-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                    {/* Section III & IV */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Section III */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <DollarSign size={20} className="text-slate-400" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                          III. Salary & Availability{" "}
                          <span className="text-red-500 ml-1">
                            *
                          </span>
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-slate-500 ml-1">
                            Currency <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedCurrencyCode}
                            onChange={(e) =>
                              setSelectedCurrencyCode(e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                          >
                            {GLOBAL_CURRENCIES.map((c) => (
                              <option
                                key={c.code}
                                value={c.code}
                                className="bg-white text-slate-800"
                              >
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-semibold text-slate-500">
                              Annual Salary Range{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <button
                              onClick={() => {
                                setIsCustomSalary(!isCustomSalary);
                                if (!isCustomSalary) setSalaryRaw("");
                              }}
                              className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1.5 hover:underline"
                            >
                              {isCustomSalary ? (
                                <List size={12} />
                              ) : (
                                <Edit size={12} />
                              )}{" "}
                              {isCustomSalary ? "Dropdown" : "Custom"}
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500 font-bold text-sm">
                              {activeCurrencySymbol} &nbsp;
                            </div>
                            {!isCustomSalary ? (
                              <select
                                value={salaryRaw}
                                onChange={(e) =>
                                  handleSalaryChange(e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 hover:border-blue-400 rounded-xl py-3 pl-12 pr-6 text-sm text-slate-800 outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all"
                              >
                                <option
                                  value=""
                                  className="bg-white text-slate-800"
                                >
                                  Select Range
                                </option>
                                {POST_SALARY_RANGES.map((r) => (
                                  <option
                                    key={r}
                                    value={r}
                                    className="bg-white text-slate-800"
                                  >
                                    {r}
                                  </option>
                                ))}
                                <option
                                  value="CUSTOM"
                                  className="bg-white text-red-500"
                                >
                                  --- Manual Override ---
                                </option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={salaryRaw}
                                onChange={(e) =>
                                  handleManualSalaryInput(e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 hover:border-blue-400 rounded-xl py-3 pl-12 pr-6 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 150k - 200k"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-slate-500 ml-1">
                            Salary Structure <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newJob.salaryStructure}
                            onChange={(e) =>
                              setNewJob({
                                ...newJob,
                                salaryStructure: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                          >
                            {SALARY_STRUCTURES.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-white text-slate-800"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-slate-500 ml-1">
                            Start Date / Availability{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newJob.availabilityRequirement}
                            onChange={(e) =>
                              setNewJob({
                                ...newJob,
                                availabilityRequirement: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                          >
                            {AVAILABILITY_OPTIONS.map((a) => (
                              <option
                                key={a}
                                value={a}
                                className="bg-white text-slate-800"
                              >
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section IV */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <UserCheck2 size={20} className="text-slate-400" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                          IV. Diversity & Inclusion (Optional){" "}
                        </h4>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-slate-500 ml-1">
                              Target Gender
                            </label>
                            <select
                              value={newJob.targetGender}
                              onChange={(e) =>
                                setNewJob({
                                  ...newJob,
                                  targetGender: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                            >
                              <option value="Any">Non-Restrictive</option>
                              {GENDER_OPTIONS.map((g) => (
                                <option
                                  key={g}
                                  value={g}
                                  className="bg-white text-slate-800"
                                >
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-slate-500 ml-1">
                              Ethnicity / Race
                            </label>
                            <select
                              value={newJob.targetRace}
                              onChange={(e) =>
                                setNewJob({
                                  ...newJob,
                                  targetRace: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                            >
                              <option value="Any">Non-Restrictive</option>
                              {RACE_OPTIONS.map((r) => (
                                <option
                                  key={r}
                                  value={r}
                                  className="bg-white text-slate-800"
                                >
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-slate-500 ml-1">
                            Religion / Creed
                          </label>
                          <select
                            value={newJob.targetReligion}
                            onChange={(e) =>
                              setNewJob({
                                ...newJob,
                                targetReligion: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                          >
                            <option value="Any">Non-Restrictive</option>
                            {RELIGION_OPTIONS.map((r) => (
                              <option
                                key={r}
                                value={r}
                                className="bg-white text-slate-800"
                              >
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Section V */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Zap size={20} className="text-slate-400" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                        V. Job Description & Requirements{" "}
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-semibold text-slate-500">
                          Job Summary / Description{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <button
                          onClick={() => handleAISupport("summary")}
                          disabled={isGenerating.summary}
                          className="text-[10px] font-bold text-red-500 flex items-center gap-2.5 hover:underline"
                        >
                          <Sparkles size={14} /> AI Draft
                        </button>
                      </div>
                      <textarea
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-[2rem] p-6 text-sm text-slate-800 min-h-[150px] outline-none focus:border-blue-500 transition-all leading-relaxed font-medium shadow-inner"
                        placeholder="Provide a brief overview of the role..."
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-semibold text-slate-500">
                            Responsibilities{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <button
                            onClick={() => handleAISupport("responsibilities")}
                            disabled={isGenerating.responsibilities}
                            className="text-[10px] font-bold text-red-500 flex items-center gap-2.5 hover:underline"
                          >
                            <Sparkles size={14} /> AI Draft
                          </button>
                        </div>
                        <textarea
                          value={newJob.responsibilities}
                          onChange={(e) =>
                            setNewJob({
                              ...newJob,
                              responsibilities: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-[2rem] p-6 text-sm text-slate-800 min-h-[300px] outline-none focus:border-blue-500 transition-all leading-relaxed font-medium shadow-inner"
                          placeholder="Describe the main responsibilities..."
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-semibold text-slate-500">
                            Requirements{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <button
                            onClick={() => handleAISupport("requirements")}
                            disabled={isGenerating.requirements}
                            className="text-[10px] font-bold text-red-500 flex items-center gap-2.5 hover:underline"
                          >
                            <Sparkles size={14} /> AI Draft
                          </button>
                        </div>
                        <textarea
                          value={newJob.requirements}
                          onChange={(e) =>
                            setNewJob({
                              ...newJob,
                              requirements: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-[2rem] p-6 text-sm text-slate-800 min-h-[300px] outline-none focus:border-blue-500 transition-all leading-relaxed font-medium shadow-inner"
                          placeholder="List the required skills and experience..."
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-semibold text-slate-500">
                          Ideal Candidate Definition{" "}
                          <span className="text-blue-400 ml-1 opacity-70 font-bold italic">
                            (Internal Only - Hidden from Seekers)
                          </span>
                        </label>
                        <button
                          onClick={() => handleAISupport("definition")}
                          disabled={isGenerating.definition}
                          className="text-[10px] font-bold text-red-500 flex items-center gap-2.5 hover:underline"
                        >
                          <Sparkles size={14} /> AI Draft
                        </button>
                      </div>
                      <textarea
                        value={newJob.idealCandidateDefinition}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            idealCandidateDefinition: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-[2rem] p-6 text-sm text-slate-800 min-h-[200px] outline-none focus:border-blue-500 transition-all leading-relaxed font-medium shadow-inner"
                        placeholder="Describe your ideal candidate in detail. This helps the AI rank applicants more accurately..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold text-slate-500 ml-1">
                        Search Tags (Keywords)
                      </label>
                      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        {newJob.tags?.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-2">
                            {tag}
                            <button onClick={() => setNewJob(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }))}>
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Add tag..."
                          className="bg-transparent text-[10px] font-bold outline-none min-w-[100px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val && !newJob.tags?.includes(val)) {
                                setNewJob(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-white border border-blue-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-6">
                    <div className="flex flex-wrap gap-3.5">
                      {BENEFITS.slice(0, 15).map((b) => (
                        <button
                          key={b}
                          onClick={() => toggleBenefit(b)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-medium border transition-all ${newJob.benefits?.includes(b) ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <input 
                        type="text"
                        placeholder="Add Custom Benefit..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-[10px] font-medium outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              toggleBenefit(val);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          const val = input.value.trim();
                          if (val) {
                            toggleBenefit(val);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Section VI */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Crown size={20} className="text-slate-400" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                        VI. Listing Type
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <button
                        onClick={() =>
                          setNewJob({ ...newJob, isPremium: false })
                        }
                        className={`p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${!newJob.isPremium ? "bg-slate-50 border-blue-500 ring-1 ring-blue-500/50" : "bg-white border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl ${!newJob.isPremium ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400"}`}
                          >
                            <Zap size={20} />
                          </div>
                          {!newJob.isPremium && (
                            <CheckCircle2
                              size={24}
                              className="text-red-600"
                            />
                          )}
                        </div>
                        <h5 className="text-lg font-black uppercase tracking-tight text-blue-900">
                          Standard Listing
                        </h5>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">
                          Free of Charge
                        </p>
                        <ul className="mt-6 space-y-2">
                          <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                            <Check size={12} /> Standard Visibility
                          </li>
                          <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                            <Check size={12} /> Basic AI Matching
                          </li>
                        </ul>
                      </button>

                      <button
                        onClick={() =>
                          setNewJob({ ...newJob, isPremium: true })
                        }
                        className={`p-6 rounded-[24px] border transition-all text-left relative overflow-hidden group ${newJob.isPremium ? "bg-gradient-to-br from-red-500/5 to-transparent border-red-500 ring-2 ring-red-500/50" : "bg-white border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-red-600">
                          <Crown size={80} />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl ${newJob.isPremium ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-slate-100 text-slate-400"}`}
                          >
                            <Crown size={20} />
                          </div>
                          {newJob.isPremium && (
                            <CheckCircle2
                              size={24}
                              className="text-red-600"
                            />
                          )}
                        </div>
                        <h5 className="text-lg font-black uppercase tracking-tight text-blue-900">
                          Premium Listing
                        </h5>
                        <p className="text-xs text-red-600 font-black uppercase tracking-widest mt-1">
                          Paid @ $28 (28 Days)
                        </p>
                        <ul className="mt-6 space-y-2">
                          <li className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600">
                            <Sparkles size={12} /> Priority Feed Placement
                          </li>
                          <li className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600">
                            <Sparkles size={12} /> Enhanced Neural Ranking
                          </li>
                          <li className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600">
                            <Sparkles size={12} /> Verified Badge
                          </li>
                        </ul>
                      </button>
                    </div>
                  </div>

                  {/* Section VII */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Send size={20} className="text-slate-400" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                        VII. Application Protocol
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Application Method <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setNewJob({ ...newJob, applicationType: "in-app" })}
                            className={`flex-1 p-4 rounded-2xl border transition-all text-center ${newJob.applicationType === "in-app" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <LayoutGrid size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest">In-App</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setNewJob({ ...newJob, applicationType: "external" })}
                            className={`flex-1 p-4 rounded-2xl border transition-all text-center ${newJob.applicationType === "external" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <ExternalLink size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest">External</span>
                            </div>
                          </button>
                        </div>
                      </div>
                      {newJob.applicationType === "external" && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                          <label className="text-[10px] font-semibold text-slate-500 ml-1">
                            External Application URL <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="url"
                              value={newJob.externalApplyUrl}
                              onChange={(e) => setNewJob({ ...newJob, externalApplyUrl: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-5 text-sm text-slate-800 outline-none focus:border-blue-500 transition-all"
                              placeholder="https://company.com/careers/apply"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[1400px] mx-auto space-y-12 animate-in slide-in-from-right-4 py-8">
                  <div className="text-center space-y-4">
                    <h4 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
                      Review Job Listing
                    </h4>
                    <p className="text-sm text-blue-400 font-bold max-w-lg mx-auto uppercase tracking-widest">
                      Review your job details before posting.
                    </p>
                  </div>
                  <div className="space-y-8">
                    <div className="rounded-[48px] p-12 border border-blue-100 bg-white space-y-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-blue-900">
                        <ShieldCheck size={200} />
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[32px] bg-blue-900 border border-blue-800 flex items-center justify-center font-black text-4xl text-red-500 shadow-xl">
                          {newJob.title?.[0]}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-4xl font-black tracking-tight text-blue-900">
                            {newJob.title}
                          </h3>
                          <div className="flex items-center gap-4">
                            <p className="text-xs font-black uppercase text-red-600 tracking-[0.2em]">
                              {newJob.location} • {newJob.city || "Global"} •{" "}
                              {newJob.salary}
                            </p>
                            <span className="px-3 py-0.5 rounded-lg bg-blue-600/10 text-blue-600 border border-blue-600/20 text-[8px] font-black uppercase">
                              {newJob.jobRank}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-10 pt-10 border-t border-blue-50">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Protocol
                          </p>
                          <p className="text-base font-bold uppercase text-blue-900">
                            {newJob.employmentType}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Category
                          </p>
                          <p className="text-base font-bold uppercase text-blue-900">
                            {newJob.category}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Industry
                          </p>
                          <p className="text-base font-bold uppercase text-blue-900">
                            {newJob.industry}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Structure
                          </p>
                          <p className="text-base font-bold uppercase text-blue-900">
                            {newJob.salaryStructure}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Inclusion
                          </p>
                          <p className="text-[10px] font-bold uppercase leading-tight text-blue-700">
                            {newJob.targetGender} • {newJob.targetRace}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                            Application
                          </p>
                          <p className="text-base font-bold uppercase text-blue-900">
                            {newJob.applicationType === "in-app" ? "In-App" : "External"}
                          </p>
                        </div>
                        {newJob.allowedCountries?.[0] === "Specific Country Only" && deploymentManifest.length > 0 && (
                          <div className="col-span-full space-y-2 pt-6 border-t border-blue-50">
                            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                              Deployment Locales
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {deploymentManifest.map((dm, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                  {dm.country} ({dm.region})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-[32px] p-8 border border-blue-100 bg-white space-y-4 shadow-sm">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                        Job Summary
                      </h5>
                      <p className="text-xs text-blue-800 leading-relaxed italic whitespace-pre-wrap">
                        {newJob.description}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="rounded-[32px] p-8 border border-blue-100 bg-white space-y-4 shadow-sm">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                          Objectives & Duties
                        </h5>
                        <p className="text-xs text-blue-800 leading-relaxed italic whitespace-pre-wrap">
                          {newJob.responsibilities}
                        </p>
                      </div>
                      <div className="rounded-[32px] p-8 border border-blue-100 bg-white space-y-4 shadow-sm">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-red-600">
                          Candidate Prerequisites
                        </h5>
                        <p className="text-xs text-blue-800 leading-relaxed italic whitespace-pre-wrap">
                          {newJob.requirements}
                        </p>
                      </div>
                    </div>
                    {newJob.idealCandidateDefinition && (
                      <div className="rounded-[32px] p-8 border border-blue-100 bg-blue-50/50 space-y-4">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                          <Target size={14} /> Ideal Candidate Definition
                          (Internal)
                        </h5>
                        <p className="text-xs text-blue-800 leading-relaxed italic whitespace-pre-wrap">
                          {newJob.idealCandidateDefinition}
                        </p>
                      </div>
                    )}
                    <div className="rounded-[32px] p-8 border border-blue-100 bg-white space-y-4 shadow-sm">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                        Search Tags
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {newJob.tags?.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                            {tag}
                          </span>
                        ))}
                        {(!newJob.tags || newJob.tags.length === 0) && (
                          <p className="text-[10px] text-slate-400 italic">No tags defined.</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-8 flex items-center gap-8 shadow-inner">
                      <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-xl border border-blue-100">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight text-blue-900">
                          Compliance & Integrity Check Passed
                        </p>
                        <p className="text-sm text-blue-400 font-medium">
                          This manifest adheres to CALIBERDESK global
                          organizational standards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-4 shrink-0">
              {modalStep === "form" ? (
                <>
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 py-4 rounded-[2rem] bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                  >
                    Cache to Drafts
                  </button>
                  <button
                    onClick={handleProceedToPublication}
                    className={`flex-[2] py-4 rounded-[2rem] font-bold tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${isFormComplete ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"}`}
                  >
                    {!isFormComplete && <Lock size={14} />} Review Job Listing
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModalStep("form")}
                    className="flex-1 py-4 rounded-[2rem] bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                  >
                    Return to Editor
                  </button>
                  <button
                    onClick={handlePublishListing}
                    className="flex-[2] py-4 rounded-[2rem] bg-blue-600 text-white font-bold tracking-widest text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Post Job Listing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {reviewingApplicant && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0a4179]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0b2e52] w-full max-w-5xl rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh] relative">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0a4179] border-2 border-[#F0C927]/30 overflow-hidden">
                  <img
                    src={
                      reviewingApplicant.candidateProfile?.profileImages?.[0] ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewingApplicant.candidateProfile?.name}`
                    }
                    alt=""
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {reviewingApplicant.candidateProfile?.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
                      REF: {reviewingApplicant.id}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <MapPin size={12} className="text-[#F0C927]" />
                      {reviewingApplicant.candidateProfile?.city}, {reviewingApplicant.candidateProfile?.country}
                    </div>
                    <button 
                      onClick={() => setShowFullProfile(true)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#F0C927] uppercase tracking-widest hover:underline transition-all"
                    >
                      <UserCheck size={12} /> View Full Profile
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReviewingApplicant(null)}
                className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <section className="p-6 rounded-[24px] bg-[#0a4179]/40 border border-white/5 space-y-6 shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#41d599] flex items-center gap-2">
                    <TrendingUp size={12} /> Application Status
                  </h4>
                  <div className="flex items-center justify-between px-2">
                    {[
                      "viewed",
                      "shortlisted",
                      "rejected",
                      "interview-invitation",
                      "selected",
                      "offer-letter",
                      "hired",
                    ].map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-black ${reviewingApplicant.status === s || ["viewed", "shortlisted", "interview-invitation", "selected", "offer-letter", "hired"].indexOf(reviewingApplicant.status) >= i ? "bg-[#41d599] border-[#0b2e52] text-[#0a4179]" : "bg-[#0b2e52] border-white/5 text-white/20"}`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[8px] font-black uppercase text-white/20 text-center max-w-[40px] leading-tight">
                          {s.replace("-", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 pb-2">
                    Work Experience
                  </h4>
                  <div className="space-y-4">
                    {reviewingApplicant.candidateProfile?.workHistory?.map(
                      (work, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2 group/h"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <h5 className="font-black text-sm group-hover/h:text-[#F0C927] transition-colors">
                                {work.role}
                              </h5>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight">
                                {work.company}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-white/20 block">
                                {work.startYear && work.endYear ? `${work.startYear} – ${work.endYear}` : work.period}
                              </span>
                              <span className="text-[9px] font-black text-[#F0C927] uppercase tracking-widest">
                                {calculateYears(work.startYear, work.endYear)} Years
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed font-medium line-clamp-3">
                            {work.description}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 pb-2">
                      Academic Credentials
                    </h4>
                    <div className="space-y-3">
                      {reviewingApplicant.candidateProfile?.education?.map((edu, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                          <p className="text-xs font-black text-white">{edu.degree}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{edu.school} • {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 pb-2">
                      Core Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reviewingApplicant.candidateProfile?.skills?.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="p-6 rounded-[24px] bg-[#F0C927]/5 border border-[#F0C927]/20 space-y-4 shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F0C927] flex items-center gap-2">
                    <Sparkles size={12} /> AI Candidate Insights
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] font-black text-lg border border-[#F0C927]/20">
                      {reviewingApplicant.matchScore || "??"}%
                    </div>
                    <p className="text-xs text-white/70 italic leading-relaxed">
                      "
                      {reviewingApplicant.matchReason ||
                        "Analyzing candidate profile..."}
                      "
                    </p>
                  </div>
                </section>
              </div>
              <aside className="space-y-4">
                <section className="p-6 rounded-[32px] bg-gradient-to-br from-[#06213f] to-[#0a4179] border border-white/10 shadow-xl space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                      Application Management
                    </p>
                    <h4 className="text-xl font-black text-[#F0C927] uppercase">
                      {reviewingApplicant.status.replace("-", " ")}
                    </h4>

                    <div className="pt-4 flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          const profile = reviewingApplicant.candidateProfile;
                          const content = `RESUME: ${profile?.name}\nROLE: ${profile?.role}\nLOCATION: ${profile?.city}, ${profile?.country}\n\nEXPERIENCE:\n${profile?.workHistory?.map(w => `- ${w.role} @ ${w.company} (${w.startYear && w.endYear ? `${w.startYear} - ${w.endYear}` : w.period}) [${calculateYears(w.startYear, w.endYear)} Years]\n  ${w.description}`).join('\n\n')}\n\nEDUCATION:\n${profile?.education?.map(e => `- ${e.degree} from ${e.school} (${e.year})`).join('\n')}\n\nSKILLS: ${profile?.skills?.join(', ')}`;
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${profile?.name?.replace(/\s+/g, '_')}_CV.txt`;
                          a.click();
                        }}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
                      >
                        <Download size={14} /> Download CV
                      </button>
                      <button 
                        onClick={() => window.open(`mailto:${reviewingApplicant.candidateProfile?.email}`)}
                        className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-blue-400 transition-all"
                      >
                        <Mail size={14} /> Contact Candidate
                      </button>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <Calendar size={12} /> Set Task Deadline
                      </label>
                      <input
                        type="date"
                        value={
                          reviewingApplicant.dueDate
                            ? reviewingApplicant.dueDate.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          onUpdateApplicationDueDate(
                            reviewingApplicant.id,
                            e.target.value
                          )
                        }
                        className="w-full bg-[#0a4179] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-[#F0C927] transition-all"
                      />
                    </div>

                    {reviewingApplicant.proposedStatus && (
                      <div className="mt-2 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 animate-pulse">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                          Pending Acceptance:{" "}
                          {reviewingApplicant.proposedStatus.replace("-", " ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {[
                      "viewed",
                      "shortlisted",
                      "rejected",
                      "interview-invitation",
                      "selected",
                      "offer-letter",
                      "hired",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleUpdateStatus(
                            reviewingApplicant.id,
                            status as ApplicationStatus,
                          )
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${reviewingApplicant.status === status ? "bg-[#F0C927] text-[#0a4179] shadow-lg" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                      >
                        <ShieldCheck
                          size={14}
                          className={
                            reviewingApplicant.status === status
                              ? "text-[#0a4179]"
                              : "text-white/20"
                          }
                        />
                        <span className="text-xs font-black uppercase tracking-tight">
                          {status === "viewed"
                            ? "View"
                            : status === "shortlisted"
                              ? "Shortlist"
                              : status === "interview-invitation"
                                ? "Interview Invitation"
                                : status === "selected"
                                  ? "Selected"
                                  : status === "offer-letter"
                                    ? "Offer Letter"
                                    : status === "hired"
                                      ? "Hired"
                                      : status === "rejected"
                                        ? "Rejected"
                                        : status.replace("-", " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}
      {reviewingApplicant && showFullProfile && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col relative glass-premium rounded-[40px] border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[#F0C927]">Candidate Dossier</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">
                  Full profile for <span className="text-white">{reviewingApplicant.candidateProfile?.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowFullProfile(false)}
                className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Profile 
                user={{ ...reviewingApplicant.candidateProfile, isReadOnly: true }} 
                setUser={() => {}} 
                onBack={() => setShowFullProfile(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
