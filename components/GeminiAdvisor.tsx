
// @google/genai used to provide AI financial insights based on payroll data.
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const APP_URL = "https://www.canpayinsights.ca/";

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
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
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("Empty response from AI engine.");
      }
    } catch (err: any) {
      console.error("AI Insight Service Error:", err);
      setError("The AI engine is currently unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!snapshotRef.current) return;
    setExporting(true);
    try {
      // 强制触发重排确保隐藏容器高度正确计算
      const fullHeight = snapshotRef.current.scrollHeight;
      
      const dataUrl = await htmlToImage.toPng(snapshotRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0f172a',
        width: 1000,
        height: fullHeight, // 显式传入计算出的全量高度
        style: {
          transform: 'scale(1)',
          left: '0',
          top: '0',
          display: 'inline-block' // 确保截图容器是流式布局
        }
      });
      
      // 判断是否是移动端 (简单的UA判断)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        // 电脑端直接下载
        download(dataUrl, `CanPay-Report-${inputs.province.replace(/\s+/g, '-')}.png`);
      }
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(APP_URL)}&color=0f172a`;

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
            <div className="flex items-center justify-between mb-1.5 flex-nowrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 rounded-md shadow-inner">
                  <InukshukIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">AI Financial Insights</h3>
              </div>
              
              {advice && (
                <button 
                  onClick={handleExport}
                  disabled={exporting}
                  className="text-[10px] sm:text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full uppercase tracking-tighter font-bold border border-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
                >
                  <svg className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {exporting ? 'Generating...' : 'Save Report'}
                </button>
              )}
            </div>
            {!advice && (
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Strategic analysis for {inputs.province}'s current economic climate.
              </p>
            )}
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

      {/* 
          MOBILE PREVIEW MODAL 
      */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-md w-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4 px-2">
              <h4 className="text-white font-bold">Report Ready</h4>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="bg-white p-1 rounded-lg shadow-2xl max-h-[70vh] overflow-auto">
              <img src={previewImage} alt="CanPay Insight Report" className="max-w-full h-auto rounded shadow-lg" />
            </div>
            
            <div className="mt-8 bg-red-600/20 border border-red-500/30 p-4 rounded-xl text-center">
              <p className="text-red-100 text-sm font-medium mb-1 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Long press the image to save to your Photos
              </p>
              <p className="text-red-200/60 text-xs">This ensures the report stays accessible in your gallery.</p>
            </div>
            
            <button 
              onClick={() => setPreviewImage(null)}
              className="mt-6 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-slate-300 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* 
          HIDDEN SNAPSHOT CONTAINER
          使用 inline-block 确保容器宽度严格受到 content 影响
      */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={snapshotRef} 
          className="w-[1000px] bg-slate-900 text-white p-16 font-sans flex flex-col h-auto pb-20 inline-block"
        >
          {/* Header Section */}
          <div className="flex justify-between items-end border-b border-slate-700 pb-12 mb-12 flex-nowrap w-full">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-4 mb-4 whitespace-nowrap">
                <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-900/20">
                  <InukshukIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  CanPay <span className="text-red-500 font-light">Insights</span>
                </h1>
              </div>
              <p className="text-slate-400 text-xl font-medium tracking-wide">AI Financial Analysis Report</p>
            </div>
            
            <div className="flex gap-12 text-right flex-nowrap">
              <div className="whitespace-nowrap">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Annual Net</p>
                <p className="text-3xl font-bold text-red-500">{formatCurrency(results.netPayAnnual)}</p>
              </div>
              <div className="whitespace-nowrap">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Region</p>
                <p className="text-3xl font-bold">{inputs.province}</p>
              </div>
              <div className="whitespace-nowrap">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Hourly Rate</p>
                <p className="text-3xl font-bold text-slate-300">${inputs.hourlyWage}/hr</p>
              </div>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="flex-grow w-full">
            {advice && (
              <div 
                className="text-2xl leading-[1.6] text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f87171; font-weight: 700;">$1</strong>')
                    .replace(/^\* (.*)/gm, '<div style="margin: 24px 0 24px 32px; position: relative;"><span style="position: absolute; left: -28px; color: #ef4444; font-size: 1.5rem;">•</span>$1</div>')
                    .split('\n\n').map(p => `<p style="margin-bottom: 2rem;">${p}</p>`).join('')
                }} 
              />
            )}
          </div>

          {/* Report Footer */}
          <div className="mt-20 pt-12 border-t border-slate-800 flex justify-between items-center w-full">
            <div>
              <p className="text-2xl font-bold text-slate-100 mb-2">Plan your future with confidence.</p>
              <p className="text-slate-500 font-mono text-base tracking-tight">{APP_URL}</p>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-[12px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-2">Powered by Gemini 3 Pro</p>
                <p className="text-sm text-slate-500 italic">Official 2025/2026 Tax Estimator Output</p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-slate-800">
                <img 
                  src={qrCodeUrl}
                  alt="QR Code" 
                  className="w-20 h-20"
                  crossOrigin="anonymous"
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
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
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
