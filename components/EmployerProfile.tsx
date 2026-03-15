import React, { useState, useRef } from "react";
import {
  Building,
  Globe,
  Users,
  FileText,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Building2,
  Image as ImageIcon,
  Upload,
  Rocket,
  Linkedin,
  Twitter,
  Facebook,
  ShieldAlert,
  Clock,
  Save,
  Briefcase,
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Camera,
  X,
  Layout,
  Info,
  Link as LinkIcon,
  Calendar,
  Layers,
  Share2,
  History,
  CreditCard,
  Box,
  TrendingUp,
  Mail,
  PhoneOutgoing,
  User as UserIcon,
} from "lucide-react";
import { UserProfile, Subsidiary, LeadershipMember } from "../types";
import { INDUSTRIES } from "../constants";
import { validatePhoneNumber } from "../utils";
import Toast from "./Toast";

interface EmployerProfileProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onComplete: () => void;
  onBack: () => void;
  onViewCompany: (name: string) => void;
  onAddSubsidiary: (subsidiary: Partial<Subsidiary>) => void;
}

const EmployerProfile: React.FC<EmployerProfileProps> = ({
  user,
  setUser,
  onComplete,
  onBack,
  onViewCompany,
  onAddSubsidiary,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof UserProfile, value: any) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };
  const handleSave = () => {
    if (!user.companyName || user.companyName.trim().length < 2) {
      setToast({
        message: "Company name must be at least 2 characters long.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setToast({
        message: "Organization manifest synchronized.",
        type: "success",
      });
    }, 1200);
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("enhancedAvatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUser((prev) => ({
            ...prev,
            companyGallery: [
              ...(prev.companyGallery || []),
              reader.result as string,
            ],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setUser((prev) => ({
      ...prev,
      companyGallery: (prev.companyGallery || []).filter((_, i) => i !== index),
    }));
  };

  const addLeadershipMember = () => {
    const newMember: LeadershipMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Member",
      position: "Position",
    };
    setUser((prev) => ({
      ...prev,
      leadership: [...(prev.leadership || []), newMember],
    }));
  };

  const updateLeadershipMember = (
    id: string,
    field: keyof LeadershipMember,
    value: string,
  ) => {
    setUser((prev) => ({
      ...prev,
      leadership: (prev.leadership || []).map((m) =>
        m.id === id ? { ...m, [field]: value } : m,
      ),
    }));
  };

  const removeLeadershipMember = (id: string) => {
    setUser((prev) => ({
      ...prev,
      leadership: (prev.leadership || []).filter((m) => m.id !== id),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20 animate-in fade-in duration-500 text-white px-4 md:px-0">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-white">
                COMPANY PROFILE
              </h1>
            </div>
          </div>
        </div>
        {user.isSuperUser && (
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all flex items-center gap-2 shadow-xl ${isEditing ? "bg-[#41d599] text-[#0a4179]" : "bg-[#F0C927] text-[#0a4179]"}`}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Edit3 size={14} />
            )}
            {isEditing ? "Commit Changes" : "Manage Profile"}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        {/* Profile Card Header */}
        <section className="lg:col-span-12 glass-premium rounded-2xl p-4 md:p-5 border-white/10 relative overflow-hidden shadow-2xl ring-1 ring-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-white pointer-events-none">
            <Building2 size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-center">
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.2rem] bg-[#06213f] flex items-center justify-center text-3xl font-black border border-white/10 text-[#F0C927] overflow-hidden shadow-2xl group transition-all duration-500">
                {user.enhancedAvatar ? (
                  <img
                    src={user.enhancedAvatar}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span>{user.companyName?.[0]}</span>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#F0C927] text-[#0a4179] flex items-center justify-center shadow-2xl border-2 border-[#0a4179] hover:scale-110 transition-all duration-300"
                >
                  <Camera size={14} />
                  <input
                    ref={logoInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              {isEditing ? (
                <div className="space-y-1 w-full">
                  <input
                    value={user.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className={`text-xl md:text-2xl font-black tracking-tight bg-white/5 border ${
                      !user.companyName || user.companyName.trim().length < 2
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-xl px-4 py-1.5 w-full outline-none focus:border-[#F0C927] transition-all`}
                    placeholder="Company Name"
                  />
                  {(!user.companyName || user.companyName.trim().length < 2) && (
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest ml-2">
                      Minimum 2 characters required
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight leading-tight">
                    {user.companyName || user.name}
                  </h1>
                  {user.isVerified ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#41d599]/20 border border-[#41d599]/30 rounded-full text-[#41d599] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#41d599]/10">
                      <ShieldCheck size={12} />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0C927]/20 border border-[#F0C927]/30 rounded-full text-[#F0C927] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#F0C927]/10">
                      <ShieldAlert size={12} />
                      Pending Verification
                    </div>
                  )}
                  {user.idNumber && (
                    <div className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-black tracking-widest text-[#F0C927]">
                      ID: {user.idNumber}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#F0C927]" /> {user.city},{" "}
                  {user.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={12} className="text-[#F0C927]" />{" "}
                  {isEditing ? (
                    <select
                      value={user.industry || ""}
                      onChange={(e) => updateField("industry", e.target.value)}
                      className="bg-[#06213f] border border-white/10 rounded-lg px-2 py-0.5 outline-none focus:border-[#F0C927] text-white"
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  ) : (
                    user.industry || "Technology"
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-[#41d599]">
                  <ShieldCheck size={12} /> Verified Enterprise
                </span>
                <span className="flex items-center gap-1.5 text-white/40">
                  {user.joinedDate ? (() => {
                    const years = new Date().getFullYear() - new Date(user.joinedDate).getFullYear();
                    return years > 0 ? `joined ${years} year${years > 1 ? 's' : ''} ago` : 'joined recently';
                  })() : 'joined recently'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Redesigned Details Layout */}
        <div className="lg:col-span-12">
          <section className="glass-premium rounded-2xl !p-6 md:!p-10 space-y-8 shadow-2xl border-white/5">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Mission & Global Presence */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                    <UserIcon className="text-[#F0C927]" size={14} /> ADMIN PERSONAL DETAILS
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">First Name</label>
                        {isEditing ? (
                          <input
                            value={user.firstName || ""}
                            onChange={(e) => updateField("firstName", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#F0C927] transition-all"
                            placeholder="First Name"
                          />
                        ) : (
                          <p className="text-xs font-bold">{user.firstName || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">Middle Name</label>
                        {isEditing ? (
                          <input
                            value={user.middleName || ""}
                            onChange={(e) => updateField("middleName", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#F0C927] transition-all"
                            placeholder="Middle Name (Optional)"
                          />
                        ) : (
                          <p className="text-xs font-bold">{user.middleName || "—"}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">Last Name</label>
                        {isEditing ? (
                          <input
                            value={user.lastName || ""}
                            onChange={(e) => updateField("lastName", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#F0C927] transition-all"
                            placeholder="Last Name"
                          />
                        ) : (
                          <p className="text-xs font-bold">{user.lastName || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">Contact Phone</label>
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              value={user.phoneNumbers?.[0] || ""}
                              onChange={(e) => updateField("phoneNumbers", [e.target.value])}
                              className={`w-full bg-white/5 border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#F0C927] transition-all ${
                                user.phoneNumbers?.[0] && !validatePhoneNumber(user.phoneNumbers[0], user.country) 
                                  ? 'border-red-500/50' 
                                  : 'border-white/10'
                              }`}
                              placeholder="Phone Number"
                            />
                            {user.phoneNumbers?.[0] && !validatePhoneNumber(user.phoneNumbers[0], user.country) && (
                              <p className="text-[8px] text-red-400 font-bold ml-1">Invalid number for {user.country}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs font-bold">{user.phoneNumbers?.[0] || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                    <Sparkles className="text-[#F0C927]" size={14} /> ABOUT {user.companyName?.toUpperCase() || "COMPANY"}
                  </h2>
                  {isEditing ? (
                    <textarea
                      value={user.companyBio}
                      onChange={(e) => updateField("companyBio", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs min-h-[120px] outline-none focus:border-[#F0C927] transition-all leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs text-white/70 leading-relaxed">
                      {user.companyBio || "No mission statement provided."}
                    </p>
                  )}
                </div>
              </div>

              {/* Leadership & Contact & Social */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="text-[#41d599]" size={14} /> LEADERSHIP
                    </h2>
                    {isEditing && (
                      <button
                        onClick={addLeadershipMember}
                        className="p-1.5 rounded-lg bg-[#41d599]/10 text-[#41d599] hover:bg-[#41d599]/20 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {(user.leadership || []).map((leader) => (
                      <div
                        key={leader.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 group hover:bg-white/[0.04] transition-all relative"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                          {leader.imageUrl ? (
                            <img src={leader.imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <UserIcon className="m-auto opacity-10" size={20} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                value={leader.name}
                                onChange={(e) => updateLeadershipMember(leader.id, "name", e.target.value)}
                                className="text-[10px] font-black uppercase bg-white/5 border border-white/10 rounded-md px-2 py-0.5 w-full outline-none focus:border-[#F0C927]"
                              />
                              <input
                                value={leader.position}
                                onChange={(e) => updateLeadershipMember(leader.id, "position", e.target.value)}
                                className="text-[8px] font-black uppercase text-white/30 bg-white/5 border border-white/10 rounded-md px-2 py-0.5 w-full outline-none focus:border-[#F0C927]"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="text-[10px] font-black truncate uppercase tracking-tight group-hover:text-[#F0C927] transition-colors">
                                {leader.name}
                              </p>
                              <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                {leader.position}
                              </p>
                            </>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeLeadershipMember(leader.id)}
                            className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!user.leadership || user.leadership.length === 0) && !isEditing && (
                      <p className="text-[10px] text-white/40 italic">No leadership members added.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <Mail className="text-blue-400" size={14} /> CONTACT
                    </h3>
                    <div className="space-y-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          {[
                            { icon: Mail, field: "companyContactEmail", placeholder: "Email" },
                            { icon: PhoneOutgoing, field: "companyContactPhone", placeholder: "Phone" },
                            { icon: Globe, field: "companyWebsite", placeholder: "Website" },
                          ].map((item, i) => {
                            const val = user[item.field as keyof UserProfile] as string || "";
                            const isPhone = item.field === 'companyContactPhone';
                            const isInvalidPhone = isPhone && val && !validatePhoneNumber(val, user.country);
                            
                            return (
                              <div key={i} className="space-y-1">
                                <div className={`flex items-center gap-2 bg-white/5 border rounded-lg px-3 py-1.5 ${isInvalidPhone ? 'border-red-500/50' : 'border-white/10'}`}>
                                  <item.icon size={12} className="text-[#41d599]" />
                                  <input
                                    value={val}
                                    onChange={(e) => updateField(item.field as keyof UserProfile, e.target.value)}
                                    className="bg-transparent border-none outline-none text-[9px] font-bold w-full"
                                    placeholder={item.placeholder}
                                  />
                                </div>
                                {isInvalidPhone && (
                                  <p className="text-[7px] text-red-400 font-bold ml-1">Invalid number</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {[
                            { icon: Mail, value: user.companyContactEmail || user.email },
                            { icon: PhoneOutgoing, value: user.companyContactPhone || "Not Specified" },
                            { icon: Globe, value: user.companyWebsite || "Official Portal" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[9px] text-white/60 font-bold truncate hover:text-white transition-colors cursor-pointer">
                              <item.icon size={12} className="text-[#41d599]" /> {item.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <Share2 className="text-purple-400" size={14} /> SOCIAL
                    </h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <div className="grid grid-cols-1 gap-2 w-full">
                          {[
                            { icon: Linkedin, field: "companyLinkedin", color: "text-blue-400", placeholder: "LinkedIn URL" },
                            { icon: Twitter, field: "companyTwitter", color: "text-blue-300", placeholder: "Twitter URL" },
                            { icon: Facebook, field: "companyFacebook", color: "text-blue-600", placeholder: "Facebook URL" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                              <item.icon size={12} className={item.color} />
                              <input
                                value={user[item.field as keyof UserProfile] as string || ""}
                                onChange={(e) => updateField(item.field as keyof UserProfile, e.target.value)}
                                className="bg-transparent border-none outline-none text-[9px] font-bold w-full"
                                placeholder={item.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {[
                            { icon: Linkedin, url: user.companyLinkedin, color: "text-blue-400" },
                            { icon: Twitter, url: user.companyTwitter, color: "text-blue-300" },
                            { icon: Facebook, url: user.companyFacebook, color: "text-blue-600" },
                          ].filter(s => s.url).map((item, i) => (
                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                              <item.icon size={14} className={item.color} />
                            </a>
                          ))}
                          {!user.companyLinkedin && !user.companyTwitter && !user.companyFacebook && (
                            <p className="text-[10px] text-white/40 italic">No social links added.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="text-orange-400" size={14} /> GALLERY
                </h2>
                {isEditing && (
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-orange-400/10 text-orange-400 hover:bg-orange-400/20 transition-all"
                  >
                    <Plus size={14} />
                    <input ref={galleryInputRef} type="file" multiple className="hidden" onChange={handleGalleryUpload} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(user.companyGallery || []).slice(0, 6).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                    {isEditing && (
                      <button
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                {(!user.companyGallery || user.companyGallery.length === 0) && !isEditing && (
                  <div className="col-span-full py-6 text-center border border-dashed border-white/5 rounded-xl opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-widest">Empty Gallery</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
