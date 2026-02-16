import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import type { CalculationResult } from '../types';
import type { SalaryInputs } from '../types';

interface Props {
  results: CalculationResult;
  inputs: SalaryInputs;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);

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
  const APP_URL = 'https://www.canpayinsights.ca/';

  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);

  // QR Baking logic - 使用兼容性更好的方法
  useEffect(() => {
    let isMounted = true;
    const bakeQrCode = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_URL)}`;
        const response = await fetch(url);
        const blob = await response.blob();
        
        // 方法1：尝试使用 createImageBitmap (更快，但兼容性较差)
        if (typeof createImageBitmap === 'function') {
          try {
            const bitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(bitmap, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              if (isMounted) setQrBase64(dataUrl);
              return;
            }
          } catch (bitmapError) {
            console.warn('createImageBitmap failed, using fallback method:', bitmapError);
          }
        }
        
        // 方法2：Fallback - 使用传统的 Image 对象 (兼容性最好)
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            if (isMounted) setQrBase64(dataUrl);
          }
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
          console.error('QR code image loading failed');
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      } catch (error) {
        console.error('QR code generation failed:', error);
        // 即使失败，也不影响其他功能
      }
    };
    bakeQrCode();
    return () => {
      isMounted = false;
    };
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
          Data: ${inputs.province}, Wage: $${inputs.hourlyWage}, Net Bi-Weekly: $${results.netPayBiWeekly.toFixed(2)}.
          Provide 3 paragraphs in English:
          1. Local competitiveness & 2025 economic context.
          2. One tax strategy (RRSP/TFSA/FHSA).
          3. Work-life balance check.
          Markdown for bold. Reference 2025/2026 estimates.
       `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ parts: [{ text: promptText }] }],
      });

      const text = response.text;
      if (text) {
        setAdvice(text);
      } else {
        throw new Error('No response');
      }
    } catch (err: unknown) {
      setError('AI analysis unavailable. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!snapshotRef.current || !qrBase64) return;
    setExporting(true);
    try {
      // Extra delay for iOS Safari to ensure DOM is quiet
      await new Promise((resolve) => setTimeout(resolve, 600));

      const options = {
        pixelRatio: 2.5,
        backgroundColor: '#0f172a',
        width: 1000,
        height: snapshotRef.current.scrollHeight,
        cacheBust: true,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        style: { transform: 'scale(1)', left: '0', top: '0' },
      };

      // Double-capture: The first one "primes" the Safari canvas buffer
      await htmlToImage.toPng(snapshotRef.current, options);
      const dataUrl = await htmlToImage.toPng(snapshotRef.current, options);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        download(dataUrl, `CanPay-Insight-${inputs.province}.png`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to generate image.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 text-white mt-6 border-l-4 border-red-500 relative overflow-hidden transition-all">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 overflow-hidden">
          <div className="w-full h-full bg-red-400 animate-shimmer-loading" />
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold">AI Financial Insights</h3>
        </div>
        
        {advice && (
          <button
            onClick={handleExport}
            disabled={exporting || !qrBase64}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
          >
            {exporting ? 'Processing...' : 'Save Report'}
            {!exporting && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
        )}
      </div>

      {!advice && !loading && (
        <button
          onClick={getAdvice}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all active:scale-95 w-full sm:w-auto shadow-xl shadow-red-900/20"
        >
          Generate 2026 Analysis
        </button>
      )}

      {error && <p className="text-red-400 text-xs italic">{error}</p>}

      {loading && (
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-red-100 animate-pulse">Computing 2026 outlook...</p>
        </div>
      )}

      {advice && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 animate-fadeIn">
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-200"
            dangerouslySetInnerHTML={{
              __html: advice
                .replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400">$1</b>')
                .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1">$1</li>'),
            }}
          />
          <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <button onClick={() => setAdvice(null)} className="hover:text-red-400 underline uppercase tracking-tighter">
              Reset Analysis
            </button>
            <span>GEMINI_V2026_EST</span>
          </div>
        </div>
      )}

      {/* MOBILE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Long press to save report
              </span>
              <button onClick={() => setPreviewImage(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[75vh] ring-4 ring-slate-800">
              <img src={previewImage} alt="Report Preview" className="w-full h-auto block" />
            </div>
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
          {/* Header */}
          <div className="border-b border-slate-700 pb-10 mb-12 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-5 mb-5">
                <div className="bg-red-600 p-4 rounded-2xl shadow-xl">
                  <InukshukIcon className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight">
                  CanPay <span className="text-red-500">Insights</span>
                </h1>
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

          {/* Advice Content */}
          <div className="mb-20">
            {advice && (
              <div
                className="prose prose-invert max-w-none text-slate-200"
                dangerouslySetInnerHTML={{
                  __html: advice
                    .replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400">$1</b>')
                    .replace(/^\* (.*)/gm, '<li class="ml-4 mb-1">$1</li>'),
                }}
              />
            )}
          </div>

          {/* Footer */}
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
                {qrBase64 ? (
                  <img src={qrBase64} alt="QR" className="w-28 h-28 block" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 animate-pulse" />
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
