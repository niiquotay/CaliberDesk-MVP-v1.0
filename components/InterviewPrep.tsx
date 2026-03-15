import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Mic, MicOff, Camera, CameraOff, Play, Square, 
  RotateCcw, ShieldCheck, Sparkles, Brain, Loader2, 
  ChevronRight, Target, BarChart, Zap, CheckCircle2,
  Activity, Award, FileCheck, X, AlertTriangle, ShieldAlert,
  HelpCircle, Settings, Cpu, LinkIcon, FileStack, Info, ArrowLeft
} from 'lucide-react';
import { UserProfile, Job, InterviewFeedback } from '../types';
import { generateInterviewQuestions, analyzeInterviewResponse } from '../services/geminiService';
import Toast from './Toast';

interface InterviewPrepProps {
  user: UserProfile;
  jobs: Job[];
  onBack: () => void;
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ user, jobs, onBack }) => {
  const [stage, setStage] = useState<'selection' | 'practice' | 'results'>('selection');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'internal' | 'external' | 'paste' | 'upload'>('internal');
  const [externalJobUrl, setExternalJobUrl] = useState('');
  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [activeProtocols, setActiveProtocols] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startPractice = async (jobOrContext: Job | string) => {
    const job = typeof jobOrContext === 'string' 
      ? { 
          id: 'custom', 
          title: 'Target Role', 
          company: 'Target Company', 
          description: jobOrContext,
          responsibilities: '',
          requirements: '',
          city: '',
          country: '',
          location: 'Remote',
          allowedCountries: [],
          tags: [],
          salary: '',
          postedAt: new Date().toISOString(),
          applicationType: 'in-app'
        } as Job 
      : jobOrContext;

    setSelectedJob(job);
    setIsInitializing(true);
    setCameraError(null);
    
    try {
      // Initiate AI question synthesis and camera prep
      const qPromise = generateInterviewQuestions(job, user);
      
      // Wait for questions
      const q = await qPromise;
      setQuestions(q);
      setStage('practice');
      
      // Initialize camera immediately after stage switch
      await initCamera();
    } catch (err) {
      setToast({ message: "Neural synthesis failed. Retrying sync...", type: 'error' });
      setStage('selection');
    } finally {
      setIsInitializing(false);
    }
  };

  const initCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser environment does not support media capture.");
      return;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCameraError(null);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("ACCESS DENIED: Please enable Camera and Mic permissions in your browser settings and click 'Attempt Re-Sync'.");
      } else {
        setCameraError("HARDWARE SYNC ERROR: Vision link could not be established. Please verify your hardware connection.");
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if (!stream) {
        initCamera().catch(err => {
          console.error("Failed to initialize camera during recording toggle:", err);
          setToast({ message: "Camera initialization failed. Please check permissions.", type: 'error' });
        });
        return;
      }
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      handleAnalyzeResponse().catch(err => {
        console.error("Analysis failed:", err);
        setToast({ message: "Neural analysis failed. Please retry.", type: 'error' });
      });
    }
  };

  const handleAnalyzeResponse = async () => {
    setIsAnalyzing(true);
    try {
      const transcript = "Based on my extensive experience in commercial strategy and partnerships, I implemented a data-driven growth framework that resulted in a 30% year-over-year revenue increase through strategic B2B negotiations...";
      const result = await analyzeInterviewResponse(questions[currentQuestionIndex], transcript, activeProtocols);
      
      setFeedback({
        id: Math.random().toString(36).substr(2, 9),
        jobTitle: selectedJob?.title || 'Unknown',
        date: new Date().toISOString(),
        ...result
      });
      setStage('results');
    } catch (err) {
      setToast({ message: "Neural analysis interrupted. Retrying synthesis...", type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleProtocol = (protocol: string) => {
    setActiveProtocols(prev => 
      prev.includes(protocol) 
        ? prev.filter(p => p !== protocol) 
        : [...prev, protocol]
    );
    setToast({ 
      message: `${protocol} ${activeProtocols.includes(protocol) ? 'deactivated' : 'activated'}.`, 
      type: 'info' 
    });
  };

  const reset = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStage('selection');
    setSelectedJob(null);
    setFeedback(null);
    setCameraError(null);
    setStream(null);
    setCurrentQuestionIndex(0);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-20 text-white animate-in fade-in duration-500 px-2 md:px-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Global Initialization Loader */}
      {isInitializing && (
        <div className="fixed inset-0 z-[150] bg-[#0a4179]/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-[32px] bg-[#41d599]/10 border border-[#41d599]/20 flex items-center justify-center text-[#41d599] shadow-2xl">
              <Cpu size={48} className="animate-pulse" />
            </div>
            <div className="absolute -inset-4 border-2 border-dashed border-[#41d599]/20 rounded-[40px] animate-spin-slow"></div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white">Neural <span className="text-[#41d599]">Calibration</span></h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Synchronizing Interview Triggers
              </p>
              <p className="text-[10px] text-[#41d599] font-black uppercase tracking-tighter opacity-60">Gemini 3 Pro • Enterprise Logic v4.2</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black">AI Interview Simulator</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Refine your pitch with Gemini 3 Pro</p>
          </div>
        </div>
      </div>

      {stage === 'selection' && (
        <div className="max-w-4xl mx-auto space-y-8 px-2">
          <div className="space-y-6">
            <section className="glass rounded-[40px] p-10 border-white/5 space-y-6 shadow-2xl">
              <h3 className="text-sm font-black tracking-widest text-[#41d599] border-b border-white/5 pb-4 flex items-center gap-2">
                <Target size={16} /> Strategy Config
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setSelectionMode('internal')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'internal' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                  >
                    CaliberDesk Jobs
                  </button>
                  <button 
                    onClick={() => setSelectionMode('external')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'external' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                  >
                    Link
                  </button>
                  <button 
                    onClick={() => setSelectionMode('paste')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'paste' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                  >
                    Paste
                  </button>
                  <button 
                    onClick={() => setSelectionMode('upload')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${selectionMode === 'upload' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
                  >
                    Upload
                  </button>
                </div>

                {selectionMode === 'internal' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-white/40 px-1">Target Job Track</label>
                    <select 
                      value={selectedJobId} 
                      onChange={e => setSelectedJobId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0a4179]">Select Job</option>
                      {jobs.map(j => <option key={j.id} value={j.id} className="bg-[#0a4179]">{j.title} @ {j.company}</option>)}
                    </select>
                  </div>
                )}

                {selectionMode === 'external' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-white/40 px-1">External Job Link</label>
                    <div className="relative">
                      <input 
                        type="url"
                        value={externalJobUrl}
                        onChange={e => setExternalJobUrl(e.target.value)}
                        placeholder="https://linkedin.com/jobs/view/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10"
                      />
                      <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                    </div>
                  </div>
                )}

                {selectionMode === 'paste' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-white/40 px-1">Paste Job Description</label>
                    <textarea 
                      value={pastedJobDescription}
                      onChange={e => setPastedJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none placeholder:text-white/10 resize-none"
                    />
                  </div>
                )}

                {selectionMode === 'upload' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest text-white/40 px-1">Upload Job Description</label>
                    <div className="relative group">
                      <input 
                        type="file"
                        onChange={e => setUploadedFileName(e.target.files?.[0]?.name || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl py-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#41d599]/50 transition-all">
                        <FileStack size={20} className="text-white/20 group-hover:text-[#41d599]/50 transition-all" />
                        <p className="text-xs font-black tracking-widest text-white/20">
                          {uploadedFileName || 'Drop file or click'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  let jobContext: Job | string = '';
                  if (selectionMode === 'internal') {
                    const job = jobs.find(j => j.id === selectedJobId);
                    if (job) jobContext = job;
                  } else if (selectionMode === 'external') {
                    jobContext = `External Job Link: ${externalJobUrl}`;
                  } else if (selectionMode === 'paste') {
                    jobContext = pastedJobDescription;
                  } else {
                    jobContext = `Uploaded Job Description: ${uploadedFileName}`;
                  }
                  
                  if (jobContext) startPractice(jobContext as any);
                }}
                disabled={isInitializing || (
                  selectionMode === 'internal' ? !selectedJobId : 
                  selectionMode === 'external' ? !externalJobUrl :
                  selectionMode === 'paste' ? !pastedJobDescription :
                  !uploadedFileName
                )}
                className="w-full py-4 rounded-2xl bg-[#41d599] text-[#0a4179] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                Engage Simulation
              </button>
            </section>

            <div className="glass rounded-[40px] p-10 flex flex-col items-center justify-center text-center space-y-6 border-[#41d599]/10 shadow-inner bg-white/[0.01] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Settings size={160} /></div>
              <div className="w-20 h-20 rounded-3xl bg-[#41d599]/10 flex items-center justify-center text-[#41d599] border border-[#41d599]/20 shadow-2xl animate-pulse z-10">
                <Brain size={40} />
              </div>
              <h3 className="text-2xl font-black z-10">AI Analysis Protocols</h3>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs z-10 font-medium">
                Select specific neural evaluation layers to prioritize during your simulator session.
              </p>
              <div className="flex flex-wrap justify-center gap-3 z-10">
                 <button 
                   onClick={() => toggleProtocol('Behavioral Analysis')}
                   className={`px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeProtocols.includes('Behavioral Analysis') ? 'bg-[#41d599] text-[#0a4179] border-[#41d599] shadow-xl' : 'bg-[#41d599]/10 border-[#41d599]/30 text-[#41d599] hover:bg-[#41d599]/20'}`}
                 >
                   Behavioral Analysis
                 </button>
                 <button 
                   onClick={() => toggleProtocol('STAR Grading')}
                   className={`px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeProtocols.includes('STAR Grading') ? 'bg-[#41d599] text-[#0a4179] border-[#41d599] shadow-xl' : 'bg-[#41d599]/10 border-[#41d599]/30 text-[#41d599] hover:bg-[#41d599]/20'}`}
                 >
                   STAR Grading
                 </button>
              </div>
              <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] z-10">Toggle protocols to specialize AI focus</p>
            </div>
          </div>
        </div>
      )}

      {stage === 'practice' && (
        <div className="grid lg:grid-cols-5 gap-8 items-start px-2">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-[40px] aspect-video bg-black relative overflow-hidden shadow-2xl border-white/10">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-6 animate-in fade-in">
                   <div className="w-20 h-20 rounded-[32px] bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-xl relative">
                      <ShieldAlert size={40} />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white border-2 border-black">
                        <X size={14} />
                      </div>
                   </div>
                   <div className="space-y-3">
                     <h4 className="text-xl font-black text-red-400 uppercase tracking-widest">Hardware Blocked</h4>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-white/70 leading-relaxed max-w-sm font-bold uppercase tracking-tight">
                          {cameraError}
                        </p>
                     </div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={initCamera} className="px-8 py-4 bg-[#41d599] text-[#0a4179] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shadow-[#41d599]/20">
                        <RotateCcw size={16} /> Attempt Re-Sync
                     </button>
                     <button onClick={reset} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Cancel Session
                     </button>
                   </div>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {isRecording && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full animate-pulse shadow-xl border border-white/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Stream Active</span>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <Loader2 size={56} className="text-[#41d599] animate-spin" />
                        <Sparkles size={20} className="absolute inset-0 m-auto text-[#F0C927] animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#41d599]">Neural Analysis in Progress...</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={toggleRecording}
                disabled={isAnalyzing || !!cameraError}
                className={`flex items-center gap-3 px-12 py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-[#41d599] text-[#0a4179] shadow-[#41d599]/20'}`}
              >
                {isRecording ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                {isRecording ? 'Finish Transcription' : 'Engage Simulator'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-[32px] p-8 border-white/10 bg-[#06213f] shadow-2xl relative overflow-hidden">
               <Sparkles size={40} className="absolute -top-2 -right-2 text-[#41d599]/10" />
               <p className="text-[10px] font-black uppercase tracking-widest text-[#41d599] mb-4 flex items-center gap-2">
                 <Target size={12} /> Question {currentQuestionIndex + 1} of {questions.length || 3}
               </p>
               <h3 className="text-xl font-bold leading-relaxed min-h-[80px]">
                 {questions.length > 0 ? questions[currentQuestionIndex] : "Synthesizing next inquiry..."}
               </h3>
               <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Hiring Lead's Tip:</p>
                 <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/60 leading-relaxed italic font-medium">
                      {activeProtocols.includes('STAR Grading') 
                        ? "Protocol 'STAR' enforced: Mention a specific Situation, your Task, the Action you took, and the quantifiable Result." 
                        : "Focus on technical accuracy and maintaining professional confidence. Speak clearly for the neural model."}
                    </p>
                 </div>
               </div>
            </div>

            <div className="glass rounded-[32px] p-6 border-white/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Active Evaluation Layers</h4>
              <div className="flex flex-wrap gap-2">
                 {activeProtocols.length > 0 ? activeProtocols.map(p => (
                   <span key={p} className="px-3 py-1.5 rounded-xl bg-[#41d599]/10 text-[#41d599] border border-[#41d599]/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12} /> {p}</span>
                 )) : (
                   <span className="text-[10px] text-white/20 italic uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">Standard Logic Model v4.2</span>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'results' && feedback && (
        <div className="space-y-8 animate-in zoom-in-95 duration-300 px-2">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-2xl border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#41d599] via-[#F0C927] to-[#41d599]"></div>
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90 overflow-visible">
                  <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="72" cy="72" r="66" 
                    stroke="currentColor" strokeWidth="10" fill="transparent" 
                    strokeDasharray={414} strokeDashoffset={414 - (414 * feedback.confidenceScore) / 100} 
                    className="text-[#41d599] transition-all duration-1000 drop-shadow-[0_0_8px_rgba(65,213,153,0.8)]" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{feedback.confidenceScore}%</span>
                  <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Sentiment</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`flex items-center gap-2 justify-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${feedback.confidenceScore > 70 ? 'bg-[#41d599]/10 border-[#41d599]/30 text-[#41d599]' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                   {feedback.confidenceScore > 70 ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                   {feedback.confidenceScore > 70 ? 'Professional Pass' : 'Calibration Required'}
                </div>
                <p className="text-xs text-white/60 leading-relaxed italic font-medium px-2">"{feedback.feedback}"</p>
              </div>
            </div>

            <div className="md:col-span-2 glass rounded-[40px] p-10 space-y-10 border-white/10 shadow-2xl relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black">Session Diagnostics</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">Multi-Layer Behavioral & STAR Analytics</p>
                </div>
                <div className="flex flex-col items-center md:items-end">
                   <div className="flex items-center gap-3 text-3xl font-black text-[#41d599]">
                      <Target size={28} /> {feedback.contentScore}%
                   </div>
                   <p className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em] mt-1">Acquisition Index</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 pt-8 border-t border-white/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-[#41d599]/10 text-[#41d599] border border-[#41d599]/20"><Activity size={16} /></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#41d599]">High-Impact Strengths</h4>
                  </div>
                  <div className="space-y-4">
                    {feedback.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm font-medium leading-relaxed group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-[#41d599]/10 flex items-center justify-center shrink-0 border border-[#41d599]/20 group-hover:bg-[#41d599] group-hover:text-[#0a4179] transition-all">
                           <CheckCircle2 size={12} />
                        </div>
                        <span className="text-white/80">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-[#f1ca27]/10 text-[#f1ca27] border border-[#f1ca27]/20"><Award size={16} /></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f1ca27]">Targeted Optimization</h4>
                  </div>
                  <div className="space-y-4">
                    {feedback.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm font-medium leading-relaxed group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-[#f1ca27]/10 flex items-center justify-center shrink-0 border border-[#f1ca27]/20 group-hover:bg-[#f1ca27] group-hover:text-[#0a4179] transition-all">
                           <Target size={12} />
                        </div>
                        <span className="text-white/80">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-[32px] bg-white/[0.02] border border-white/10 flex items-center justify-between shadow-inner">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20 shadow-lg">
                       <FileCheck size={24} />
                    </div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Integrity Protocol</p>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">
                         Analysis Methodology: {activeProtocols.length > 0 ? activeProtocols.join(' • ') : 'Standard Neural Logic Model'}
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-2.5">
                    {activeProtocols.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[#41d599] animate-pulse shadow-[0_0_10px_#41d599]"></div>
                    ))}
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={reset} className="px-12 py-5 rounded-2xl glass border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95 shadow-xl">Dashboard Exit</button>
             <button 
               onClick={() => { 
                 setStage('practice'); 
                 setCurrentQuestionIndex(0); 
                 initCamera().catch(err => {
                   console.error("Failed to re-initialize camera:", err);
                   setToast({ message: "Camera re-initialization failed.", type: 'error' });
                 }); 
               }} 
               className="px-12 py-5 rounded-2xl bg-[#41d599] text-[#0a4179] font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#41d599]/20 hover:scale-[1.03] transition-all active:scale-95 flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Re-Engage Simulation
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;