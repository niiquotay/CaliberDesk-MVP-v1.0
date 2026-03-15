import React, { useState } from 'react';
import { ShieldCheck, Mail, FileText, X, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { UserProfile } from '../types';

interface CompanyVerificationModalProps {
  user: UserProfile;
  onClose: () => void;
  onVerified: (updatedUser: UserProfile) => void;
}

const CompanyVerificationModal: React.FC<CompanyVerificationModalProps> = ({ user, onClose, onVerified }) => {
  const [step, setStep] = useState<'choice' | 'email' | 'document' | 'success'>('choice');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);

  const handleEmailRequest = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch('/api/employer/verify-email-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setStep('email');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send verification code.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEmailSubmit = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/employer/verify-email-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (response.ok) {
        onVerified(data.user);
        setStep('success');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/employer/upload-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      });
      const data = await response.json();
      if (response.ok) {
        onVerified(data.user);
        setStep('success');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Upload failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocuments(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a213f] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0C927]/20 flex items-center justify-center text-[#F0C927]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-white uppercase">Company Verification</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Secure your organization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'choice' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-white font-bold">Why verify?</h3>
                <ul className="space-y-2">
                  {[
                    'Post unlimited jobs',
                    'Standard 28-day listing duration',
                    'Verified badge on your profile',
                    'Priority in candidate matching',
                    'Access to premium hiring tools'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle size={14} className="text-[#41d599]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => setStep('email')}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Corporate Email</h4>
                    <p className="text-[10px] text-white/40">Instant verification via company domain</p>
                  </div>
                </button>

                <button
                  onClick={() => setStep('document')}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Business Documents</h4>
                    <p className="text-[10px] text-white/40">For public emails (Gmail, Yahoo, etc.)</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hr@yourcompany.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#F0C927] transition-all"
                />
                <p className="text-[9px] text-white/30 italic">Must match your company domain. Public emails not allowed.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                onClick={handleEmailRequest}
                disabled={isSending || !email}
                className="w-full py-4 bg-[#F0C927] text-[#0a213f] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification Code'}
              </button>
              
              <button onClick={() => setStep('choice')} className="w-full text-center text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                Back to options
              </button>
            </div>
          )}

          {step === 'email' && user.verificationEmail && (
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-[1em] outline-none focus:border-[#F0C927] transition-all"
                />
              </div>

              <button
                onClick={handleEmailSubmit}
                disabled={isVerifying || code.length !== 6}
                className="w-full py-4 bg-[#41d599] text-[#0a213f] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify Code'}
              </button>
            </div>
          )}

          {step === 'document' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-xs text-blue-400 leading-relaxed">
                  Please upload your business registration certificate, tax ID, or other official documents. Our team will review them within 24-48 hours.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Upload Documents</label>
                <div 
                  onClick={() => document.getElementById('doc-upload')?.click()}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-white/5 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white font-bold">Click to upload</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <input id="doc-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              {documents.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative group">
                      <img src={doc} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setDocuments(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                onClick={handleDocumentUpload}
                disabled={isVerifying || documents.length === 0}
                className="w-full py-4 bg-[#F0C927] text-[#0a213f] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 size={16} className="animate-spin" /> : 'Submit for Review'}
              </button>

              <button onClick={() => setStep('choice')} className="w-full text-center text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                Back to options
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#41d599]/20 flex items-center justify-center text-[#41d599] mx-auto animate-bounce">
                <CheckCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                  {user.verificationMethod === 'email' ? 'Verified!' : 'Submitted!'}
                </h3>
                <p className="text-sm text-white/60">
                  {user.verificationMethod === 'email' 
                    ? 'Your company is now fully verified. You can now post unlimited jobs.' 
                    : 'Your documents have been submitted for review. We will notify you once verified.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyVerificationModal;
