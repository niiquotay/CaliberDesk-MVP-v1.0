import React, { useState } from 'react';
import { 
  User, Building2, Briefcase, MapPin, Globe, 
  Rocket, Sparkles, CheckCircle2, ArrowRight, 
  ArrowLeft, Zap, Target, Users, ShieldCheck,
  Mail, Phone, Linkedin, Info, Star
} from 'lucide-react';
import { UserProfile } from '../types';
import { INDUSTRIES, ALL_COUNTRIES } from '../constants';

interface OnboardingWizardProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({ ...user });
  const isEmployer = user.isEmployer;

  const totalSteps = isEmployer ? 4 : 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({ ...formData, profileCompleted: true });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePreferences = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [field]: value
      }
    }));
  };

  const renderProgress = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
              step > i + 1 ? 'bg-[#41d599] text-[#0a4179]' : 
              step === i + 1 ? 'bg-[#F0C927] text-[#0a4179] ring-4 ring-[#F0C927]/20' : 
              'bg-white/5 text-white/20 border border-white/10'
            }`}>
              {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
            </div>
          </div>
          {i < totalSteps - 1 && (
            <div className="flex-1 h-[2px] mx-4 bg-white/5 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#F0C927] to-[#41d599] transition-all duration-700"
                style={{ width: step > i + 1 ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderSeekerSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] mx-auto mb-4 shadow-xl border border-[#F0C927]/20">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Welcome, {formData.name.split(' ')[0]}!</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Let's calibrate your neural career profile</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">First Name</label>
                <input 
                  type="text"
                  value={formData.firstName || ''}
                  onChange={e => updateField('firstName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Last Name</label>
                <input 
                  type="text"
                  value={formData.lastName || ''}
                  onChange={e => updateField('lastName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Phone Number</label>
              <input 
                type="tel"
                value={formData.whatsapp || ''}
                onChange={e => updateField('whatsapp', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="+233 24 000 0000"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Location & Reach</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Where should opportunities find you?</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Country</label>
              <select 
                value={formData.country}
                onChange={e => updateField('country', e.target.value)}
                className="w-full bg-[#06213f] border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all appearance-none"
              >
                {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">City</label>
              <input 
                type="text"
                value={formData.city}
                onChange={e => updateField('city', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="Accra"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">LinkedIn URL</label>
              <input 
                type="url"
                value={formData.linkedinUrl || ''}
                onChange={e => updateField('linkedinUrl', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Professional DNA</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Define your core expertise</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Current Job Title</label>
              <input 
                type="text"
                value={formData.jobTitle || ''}
                onChange={e => updateField('jobTitle', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Skills (Comma separated)</label>
              <input 
                type="text"
                value={formData.skills.join(', ')}
                onChange={e => updateField('skills', e.target.value.split(',').map((s: string) => s.trim()))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Experience Summary</label>
              <textarea 
                value={formData.experienceSummary}
                onChange={e => updateField('experienceSummary', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all min-h-[100px] resize-none"
                placeholder="Briefly describe your professional journey..."
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Job Preferences</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">What are you looking for?</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Target Roles (Comma separated)</label>
              <input 
                type="text"
                value={formData.jobPreferences?.roles?.join(', ') || ''}
                onChange={e => updatePreferences('roles', e.target.value.split(',').map((s: string) => s.trim()))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="Product Manager, UX Designer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Preferred Locations</label>
              <input 
                type="text"
                value={formData.jobPreferences?.locations?.join(', ') || ''}
                onChange={e => updatePreferences('locations', e.target.value.split(',').map((s: string) => s.trim()))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F0C927]/50 transition-all"
                placeholder="Accra, Remote, London"
              />
            </div>
            <div className="p-4 rounded-2xl bg-[#41d599]/5 border border-[#41d599]/20 flex items-start gap-3">
              <Zap size={18} className="text-[#41d599] shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#41d599]">Pro Tip: Auto-Apply</p>
                <p className="text-[9px] text-white/40 leading-relaxed font-bold">You can enable Auto-Apply in your settings later to let our AI apply to matching jobs automatically.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEmployerSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] mx-auto mb-4 shadow-xl border border-[#41d599]/20">
                <Building2 size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Organization Setup</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Let's build your hiring command center</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Company Name</label>
              <input 
                type="text"
                value={formData.companyName || ''}
                onChange={e => updateField('companyName', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all"
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Industry</label>
              <select 
                value={formData.industry || ''}
                onChange={e => updateField('industry', e.target.value)}
                className="w-full bg-[#06213f] border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all appearance-none"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Company Details</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Tell us more about your scale</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Company Size</label>
              <select 
                value={formData.companySize || ''}
                onChange={e => updateField('companySize', e.target.value)}
                className="w-full bg-[#06213f] border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all appearance-none"
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="501+">501+ Employees</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Website URL</label>
              <input 
                type="url"
                value={formData.companyWebsite || ''}
                onChange={e => updateField('companyWebsite', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all"
                placeholder="https://acme.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Company Type</label>
              <select 
                value={formData.companyType || ''}
                onChange={e => updateField('companyType', e.target.value)}
                className="w-full bg-[#06213f] border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all appearance-none"
              >
                <option value="">Select Type</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="NGO">NGO</option>
                <option value="Government">Government</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Company Bio</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Share your mission with candidates</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">About the Company</label>
              <textarea 
                value={formData.companyBio || ''}
                onChange={e => updateField('companyBio', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all min-h-[120px] resize-none"
                placeholder="Describe your company's mission, culture, and values..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Headquarters Address</label>
              <input 
                type="text"
                value={formData.companyAddress || ''}
                onChange={e => updateField('companyAddress', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#41d599]/50 transition-all"
                placeholder="123 Business Ave, Accra, Ghana"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Hiring Intent</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">What are your immediate goals?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'post', title: 'Post a Vacancy', desc: 'I have a role ready to be filled immediately.', icon: Briefcase },
                { id: 'brand', title: 'Build Employer Brand', desc: 'I want to showcase our culture to attract talent.', icon: Star },
                { id: 'explore', title: 'Explore Talent Pool', desc: 'I want to see what candidates are available.', icon: Users },
              ].map(option => (
                <button 
                  key={option.id}
                  onClick={() => updateField('velocity', option.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                    formData.velocity === option.id ? 'bg-[#41d599]/10 border-[#41d599] shadow-xl' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    formData.velocity === option.id ? 'bg-[#41d599] text-[#0a4179]' : 'bg-white/5 text-white/20 group-hover:text-white'
                  }`}>
                    <option.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">{option.title}</h4>
                    <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">{option.desc}</p>
                  </div>
                  {formData.velocity === option.id && <CheckCircle2 size={18} className="text-[#41d599] ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#0a4179] flex items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#41d599]/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#F0C927]/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="glass w-full max-w-2xl rounded-[40px] p-8 md:p-12 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative z-10 animate-in zoom-in-95 duration-700 flex flex-col min-h-[600px]">
        {renderProgress()}

        <div className="flex-1">
          {isEmployer ? renderEmployerSteps() : renderSeekerSteps()}
        </div>

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/30 hover:text-white'
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onComplete({ ...formData, profileCompleted: true })}
              className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
            >
              Skip for now
            </button>
            <button 
              onClick={handleNext}
              className={`px-8 py-4 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl flex items-center gap-4 active:scale-95 hover:scale-[1.05] ${
                isEmployer ? 'bg-[#41d599] text-[#0a4179] shadow-[#41d599]/30' : 'bg-[#F0C927] text-[#0a4179] shadow-[#F0C927]/30'
              }`}
            >
              {step === totalSteps ? 'Complete Calibration' : 'Next Protocol'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
