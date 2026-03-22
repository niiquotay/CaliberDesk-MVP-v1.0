import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getApiKey, dispatchGeminiError } from '../services/geminiService';
import { Search, Loader2, ExternalLink, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface JobSearchGroundingProps {
  jobTitle: string;
  company: string;
  description: string;
}

const JobSearchGrounding: React.FC<JobSearchGroundingProps> = ({ jobTitle, company, description }) => {
  const [query, setQuery] = useState(`Market trends and salary insights for ${jobTitle} at ${company}`);
  const [results, setResults] = useState<string | null>(null);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research the following job context and provide market insights, typical salary ranges, and company reputation if available: 
        Role: ${jobTitle}
        Company: ${company}
        Description: ${description}
        
        User Query: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResults(response.text || "No insights found.");
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri,
          }));
        setSources(extractedSources);
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      dispatchGeminiError(msg);
      console.error("Search grounding error:", err);
      setError("Failed to retrieve market insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-card overflow-hidden border-[#F0C927]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-2.5 text-[#F0C927]">
          <Globe size={18} /> Market Intelligence
        </h2>
        <div className="px-3 py-1 rounded-lg bg-[#F0C927]/10 border border-[#F0C927]/20 text-[8px] font-black uppercase tracking-widest text-[#F0C927] flex items-center gap-1.5">
          <Sparkles size={10} /> Powered by Google Search
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about salary, market trends, or company culture..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-sm font-bold focus:border-[#F0C927] outline-none transition-all duration-300 placeholder:text-white/20"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl bg-[#F0C927] text-[#0a4179] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Research"}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={18} />
            <p className="text-[10px] text-red-400 font-black uppercase tracking-tight">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap italic">
                {results}
              </div>
            </div>

            {sources.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Verified Sources</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#F0C927]/30 transition-all group"
                    >
                      <span className="text-[10px] font-bold truncate pr-4 text-white/60 group-hover:text-white">{source.title}</span>
                      <ExternalLink size={12} className="text-[#F0C927] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!results && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 mb-4">
              <Search size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              Enter a query to gather real-time market data
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobSearchGrounding;
