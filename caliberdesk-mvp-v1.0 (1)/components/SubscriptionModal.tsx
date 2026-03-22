import React, { useState, useMemo } from 'react';
import { 
  Crown, Check, Zap, Rocket, ShieldCheck, 
  CreditCard, Loader2, X, Star, Cpu, Video,
  Briefcase, TrendingUp, ArrowUpCircle, MessageSquare,
  Plus, Minus, ChevronDown
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  price: number;
  period: string;
  desc: string;
  perks: string[];
  isNegotiable?: boolean;
}

interface SubscriptionModalProps {
  type: 'seeker' | 'employer';
  upgradeFrom?: 'regular' | 'premium' | 'shortlist'; 
  onSuccess: (amount: number, item: string, tierId?: string, quantity?: number) => void;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ type, upgradeFrom, onSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPerks, setShowPerks] = useState(false);
  
  const seekerTiers: Tier[] = [
    { id: 'seeker_free', name: 'Regular User', price: 0, period: '', desc: 'Feed access.', perks: ['Standard Job Feed', 'Profile Builder', 'Basic Search'] },
    { id: 'seeker_premium', name: 'Premium Seeker', price: 28, period: '/year', desc: 'AI edge search.', perks: ['AI Match Intelligence', 'Stealth Mode Privacy', 'AI Agency Auto-Apply', 'Priority Video Pitch'] },
  ];

  const employerTiers: Tier[] = [
    { id: 'employer_standard', name: 'Standard Post', price: 28, period: '/post', desc: 'Verified visibility.', perks: ['Standard Feed Placement', '7-Day Listing', 'Basic Applicant Tracking'] },
    { id: 'employer_premium', name: 'Gold Tier Post', price: 100, period: '/post', desc: '10x visibility boost.', perks: ['Top-of-Feed Pinning', 'Gold Badge & Border', 'Direct Talent Alerts', 'Enhanced AI Candidate Rank'] },
    { id: 'employer_shortlist', name: 'Shortlist', price: 250, period: '/post', desc: 'Fastest acquisition.', perks: ['24h Talent Delivery', 'AI Auto-Shortlisting', 'Video Screening Toolset', 'Dedicated Hiring Specialist'] },
    { id: 'employer_professional', name: 'Elite Search', price: 0, isNegotiable: true, period: '', desc: 'Executive handling.', perks: ['End-to-end management', 'Negotiable Service Fee', 'Customer Service Concierge', 'Admin Managed Approval'] },
  ];

  const availableTiers = useMemo(() => {
    if (type === 'seeker') return seekerTiers;
    
    if (upgradeFrom) {
      if (upgradeFrom === 'regular') {
        return employerTiers.filter(t => t.id !== 'employer_standard');
      }
      if (upgradeFrom === 'premium') {
        return employerTiers.filter(t => t.id === 'employer_shortlist' || t.id === 'employer_professional');
      }
      if (upgradeFrom === 'shortlist') {
        return employerTiers.filter(t => t.id === 'employer_professional');
      }
    }
    return employerTiers;
  }, [type, upgradeFrom]);

  const [selectedItem, setSelectedItem] = useState(availableTiers[0]?.id);

  const activeTier = useMemo(() => 
    availableTiers.find(t => t.id === selectedItem) || availableTiers[0]
  , [availableTiers, selectedItem]);

  const unitPrice = useMemo(() => {
    if (!activeTier) return 0;
    if (activeTier.isNegotiable) return 0;
    return upgradeFrom ? activeTier.price * 0.9 : activeTier.price;
  }, [activeTier, upgradeFrom]);

  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const handlePayment = () => {
    if (!activeTier) return;
    
    if (activeTier.id === 'employer_professional') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(0, "Professional Hiring Request", activeTier.id, 1);
      }, 1500);
      return;
    }

    if (activeTier.price === 0 && !upgradeFrom) {
      onSuccess(0, activeTier.name, activeTier.id, 1);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(totalPrice, upgradeFrom ? `Upgrade to ${activeTier.name}` : activeTier.name, activeTier.id, quantity);
    }, 2000);
  };

  const showQuantitySelector = type === 'employer' && activeTier && !activeTier.isNegotiable && !upgradeFrom;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030014]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header - Minimalist */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0a4179] to-[#06213f]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F0C927]/10 text-[#F0C927]">
              <Rocket size={14} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest">{upgradeFrom ? 'Tier Refresh' : 'Select Plan'}</h2>
              <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Provisioning Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-[#0a4179]/40">
          
          {/* Plan Selection */}
          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">
              Available Licenses
            </p>
            <div className="grid gap-1.5">
              {availableTiers.map((tier) => (
                <div 
                  key={tier.id}
                  onClick={() => {
                    setSelectedItem(tier.id);
                    if (tier.isNegotiable) setQuantity(1);
                  }}
                  className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedItem === tier.id ? 'border-[#41d599] bg-[#41d599]/10' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-[10px] uppercase tracking-wider">{tier.name}</h4>
                    <p className="text-[8px] text-white/40 mt-0.5 truncate">{tier.desc}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="flex flex-col items-end">
                      {tier.isNegotiable ? (
                        <p className="text-xs font-black text-[#41d599]">Request</p>
                      ) : (
                        <>
                          {upgradeFrom && (
                            <span className="text-[7px] line-through text-white/20">${tier.price}</span>
                          )}
                          <p className="text-xs font-black">
                            ${upgradeFrom ? (tier.price * 0.9).toFixed(0) : tier.price}
                            <span className="text-[8px] font-normal text-white/40">{tier.period}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perks Preview - Collapsible */}
          <div className="border-t border-white/5 pt-3">
             <button 
               onClick={() => setShowPerks(!showPerks)}
               className="w-full flex items-center justify-between px-1 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
             >
               Included Features
               <ChevronDown size={10} className={`transition-transform duration-300 ${showPerks ? 'rotate-180' : ''}`} />
             </button>
             {showPerks && (
               <div className="mt-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-300">
                  {activeTier?.perks.map((perk, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <div className="shrink-0 w-4 h-4 rounded-md bg-[#41d599]/10 flex items-center justify-center text-[#41d599]">
                        <Check size={8} />
                      </div>
                      <p className="font-bold text-[8px] text-white/50 truncate leading-tight">{perk}</p>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {showQuantitySelector && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
               <div className="flex items-center justify-between px-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Quantity</p>
                 <span className="text-[7px] font-black uppercase text-[#41d599]">Bulk Applied</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
                     <button 
                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
                       className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                     >
                        <Minus size={10} />
                     </button>
                     <div className="w-6 text-center font-black text-xs">{quantity}</div>
                     <button 
                       onClick={() => setQuantity(Math.min(99, quantity + 1))}
                       className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                     >
                        <Plus size={10} />
                     </button>
                  </div>
                  
                  <div className="flex gap-1">
                     {[1, 5, 10].map(n => (
                       <button 
                         key={n}
                         onClick={() => setQuantity(n)}
                         className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${quantity === n ? 'bg-[#41d599] text-[#0a4179] border-[#41d599]' : 'bg-white/5 border-white/10 text-white/40'}`}
                       >
                         {n}x
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* Secure Settlement Area */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            {!activeTier?.isNegotiable && (
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-white/20" size={14} />
                  <div>
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Gateway Locked</p>
                    <div className="flex gap-1 mt-0.5">
                      <div className="px-1 py-0.5 rounded-sm bg-white/10 flex items-center justify-center font-black text-[5px]">VISA</div>
                      <div className="px-1 py-0.5 rounded-sm bg-white/10 flex items-center justify-center font-black text-[5px]">MC</div>
                    </div>
                  </div>
                </div>
                {showQuantitySelector && (
                  <div className="text-right">
                     <p className="text-[7px] font-black uppercase text-white/20">Settlement</p>
                     <p className="text-sm font-black text-[#41d599] tracking-tighter">${totalPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[9px] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${activeTier?.isNegotiable ? 'bg-[#f1ca27] text-[#0a4179]' : 'bg-[#41d599] text-[#0a4179]'}`}
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : activeTier?.isNegotiable ? <MessageSquare size={12} /> : <ShieldCheck size={12} />}
              {isProcessing ? 'PROCESSING' : activeTier?.isNegotiable ? 'PROVISION REQUEST' : `ACTIVATE ${quantity > 1 ? `${quantity} UNITS` : 'PLAN'}`}
            </button>
            <div className="flex items-center justify-center gap-2 opacity-20">
               <ShieldCheck size={10} />
               <p className="text-[7px] font-black uppercase tracking-[0.2em]">Neural Encryption Active • AES-256</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;