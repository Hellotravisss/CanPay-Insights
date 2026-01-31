
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
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
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
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const APP_URL = "https://www.canpayinsights.ca/";

  // QR Baking logic
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

  // LOCK BODY SCROLL when preview is open
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    };
  }, [previewImage]);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const promptText = `
        System: Professional Canadian financial consultant for 2025-2026.
        Provide 3 paragraphs in English for ${inputs.province}:
        1. Local competitiveness & 2025 inflation context.
        2. One tax strategy (RRSP/TFSA/FHSA) for this income level.
        3. Work-life balance review.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });
      if (response.text) setAdvice(response.text);
    } catch (err: any) {
      setError("AI analysis unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!snapshotRef.current || !qrBase64) return;
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
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
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 overflow-hidden">
          <div className="w-full h-full bg-red-400 animate-shimmer-loading"></div>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-600 rounded-md">
              <InukshukIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold">AI Financial Insights</h3>
          </div>
          {advice && (
            <button 
              onClick={handleExport}
              disabled={exporting || !qrBase64}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-transform"
            >
              {exporting ? 'Generating...' : 'Save Report'}
              {!exporting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>}
            </button>
          )}
        </div>

        {!advice && !loading && (
          <button onClick={getAdvice} className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl w-full">
            Generate AI Report
          </button>
        )}

        {advice && (
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
            <div 
              className="prose prose-invert prose-sm max-w-none text-slate-200"
              dangerouslySetInnerHTML={{ 
                __html: advice
                  .replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400 font-bold">$1</b>')
                  .replace(/^\* (.*)/gm, '<li class="ml-4 mb-2">$1</li>')
              }} 
            />
          </div>
        )}
      </div>

      {/* RE-ENGINEERED MOBILE PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fadeIn"
          style={{ backgroundColor: 'rgba(2, 6, 23, 0.98)', backdropFilter: 'blur(8px)' }}
        >
          {/* Top Bar - High Contrast & No-Selection */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 select-none">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white font-bold text-sm tracking-wide">REPORT PREVIEW</span>
             </div>
             <button 
               onClick={() => setPreviewImage(null)} 
               className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 active:scale-90 transition-all"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>

          {/* Image Container - Scrollable if too tall */}
          <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
             <div className="max-w-lg w-full py-20">
                <img 
                  src={previewImage} 
                  alt="Payroll Report" 
                  className="w-full h-auto rounded-lg shadow-2xl border border-white/10"
                  style={{ userSelect: 'auto', WebkitUserSelect: 'auto' }}
                />
             </div>
          </div>

          {/* Bottom Instructions - Clearer & Non-Selectable */}
          <div className="absolute bottom-0 left-0 w-full p-8 pb-12 bg-gradient-to-t from-slate-950 to-transparent flex flex-col items-center select-none pointer-events-none">
             <div className="bg-red-600/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-xl border border-red-400/30">
                <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                <span className="text-white font-extrabold text-sm uppercase tracking-widest">Long press image to save</span>
             </div>
             <p className="mt-4 text-slate-400 text-xs font-medium">Saved as High Resolution PNG</p>
          </div>
        </div>
      )}

      {/* HIDDEN SNAPSHOT CONTAINER */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, overflow: 'hidden' }}>
        <div ref={snapshotRef} className="w-[1000px] bg-slate-900 text-white p-16 font-sans block" style={{ height: 'auto' }}>
          <div className="border-b border-slate-700 pb-10 mb-12 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-5 mb-5">
                <div className="bg-red-600 p-4 rounded-2xl shadow-xl"><InukshukIcon className="w-10 h-10 text-white" /></div>
                <h1 className="text-5xl font-bold tracking-tight">CanPay <span className="text-red-500">Insights</span></h1>
              </div>
              <p className="text-slate-400 text-2xl font-medium">AI Financial Analysis Report</p>
            </div>
            <div className="text-right">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Annual Net</p>
                <p className="text-4xl font-bold text-red-500">{formatCurrency(results.netPayAnnual)}</p>
            </div>
          </div>
          <div className="mb-20">
            {advice && (
              <div 
                className="text-[26px] leading-[1.7] text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<b style="color: #f87171;">$1</b>')
                    .replace(/^\* (.*)/gm, '<div style="margin: 25px 0 25px 45px; position: relative;"><span style="position: absolute; left: -35px; color: #ef4444; font-size: 1.4em;">•</span>$1</div>')
                    .split('\n\n').map(p => `<p style="margin-bottom: 35px;">${p}</p>`).join('')
                }} 
              />
            )}
          </div>
          <div className="pt-12 border-t border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-slate-100 mb-2">Plan your future with confidence.</p>
              <p className="text-slate-500 font-mono text-lg">{APP_URL}</p>
            </div>
            <div className="p-2 bg-white rounded-2xl shadow-2xl border-4 border-slate-800">
                {qrBase64 && <img src={qrBase64} alt="QR" className="w-28 h-28 block" />}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .select-none { user-select: none; -webkit-user-select: none; }
        @keyframes shimmer-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer-loading { animation: shimmer-loading 1.5s infinite linear; }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
