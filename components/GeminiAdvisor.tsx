
import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef } from 'react';
import { CalculationResult, SalaryInputs } from '../types';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

interface Props {
  results: CalculationResult;
  inputs: SalaryInputs;
}

const InukshukIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="10" y="2" width="4" height="3" rx="0.5" />
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    <rect x="9" y="10" width="6" height="4" rx="0.5" />
    <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
    <rect x="7" y="18" width="3" height="4" rx="0.5" />
    <rect x="14" y="18" width="3" height="4" rx="0.5" />
  </svg>
);

const GeminiAdvisor: React.FC<Props> = ({ results, inputs }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const APP_URL = "https://can-pay-insights.vercel.app/";

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptText = `
        System: You are a professional Canadian financial consultant specializing in 2025-2026 economy.
        User Data Analysis for ${inputs.province}:
        - Province: ${inputs.province}
        - Hourly Rate: $${inputs.hourlyWage}/hr
        - Bi-Weekly Net: $${results.netPayBiWeekly.toFixed(2)}
        - Annual Gross: $${results.grossPayAnnual.toFixed(2)}
        - Annual Net: $${results.netPayAnnual.toFixed(2)}
        - Total Bi-weekly Hours: ${(results.regularHours + results.overtimeHours15 + results.overtimeHours20).toFixed(1)}

        Objective: Provide a 3-paragraph executive summary in English focusing on the 2025/2026 economic landscape.
        1. Evaluate the competitiveness of this salary in ${inputs.province} considering 2025 inflation and high interest rates/housing costs.
        2. Provide one specific tax optimization or investment strategy (TFSA, RRSP, or the new FHSA) tailored to this income bracket.
        3. A quick check on their work-life balance based on the hours provided.

        Constraints: Output MUST be in English. Use Markdown for bold text. Use bullet points for recommendations. Mention that this is based on 2025/2026 tax estimates.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("Empty response");
      }
    } catch (err: any) {
      console.error("AI Insight Service Error:", err);
      setError("The premium analysis engine is currently handling a surge of requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!snapshotRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(snapshotRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      });
      download(dataUrl, `CanPay-Insights-${inputs.province}.png`);
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden transition-all duration-300">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 overflow-hidden">
          <div className="w-full h-full bg-red-400 animate-shimmer-loading"></div>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className="p-1.5 bg-red-600 rounded-md shadow-inner">
                <InukshukIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">AI Financial Insights</h3>
              
              {advice ? (
                <button 
                  onClick={handleSaveImage}
                  disabled={exporting}
                  className="text-[9px] sm:text-[10px] bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold border border-red-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <svg className={`w-3 h-3 ${exporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {exporting ? 'Saving...' : 'Save Image'}
                </button>
              ) : (
                <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter font-mono border border-red-500/30">2025/2026 Edition</span>
              )}
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Strategic analysis for {inputs.province}'s current economic climate.
            </p>
          </div>
          
          {!advice && !loading && (
            <button 
              onClick={getAdvice}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/40 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Generate 2026 Analysis</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          )}

          {error && (
            <div className="bg-red-900/10 border border-red-800/20 p-4 rounded-lg mt-2 flex items-center gap-3 text-red-300 text-xs italic animate-fadeIn">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
              <p className="flex-1">{error}</p>
              <button onClick={getAdvice} className="underline font-bold hover:text-red-100 transition-colors uppercase tracking-widest text-[9px]">Retry</button>
            </div>
          )}

          {loading && (
            <div className="py-10 flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-red-200 animate-pulse tracking-wide text-center">Generating your personalized 2026 financial outlook...</p>
            </div>
          )}

          {advice && (
            <div className="bg-slate-900/60 p-5 sm:p-6 rounded-xl text-[13px] sm:text-sm leading-relaxed border border-slate-700/50 shadow-inner animate-fadeIn relative">
               <div 
                 className="prose prose-invert max-w-none prose-sm whitespace-pre-wrap text-slate-200 font-normal"
                 dangerouslySetInnerHTML={{ 
                   __html: advice
                     .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400 font-bold">$1</strong>')
                     .replace(/^\* (.*)/gm, '<li class="ml-4 mb-2 text-slate-300 list-disc">$1</li>')
                 }} 
               />
               <div className="mt-8 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                 <button 
                   onClick={() => setAdvice(null)} 
                   className="text-[10px] sm:text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium"
                 >
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                   </svg>
                   Refresh Analysis
                 </button>
                 <span className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">MODEL v2026.1</span>
               </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={snapshotRef} 
          className="w-[800px] bg-slate-900 text-white p-12 font-sans"
        >
          <div className="flex justify-between items-end border-b border-slate-700 pb-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-600 p-2 rounded-lg">
                  <InukshukIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">CanPay <span className="text-red-500 font-light">Insights</span></h1>
              </div>
              <p className="text-slate-400 text-lg">AI Financial Analysis Report</p>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Annual Net</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(results.netPayAnnual)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Region</p>
                <p className="text-2xl font-bold">{inputs.province}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Rate</p>
                <p className="text-2xl font-bold text-slate-300">${inputs.hourlyWage}/hr</p>
              </div>
            </div>
          </div>

          <div className="min-h-[400px]">
            {advice && (
              <div 
                className="text-xl leading-relaxed text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f87171;">$1</strong>')
                    .replace(/^\* (.*)/gm, '<div style="margin: 16px 0 16px 24px; position: relative;"><span style="position: absolute; left: -20px; color: #ef4444;">•</span>$1</div>')
                }} 
              />
            )}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-slate-100">Plan your future with confidence.</p>
              <p className="text-slate-500 mt-1 font-mono text-sm tracking-tight">{APP_URL}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-1">Generated by Gemini 3</p>
                <p className="text-xs text-slate-500 italic">2025/2026 Tax Estimator</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(APP_URL)}&color=0f172a`} 
                  alt="QR Code" 
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-loading {
          animation: shimmer-loading 1.5s infinite linear;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prose li {
          margin-left: 1.25rem !important;
          padding-left: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
