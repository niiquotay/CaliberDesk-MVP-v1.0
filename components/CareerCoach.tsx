import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, User, Lock, Crown, Zap, Loader2, ChevronRight, Cpu, ShieldCheck, MessageCircle } from 'lucide-react';
import { UserProfile, Message, Job } from '../types';
import { getCareerAdvice } from '../services/geminiService';

interface CareerCoachProps {
  user: UserProfile;
  isSubscribed: boolean;
  onUpgrade: () => void;
  currentJob?: Job | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CareerCoach: React.FC<CareerCoachProps> = ({ user, isSubscribed, onUpgrade, currentJob, isOpen, setIsOpen }) => {
  const [chatMode, setChatMode] = useState<'ai' | 'live'>('ai');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: 'model', text: `Greetings ${(user?.name || 'User').split(' ')[0]}. I'm your CALIBERDESK Support Agent. How can I assist you with our platform today?` }
  ]);
  const [liveMessages, setLiveMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! How can we help you today? Our team is online and ready to assist." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMessages = chatMode === 'ai' ? aiMessages : liveMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isOpen, chatMode]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', text: input };
    
    if (chatMode === 'ai') {
      const newMessages = [...aiMessages, userMsg];
      setAiMessages(newMessages);
      setInput('');
      setIsTyping(true);

      try {
        const stream = await getCareerAdvice(newMessages, user, currentJob || undefined);
        let fullText = '';
        setAiMessages(prev => [...prev, { role: 'model', text: '' }]);
        
        for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          fullText += chunkText;
          setAiMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = fullText;
            return updated;
          });
        }
      } catch (err) {
        console.error("Coach Error:", err);
        setAiMessages(prev => [...prev, { role: 'model', text: "Synchronization interrupted. Please retry." }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      setLiveMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);
      
      // Simulate admin response
      setTimeout(() => {
        const adminResponse: Message = {
          role: 'model',
          text: "Thank you for your message. An administrator has been notified and will respond shortly. In the meantime, feel free to explore our dashboard."
        };
        setLiveMessages(prev => [...prev, adminResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 bg-[#41d599] text-[#0a4179]"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[350px] h-[500px] bg-[#0a4179] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="p-6 bg-[#06213f] border-b border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599]">
                  {chatMode === 'ai' ? <Cpu size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    {chatMode === 'ai' ? 'Support Agent' : 'Support Live'}
                  </h3>
                  <p className="text-[10px] text-[#41d599] font-bold uppercase tracking-widest">
                    {chatMode === 'ai' ? 'System v4.2 Active' : 'Online • Admin Team'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Mode Switch */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setChatMode('ai')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  chatMode === 'ai' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/50 hover:text-white'
                }`}
              >
                AI Agent
              </button>
              <button
                onClick={() => setChatMode('live')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  chatMode === 'live' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/50 hover:text-white'
                }`}
              >
                Live Chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {currentMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#41d599] text-[#0a4179] rounded-tr-none'
                      : 'bg-white/5 text-white/80 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-white/20">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {chatMode === 'ai' ? 'Agent is typing...' : 'Admin is typing...'}
                </span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-[#06213f] border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#41d599] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-[#41d599] text-[#0a4179] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CareerCoach;