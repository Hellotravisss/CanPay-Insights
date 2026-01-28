
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
      // 按照规定：直接从环境变量读取 API_KEY，无需用户干预
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are a helpful financial assistant for a Canadian worker.
        Here is their payroll data:
        - Province: ${inputs.province}
        - Hourly Wage: $${inputs.hourlyWage}
        - Bi-Weekly Net Pay: $${results.netPayBiWeekly.toFixed(2)}
        - Annual Gross Income: $${results.grossPayAnnual.toFixed(2)}
        - Annual Net Income: $${results.netPayAnnual.toFixed(2)}
        - Working Hours (Bi-weekly): ${(results.regularHours + results.overtimeHours15 + results.overtimeHours20).toFixed(1)}

        Please provide a concise analysis (max 3 paragraphs) covering:
        1. How this income compares to the cost of living in ${inputs.province} (general sentiment).
        2. A brief tip on tax optimization or savings based on this bracket.
        3. Analysis of work-life balance based on their schedule.

        Keep it friendly and professional. Use markdown for bold text and bullet points.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Could not generate advice at this time.");
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      // 提示：如果依然报错，通常是因为 Vercel 端没有同步好环境变量，或者 Key 的限制规则还没生效（有延迟）
      setError("Unable to reach AI services. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden">
      {/* 顶部动态加载条 */}
      {loading && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>}
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-700 rounded-lg shrink-0 shadow-inner">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            AI Salary Insights
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium Service</span>
          </h3>
          
          {!advice && !loading && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm">
                Get a professional AI analysis of your earnings relative to {inputs.province}'s cost of living and tax bracket.
              </p>
              <button 
                onClick={getAdvice}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/40 active:scale-95 flex items-center gap-2 group"
              >
                <span>Analyze My Paycheck</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              {error && <p className="text-red-400 text-xs mt-2 italic flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </p>}
            </div>
          )}

          {loading && (
            <div className="flex items-center space-x-3 py-4 text-red-300">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span className="text-sm font-medium animate-pulse">Generating personalized insights...</span>
            </div>
          )}

          {advice && (
            <div className="bg-slate-900/40 p-5 rounded-xl text-sm leading-relaxed border border-slate-700/50 shadow-inner animate-fadeIn">
               <div 
                 className="prose prose-invert max-w-none prose-sm"
                 dangerouslySetInnerHTML={{ 
                   __html: advice
                     .replace(/\n/g, '<br/>')
                     .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400 font-bold">$1</strong>')
                     .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1 text-slate-300">$1</li>')
                 }} 
               />
               <div className="mt-6">
                 <button 
                   onClick={() => setAdvice(null)} 
                   className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                   Refresh Analysis
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAdvisor;
