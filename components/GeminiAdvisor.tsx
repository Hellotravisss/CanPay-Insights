
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
    setLoading(true);
    setError(null);
    
    try {
      // Create instance using the pre-configured environment variable
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptText = `
        System: You are a professional Canadian financial consultant.
        User Data Analysis for ${inputs.province}:
        - Province: ${inputs.province}
        - Hourly Rate: $${inputs.hourlyWage}/hr
        - Bi-Weekly Net: $${results.netPayBiWeekly.toFixed(2)}
        - Annual Gross: $${results.grossPayAnnual.toFixed(2)}
        - Annual Net: $${results.netPayAnnual.toFixed(2)}
        - Total Bi-weekly Hours: ${(results.regularHours + results.overtimeHours15 + results.overtimeHours20).toFixed(1)}

        Objective: Provide a 3-paragraph executive summary in English.
        1. Evaluate the competitiveness of this salary in ${inputs.province} given current inflation and housing costs.
        2. Provide one specific tax optimization or investment strategy (TFSA, RRSP, or FHSA) tailored to this income bracket.
        3. A quick check on their work-life balance based on the hours provided.

        Constraints: Output MUST be in English. Use Markdown for bold text. Use bullet points for recommendations.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("Analysis failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError("Premium service is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden transition-all duration-300">
      {/* Animated Loading Progress Bar */}
      {loading && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-shimmer-progress"></div>}
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-700 rounded-lg shrink-0 shadow-inner">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              AI Financial Insights
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter font-mono">Premium Service</span>
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Professional breakdown of your earnings relative to {inputs.province} living costs.
            </p>
          </div>

          {!advice && !loading && (
            <button 
              onClick={getAdvice}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/40 active:scale-95 flex items-center gap-2 group"
            >
              <span>Generate Analysis</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800/30 p-3 rounded-lg mt-2 flex items-center gap-2 text-red-400 text-xs italic animate-fadeIn">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          )}

          {loading && (
            <div className="py-6 flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="w-10 h-10 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-red-200 animate-pulse">Consulting tax guidelines for {inputs.province}...</p>
            </div>
          )}

          {advice && (
            <div className="bg-slate-900/80 p-6 rounded-xl text-sm leading-relaxed border border-slate-700 shadow-inner animate-fadeIn relative">
               <div 
                 className="prose prose-invert max-w-none prose-sm whitespace-pre-wrap text-slate-200"
                 dangerouslySetInnerHTML={{ 
                   __html: advice
                     .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400 font-bold">$1</strong>')
                     .replace(/^\* (.*)/gm, '<li class="ml-4 mb-2 text-slate-300 list-disc">$1</li>')
                 }} 
               />
               <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-center">
                 <button 
                   onClick={() => setAdvice(null)} 
                   className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                   </svg>
                   New Analysis
                 </button>
                 <span className="text-[10px] text-slate-600 uppercase tracking-widest">2024 Financial Model</span>
               </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes shimmer-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer-progress { animation: shimmer-progress 2s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
