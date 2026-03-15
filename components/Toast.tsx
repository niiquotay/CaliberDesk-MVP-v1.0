
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-10 duration-500">
      <div className={`glass flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border ${
        type === 'success' ? 'border-[#41d599]/30 bg-[#41d599]/5' : 
        type === 'error' ? 'border-red-500/30 bg-red-500/5' : 
        'border-blue-500/30 bg-blue-500/5'
      }`}>
        <div className={`p-2 rounded-xl ${
          type === 'success' ? 'bg-[#41d599]/20 text-[#41d599]' : 
          type === 'error' ? 'bg-red-500/20 text-red-400' : 
          'bg-blue-500/20 text-blue-400'
        }`}>
          {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>
        <p className="text-sm font-bold text-white whitespace-nowrap">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/20 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
