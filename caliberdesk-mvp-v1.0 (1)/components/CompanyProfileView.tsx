import React, { useMemo } from 'react';
import { 
  Building2, Globe, Users, MapPin, ArrowLeft, 
  ExternalLink, Briefcase, Calendar, ChevronRight, 
  Sparkles, ShieldCheck, TrendingUp, Mail, Phone,
  Image as ImageIcon, Linkedin, Twitter, Facebook,
  History, Layers, Box, Share2, Info, User as UserIcon
} from 'lucide-react';
import { Job, UserProfile, LeadershipMember } from '../types';

interface CompanyProfileViewProps {
  companyName: string;
  allJobs: Job[];
  onBack: () => void;
  onSelectJob: (job: Job) => void;
  employerProfile?: UserProfile;
  onViewCompany?: (name: string) => void;
  onApply?: (job: Job) => void;
}

const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  companyName,
  allJobs,
  onBack,
  onSelectJob,
  employerProfile,
  onViewCompany,
  onApply
}) => {
  const [showAllJobs, setShowAllJobs] = React.useState(false);

  const companyJobs = useMemo(() => {
    return allJobs
      .filter((j) => j.company === companyName)
      .sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
  }, [allJobs, companyName]);

  const activeJobs = useMemo(() => companyJobs.filter(j => j.status === 'active' || !j.status), [companyJobs]);
  const displayedJobs = showAllJobs ? companyJobs : activeJobs;

  // Mocked/Derived company metadata
  const companyData = useMemo(() => {
    const latestJob = companyJobs[0];
    const sanitizedName = companyName.toLowerCase().replace(/\s/g, "");
    const isMockEmployer = companyName === "Quantify Systems";

    // If we have a real employer profile, use its data
    if (employerProfile && employerProfile.companyName === companyName) {
      return {
        name: employerProfile.companyName || companyName,
        logoUrl: employerProfile.profileImages?.[0] || latestJob?.logoUrl,
        location:
          employerProfile.companyAddress ||
          (latestJob ? `${latestJob.city}, ${latestJob.country}` : "Global"),
        industry: latestJob?.category || "Technology",
        size: "500-1000 Employees",
        website: employerProfile.companyWebsite || `https://www.${sanitizedName}.ai`,
        linkedin: employerProfile.companyLinkedin || `https://www.linkedin.com/company/${sanitizedName}`,
        twitter: employerProfile.companyTwitter || `https://twitter.com/${sanitizedName}`,
        facebook: employerProfile.companyFacebook || `https://facebook.com/${sanitizedName}`,
        email: employerProfile.companyContactEmail || employerProfile.email || `contact@${sanitizedName}.ai`,
        phone: employerProfile.companyContactPhone || "+1 (555) 012-3456",
        bio: employerProfile.companyBio || `${companyName} is a visionary organization dedicated to pushing the boundaries of innovation. With a commitment to excellence and a global presence, we strive to build high-performance teams and cutting-edge solutions for the modern world.`,
        activeCount: companyJobs.length,
        founded: isMockEmployer ? "2016" : "2018",
        velocity: isMockEmployer ? "High Density" : "Stable",
        type: isMockEmployer ? "Private Equity" : "Public Corporation",
        ownership: isMockEmployer ? "Venture Backed" : "Independent",
        leadership: employerProfile.leadership || (isMockEmployer
          ? [
              {
                id: "l1",
                name: "James Miller",
                position: "Chief Executive Officer",
                imageUrl:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMiller",
                linkedinUrl: "#",
                twitterUrl: "#",
              },
              {
                id: "l2",
                name: "Sarah Chen",
                position: "VP of Engineering",
                imageUrl:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen",
                linkedinUrl: "#",
                twitterUrl: "#",
              },
            ]
          : [
              {
                id: "l3",
                name: "Executive Director",
                position: "Hiring Lead",
                imageUrl: "",
                linkedinUrl: "#",
              },
            ]),
        gallery: employerProfile.companyGallery || (isMockEmployer
          ? [
              "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600",
            ]
          : [
              "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
            ]),
        subsidiaries: employerProfile.subsidiaries?.map(s => ({
          name: s.name,
          loc: s.location,
          jobs: s.activeJobs,
          leadership: s.leadership
        })) || (isMockEmployer
          ? [
              {
                name: "Quantify Data Labs",
                loc: "Dublin",
                jobs: 3,
                leadership: [
                  {
                    id: "sl1",
                    name: "Dr. Alan Turing",
                    position: "Branch Director",
                    imageUrl:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=AlanTuring",
                    linkedinUrl: "#",
                  },
                ],
              },
              {
                name: "Quantify Neural Robotics",
                loc: "Austin",
                jobs: 1,
                leadership: [
                  {
                    id: "sl2",
                    name: "Maria Curie",
                    position: "Technical Lead",
                    imageUrl:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=MariaCurie",
                    linkedinUrl: "#",
                  },
                ],
              },
            ]
          : []),
      };
    }

    return {
      name: companyName,
      logoUrl: latestJob?.logoUrl,
      location: latestJob ? `${latestJob.city}, ${latestJob.country}` : "Global",
      industry: latestJob?.category || "Technology",
      size: "500-1000 Employees",
      website: `https://www.${sanitizedName}.ai`,
      linkedin: `https://www.linkedin.com/company/${sanitizedName}`,
      twitter: `https://twitter.com/${sanitizedName}`,
      facebook: `https://facebook.com/${sanitizedName}`,
      email: `contact@${sanitizedName}.ai`,
      phone: "+1 (555) 012-3456",
      bio: `${companyName} is a visionary organization dedicated to pushing the boundaries of innovation. With a commitment to excellence and a global presence, we strive to build high-performance teams and cutting-edge solutions for the modern world.`,
      activeCount: companyJobs.length,
      founded: isMockEmployer ? "2016" : "2018",
      velocity: isMockEmployer ? "High Density" : "Stable",
      type: isMockEmployer ? "Private Equity" : "Public Corporation",
      ownership: isMockEmployer ? "Venture Backed" : "Independent",
      leadership: isMockEmployer
        ? [
            {
              id: "l1",
              name: "James Miller",
              position: "Chief Executive Officer",
              imageUrl:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMiller",
              linkedinUrl: "#",
              twitterUrl: "#",
            },
            {
              id: "l2",
              name: "Sarah Chen",
              position: "VP of Engineering",
              imageUrl:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen",
              linkedinUrl: "#",
              twitterUrl: "#",
            },
          ]
        : [
            {
              id: "l3",
              name: "Executive Director",
              position: "Hiring Lead",
              imageUrl: "",
              linkedinUrl: "#",
            },
          ],
      gallery: isMockEmployer
        ? [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600",
          ]
        : [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
          ],
      subsidiaries: isMockEmployer
        ? [
            {
              name: "Quantify Data Labs",
              loc: "Dublin",
              jobs: 3,
              leadership: [
                {
                  id: "sl1",
                  name: "Dr. Alan Turing",
                  position: "Branch Director",
                  imageUrl:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=AlanTuring",
                  linkedinUrl: "#",
                },
              ],
            },
            {
              name: "Quantify Neural Robotics",
              loc: "Austin",
              jobs: 1,
              leadership: [
                {
                  id: "sl2",
                  name: "Maria Curie",
                  position: "Technical Lead",
                  imageUrl:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=MariaCurie",
                  linkedinUrl: "#",
                },
              ],
            },
          ]
        : [],
    };
  }, [companyName, companyJobs, employerProfile]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Return to Market</span>
      </button>

      {/* Hero Header */}
      <div className="glass rounded-[32px] p-6 md:p-8 relative overflow-hidden shadow-2xl border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Building2 size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-[24px] bg-[#0a4179] flex items-center justify-center text-4xl md:text-5xl font-black border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] text-[#F0C927] overflow-hidden">
            {companyData.logoUrl ? (
              <img src={companyData.logoUrl} alt={companyData.name} className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{companyData.name.charAt(0)}</span>
            )}
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">{companyData.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#F0C927]" /> {companyData.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-[#F0C927]" /> {companyData.industry}</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#F0C927]" /> {companyData.size}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <Globe size={14} /> Official Portal
              </a>
              <div className="flex items-center gap-2">
                <a href={companyData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#0077b5] transition-all"><Linkedin size={18} /></a>
                <a href={companyData.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#1DA1F2] transition-all"><Twitter size={18} /></a>
                <a href={companyData.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#1877F2] transition-all"><Facebook size={18} /></a>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#41d599]/10 border border-[#41d599]/20 text-[#41d599] text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Verified Enterprise
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <section className="glass rounded-[24px] p-6 md:p-8 border-white/5 space-y-6 shadow-2xl relative">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <Sparkles size={22} className="text-[#F0C927]" /> Organization Ethos
            </h2>
            <p className="text-white/70 leading-relaxed font-medium">
              {companyData.bio}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Founding Year</p>
                <p className="text-sm font-bold">{companyData.founded}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Hiring Velocity</p>
                <div className="flex items-center gap-2 text-sm font-bold text-[#41d599]">
                  <TrendingUp size={14} /> {companyData.velocity}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Company Type</p>
                <p className="text-sm font-bold">{companyData.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Ownership</p>
                <p className="text-sm font-bold">{companyData.ownership}</p>
              </div>
            </div>
          </section>

          {/* Corporate Leadership Section */}
          <section className="glass rounded-[24px] p-6 md:p-8 border-white/5 space-y-6 shadow-2xl">
             <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck size={22} className="text-[#F0C927]" /> Corporate Leadership
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {companyData.leadership.map((leader) => (
                <div key={leader.id} className="p-4 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
                  <div className="w-16 h-16 rounded-[20px] bg-[#0a4179] overflow-hidden border-2 border-white/10 shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    {leader.imageUrl ? (
                      <img src={leader.imageUrl} className="w-full h-full object-cover" alt={leader.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20"><UserIcon size={32} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-base truncate">{leader.name}</h4>
                    <p className="text-[10px] text-[#41d599] font-black uppercase tracking-widest mb-3">{leader.position}</p>
                    <div className="flex items-center gap-2">
                       {leader.linkedinUrl && <a href={leader.linkedinUrl} className="p-1.5 rounded-lg bg-white/5 text-white/20 hover:text-[#0077b5] transition-all"><Linkedin size={14} /></a>}
                       {leader.twitterUrl && <a href={leader.twitterUrl} className="p-1.5 rounded-lg bg-white/5 text-white/20 hover:text-[#1DA1F2] transition-all"><Twitter size={14} /></a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 px-2">
              <ImageIcon size={22} className="text-[#41d599]" /> Culture Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {companyData.gallery.map((img, i) => (
                <div key={i} className="aspect-video rounded-[24px] overflow-hidden border border-white/5 group relative shadow-xl">
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="text-white" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Job Manifest */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black uppercase tracking-widest">Job Manifest ({displayedJobs.length})</h2>
              <button 
                onClick={() => setShowAllJobs(!showAllJobs)}
                className="text-[9px] font-black uppercase tracking-widest text-[#41d599] hover:text-white transition-colors"
              >
                {showAllJobs ? "Show Active Only" : "View All Jobs (Active & Inactive)"}
              </button>
            </div>
            <div className="grid gap-3">
              {displayedJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => onSelectJob(job)}
                  className={`glass group hover:bg-white/[0.05] transition-all rounded-[24px] p-4 border-white/5 cursor-pointer flex items-center justify-between shadow-xl ${job.status === 'closed' || job.status === 'draft' ? 'opacity-60' : ''}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg group-hover:text-[#F0C927] transition-colors">{job.title}</h4>
                      {job.isPremium && (
                        <span className="px-2 py-0.5 rounded bg-[#F0C927]/10 text-[#F0C927] text-[8px] font-black uppercase tracking-widest border border-[#F0C927]/20">Premium</span>
                      )}
                      {job.status === 'closed' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">Closed</span>
                      )}
                      {job.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 text-[8px] font-black uppercase tracking-widest border border-white/20">Draft</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {job.city}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(job.postedAt).toLocaleDateString()}</span>
                      <span className="text-[#41d599] font-black">{job.salary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {onApply && (!job.status || job.status === 'active') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onApply(job);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#41d599] text-[#0a4179] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                      >
                        Apply Now
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-[#F0C927] group-hover:border-[#F0C927]/30 transition-all shadow-lg">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
              {displayedJobs.length === 0 && (
                <div className="text-center py-8 text-white/40 text-xs font-bold uppercase tracking-widest">
                  No jobs found.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <section className="glass rounded-2xl p-8 border-white/5 space-y-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#F0C927] border-b border-white/5 pb-4 flex items-center gap-2">
              <Share2 size={16} /> Full Contact Data
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] border border-[#41d599]/20 group-hover:bg-[#41d599] group-hover:text-[#0a4179] transition-all shadow-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Primary Email</p>
                  <p className="text-xs font-bold truncate">{companyData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] border border-[#41d599]/20 group-hover:bg-[#41d599] group-hover:text-[#0a4179] transition-all shadow-lg">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Support Line</p>
                  <p className="text-xs font-bold">{companyData.phone}</p>
                </div>
              </div>
            </div>
          </section>

          {companyData.subsidiaries.length > 0 && (
            <section className="glass rounded-2xl p-8 border-white/5 space-y-6 shadow-2xl">
               <h3 className="text-sm font-black uppercase tracking-widest text-[#F0C927] border-b border-white/5 pb-4 flex items-center gap-2">
                 <Layers size={16} /> Subsidiaries
               </h3>
               <div className="space-y-6">
                 {companyData.subsidiaries.map((sub, idx) => (
                   <div key={idx} className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#F0C927]/30 transition-all shadow-md">
                      <div className="flex justify-between items-start">
                         <div>
                            <p 
                              className={`font-bold text-xs mb-1 ${onViewCompany ? 'cursor-pointer hover:text-[#41d599] transition-colors text-white' : 'text-white/90'}`}
                              onClick={() => onViewCompany && onViewCompany(sub.name)}
                            >
                              {sub.name}
                            </p>
                            <div className="flex items-center gap-3 text-[8px] font-black uppercase text-white/20">
                               <span>{sub.loc}</span>
                               <span className="text-[#41d599]">{sub.jobs} Vacancies</span>
                            </div>
                         </div>
                         {onViewCompany && (
                           <button onClick={() => onViewCompany(sub.name)} className="text-white/10 group-hover:text-[#F0C927] transition-colors">
                             <ExternalLink size={12} />
                           </button>
                         )}
                      </div>
                      
                      {/* Branch Leadership Preview */}
                      {sub.leadership && sub.leadership.length > 0 && (
                        <div className="pt-3 border-t border-white/5 space-y-3">
                           <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Branch Executive</p>
                           {sub.leadership.map(leader => (
                             <div key={leader.id} className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-[#0a4179] overflow-hidden border border-white/10">
                                  {leader.imageUrl ? <img src={leader.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><UserIcon size={12} /></div>}
                               </div>
                               <div>
                                  <p className="text-[9px] font-bold text-white/80">{leader.name}</p>
                                  <p className="text-[7px] text-[#41d599] font-black uppercase tracking-tighter">{leader.position}</p>
                               </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            </section>
          )}

          <section className="glass rounded-2xl p-8 border-white/5 text-center space-y-6 shadow-2xl bg-gradient-to-br from-[#06213f] to-transparent">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Recruitment Gravity</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 shadow-inner">
                <p className="text-4xl font-black text-[#41d599]">{companyData.activeCount}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Live Manifests</p>
              </div>
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 shadow-inner">
                <p className="text-4xl font-black text-white">4.8</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Cultural Pulse</p>
              </div>
            </div>
            <div className="pt-4">
              <button 
                className="w-full py-4 rounded-2xl bg-[#41d599] text-[#0a4179] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Follow Global Identity
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileView;