import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getApiKey, dispatchGeminiError } from '../services/geminiService';
import { Job, UserProfile, Message } from '../types';
import { Send, User, Bot, Loader2, X, Sparkles, MessageSquare, Award, Target, Brain } from 'lucide-react';
import Markdown from 'react-markdown';

interface AIInterviewerProps {
  job: Job;
  user: UserProfile;
  onClose: () => void;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({ job, user, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setIsStarted(true);
    setIsLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const prompt = `
        You are an expert AI Interviewer for a company hiring for the position of ${job.title} at ${job.company}.
        
        Job Description:
        ${job.description}
        ${job.responsibilities ? `Responsibilities: ${job.responsibilities}` : ''}
        ${job.requirements ? `Requirements: ${job.requirements}` : ''}
        
        Candidate Profile:
        Name: ${user.name}
        Skills: ${user.skills.join(', ')}
        Experience Summary: ${user.experienceSummary}
        
        Your goal is to conduct a professional, insightful interview. 
        Start by welcoming the candidate and asking the first relevant behavioral or technical question based on the job requirements and their profile.
        Keep your responses concise and professional.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || "Hello! I'm ready to start the interview. Could you tell me about your experience relevant to this role?";
      setMessages([{ role: 'model', text }]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      dispatchGeminiError(msg);
      console.error("Error starting interview:", error);
      setMessages([{ role: 'model', text: "I'm sorry, I encountered an error starting the interview. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      
      // Construct chat history for context
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const prompt = `
        Continue the interview for the position of ${job.title} at ${job.company}.
        The candidate just said: "${userMessage}"
        
        Evaluate their response briefly (internally) and ask the next relevant question. 
        Focus on technical skills if the previous was behavioral, or vice versa. 
        If you have enough information (after 4-5 questions), you can provide a brief summary of their performance and end the interview.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...chatHistory, { role: 'user', parts: [{ text: prompt }] }],
      });
      
      const text = response.text || "Thank you for your response. Let's move to the next question.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      dispatchGeminiError(msg);
      console.error("Error during interview:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Could you please repeat that?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-premium w-full max-w-4xl h-[80vh] flex flex-col rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] shadow-lg">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">AI Interviewer</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Simulating interview for {job.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!isStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#F0C927] to-[#41d599] p-0.5 shadow-2xl animate-pulse">
              <div className="w-full h-full rounded-[1.9rem] bg-[#0a4179] flex items-center justify-center text-[#F0C927]">
                <Sparkles size={48} />
              </div>
            </div>
            <div className="max-w-md space-y-4">
              <h3 className="text-2xl font-black">Ready for your simulation?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Our AI will conduct a realistic interview based on the <span className="text-[#F0C927] font-bold">{job.title}</span> role requirements and your professional profile.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Target size={20} className="text-[#F0C927] mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Role Specific</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <MessageSquare size={20} className="text-[#41d599] mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Real-time Feedback</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Award size={20} className="text-purple-400 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Skill Evaluation</p>
              </div>
            </div>
            <button 
              onClick={startInterview}
              className="px-12 py-4 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.05] active:scale-95 transition-all duration-300"
            >
              Begin Interview Simulation
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-[#F0C927] text-[#0a4179]' : 'bg-white/10 text-white/60'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#F0C927]/10 border border-[#F0C927]/20 text-white' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown>{m.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-white/20" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <Loader2 size={16} className="animate-spin text-[#F0C927]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your response here..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-[#F0C927]/50 transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#F0C927] text-[#0a4179] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[8px] text-center mt-4 text-white/20 font-bold uppercase tracking-tighter">
                This is an AI simulation. Responses are generated for practice purposes only.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIInterviewer;
