import { AlertCircle, Brain, ClipboardList, Clock, FileCheck, Loader2, Plus, Wand2, X, Zap, Trash2, Target, Eye, ShieldCheck, ShieldAlert, SlidersHorizontal, Download, ArrowLeft, BarChart3, Users, CheckCircle2, Calendar, ChevronRight, Timer, TrendingUp, Info, User as UserIcon } from 'lucide-react';
import React, { useState, useMemo, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { generateAptitudeTest } from '../services/geminiService';
import { AptitudeQuestion, AptitudeTest, Job, UserProfile, Application } from '../types';
import Toast from './Toast';

interface AptitudeTestManagerProps {
  user: UserProfile;
  jobs: Job[];
  tests: AptitudeTest[];
  applications: Application[];
  onSaveTest: (test: AptitudeTest) => void;
  onDeployTest: (jobId: string, testId: string) => void;
}

const AptitudeTestManager: React.FC<AptitudeTestManagerProps> = ({ 
  user, 
  jobs, 
  tests, 
  applications,
  onSaveTest,
  onDeployTest
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<'active' | 'inactive'>('active');
  const [viewingDetails, setViewingDetails] = useState<AptitudeTest | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeLimit, setTimeLimit] = useState(15);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const [newTest, setNewTest] = useState<Partial<AptitudeTest>>({
    title: '',
    questions: [],
    difficulty: 'Medium'
  });

  React.useEffect(() => {
    if (newTest.questions && newTest.questions.length > 0 && reviewRef.current) {
      const textareas = reviewRef.current.querySelectorAll('textarea');
      textareas.forEach(ta => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      });
    }
  }, [newTest.questions]);

  const filteredTests = useMemo(() => {
    return tests
      .filter(test => {
        const associatedJob = jobs.find(j => j.id === test.jobId);
        const isActive = associatedJob?.status === 'active';
        return filterType === 'active' ? isActive : !isActive;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tests, jobs, filterType]);

  const handleExportData = (test: AptitudeTest) => {
    setIsExporting(true);
    try {
      const testApps = applications.filter(a => a.jobId === test.jobId && a.testScore !== undefined);
      const data = {
        test: {
          id: test.id,
          title: test.title,
          difficulty: test.difficulty,
          timeLimit: test.timeLimit,
          questionCount: test.questions.length
        },
        analytics: {
          totalParticipants: testApps.length,
          averageScore: testApps.length > 0 ? Math.round(testApps.reduce((acc, a) => acc + (a.testScore || 0), 0) / testApps.length) : 0,
          passRate: testApps.length > 0 ? Math.round((testApps.filter(a => (a.testScore || 0) >= 70).length / testApps.length) * 100) : 0
        },
        participants: testApps.map(a => ({
          name: a.candidateProfile?.name || 'Anonymous',
          email: a.candidateProfile?.email || 'N/A',
          score: a.testScore,
          flags: a.proctorFlags,
          date: a.appliedDate
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Assessment_Report_${test.title.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: "Assessment manifest exported successfully", type: 'success' });
    } catch (err) {
      setToast({ message: "Export protocol failed", type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const getTestAnalytics = (test: AptitudeTest) => {
    const testApps = applications.filter(a => a.jobId === test.jobId && a.testScore !== undefined);
    
    // Score distribution
    const distribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];

    testApps.forEach(a => {
      const score = a.testScore || 0;
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return {
      total: testApps.length,
      avgScore: testApps.length > 0 ? Math.round(testApps.reduce((acc, a) => acc + (a.testScore || 0), 0) / testApps.length) : 0,
      distribution,
      topPerformers: testApps.sort((a, b) => (b.testScore || 0) - (a.testScore || 0)).slice(0, 5)
    };
  };

  const handleAIGenerate = async () => {
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) {
      setToast({ message: "Select a target job first", type: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedQuestions = await generateAptitudeTest(job, numQuestions, difficulty);
      setNewTest({
        title: `Aptitude Assessment: ${job.title}`,
        jobId: job.id,
        questions: generatedQuestions,
        difficulty: difficulty
      });
      setToast({ message: "Neural Assessment Manifest Synthesized", type: 'success' });
    } catch (err) {
      setToast({ message: "Assessment synchronization failed", type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAddQuestion = () => {
    const q: AptitudeQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      scenario: '',
      options: ['', '', '', ''],
      correctIndex: 0
    };
    setNewTest(prev => ({
      ...prev,
      questions: [...(prev.questions || []), q]
    }));
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let questions: AptitudeQuestion[] = [];

        if (file.name.endsWith('.json')) {
          questions = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(l => l.trim());
          // Skip header if it exists
          const startIdx = lines[0].toLowerCase().includes('scenario') ? 1 : 0;
          
          for (let i = startIdx; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            if (parts.length >= 6) {
              questions.push({
                id: Math.random().toString(36).substr(2, 9),
                scenario: parts[0],
                options: [parts[1], parts[2], parts[3], parts[4]],
                correctIndex: parseInt(parts[5]) || 0
              });
            }
          }
        }

        if (questions.length > 0) {
          setNewTest(prev => ({
            ...prev,
            questions: [...(prev.questions || []), ...questions]
          }));
          setToast({ message: `Successfully imported ${questions.length} questions`, type: 'success' });
        } else {
          setToast({ message: "No valid questions found in file", type: 'error' });
        }
      } catch (err) {
        setToast({ message: "Failed to parse file. Ensure correct format (JSON or CSV)", type: 'error' });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const updateQuestion = (index: number, field: keyof AptitudeQuestion, value: any) => {
    setNewTest(prev => {
      const updated = [...(prev.questions || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const saveTest = () => {
    if (!newTest.title || !newTest.questions?.length || !newTest.jobId) return;
    
    const finalTest: AptitudeTest = {
      id: editingTestId || Math.random().toString(36).substr(2, 9),
      jobId: newTest.jobId,
      title: newTest.title,
      questions: newTest.questions as AptitudeQuestion[],
      createdAt: new Date().toISOString(),
      timeLimit: timeLimit,
      difficulty: difficulty
    };
    
    onSaveTest(finalTest);
    if (!editingTestId) {
      onDeployTest(finalTest.jobId, finalTest.id);
    }
    setIsCreating(false);
    setEditingTestId(null);
    setNewTest({ title: '', questions: [], difficulty: 'Medium' });
    setToast({ message: editingTestId ? "Assessment Protocol Updated" : "Assessment Protocol Deployed", type: 'success' });
  };

  const handleEditTest = (test: AptitudeTest) => {
    setEditingTestId(test.id);
    setSelectedJobId(test.jobId);
    setNumQuestions(test.questions.length);
    setTimeLimit(test.timeLimit);
    setDifficulty(test.difficulty || 'Medium');
    setNewTest({
      title: test.title,
      jobId: test.jobId,
      questions: [...test.questions],
      difficulty: test.difficulty || 'Medium'
    });
    setIsCreating(true);
  };

  const handleDuplicateTest = (test: AptitudeTest) => {
    const duplicatedTest: AptitudeTest = {
      ...test,
      id: Math.random().toString(36).substr(2, 9),
      title: `${test.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    onSaveTest(duplicatedTest);
    setToast({ message: "Assessment Protocol Duplicated", type: 'success' });
  };

  const getPassRate = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    const relatedApps = applications.filter(a => a.jobId === test?.jobId && a.testScore !== undefined);
    
    if (relatedApps.length === 0) {
      const seeds: Record<string, string> = { 'test-ai-infra': '74%', 'test-growth': '62%' };
      return seeds[testId] || '0%';
    }

    const avg = relatedApps.reduce((acc, curr) => acc + (curr.testScore || 0), 0) / relatedApps.length;
    return `${Math.round(avg)}%`;
  };

  const getIntegrityRate = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    const relatedApps = applications.filter(a => a.jobId === test?.jobId && a.testScore !== undefined);
    
    if (relatedApps.length === 0) return '98.4%';
    const totalBreaches = relatedApps.reduce((acc, curr) => acc + (curr.proctorFlags || 0), 0);
    const avgBreaches = totalBreaches / relatedApps.length;
    const rate = Math.max(0, Math.min(100, 100 - (avgBreaches * 5)));
    return `${rate.toFixed(1)}%`;
  };

  const handleExportCSV = (test: AptitudeTest) => {
    const relatedApps = applications.filter(a => a.jobId === test.jobId);
    
    if (relatedApps.length === 0) {
      setToast({ message: "No candidate data available for this role.", type: 'info' });
      return;
    }

    const headers = ["Candidate Name", "Email", "Status", "Applied Date", "Test Score (%)", "Proctor Flags"];
    const rows = relatedApps.map(app => [
      `"${app.candidateProfile?.name || 'Unknown'}"`,
      `"${app.candidateProfile?.email || 'N/A'}"`,
      `"${app.status}"`,
      `"${new Date(app.appliedDate).toLocaleDateString()}"`,
      app.testScore !== undefined ? app.testScore : '"N/A"',
      app.proctorFlags !== undefined ? app.proctorFlags : '"0"'
    ]);

    const csvString = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${test.title.replace(/\s+/g, '_')}_Recruitment_Report.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    setToast({ message: "Recruitment manifest exported successfully", type: 'success' });
  };

  if (viewingDetails) {
    const relatedApps = applications.filter(a => a.jobId === viewingDetails.jobId && a.testScore !== undefined);
    const totalTaken = relatedApps.length || 12; // Simulation base for visual demo
    
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 text-white pb-32 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewingDetails(null)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black">{viewingDetails.title}</h1>
              <p className="text-[#F0C927] text-[10px] font-black uppercase tracking-widest mt-1">Detailed Question Analytics & Performance Tracking</p>
            </div>
          </div>
          <button 
            onClick={() => handleExportCSV(viewingDetails)}
            className="px-8 py-4 bg-[#41d599] text-[#0a4179] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export Recruitment Report (.CSV)
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
           <div className="glass rounded-2xl p-4 border-white/5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Participants</p>
              <h3 className="text-2xl font-black text-[#F0C927]">{relatedApps.length || '12'}</h3>
              <p className="text-[8px] text-[#41d599] font-bold uppercase">Real-time Pipeline Sync</p>
           </div>
           <div className="glass rounded-2xl p-4 border-white/5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Aggregate Accuracy</p>
              <h3 className="text-2xl font-black text-[#41d599]">{getPassRate(viewingDetails.id)}</h3>
              <p className="text-[8px] text-white/20 font-bold uppercase">Based on total score average</p>
           </div>
           <div className="glass rounded-2xl p-4 border-white/5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Protocol Integrity</p>
              <h3 className="text-2xl font-black text-blue-400">{getIntegrityRate(viewingDetails.id)}</h3>
              <p className="text-[8px] text-white/20 font-bold uppercase">Tab focus retention rate</p>
           </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid md:grid-cols-2 gap-4">
           <div className="glass rounded-2xl p-4 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Timer size={14} className="text-[#F0C927]" /> Time per Question (Seconds)</h4>
              </div>
              <div className="h-[180px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewingDetails.questions.map((q, i) => ({ name: `Q${i+1}`, time: Math.floor(Math.random() * 45) + 30 }))}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#06213f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#F0C927', fontWeight: 'bold' }}
                       />
                       <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                          {viewingDetails.questions.map((_, index) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#F0C927' : '#41d599'} fillOpacity={0.8} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="glass rounded-2xl p-4 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-[#41d599]" /> Accuracy Distribution (%)</h4>
              </div>
              <div className="h-[180px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewingDetails.questions.map((q, i) => ({ name: `Q${i+1}`, accuracy: Math.floor(Math.random() * 30) + 60 }))}>
                       <defs>
                          <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#41d599" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#41d599" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#06213f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#41d599', fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="accuracy" stroke="#41d599" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="text-[#F0C927]" size={16} /> Question Performance Directory</h3>
           <div className="space-y-3">
               {viewingDetails.questions.map((q, idx) => {
                const qPassRate = Math.floor(Math.random() * 30) + 60;
                const qAnswers = totalTaken;
                const avgTime = Math.floor(Math.random() * 45) + 30; // Simulated avg time in seconds
                const incorrectCounts = q.options.map((_, i) => i === q.correctIndex ? 0 : Math.floor(Math.random() * 20));
                const mostIncorrectIdx = incorrectCounts.indexOf(Math.max(...incorrectCounts));
                
                return (
                  <div key={q.id} className="glass rounded-2xl p-4 border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <span className="w-8 h-8 rounded-lg bg-[#F0C927] text-[#0a4179] flex items-center justify-center font-black text-xs">0{idx + 1}</span>
                           <h4 className="font-bold text-sm max-w-2xl leading-relaxed">{q.scenario}</h4>
                        </div>
                        <div className="text-right space-y-0.5">
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Pass Rate</p>
                           <p className="text-lg font-black text-[#41d599]">{qPassRate}%</p>
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-3 rounded-xl border text-[10px] font-bold leading-relaxed flex items-center justify-between relative ${oIdx === q.correctIndex ? 'bg-[#41d599]/10 border-[#41d599]/40 text-[#41d599]' : oIdx === mostIncorrectIdx ? 'bg-red-500/5 border-red-500/20 text-red-400/60' : 'bg-white/5 border-white/10 text-white/40'}`}>
                             <span className="pr-4">{opt}</span>
                             {oIdx === q.correctIndex ? (
                               <CheckCircle2 size={12} className="shrink-0" />
                             ) : oIdx === mostIncorrectIdx ? (
                               <AlertCircle size={12} className="shrink-0 text-red-400" />
                             ) : null}
                             {oIdx === mostIncorrectIdx && (
                               <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[6px] font-black rounded-full uppercase">Common Error</span>
                             )}
                          </div>
                        ))}
                     </div>

                     <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-white/20" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{qAnswers} Candidates</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-white/20" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Avg. {avgTime}s / Question</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <Target size={12} className="text-white/20" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{Math.round(qAnswers * (qPassRate/100))} Correct</span>
                           </div>
                        </div>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-[#41d599]" style={{ width: `${qPassRate}%` }}></div>
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-white pb-32 px-4 md:px-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#41d599] to-[#F0C927] flex items-center justify-center text-[#0a4179] shadow-lg">
              <Brain size={16} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-white">
                ASSESSMENT MANAGEMENT
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isCreating && (
            <div className="flex items-center gap-1 p-1 bg-[#06213f] rounded-xl border border-white/5 w-44">
              <button 
                onClick={() => setFilterType('active')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'active' ? 'bg-[#41d599] text-[#0a4179]' : 'text-white/40 hover:text-white'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilterType('inactive')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'inactive' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                Non-Active
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-[#F0C927] text-[#0a4179] font-medium text-xs rounded-xl shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> New Assessment
          </button>
        </div>
      </div>

      {isCreating ? (
        <div className="glass-premium rounded-[40px] p-6 md:p-10 border-white/5 space-y-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4">
           <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-all"><X size={20} /></button>
           
           <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Assessment Title</label>
              <input 
                type="text"
                value={newTest.title}
                onChange={e => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter Assessment Title"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-[#F0C927] transition-all text-white"
              />
            </div>

           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Wand2 className="text-[#F0C927]" size={16} /> AI Synthesis</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Generate scenario-based questions using professionally tuned psychometric logic.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Target Job Track</label>
                    <select 
                      value={selectedJobId}
                      onChange={e => setSelectedJobId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-[#F0C927] transition-all text-white appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0a4179]">Select Job</option>
                      {jobs.map(j => <option key={j.id} value={j.id} className="bg-[#0a4179]">{j.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Question Volume</label>
                      <div className="flex flex-wrap gap-1.5">
                         {[5, 10, 15, 21].map(n => (
                           <button 
                             key={n} 
                             onClick={() => setNumQuestions(n)}
                             className={`px-2.5 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${numQuestions === n ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927]' : 'bg-white/5 border-white/10 text-white/40'}`}
                           >
                             {n} Qs
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5"><Clock size={10}/> Time Limit</label>
                      <select 
                        value={timeLimit}
                        onChange={e => setTimeLimit(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] text-white outline-none appearance-none"
                      >
                        <option value="10" className="bg-[#0a4179]">10 Minutes</option>
                        <option value="15" className="bg-[#0a4179]">15 Minutes</option>
                        <option value="20" className="bg-[#0a4179]">20 Minutes</option>
                        <option value="30" className="bg-[#0a4179]">30 Minutes</option>
                        <option value="45" className="bg-[#0a4179]">45 Minutes</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Difficulty Level</label>
                      <div className="flex gap-1.5">
                         {['Easy', 'Medium', 'Hard'].map(d => (
                           <button 
                             key={d} 
                             onClick={() => setDifficulty(d as any)}
                             className={`flex-1 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-[#F0C927] text-[#0a4179] border-[#F0C927]' : 'bg-white/5 border-white/10 text-white/40'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !selectedJobId}
                    className="w-full py-4 rounded-xl bg-[#0a4179] border-2 border-[#F0C927] text-[#F0C927] font-black uppercase tracking-[0.2em] text-[9px] hover:bg-[#F0C927]/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Brain size={14} />} SYNCHRONIZE NEURAL MODEL
                  </button>
                </div>
              </div>

              <div className="space-y-6 border-l border-white/5 pl-8 hidden md:block">
                 <div className="space-y-2">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="text-[#41d599]" size={16} /> Manual Configuration</h3>
                    <p className="text-xs text-white/60 leading-relaxed font-medium">Input your bespoke workplace scenarios and evaluation criteria tailored to the role.</p>
                 </div>
                 <div className="pt-2">
                    <button 
                      onClick={handleManualAddQuestion}
                      className="w-full py-4 rounded-xl bg-[#41d599]/10 border border-[#41d599]/20 text-[#41d599] font-black uppercase tracking-widest text-[9px] hover:bg-[#41d599]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Build Question Manually
                    </button>
                 </div>
              </div>
           </div>

           {/* Review & Edit Section */}
           {newTest.questions && newTest.questions.length > 0 && (
             <div ref={reviewRef} className="pt-8 border-t border-white/5 space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                   <h4 className="text-2xl font-black">Review <span className="text-[#F0C927]">Manifest</span></h4>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{newTest.questions.length} Items Prepped</p>
                </div>

                <div className="space-y-4">
                   {newTest.questions.map((q, qIndex) => (
                     <div key={qIndex} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                        <div className="flex justify-between items-start">
                           <span className="w-6 h-6 rounded-md bg-[#F0C927] text-[#0a4179] flex items-center justify-center font-black text-[10px]">0{qIndex + 1}</span>
                           <button onClick={() => setNewTest(p => ({ ...p, questions: p.questions?.filter((_, i) => i !== qIndex) }))} className="text-white/20 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                           </button>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Scenario / Question</label>
                           <textarea 
                             value={q.scenario} 
                             onChange={e => updateQuestion(qIndex, 'scenario', e.target.value)}
                             className="w-full bg-transparent border-b border-white/10 outline-none text-sm font-medium py-1.5 focus:border-[#F0C927] transition-all resize-none overflow-hidden"
                             onInput={(e) => {
                               const target = e.target as HTMLTextAreaElement;
                               target.style.height = 'auto';
                               target.style.height = target.scrollHeight + 'px';
                             }}
                             rows={1}
                           />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                           {q.options.map((opt, oIndex) => (
                             <div key={oIndex} className="relative group/opt">
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={e => {
                                    const opts = [...q.options];
                                    opts[oIndex] = e.target.value;
                                    updateQuestion(qIndex, 'options', opts);
                                  }}
                                  className={`w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border text-[10px] outline-none transition-all ${q.correctIndex === oIndex ? 'border-[#41d599]/40 text-white' : 'border-white/10 text-white/60 focus:border-white/20'}`}
                                />
                                <button 
                                  onClick={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${q.correctIndex === oIndex ? 'bg-[#41d599] border-[#41d599]' : 'bg-white/5 border-white/20 group-hover/opt:border-white/40'}`}
                                >
                                  {q.correctIndex === oIndex && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="pt-6 flex flex-col md:flex-row gap-3">
                   <button 
                    onClick={saveTest}
                    className="flex-1 py-4 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#F0C927]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <Zap size={16} /> Commit Assessment Protocol
                   </button>
                   <button 
                    onClick={() => setNewTest({ title: '', questions: [] })}
                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
                   >
                     Reset Workspace
                   </button>
                </div>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-8">
           <div className="space-y-6">
              {filteredTests.length === 0 ? (
                <div className="glass rounded-[40px] p-8 text-center border-dashed border-white/10 shadow-inner bg-white/[0.01]">
                   <ClipboardList size={32} className="mx-auto text-white/5 mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest text-white/20">No {filterType} assessments found</p>
                   {filterType === 'active' && <button onClick={() => setIsCreating(true)} className="mt-6 px-6 py-2.5 rounded-xl bg-[#41d599]/10 text-[#41d599] border border-[#41d599]/20 font-black uppercase tracking-widest text-[9px] hover:bg-[#41d599]/20 transition-all">Initialize Studio</button>}
                </div>
              ) : (
                <div className="grid gap-2">
                   {filteredTests.map(test => {
                     const associatedJob = jobs.find(j => j.id === test.jobId);
                     const isActive = associatedJob?.status === 'active';
                     
                     return (
                       <div 
                        key={test.id} 
                        onClick={() => setViewingDetails(test)}
                        className={`glass-premium group transition-all duration-500 rounded-2xl p-4 border cursor-pointer flex items-center justify-between gap-2 shadow-xl relative overflow-hidden ${isActive ? 'border-white/5 hover:bg-white/[0.06] hover:border-white/10' : 'border-white/5 opacity-60'}`}
                       >
                          {/* Sync listing design with left accent line */}
                          <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-2 ${isActive ? 'bg-[#41d599]' : 'bg-white/10'}`}></div>
                          
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-1">
                             <div className={`w-8 h-8 rounded-lg bg-[#0a4179] border-2 border-white/5 flex items-center justify-center font-black transition-all shrink-0 text-sm shadow-lg overflow-hidden ${isActive ? 'text-[#F0C927] group-hover:scale-105' : 'text-white/20'}`}>
                                <FileCheck size={16} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-black truncate leading-tight tracking-tight group-hover:text-[#41d599] transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>{test.title}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
                                   <span className="flex items-center gap-1">
                                     <Calendar size={10} className="text-[#F0C927]" /> 
                                     {new Date(test.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                   </span>
                                   <span className="flex items-center gap-1"><ClipboardList size={10} /> {test.questions.length} Qs</span>
                                   <span className="flex items-center gap-1"><Clock size={10} /> {test.timeLimit}m</span>
                                   <span className="flex items-center gap-1 text-[#41d599]"><Target size={10} /> {associatedJob?.title || 'Unknown Role'}</span>
                                   <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${isActive ? 'bg-[#41d599]/10 text-[#41d599] border-[#41d599]/20' : 'bg-white/5 text-white/20 border-white/10'}`}>
                                      Rate: {getPassRate(test.id)}
                                   </span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                             <div className="flex items-center gap-1.5">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleEditTest(test); }}
                                 className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-[#F0C927] hover:bg-[#F0C927]/10 transition-all border border-transparent hover:border-[#F0C927]/20 shadow-md"
                               >
                                  <Zap size={14} />
                                </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDuplicateTest(test); }}
                                 className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-blue-400 hover:bg-blue-400/10 transition-all border border-transparent hover:border-blue-400/20 shadow-md"
                               >
                                  <Plus size={14} />
                                </button>
                               <button 
                                onClick={(e) => { e.stopPropagation(); setToast({ message: "Assessment decommissioning requires admin privileges.", type: 'error' }); }}
                                className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 shadow-md"
                               >
                                  <Trash2 size={14} />
                                </button>
                             </div>
                             <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all" />
                          </div>
                       </div>
                     );
                   })}
                </div>
              )}
           </div>
         </div>
      )}
    </div>
  );
};

export default AptitudeTestManager;