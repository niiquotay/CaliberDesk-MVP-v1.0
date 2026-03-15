
import React, { useState } from 'react';
import { X, Bell, Mail, Trash2, Plus, Settings, Sparkles, Check } from 'lucide-react';
import { JobAlert } from '../types';

interface JobAlertsModalProps {
  alerts: JobAlert[];
  onSave: (alert: Omit<JobAlert, 'id' | 'isActive'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  initialKeywords?: string;
  initialLocation?: string;
}

const JobAlertsModal: React.FC<JobAlertsModalProps> = ({ 
  alerts, 
  onSave, 
  onDelete, 
  onClose,
  initialKeywords = '',
  initialLocation = ''
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [location, setLocation] = useState(initialLocation);
  const [minSalary, setMinSalary] = useState(100);
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  const handleCreate = () => {
    onSave({ keywords, location, minSalary, frequency });
    setIsCreating(false);
    setKeywords('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0a4179] to-[#1c7283]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ea38e] flex items-center justify-center text-white shadow-lg shadow-[#2ea38e]/20">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Job Alerts</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Never miss an opportunity</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6 bg-[#0a4179]">
          {isCreating ? (
            <div className="space-y-4 p-6 rounded-3xl border border-[#2ea38e]/30 bg-[#2ea38e]/5 animate-in slide-in-from-top-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Plus size={16} className="text-[#41d599]" /> New Alert Criteria
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Keywords</label>
                  <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:border-[#41d599] transition-all outline-none text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:border-[#41d599] transition-all outline-none text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Min. Salary (k/yr)</label>
                  <input 
                    type="number" 
                    value={minSalary}
                    onChange={(e) => setMinSalary(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:border-[#41d599] transition-all outline-none text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Frequency</label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:border-[#41d599] transition-all outline-none appearance-none text-white"
                  >
                    <option value="instant" className="bg-[#0a4179]">Instant</option>
                    <option value="daily" className="bg-[#0a4179]">Daily</option>
                    <option value="weekly" className="bg-[#0a4179]">Weekly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-3 rounded-xl bg-[#41d599] text-[#0a4179] text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                >
                  Create Alert
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full py-4 rounded-3xl border-2 border-dashed border-white/10 hover:border-[#41d599]/40 hover:bg-[#41d599]/5 flex items-center justify-center gap-3 transition-all group"
            >
              <Plus size={20} className="text-slate-500 group-hover:text-[#41d599]" />
              <span className="text-sm font-bold text-slate-500 group-hover:text-white">Add New Job Alert</span>
            </button>
          )}

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Active Alerts ({alerts.length})</h4>
            {alerts.length === 0 ? (
              <div className="text-center py-12 px-8 rounded-3xl border border-dashed border-white/5 bg-white/[0.01]">
                <Bell size={32} className="mx-auto text-slate-700 mb-4" />
                <p className="text-sm text-slate-500">You haven't set up any alerts yet.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="group glass rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#41d599] group-hover:bg-[#41d599]/10 transition-all">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{alert.keywords}</p>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#41d599]/10 text-[#41d599] border border-[#41d599]/20 font-black uppercase tracking-widest">Active</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {alert.location || 'Global'} • ${alert.minSalary}k+ • {alert.frequency}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(alert.id)}
                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAlertsModal;
