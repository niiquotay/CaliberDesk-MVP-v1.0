import React, { useState } from 'react';
import { 
  Bell, Mail, Zap, Briefcase, Info, ChevronRight, ArrowLeft, 
  Trash2, CheckCircle2, Clock, Search, Filter, Sparkles, ExternalLink
} from 'lucide-react';
import { AppNotification, UserProfile, ViewType } from '../types';

interface NotificationsProps {
  user: UserProfile;
  onNavigate: (view: ViewType, params?: any) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ 
  user, 
  onNavigate, 
  onMarkAsRead, 
  onDelete, 
  onBack 
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const notifications = user.notifications || [];
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const getIcon = (category: string) => {
    switch (category) {
      case 'recommendation': return <Briefcase size={16} className="text-[#F0C927]" />;
      case 'auto-apply': return <Zap size={16} className="text-[#41d599]" />;
      case 'application': return <CheckCircle2 size={16} className="text-blue-400" />;
      default: return <Info size={16} className="text-white/40" />;
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      onMarkAsRead(n.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 text-white pb-32 px-4 md:px-0">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black">Alerts & Notifications</h1>
            <p className="text-white/40 text-[10px] font-black mt-1">Operational Logs & Alerts Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${filter === 'all' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${filter === 'unread' ? 'bg-[#F0C927] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List */}
        <div className="md:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-[40px] p-6 border-white/5 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-white/20">
                <Bell size={20} />
              </div>
              <p className="text-[9px] font-black text-white/20">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => (
              <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`group transition-all duration-300 rounded-xl p-3 border cursor-pointer relative overflow-hidden ${
                  selectedNotification?.id === n.id 
                    ? 'bg-gradient-to-r from-[#F0C927]/20 to-white/5 border-[#F0C927]/30 shadow-[0_0_20px_rgba(240,201,39,0.1)]' 
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                  selectedNotification?.id === n.id ? 'bg-[#F0C927]' : n.isRead ? 'bg-transparent' : 'bg-blue-500/50'
                }`}></div>
                {!n.isRead && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F0C927] rounded-full shadow-[0_0_8px_rgba(240,201,39,0.5)]"></div>}
                <div className="flex gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 ${n.isRead ? 'bg-white/5 opacity-50' : 'bg-[#0a4179]'}`}>
                    {getIcon(n.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-[11px] font-black truncate tracking-tight ${n.isRead ? 'text-white/40' : 'text-white'}`}>{n.title}</h4>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <Clock size={8} /> {new Date(n.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2">
          {selectedNotification ? (
            <div className="rounded-[40px] p-6 border-white/10 space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a4179] border border-[#F0C927]/30 flex items-center justify-center text-[#F0C927] shadow-xl">
                    {getIcon(selectedNotification.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{selectedNotification.title}</h3>
                    <p className="text-[9px] text-white/30 font-black">
                      {selectedNotification.type === 'both' ? 'In-App & Email' : selectedNotification.type} • {new Date(selectedNotification.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { onDelete(selectedNotification.id); setSelectedNotification(null); }}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                  <p className="text-xs text-white/80 leading-relaxed italic whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                {selectedNotification.actionLink && (
                  <div className="pt-2">
                    <button 
                      onClick={() => onNavigate(selectedNotification.actionLink!.view, selectedNotification.actionLink!.params)}
                      className="w-full py-3 rounded-xl bg-[#F0C927] text-[#0a4179] font-black text-[10px] shadow-xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      {selectedNotification.actionLink.label}
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
                  <Sparkles size={12} />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                  This message was generated by CaliberDesk Neural Engine
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[40px] h-full flex flex-col items-center justify-center p-8 border-white/5 text-center space-y-4 opacity-40">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/10">
                <Mail size={32} />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-widest">Select a message</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Choose a notification from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
