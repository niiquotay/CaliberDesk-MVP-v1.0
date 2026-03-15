import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string;
}

interface LiveChatProps {
  user: UserProfile;
}

const LiveChat: React.FC<LiveChatProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! How can we help you today? Our team is online and ready to assist.",
      sender: 'admin',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate sending to administrator
    console.log(`[LIVE CHAT] Message from ${user.name || 'Guest'}: ${message}`);
    
    // Simulate admin response
    setIsTyping(true);
    setTimeout(() => {
      const adminResponse: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: "Thank you for your message. An administrator has been notified and will respond shortly. In the meantime, feel free to explore our dashboard.",
        sender: 'admin',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, adminResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-[#0a4179] rotate-90' : 'bg-[#41d599] text-[#0a4179]'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-[#0a4179] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="p-6 bg-[#06213f] border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Support Live</h3>
              <p className="text-[10px] text-[#41d599] font-bold uppercase tracking-widest">Online • Admin Team</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#41d599] text-[#0a4179] rounded-tr-none'
                      : 'bg-white/5 text-white/80 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-white/20">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Admin is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-[#06213f] border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#41d599] transition-all"
            />
            <button
              type="submit"
              disabled={!message.trim()}
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

export default LiveChat;
