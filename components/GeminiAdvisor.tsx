
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
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const APP_URL = "https://www.canpayinsights.ca/";

  // Pre-load QR Code as Base64 to ensure it's captured in the screenshot
  useEffect(() => {
    let isMounted = true;
    const loadQrCode = async () => {
      try {
        // Fetch as PNG for maximum compatibility across all devices
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APP_URL)}&color=0f172a&bgcolor=ffffff&margin=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("QR fetch failed");
        
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) setQrBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Critical: QR Code failed to load", e);
      }
    };
    loadQrCode();
    return () => { isMounted = false; };
  }, []);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      // MANDATORY: Always use process.env.API_KEY directly
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
        1. Evaluate the competitiveness of this salary in ${inputs.province} considering 2025 inflation and housing costs.
        2. Provide one specific tax optimization strategy (TFSA, RRSP, or FHSA) tailored to this income.
        3. A quick check on their work-life balance based on the hours provided.

        Constraints: Output MUST be in English. Mention this is based on 2025/2026 tax estimates.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: promptText }] }],
      });

      if (response.text) {
        setAdvice(response.text);
      } else {
        throw new Error("No analysis received.");
      }
    } catch (err: any) {
      console.error("AI Service Error:", err);
      setError("AI analysis unavailable. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!snapshotRef.current) return;
    setExporting(true);
    try {
      // Small buffer to ensure any Base64 images are decoded by the browser
      await new Promise(resolve => setTimeout(resolve, 200));

      const fullHeight = snapshotRef.current.scrollHeight;
      
      const dataUrl = await htmlToImage.toPng(snapshotRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0f172a',
        width: 1000,
        height: fullHeight,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          left: '0',
          top: '0',
          display: 'block'
        }
      });
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        download(dataUrl, `CanPay-Insight-${inputs.province.replace(/\s+/g, '-')}.png`);
      }
    } catch (err) {
      console.error('Export failed', err);
      setError("Failed to generate report image.");
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
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-600 rounded-md">
                <InukshukIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold">AI Financial Insights</h3>
            </div>
            
            {advice && (
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                )}
                {exporting ? 'Processing...' : 'Save Report'}
              </button>
            )}
          </div>

          {!advice && !loading && (
            <button 
              onClick={getAdvice}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg active:scale-95"
            >
              Get Professional AI Analysis
            </button>
          )}

          {error && <p className="text-red-400 text-xs mt-2 italic">{error}</p>}

          {loading && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-sm text-red-200 animate-pulse font-medium">Analyzing 2026 economic data...</p>
            </div>
          )}

          {advice && (
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 animate-fadeIn">
              <div 
                className="prose prose-invert prose-sm max-w-none text-slate-200 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400">$1</b>')
                    .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1">$1</li>')
                }} 
              />
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500">
                <button onClick={() => setAdvice(null)} className="hover:text-red-400 underline font-bold uppercase tracking-widest">New Analysis</button>
                <span className="font-mono">GEMINI-3-PRO-INSIGHT-REPORT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="font-bold">Long press the image to save</span>
              <button onClick={() => setPreviewImage(null)} className="p-2 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto">
              <img src={previewImage} alt="CanPay Insight" className="w-full h-auto" />
            </div>
            <button 
              onClick={() => setPreviewImage(null)}
              className="w-full mt-6 py-4 text-slate-400 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN SNAPSHOT CONTAINER */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, overflow: 'hidden' }}>
        <div 
          ref={snapshotRef} 
          className="w-[1000px] bg-slate-900 text-white p-16 font-sans flex flex-col h-auto"
          style={{ display: 'block' }}
        >
          {/* Header */}
          <div className="flex justify-between items-end border-b border-slate-700 pb-10 mb-10 w-full">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-600 p-3 rounded-xl">
                  <InukshukIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">CanPay <span className="text-red-500">Insights</span></h1>
              </div>
              <p className="text-slate-400 text-xl">AI Financial Analysis Report</p>
            </div>
            <div className="flex gap-10 text-right">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Annual Net</p>
                <p className="text-3xl font-bold text-red-500">{formatCurrency(results.netPayAnnual)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Region</p>
                <p className="text-3xl font-bold">{inputs.province}</p>
              </div>
            </div>
          </div>

          {/* Advice Content */}
          <div className="flex-grow w-full">
            {advice && (
              <div 
                className="text-2xl leading-[1.6] text-slate-200"
                dangerouslySetInnerHTML={{ 
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<b style="color: #f87171;">$1</b>')
                    .replace(/^\* (.*)/gm, '<div style="margin: 20px 0 20px 40px; position: relative;"><span style="position: absolute; left: -30px; color: #ef4444;">•</span>$1</div>')
                    .split('\n\n').map(p => `<p style="margin-bottom: 30px;">${p}</p>`).join('')
                }} 
              />
            )}
          </div>

          {/* Footer with QR */}
          <div className="mt-20 pt-10 border-t border-slate-800 flex justify-between items-center w-full pb-10">
            <div>
              <p className="text-xl font-bold text-slate-100 mb-1">Plan your future with confidence.</p>
              <p className="text-slate-500 font-mono text-sm">{APP_URL}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">Powered by Gemini 3 Pro</p>
                <p className="text-xs text-slate-500 italic">Official 2025/2026 Tax Output</p>
              </div>
              <div className="p-1 bg-white rounded-xl shadow-xl">
                {qrBase64 ? (
                  <img src={qrBase64} alt="QR" className="w-20 h-20 block" />
                ) : (
                  <div className="w-20 h-20 bg-slate-200 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer-loading { animation: shimmer-loading 1.5s infinite linear; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default GeminiAdvisor;
