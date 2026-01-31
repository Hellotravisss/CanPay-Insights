
// @google/genai used to provide AI financial insights based on payroll data.
import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
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
  const [ClarifyingQrBase64, setQrBase64] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const APP_URL = "https://www.canpayinsights.ca/";

  // QR Baking Logic - Pre-loads the bitmap to prevent white boxes in screenshots
  useEffect(() => {
    let isMounted = true;
    const bakeQrCode = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_URL)}&color=0f172a&bgcolor=ffffff&margin=1`;
        const response = await fetch(url);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(bitmap, 0, 0);
          const finalDataUrl = canvas.toDataURL('image/png', 1.0);
          if (isMounted) setQrBase64(finalDataUrl);
        }
      } catch (e) {
        console.error("QR Baking Failed:", e);
      }
    };
    bakeQrCode();
    return () => { isMounted = false; };
  }, []);

  // SCROLL LOCK: Prevent background scrolling when preview is open
  useEffect(() => {
    if (previewImage) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [previewImage]);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fix: Always use process.env.API_KEY for initializing GoogleGenAI
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const promptText = `
        System: Professional Canadian financial consultant for 2025-2026.
        Data: ${inputs.province}, Wage: $${inputs.hourlyWage}, Net Bi-Weekly: $${results.netPayBiWeekly.toFixed(2)}.
        Provide 3 paragraphs in English:
        1. Local competitiveness & 2025 economy.
        2. One tax strategy (RRSP/TFSA/FHSA).
        3. Work-life balance review.
        Markdown for bold. Reference 2025/2026 estimates.
      `;

      // Use the complex text model 'gemini-3-pro-preview' for analysis
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      // Fix: Access the text property directly on the GenerateContentResponse object
      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("No response");
      }
    } catch (err: any) {
      // Fix: Handle key selection error by triggering the selection dialog
      if (err.message?.includes("Requested entity was not found.")) {
        if ((window as any).aistudio?.openSelectKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }
      setError("AI analysis unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!snapshotRef.current || !ClarifyingQrBase64) return;
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const options = {
        pixelRatio: 2.5,
        backgroundColor: '#0f172a',
        width: 1000,
        height: snapshotRef.current.scrollHeight,
        cacheBust: true,
        style: { transform: 'scale(1)', left: '0', top: '0' }
      };

      await htmlToImage.toPng(snapshotRef.current, options);
      const dataUrl = await htmlToImage.toPng(snapshotRef.current, options);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        download(dataUrl, `CanPay-Insight-${inputs.province}.png`);
      }
    } catch (err) {
      setError("Failed to generate image.");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden transition-all group">
      {/* Decorative Inukshuk Watermark for the visible card */}
      <InukshukIcon className="absolute -right-8 -bottom-8 w-48 h-48 text-slate-700/30 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 overflow-hidden">
          <div className="w-full h-full bg-red-400 animate-shimmer-loading"></div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-600 rounded-md">
              <InukshukIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold">AI Financial Insights</h3>
          </div>
          
          {advice && (
            <button 
              onClick={handleExport}
              disabled={exporting || !ClarifyingQrBase64}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 active:scale-95 shadow-lg disabled:opacity-50"
            >
              {exporting ? 'Processing...' : 'Save Report'}
              {!exporting && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              )}
            </button>
          )}
        </div>

        {!advice && !loading && (
          <button 
            onClick={getAdvice}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 w-full shadow-xl shadow-red-900/20"
          >
            Generate 2026 Analysis
          </button>
        )}

        {error && <p className="text-red-400 text-xs italic">{error}</p>}

        {loading && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-sm text-red-100 animate-pulse font-medium">Analyzing 2026 economic data...</p>
          </div>
        )}

        {advice && (
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 animate-fadeIn backdrop-blur-sm">
            <div 
              className="prose prose-invert prose-sm max-w-none text-slate-200"
              dangerouslySetInnerHTML={{ 
                __html: advice
                  .replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400">$1</b>')
                  .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1">$1</li>')
              }} 
            />
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <button onClick={() => setAdvice(null)} className="hover:text-red-400 underline uppercase tracking-tighter font-bold">Reset Report</button>
              <span>GEMINI_V3_REPORT</span>
            </div>
          </div>
        )}
      </div>

      {/* RE-DESIGNED MOBILE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[1000] flex flex-col animate-fadeIn select-none overflow-hidden">
          {/* Backdrop with Heavy Blur */}
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl" />
          
          {/* Header Bar */}
          <div className="relative z-10 p-6 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white/60 font-bold text-xs uppercase tracking-[0.2em] select-none">Preview Report</span>
             </div>
             <button 
               onClick={() => setPreviewImage(null)} 
               className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 active:scale-90 transition-all select-none"
             >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>

          {/* Image Content - Scrollable container for the image only */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
             <div className="max-w-xl mx-auto flex items-center justify-center min-h-full">
                <img 
                  src={previewImage} 
                  alt="Saved Report" 
                  className="w-full h-auto rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto"
                  style={{ userSelect: 'auto', WebkitUserSelect: 'auto' }}
                />
             </div>
          </div>

          {/* Bottom Instruction Bar - High Contrast */}
          <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center z-20 select-none bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none">
             <div className="bg-red-600 px-8 py-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_40px_rgba(220,38,38,0.4)] border border-red-400/50 scale-100 sm:scale-110">
                <div className="relative">
                  <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
                <span className="text-white font-black text-base uppercase tracking-widest whitespace-nowrap">Long press image to save</span>
             </div>
             <p className="mt-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Ready for 2026 Planning</p>
          </div>
        </div>
      )}

      {/* HIDDEN SNAPSHOT CONTAINER */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, overflow: 'hidden' }}>
        <div 
          ref={snapshotRef} 
          className="w-[1000px] bg-slate-900 text-white p-16 font-sans block"
          style={{ height: 'auto' }}
        >
          {/* Snapshot Header */}
          <div className="border-b border-slate-700 pb-10 mb-12 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-5 mb-5">
                <div className="bg-red-600 p-4 rounded-2xl shadow-xl">
                  <InukshukIcon className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight">CanPay <span className="text-red-500">Insights</span></h1>
              </div>
              <p className="text-slate-400 text-2xl font-medium">AI Financial Analysis Report</p>
            </div>
            <div className="flex gap-12 text-right">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Annual Net</p>
                <p className="text-4xl font-bold text-red-500">{formatCurrency(results.netPayAnnual)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Region</p>
                <p className="text-4xl font-bold">{inputs.province}</p>
              </div>
            </div>
          </div>

          {/* Snapshot Content */}
          <div className="mb-20">
            {advice && (
              <div 
                className="text-[26px] Bird leading-[1.7] text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<b style="color: #f87171;">$1</b>')
                    .replace(/^\* (.*)/gm, '<div style="margin: 25px 0 25px 45px; position: relative;"><span style="position: absolute; left: -35px; color: #ef4444; font-size: 1.4em;">•</span>$1</div>')
                    .split('\n\n').map(p => `<p style="margin-bottom: 35px;">${p}</p>`).join('')
                }} 
              />
            )}
          </div>

          {/* Snapshot Footer */}
          <div className="pt-12 border-t border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-slate-100 mb-2">Plan your future with confidence.</p>
              <p className="text-slate-500 font-mono text-lg">{APP_URL}</p>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.4em] mb-2">Powered by Gemini 3 Pro</p>
                <p className="text-sm text-slate-500 italic">Official 2025/2026 Tax Output</p>
              </div>
              <div className="p-1.5 bg-white rounded-2xl shadow-2xl border-4 border-slate-800">
                {ClarifyingQrBase64 ? (
                  <img src={ClarifyingQrBase64} alt="QR" className="w-28 h-28 block" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .select-none { user-select: none; -webkit-user-select: none; }
        @keyframes shimmer-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer-loading { animation: shimmer-loading 1.5s infinite linear; }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
