
import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import { CalculationResult, SalaryInputs } from '../types';

interface Props {
  results: CalculationResult;
  inputs: SalaryInputs;
}

const GeminiAdvisor: React.FC<Props> = ({ results, inputs }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    // Check if API key is available in environment
    if (!process.env.API_KEY) {
      setError("AI service configuration is missing. Please check environment variables.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Direct initialization as per system guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptText = `
        You are a professional financial advisor specializing in the Canadian job market.
        Analyze the following payroll data for a worker in ${inputs.province}:
        
        - Province: ${inputs.province}
        - Hourly Wage: $${inputs.hourlyWage}/hr
        - Bi-Weekly Net Pay: $${results.netPayBiWeekly.toFixed(2)}
        - Annual Gross Income: $${results.grossPayAnnual.toFixed(2)}
        - Annual Net Income: $${results.netPayAnnual.toFixed(2)}
        - Bi-weekly Work Hours: ${(results.regularHours + results.overtimeHours15 + results.overtimeHours20).toFixed(1)}

        Task: Provide a concise financial analysis in English (max 3 short paragraphs).
        1. Contextualize this income against the current cost of living in ${inputs.province}.
        2. Suggest one specific tax-saving tip (like RRSP/TFSA) or budget strategy for this bracket.
        3. Evaluate their work-life balance based on the schedule provided.

        Use Markdown for bolding and bullet points. Keep the tone encouraging and professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("The AI returned an empty response.");
      }
    } catch (err: any) {
      console.error("Detailed AI Error:", err);
      // Specific error messaging for common API issues
      if (err.message?.includes("403") || err.message?.includes("restricted")) {
        setError("Access Restricted: Ensure this domain is whitelisted in your Google Cloud API key settings.");
      } else if (err.message?.includes("429")) {
        setError("Rate limit exceeded. Please wait a moment before trying again.");
      } else {
        setError("Unable to reach AI services. Please try again in a few minutes.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden">
      {/* Animated loading bar */}
      {loading && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>}
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-700 rounded-lg shrink-0 shadow-inner">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              AI Financial Insights
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter font-mono">Premium Service</span>
            </h3>
          </div>
          
          {!advice && !loading && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Get a personalized analysis of your earnings relative to <strong>{inputs.province}</strong>'s living costs and tax regulations.
              </p>
              <button 
                onClick={getAdvice}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/40 active:scale-95 flex items-center gap-2 group"
              >
                <span>Generate Analysis</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              {error && (
                <div className="bg-red-900/20 border border-red-800/50 p-3 rounded-lg mt-2">
                  <p className="text-red-400 text-xs italic flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-2 py-4">
              <div className="flex items-center space-x-3 text-red-300">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-sm font-medium animate-pulse">Analyzing provincial tax data and living costs...</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full animate-shimmer" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {advice && (
            <div className="bg-slate-900/60 p-5 rounded-xl text-sm leading-relaxed border border-slate-700 shadow-inner animate-fadeIn">
               <div 
                 className="prose prose-invert max-w-none prose-sm whitespace-pre-wrap"
                 dangerouslySetInnerHTML={{ 
                   __html: advice
                     .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400 font-bold">$1</strong>')
                     .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1 text-slate-300 list-disc">$1</li>')
                 }} 
               />
               <div className="mt-6 pt-4 border-t border-slate-700">
                 <button 
                   onClick={() => setAdvice(null)} 
                   className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                   New Analysis
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
