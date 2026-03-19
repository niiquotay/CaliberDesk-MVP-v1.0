
export interface WorkExperience {
  role: string;
  company: string;
  startYear?: string;
  endYear?: string;
  period: string;
  description: string;
  isVerified?: boolean;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  description?: string;
}

export interface VoluntaryActivity {
  role: string;
  organization: string;
  year: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  year?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface JobAlert {
  id: string;
  keywords: string;
  location: string;
  minSalary: number;
  frequency: 'instant' | 'daily' | 'weekly';
  isActive: boolean;
}

export interface InterviewFeedback {
  id: string;
  jobTitle: string;
  date: string;
  confidenceScore: number;
  contentScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export type ApplicationStatus = 
  | 'applied' 
  | 'viewed'
  | 'shortlisted' 
  | 'rejected' 
  | 'assessment' 
  | 'interview-invitation' 
  | 'selected'
  | 'final-interview' 
  | 'offer-letter' 
  | 'salary-negotiating' 
  | 'approval' 
  | 'hired';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedDate: string;
  candidateProfile?: UserProfile;
  videoUrl?: string;
  testScore?: number;
  proctorFlags?: number; // Number of integrity breaches (tab switches)
  matchScore?: number;
  matchReason?: string;
  isAutoApplied?: boolean;
  proposedStatus?: ApplicationStatus;
  dueDate?: string;
  statusHistory?: StatusHistoryEntry[];
  reminderSent7d?: boolean;
}

export interface AptitudeQuestion {
  id: string;
  scenario: string;
  options: string[];
  correctIndex: number;
}

export interface AptitudeTest {
  id: string;
  jobId: string;
  title: string;
  questions: AptitudeQuestion[];
  createdAt: string;
  timeLimit: number; // in minutes
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Job {
  id: string;
  idNumber?: string;
  title: string;
  company: string;
  logoUrl?: string;
  location: string; // Used for Onsite/Remote/Hybrid
  city: string;
  country: string; 
  category?: string;
  allowedCountries: string[]; 
  salary: string;
  salaryStructure?: 'Fixed' | 'Commission Only' | 'Commission + Salary';
  roleDefinition?: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  tags: string[];
  benefits?: string[];
  postedAt: string; 
  expiryDate?: string;
  isPremium?: boolean;
  isQuickHire?: boolean;
  isShortlistService?: boolean;
  isProfessionalHiring?: boolean;
  status?: 'active' | 'closed' | 'draft' | 'pending_approval';
  matchScore?: number;
  matchReason?: string;
  matchDetails?: {
    technical: number;
    culture: number;
    experience: number;
  };
  industry?: string;
  applicationType: 'in-app' | 'external';
  externalApplyUrl?: string;
  aptitudeTestId?: string;
  idealCandidateDefinition?: string;
  postedBy?: string;
  // New fields for organizational context
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Volunteering';
  contractTerm?: string;
  organizationType?: 'NGO' | 'Government' | 'Private';
  jobRank?: 'Senior Management' | 'Middle Level' | 'Entry Level' | 'Intern' | 'Executive';
  targetGender?: string;
  targetAgeRange?: string;
  targetRace?: string;
  targetDisabilityStatus?: string;
  targetReligion?: string;
  targetMaritalStatus?: string;
  targetVeteranStatus?: string;
  availabilityRequirement?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  userName?: string;
  date: string;
  item: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

export type OperationalRole = 
  | 'sales_exec' 
  | 'sales_manager' 
  | 'cs_operator' 
  | 'cs_head' 
  | 'recruiter' 
  | 'recruiter_head' 
  | 'finance_manager' 
  | 'finance_head' 
  | 'super_admin';

export interface SubUser {
  id: string;
  idNumber?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'admin' | 'recruiter' | 'viewer';
  isSuperUser: boolean;
  joinedDate: string;
  lastLogin: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface Subsidiary {
  id: string;
  idNumber?: string;
  name: string;
  industry: string;
  activeJobs: number;
  location: string;
  joinedDate: string;
  leadership?: LeadershipMember[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  readTime: string;
  isDraft?: boolean;
}

export interface CaliberEvent {
  id: string;
  title: string;
  description: string;
  date: string; 
  time: string;
  location: string;
  organizer: string;
  imageUrl?: string;
  bookingUrl?: string;
  type: 'Webinar' | 'Conference' | 'Workshop' | 'Networking';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'in-app' | 'email' | 'both';
  category: 'recommendation' | 'auto-apply' | 'system' | 'application';
  date: string;
  isRead: boolean;
  actionLink?: {
    label: string;
    view: ViewType;
    params?: any;
  };
}

export interface PendingAssessmentReminder {
  jobId: string;
  matchedAt: string;
  remindersSent: number; // 0: initial, 1: 24h, 2: 36h, 3: 72h
}

export interface UserProfile {
  id?: string;
  idNumber?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumbers?: string[];
  whatsapp?: string;
  linkedinUrl?: string; 
  instagramUrl?: string;
  facebookUrl?: string;
  portfolioUrl?: string; 
  role: string;
  city: string;
  country: string;
  skills: string[];
  shortlistedSkills?: string[];
  digitalSkills: string[];
  certifications: string[];
  hobbies: string[];
  languages?: string[];
  projects: Project[];
  experienceSummary: string;
  bio?: string;
  jobTitle?: string;
  stealthMode: boolean;
  profileCompleted: boolean;
  linkedInConnected: boolean;
  isSubscribed: boolean; 
  subscriptionTier: 'free' | 'premium';
  productCredits?: {
    standard: number;
    premium: number;
    shortlist: number;
  };
  purchaseHistory: Transaction[];
  adOptIn: boolean;
  alerts: JobAlert[];
  savedJobIds: string[];
  autoApplyEnabled: boolean;
  autoApplyEnabledAt?: string;
  lastAutoApplyReminderAt?: string;
  jobPreferences?: {
    categories?: string[];
    locations?: string[];
    roles?: string[];
  };
  enhancedAvatar?: string;
  profileImages: string[]; 
  workHistory: WorkExperience[];
  education: Education[];
  voluntaryActivities?: VoluntaryActivity[];
  isEmployer?: boolean;
  isVerified?: boolean;
  verificationMethod?: 'email' | 'document';
  verificationDocuments?: string[];
  verificationEmail?: string;
  isDeactivated?: boolean;
  deactivationDate?: string;
  isAdmin?: boolean;
  isSuperUser?: boolean;
  isEmailVerified?: boolean;
  verificationCode?: string;
  openToTravel?: boolean;
  subUsers?: SubUser[];
  subsidiaries?: Subsidiary[];
  leadership?: LeadershipMember[];
  opRole?: OperationalRole; 
  companyName?: string;
  companyBio?: string;
  cvName?: string;
  cvUrl?: string;
  industry?: string;
  companySize?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyTwitter?: string;
  companyFacebook?: string;
  companyAddress?: string;
  companyContactEmail?: string;
  companyContactPhone?: string;
  companyGallery?: string[];
  foundingYear?: string;
  velocity?: string;
  companyType?: string;
  ownershipStructure?: string;
  personalTitle?: string;
  gender?: string;
  ageRange?: string;
  race?: string;
  disabilityStatus?: string;
  religion?: string;
  maritalStatus?: string;
  veteranStatus?: string;
  demographicVisibility?: {
    gender: boolean;
    ageRange: boolean;
    race: boolean;
    disabilityStatus: boolean;
    religion: boolean;
    maritalStatus: boolean;
    veteranStatus: boolean;
  };
  joinedDate?: string;
  notifications?: AppNotification[];
  pendingAssessmentReminders?: PendingAssessmentReminder[];
  employmentVerificationStatus?: 'none' | 'pending' | 'completed';
  verificationCertificateUrl?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'feature-request' | 'other';
  createdAt: string;
  updatedAt: string;
}

export type ViewType = 
  | 'seeker' 
  | 'seeker-insights' 
  | 'seeker-applications' 
  | 'employer' 
  | 'employer-management' 
  | 'employer-profile' 
  | 'home' 
  | 'profile' 
  | 'job-details' 
  | 'billing' 
  | 'interview-prep' 
  | 'cv-prep' 
  | 'settings' 
  | 'signin' 
  | 'employer-public-profile' 
  | 'admin' 
  | 'admin-jobs'
  | 'admin-staff'
  | 'employer-aptitude'
  | 'employer-org'
  | 'services'
  | 'about-caliberdesk'
  | 'blog'
  | 'notifications'
  | 'employer-post-job'
  | 'employer-live-jobs';
