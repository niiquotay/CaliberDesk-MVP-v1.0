import React from 'react';
import { 
  CreditCard, History, Download, ShieldCheck, 
  Crown, CheckCircle2, ArrowRight, ExternalLink,
  ChevronRight, Calendar, DollarSign, Receipt
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';

interface BillingProps {
  user: UserProfile;
  onUpgrade: () => void;
}

const Billing: React.FC<BillingProps> = ({ user, onUpgrade }) => {
  // Logic: Calculate dynamic "Next Cycle" based on current date + 1 year
  const nextBillingDate = new Date();
  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
  const formattedNextCycle = nextBillingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white pb-32 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black">Financial History</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Manage subscriptions and transaction ledger</p>
        </div>
        {!user.isSubscribed && (
          <button 
            onClick={onUpgrade}
            className="px-8 py-4 bg-[#f1ca27] text-[#0a4179] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#f1ca27]/10 active:scale-95 transition-all"
          >
            Upgrade Account
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Plan Status */}
        <div className="glass rounded-[32px] p-8 border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Subscription</p>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${user.isSubscribed ? 'bg-[#f1ca27]/10 text-[#f1ca27]' : 'bg-white/5 text-white/40'}`}>
                {user.isSubscribed ? <Crown size={24} /> : <CreditCard size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold capitalize">{user.subscriptionTier || 'Standard'} Tier</h3>
                <p className="text-xs text-white/40 font-bold uppercase">
                  {user.isSubscribed ? `Next Cycle: ${formattedNextCycle}` : 'Basic Access'}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-8 space-y-3">
             <div className={`flex items-center gap-3 text-xs font-bold ${user.isSubscribed ? 'text-[#41d599]' : 'text-white/20'}`}>
               <CheckCircle2 size={14} /> AI Match Intelligence
             </div>
             <div className={`flex items-center gap-3 text-xs font-bold ${user.isSubscribed ? 'text-[#41d599]' : 'text-white/20'}`}>
               <CheckCircle2 size={14} /> Full Comm Studio Access
             </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="glass rounded-[32px] p-8 border-white/10 shadow-2xl space-y-4 md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Linked Payment Credentials</p>
          <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-bold italic text-[8px] tracking-tighter">
                VISA
              </div>
              <div>
                <p className="font-bold text-sm">•••• •••• •••• 4242</p>
                <p className="text-[10px] text-white/40 font-bold uppercase">Expires 12/28</p>
              </div>
            </div>
            <button className="p-2 text-white/20 hover:text-white transition-colors">
              <ExternalLink size={18} />
            </button>
          </div>
          <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
            + Provision New Method
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <History size={20} className="text-[#41d599]" /> Ledger Entries
          </h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Export .CSV</button>
        </div>

        <div className="glass rounded-[40px] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                <tr>
                  <th className="px-8 py-5">Product / Item</th>
                  <th className="px-8 py-5">Ref ID</th>
                  <th className="px-8 py-5">Settlement Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!user.purchaseHistory || user.purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <Receipt size={48} className="mx-auto text-white/5 mb-4" />
                      <p className="text-sm text-white/20 italic">No financial movements recorded for this identity.</p>
                    </td>
                  </tr>
                ) : (
                  user.purchaseHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-white">{tx.item}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{tx.paymentMethod}</p>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-white/30">#{tx.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Calendar size={12} className="text-[#41d599]" />
                          {new Date(tx.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-[#41d599]">${tx.amount.toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                          tx.status === 'completed' ? 'bg-[#41d599]/10 text-[#41d599]' : 'bg-white/5 text-white/40'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;