import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, Square, RefreshCcw, CheckCircle, Loader2, AlertCircle, 
  Edit3, Type as TypeIcon, ShieldAlert, X, RotateCcw, HelpCircle,
  Zap, Video as VideoIcon, Mic, Monitor, LogOut
} from 'lucide-react';

interface VideoRecorderProps {
  onComplete: (videoUrl: string) => void;
  onCancel: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Custom prompt state updated with new default
  const [prompt, setPrompt] = useState('Tell us about a project you are proud of.');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Upload simulation state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    startCamera().catch(err => console.error("Initial camera sync error:", err));
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser environment does not support high-density video capture protocols.");
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCameraError(null);
    } catch (err: any) {
      console.error("VideoRecorder Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Biometric Access Denied: Please enable camera and microphone permissions in your security settings.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("Hardware Link Missing: No video input device detected. Please connect a camera.");
      } else {
        setCameraError("Neural Sync Error: A system fault occurred during media stream initialization.");
      }
    }
  };

  const startRecording = () => {
    if (!stream) {
      startCamera().catch(err => console.error("Start camera error:", err));
      return;
    }
    setRecordedChunks([]);
    setPreviewUrl(null);
    setIsEditingPrompt(false);
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks(prev => [...prev, e.data]);
      }
    };

    recorder.onstop = () => {
      // Collect the chunks into a blob when the recording actually stops
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // We need to wait for the data to be available
      setTimeout(() => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        setPreviewUrl(URL.createObjectURL(blob));
      }, 500);
    }
  };

  const handleComplete = () => {
    if (!previewUrl) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    let progress = 0;
    
    const interval = setInterval(() => {
      const shouldFail = Math.random() < 0.05; // Lower failure rate for better UX
      
      if (shouldFail && progress > 50) {
        clearInterval(interval);
        setUploadError("Encryption integrity check failed. Retrying upload manifest...");
        return;
      }

      progress += Math.floor(Math.random() * 20) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onComplete(previewUrl);
          setIsUploading(false);
        }, 600);
      }
      setUploadProgress(progress);
    }, 300) as any;
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setUploadError(null);
    setUploadProgress(0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06213f]/95 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#41d599]/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#F0C927]/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="glass w-full max-w-5xl rounded-[48px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-full">
        
        {/* Header - Unified with Quit Action */}
        <header className="px-8 py-6 md:py-8 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F0C927] shadow-lg">
                 <VideoIcon size={24} />
              </div>
              <div className="hidden sm:block">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Profile <span className="text-[#F0C927]">Video Pitch</span></h3>
                 <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#41d599] animate-pulse"></div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#41d599]">Enterprise Capture Sync Active</p>
                 </div>
              </div>
           </div>

           <button 
             onClick={onCancel}
             className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 group shadow-xl"
           >
             <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit Protocol
           </button>
        </header>

        {/* Content Body - Scrollable if needed */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          
          <div className="grid lg:grid-cols-5 h-full">
            
            {/* Camera / Preview Area */}
            <div className="lg:col-span-3 bg-black flex items-center justify-center relative min-h-[300px] group">
              {cameraError ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6 bg-[#06213f]">
                    <div className="w-20 h-20 rounded-[32px] bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-2xl">
                       <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black text-red-400 uppercase tracking-widest">Hardware Link Failure</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed max-w-sm font-black uppercase tracking-widest">{cameraError}</p>
                    </div>
                    <button onClick={startCamera} className="px-10 py-5 bg-[#F0C927] text-[#0a4179] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shadow-[#F0C927]/20 active:scale-95">
                       <RotateCcw size={16} /> Re-Sync Hardware
                    </button>
                 </div>
              ) : previewUrl ? (
                <div className="w-full h-full relative">
                  <video src={previewUrl} controls className="w-full h-full object-cover" />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-[#41d599]/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0a4179] shadow-2xl flex items-center gap-2 border border-white/20">
                     <CheckCircle size={14} /> Reviewing Manifest
                  </div>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  
                  {isRecording && (
                    <div className="absolute top-6 left-6 flex items-center gap-3 px-5 py-2 bg-red-500 rounded-full animate-pulse shadow-2xl border border-white/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Transmission Active</span>
                    </div>
                  )}

                  {/* On-video prompter during recording */}
                  {isRecording && (
                    <div className="absolute bottom-10 inset-x-10 p-6 glass border-white/20 rounded-[32px] bg-black/40 text-center animate-in slide-in-from-bottom-4 duration-500">
                      <p className="text-white text-lg font-bold leading-relaxed italic drop-shadow-lg">
                        "{prompt}"
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls / Prompter Area */}
            <div className="lg:col-span-2 p-8 md:p-12 flex flex-col justify-between bg-white/[0.01] border-l border-white/5">
              
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                      <TypeIcon size={14} className="text-[#F0C927]" /> Neural Prompter
                    </label>
                    {!isRecording && !previewUrl && (
                      <button 
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                        className="text-[10px] font-black uppercase tracking-widest text-[#F0C927] hover:text-white transition-all flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                      >
                        <Edit3 size={12} /> {isEditingPrompt ? 'Commit' : 'Customize'}
                      </button>
                    )}
                  </div>
                  
                  {isEditingPrompt ? (
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-white/5 border border-[#F0C927]/40 rounded-[32px] p-8 text-lg text-white focus:outline-none focus:border-[#F0C927] transition-all min-h-[240px] resize-none shadow-inner leading-relaxed font-semibold"
                      placeholder="Enter talking points for the AI to display..."
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={() => !isRecording && !previewUrl && setIsEditingPrompt(true)}
                      className={`w-full bg-[#06213f]/40 border border-white/5 rounded-[40px] p-10 text-xl md:text-2xl text-center italic transition-all group min-h-[240px] flex items-center justify-center ${!isRecording && !previewUrl ? 'cursor-pointer hover:bg-white/[0.08] hover:border-white/10 shadow-inner' : ''}`}
                    >
                      <p className="text-white/70 leading-relaxed font-bold group-hover:text-white transition-colors relative">
                        "{prompt}"
                        <span className="absolute -top-6 -left-6 opacity-5"><Zap size={48} /></span>
                      </p>
                    </div>
                  )}
                  
                  {!isRecording && !previewUrl && (
                    <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-white/20">
                      <HelpCircle size={14} /> Tap prompt to adjust strategy
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Latency</p>
                     <p className="text-sm font-black text-[#41d599]">12ms Verified</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Encryption</p>
                     <p className="text-sm font-black text-[#41d599]">256-bit AES</p>
                  </div>
                </div>
              </div>

              {/* Final Actions - Fixed to Bottom */}
              <div className="pt-10 mt-auto border-t border-white/5 flex flex-col gap-4">
                {!previewUrl ? (
                  !isRecording ? (
                    <button 
                      onClick={startRecording}
                      disabled={isEditingPrompt || !!cameraError}
                      className="w-full flex items-center justify-center gap-4 bg-[#F0C927] hover:bg-[#F0C927]/90 text-[#0a4179] py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-sm transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-[#F0C927]/30 disabled:opacity-50"
                    >
                      <Camera size={22} fill="currentColor" /> Engage Capture
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-full flex items-center justify-center gap-4 bg-white text-[#0a4179] py-6 rounded-[28px] font-black uppercase tracking-[0.25em] text-sm transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <Square size={22} fill="currentColor" /> Terminate Stream
                    </button>
                  )
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => { setPreviewUrl(null); setRecordedChunks([]); }}
                      className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white py-5 rounded-[22px] font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 border border-white/10"
                    >
                      <RotateCcw size={18} /> Redo Session
                    </button>
                    <button 
                      onClick={startRecording}
                      className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white py-5 rounded-[22px] font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 border border-white/10"
                    >
                      <RefreshCcw size={18} /> Retake Video
                    </button>
                    <button 
                      onClick={handleComplete}
                      className="flex-[2] flex items-center justify-center gap-4 bg-gradient-to-r from-[#41d599] to-[#2ea38e] text-[#0a4179] py-5 rounded-[22px] font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-2xl shadow-[#41d599]/30 hover:scale-105 active:scale-95"
                    >
                      <CheckCircle size={22} /> Deploy Pitch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Upload Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-[300] bg-[#06213f]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 animate-in fade-in duration-300">
            {!uploadError ? (
              <div className="text-center space-y-10 w-full max-w-sm">
                <div className="relative mx-auto">
                  <div className="w-32 h-32 rounded-full border-8 border-white/5 border-t-[#F0C927] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">
                    {uploadProgress}%
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black tracking-tight">Syncing Manifest</h3>
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] leading-relaxed">
                    Securely transmitting pitch telemetry to recruitment cloud...
                  </p>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-[#F0C927] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(240,201,39,0.5)]"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300 max-w-md">
                <div className="w-24 h-24 bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl">
                  <AlertCircle size={48} />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">Transmission Fault</h3>
                <p className="text-white/40 mb-12 text-xs font-black leading-relaxed uppercase tracking-widest">
                  {uploadError}
                </p>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={handleCancelUpload}
                    className="flex-1 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest border border-white/10 text-white/40 hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleComplete}
                    className="flex-[2] py-5 rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em] bg-[#F0C927] text-[#0a4179] hover:brightness-110 transition-all shadow-xl shadow-[#F0C927]/20 active:scale-95"
                  >
                    Retry Protocol
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Status Footer */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none opacity-40">
         <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            <span className="flex items-center gap-2"><Mic size={10} /> MIC: ARMED</span>
            <span className="flex items-center gap-2"><Monitor size={10} /> VISION: SYNCED</span>
            <span className="flex items-center gap-2 text-[#41d599]"><Zap size={10} fill="currentColor" /> NETWORK: STABLE</span>
         </div>
      </div>
    </div>
  );
};

export default VideoRecorder;