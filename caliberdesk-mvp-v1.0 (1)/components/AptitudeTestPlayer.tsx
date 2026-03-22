import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck, Clock, ShieldCheck, AlertTriangle, 
  Brain, CheckCircle2, ChevronRight, X, Camera, 
  ShieldAlert, Sparkles, Loader2, Play, Lock,
  ChevronLeft, LogOut, Terminal as TerminalIcon, Activity, Info, Zap
} from 'lucide-react';
import { AptitudeTest, AptitudeQuestion } from '../types';

interface AptitudeTestPlayerProps {
  test: AptitudeTest;
  onComplete: (score: number, proctorFlags: number) => void;
  onCancel: () => void;
}

const Terminal = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const AptitudeTestPlayer: React.FC<AptitudeTestPlayerProps> = ({ test, onComplete, onCancel }) => {
  const [stage, setStage] = useState<'guidelines' | 'active' | 'results' | 'timeout'>('guidelines');
  const [timeLeft, setTimeLeft] = useState(test?.timeLimit ? test.timeLimit * 60 : 600);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [proctorFlags, setProctorFlags] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: any;
    if (stage === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && stage === 'active') {
      setStage('timeout');
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stage === 'active') {
        setProctorFlags(prev => prev + 1);
      }
    };
    const handleBlur = () => {
      if (stage === 'active') {
        setProctorFlags(prev => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [stage]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera proctoring failed:", err);
    }
  };

  const startTest = () => {
    initCamera().catch(err => console.error("Camera proctoring init error:", err));
    setStage('active');
  };

  const handleSubmit = () => {
    setIsSyncing(true);
    let correct = 0;
    test.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / test.questions.length) * 100);
    
    setTimeout(() => {
      setIsSyncing(false);
      onComplete(score, proctorFlags);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (stage === 'guidelines') {
    return (
      <div className="fixed inset-0 z-[200] bg-[#06213f]/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="glass w-full max-w-2xl rounded-[48px] p-10 border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#F0C927]/10 blur-[100px]"></div>
           <div className="flex flex-col items-center text-center space-y-8 relative z-10">
              <div className="w-20 h-20 rounded-[32px] bg-[#F0C927]/10 border border-[#F0C927]/20 flex items-center justify-center text-[#F0C927] shadow-xl">
                 <Brain size={40} />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black uppercase tracking-tight">Assessment <span className="text-[#F0C927]">Manifest</span></h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">{test.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Question Load</p>
                    <p className="text-lg font-black">{test.questions.length} Scenario Units</p>
                 </div>
                 <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Temporal Limit</p>
                    <p className="text-lg font-black">{test.timeLimit} Minutes</p>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 text-left space-y-6">
                 <div className="flex items-center gap-3 text-[#F0C927] font-black text-xs uppercase tracking-widest">
                    <Info size={18} /> Assessment Protocol
                 </div>
                 <div className="space-y-4">
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] mt-1.5 shrink-0"></div>
                       <p className="text-xs text-white/60 leading-relaxed font-medium">Ensure a stable network connection and active camera before initializing session.</p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] mt-1.5 shrink-0"></div>
                       <p className="text-xs text-white/60 leading-relaxed font-medium">Operate within a distraction-free environment to maintain focus telemetry.</p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] mt-1.5 shrink-0"></div>
                       <p className="text-xs text-white/60 leading-relaxed font-medium">Analyze each scenario thoroughly; responses are final once committed to the manifest.</p>
                    </div>
                 </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-[28px] p-6 text-left space-y-4">
                 <div className="flex items-center gap-3 text-orange-400 font-black text-xs uppercase tracking-widest">
                    <ShieldAlert size={18} /> Proctoring Protocol Active
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed">
                    This session is being monitored. Tab-switching or minimizing the browser will be flagged in the final manifest sent to the hiring organization.
                 </p>
              </div>
              <div className="flex gap-4 w-full pt-4">
                 <button onClick={onCancel} className="flex-1 py-5 rounded-[22px] bg-white/5 border border-white/10 font-black uppercase text-[10px] hover:bg-white/10 transition-all">Abort Protocol</button>
                 <button onClick={startTest} className="flex-[2] py-5 rounded-[22px] bg-[#F0C927] text-[#0a4179] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#F0C927]/20 hover:scale-105 active:scale-95 transition-all">Initialize Session</button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a4179] flex flex-col animate-in fade-in duration-500">
      {/* HUD Header */}
      <header className="p-6 md:px-10 border-b border-white/10 bg-[#06213f] flex items-center justify-between shadow-xl relative z-20">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0a4179] flex items-center justify-center text-[#F0C927] border border-white/10 shadow-lg">
               <Terminal size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{test.title}</h3>
               <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1.5 text-[#41d599] text-[8px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] animate-pulse"></div> Session Synced
                  </div>
                  <span className="text-white/20 text-[8px]">|</span>
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Breaches Flagged: {proctorFlags}</span>
               </div>
            </div>
         </div>

         <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
            <Clock size={18} className={timeLeft < 60 ? 'animate-pulse' : ''} />
            <span className="text-xl font-mono font-black tracking-tighter">{formatTime(timeLeft)}</span>
         </div>
      </header>

      {/* Main Testing Environment */}
      <main className="flex-1 grid lg:grid-cols-4 overflow-hidden relative">
         {/* Question Area */}
         <div className="lg:col-span-3 overflow-y-auto custom-scrollbar p-6 md:p-12 space-y-10 relative z-10">
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 rounded-lg bg-[#F0C927]/10 text-[#F0C927] text-[10px] font-black uppercase tracking-widest border border-[#F0C927]/20">
                       Scenario {currentIndex + 1} of {test.questions.length}
                     </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-white/90">
                    {currentQ.scenario}
                  </h2>
               </div>

               <div className="grid gap-4">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => setAnswers({...answers, [currentQ.id]: i})}
                      className={`w-full p-6 rounded-[32px] border text-left transition-all group flex items-center gap-5 ${answers[currentQ.id] === i ? 'bg-[#F0C927] border-[#F0C927] text-[#0a4179] shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'}`}
                    >
                       <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${answers[currentQ.id] === i ? 'bg-[#0a4179] text-[#F0C927]' : 'bg-white/5 text-white/30 group-hover:text-white'}`}>
                          {String.fromCharCode(65 + i)}
                       </div>
                       <span className="text-sm font-bold leading-relaxed">{opt}</span>
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Proctor Sidebar */}
         <aside className="hidden lg:flex flex-col border-l border-white/5 bg-[#06213f]/40 backdrop-blur-md p-8 justify-between relative z-10">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-1">Visual Proctoring</h4>
                  <div className="aspect-video rounded-3xl bg-black border-4 border-white/5 shadow-inner overflow-hidden relative group">
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                     <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#41d599]/80 text-[#0a4179] text-[7px] font-black uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a4179] animate-pulse"></div> Live Scan
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-1">Progress Index</h4>
                  <div className="grid grid-cols-5 gap-2">
                     {test.questions.map((q, idx) => (
                       <button 
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`aspect-square rounded-xl border flex items-center justify-center text-[10px] font-black transition-all ${currentIndex === idx ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927] shadow-lg scale-110' : answers[q.id] !== undefined ? 'bg-[#41d599]/20 border-[#41d599]/40 text-[#41d599]' : 'bg-white/5 border-white/10 text-white/20'}`}
                       >
                         {idx + 1}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5">
               <button 
                 onClick={handleSubmit}
                 disabled={Object.keys(answers).length < test.questions.length || isSyncing}
                 className="w-full py-5 rounded-[22px] bg-[#41d599] text-[#0a4179] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[#41d599]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
               >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Finalize Manifest
               </button>
               <p className="text-[8px] text-center text-white/20 uppercase font-black tracking-widest mt-4">Automated Session Submission v4.2</p>
            </div>
         </aside>

         {/* Navigation HUD - Bottom Mobile Only */}
         <div className="lg:hidden absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#06213f] to-transparent flex items-center justify-between gap-4">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(p => p - 1)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 disabled:opacity-10"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Scenario {currentIndex + 1} of {test.questions.length}</div>
            <button 
              disabled={currentIndex === test.questions.length - 1}
              onClick={() => setCurrentIndex(p => p + 1)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 disabled:opacity-10"
            >
              <ChevronRight size={24} />
            </button>
         </div>
      </main>

      {/* Syncing Overlay */}
      {isSyncing && (
        <div className="absolute inset-0 z-[100] bg-[#0a4179]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
           <div className="relative mb-12">
              <div className="w-32 h-32 rounded-[40px] border-8 border-white/5 border-t-[#F0C927] animate-spin"></div>
              <Sparkles size={48} className="absolute inset-0 m-auto text-[#41d599] animate-pulse" />
           </div>
           <div className="space-y-4 max-w-sm">
              <h2 className="text-3xl font-black uppercase tracking-tight">Syncing <span className="text-[#F0C927]">Manifest</span></h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Encrypting neural session telemetry...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTestPlayer;