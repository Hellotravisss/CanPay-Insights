import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import type { CalculationResult } from '../types';
import type { SalaryInputs } from '../types';
import { 
  generateTaxOptimization, 
  calculateRRSPScenarios,
  calculateMarginalRate,
  TaxOptimizationResult 
} from '../utils/taxOptimizer';

interface Props {
  results: CalculationResult;
  inputs: SalaryInputs;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

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

// Detect mobile devices
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
};

// Detect iOS
const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Detect Safari
const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Simple HTML sanitization to prevent XSS
const sanitizeHTML = (html: string): string => {
  // First escape HTML entities
  let sanitized = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Then restore safe formatting tags
  // Bold: **text** or __text__ -> <b>text</b>
  sanitized = sanitized.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>');
  sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400">$1</b>');
  
  // List items
  sanitized = sanitized.replace(/^\* (.*)$/gm, '<li class="ml-4 mb-1">$1</li>');
  
  // Headers (allow h3 and h4)
  sanitized = sanitized.replace(/^# (.*)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>');
  sanitized = sanitized.replace(/^## (.*)$/gm, '<h4 class="text-md font-semibold text-slate-300 mt-3 mb-1">$1</h4>');
  
  // Paragraphs - wrap lines that don't start with special characters
  sanitized = sanitized.replace(/^(?!<[lh]|<b)(.+)$/gm, '<p class="mb-2">$1</p>');
  
  return sanitized;
};

const GeminiAdvisor: React.FC<Props> = ({ results, inputs }) => {
  const APP_URL = 'https://www.canpayinsights.ca/';

  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showRRSPScenarios, setShowRRSPScenarios] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);

  // Local tax optimization calculations
  const taxOptimization = useMemo(() => {
    return generateTaxOptimization(results.grossPayAnnual, inputs.province);
  }, [results.grossPayAnnual, inputs.province]);

  const rrspScenarios = useMemo(() => {
    return calculateRRSPScenarios(results.grossPayAnnual, inputs.province);
  }, [results.grossPayAnnual, inputs.province]);

  const marginalRate = useMemo(() => {
    return calculateMarginalRate(results.grossPayAnnual, inputs.province);
  }, [results.grossPayAnnual, inputs.province]);

  // QR Code generation
  useEffect(() => {
    let isMounted = true;
    const bakeQrCode = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_URL)}`;
        const response = await fetch(url);
        const blob = await response.blob();
        
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
            console.warn('createImageBitmap failed:', bitmapError);
          }
        }
        
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
        img.src = objectUrl;
      } catch (error) {
        console.error('QR code generation failed:', error);
      }
    };
    bakeQrCode();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (previewImage || showSaveOptions) {
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
  }, [previewImage, showSaveOptions]);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const promptText = generateTaxPrompt(taxOptimization, results, inputs);

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
      setError('Tax analysis temporarily unavailable. Please refer to the local calculations below.');
    } finally {
      setLoading(false);
    }
  };

  // Generate image data URL
  const generateImageDataUrl = async (): Promise<string | null> => {
    if (!snapshotRef.current) return null;
    
    const options = {
      pixelRatio: 2,
      backgroundColor: '#0f172a',
      width: 1000,
      height: snapshotRef.current.scrollHeight,
      cacheBust: true,
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      style: { transform: 'scale(1)', left: '0', top: '0' },
    };

    // Double capture for better quality
    await htmlToImage.toPng(snapshotRef.current, options);
    return await htmlToImage.toPng(snapshotRef.current, options);
  };

  // Handle export - main function
  const handleExport = async () => {
    if (!snapshotRef.current) return;
    setExporting(true);
    
    try {
      const dataUrl = await generateImageDataUrl();
      if (!dataUrl) {
        throw new Error('Failed to generate image');
      }

      // Check if Web Share API is available (best for mobile)
      const canShare = navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], '')] });
      
      if (canShare && isMobileDevice()) {
        // Try native share first
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `CanPay-Tax-Report-${inputs.province}.png`, { type: 'image/png' });
          
          await navigator.share({
            files: [file],
            title: 'CanPay Tax Report',
            text: `My tax report for ${inputs.province}`
          });
          setExporting(false);
          return;
        } catch (shareError) {
          console.log('Share canceled or failed, falling back to preview');
        }
      }

      // For mobile without share API, show options modal
      if (isMobileDevice()) {
        setShowSaveOptions(true);
        setPreviewImage(dataUrl);
      } else {
        // Desktop: direct download
        download(dataUrl, `CanPay-Tax-Report-${inputs.province}.png`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Save methods for mobile
  const saveToPhotos = async () => {
    if (!previewImage) return;
    
    try {
      // Create a temporary link
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `CanPay-Tax-Report-${inputs.province}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // On iOS, this often doesn't work, so show instructions
      if (isIOS()) {
        alert('If download didn\'t start: Long press the image below and select "Save Image"');
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const copyToClipboard = async () => {
    if (!previewImage) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Image copied! You can now paste it in Messages, Notes, or other apps.');
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Could not copy automatically. Please use the Share button or screenshot.');
    }
  };

  const shareImage = async () => {
    if (!previewImage) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const file = new File([blob], `CanPay-Tax-Report-${inputs.province}.png`, { type: 'image/png' });
      
      await navigator.share({
        files: [file],
        title: 'CanPay Tax Report',
        text: `My tax report for ${inputs.province} - Calculated with CanPay Insights`
      });
    } catch (err) {
      console.log('Share canceled');
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
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">Smart Tax Optimizer</h3>
            <p className="text-xs text-slate-400">Personalized tax reduction strategies based on your income</p>
          </div>
        </div>
        

      </div>

      {/* Local Tax Optimization - Always Visible */}
      <TaxOptimizationPanel 
        optimization={taxOptimization} 
        rrspScenarios={rrspScenarios}
        marginalRate={marginalRate}
        showScenarios={showRRSPScenarios}
        onToggleScenarios={() => setShowRRSPScenarios(!showRRSPScenarios)}
      />

      {/* AI Enhanced Analysis Button */}
      {!advice && !loading && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={getAdvice}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all active:scale-95 w-full sm:w-auto shadow-xl shadow-red-900/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            Get AI Deep Tax Analysis
          </button>
          <p className="text-xs text-slate-500 mt-2">AI will provide detailed tax planning advice based on your specific situation</p>
        </div>
      )}

      {error && <p className="text-red-400 text-xs italic mt-4">{error}</p>}

      {loading && (
        <div className="py-8 flex flex-col items-center gap-3 mt-6 border-t border-slate-700">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-red-100 animate-pulse">AI is analyzing optimal tax strategies...</p>
        </div>
      )}

      {advice && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            AI Deep Analysis
          </h4>
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 animate-fadeIn">
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-200"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(advice),
              }}
            />
            {/* Save Report Button - Mobile Optimized */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleExport}
                disabled={exporting || !qrBase64}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Save Tax Report
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-2">Save this report to your device or share with your financial advisor</p>
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <button onClick={() => setAdvice(null)} className="hover:text-red-400 underline uppercase tracking-tighter">
                Analyze Again
              </button>
              <span>GEMINI_TAX_2026</span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SAVE OPTIONS MODAL */}
      {showSaveOptions && previewImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="text-lg font-bold">Save Report</span>
              <button onClick={() => { setShowSaveOptions(false); setPreviewImage(null); }} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Image */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[50vh] ring-4 ring-slate-800 mb-4">
              <img src={previewImage} alt="Report Preview" className="w-full h-auto block" />
            </div>

            {/* Save Options */}
            <div className="space-y-3">
              {/* Share Button - Best for iOS */}
              {navigator.share && (
                <button
                  onClick={shareImage}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share / Open in Apps
                  <span className="text-xs opacity-75">(Recommended)</span>
                </button>
              )}

              {/* Save to Photos */}
              <button
                onClick={saveToPhotos}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Download Image
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={copyToClipboard}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Image
              </button>

              {/* Manual Instructions */}
              <div className="bg-slate-800 p-4 rounded-xl text-sm text-slate-300">
                <p className="font-semibold mb-2">💡 Tip:</p>
                <p>If the buttons don't work:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-slate-400">
                  <li>Long press the image above</li>
                  <li>Select "Save Image" or "Copy"</li>
                  <li>Or take a screenshot</li>
                </ol>
              </div>
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
              <p className="text-slate-400 text-2xl font-medium">2025/2026 Tax Report</p>
            </div>
            <div className="flex gap-12 text-right">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Annual Income</p>
                <p className="text-4xl font-bold text-red-500">{formatCurrency(results.grossPayAnnual)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Province</p>
                <p className="text-4xl font-bold">{inputs.province}</p>
              </div>
            </div>
          </div>

          {/* Tax Optimization Summary */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Core Tax Optimization Recommendations</h2>
            <div className="bg-slate-800 p-6 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Recommended RRSP Contribution</p>
                  <p className="text-3xl font-bold text-green-400">{formatCurrency(taxOptimization.rrsp.recommendedAmount)}</p>
                  <p className="text-slate-500 text-sm mt-1">Estimated Refund: {formatCurrency(taxOptimization.rrsp.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Tax Savings Potential</p>
                  <p className="text-3xl font-bold text-red-400">{formatCurrency(taxOptimization.summary.totalPotentialSavings)}</p>
                  <p className="text-slate-500 text-sm mt-1">Marginal Rate: {(taxOptimization.rrsp.marginalRate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-4">Action Plan</h3>
            <ul className="space-y-3">
              {taxOptimization.summary.actionPlan.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <span className="text-red-500 font-bold">{idx + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-slate-100 mb-2">Plan your future with confidence.</p>
              <p className="text-slate-500 font-mono text-lg">{APP_URL}</p>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.4em] mb-2">Based on 2025 Tax Rules</p>
                <p className="text-sm text-slate-500 italic">For reference only. Consult a tax professional for personalized advice.</p>
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

// Tax Optimization Panel Component
interface TaxOptimizationPanelProps {
  optimization: TaxOptimizationResult;
  rrspScenarios: { amount: number; taxSavings: number; effectiveCost: number; refundRate: number }[];
  marginalRate: { federal: number; provincial: number; combined: number };
  showScenarios: boolean;
  onToggleScenarios: () => void;
}

const TaxOptimizationPanel: React.FC<TaxOptimizationPanelProps> = ({
  optimization,
  rrspScenarios,
  marginalRate,
  showScenarios,
  onToggleScenarios,
}) => {
  const { rrsp, tfsa, fhsa, otherStrategies, summary } = optimization;

  const highPriorityStrategies = otherStrategies.filter(
    s => s.suitability === 'highly-recommended'
  );
  const mediumPriorityStrategies = otherStrategies.filter(
    s => s.suitability === 'recommended'
  );

  return (
    <div className="space-y-6">
      {/* Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaxCard
          title="Recommended RRSP"
          amount={rrsp.recommendedAmount}
          subtitle={`Est. Refund ${formatCurrency(rrsp.refundAmount)}`}
          highlight
        />
        <TaxCard
          title="Marginal Tax Rate"
          amount={marginalRate.combined * 100}
          subtitle={`Federal ${(marginalRate.federal * 100).toFixed(0)}% + Prov ${(marginalRate.provincial * 100).toFixed(0)}%`}
          isPercentage
        />
        <TaxCard
          title="Total Savings Potential"
          amount={summary.totalPotentialSavings}
          subtitle="Annual estimate"
          accent="green"
        />
      </div>

      {/* RRSP Detailed Recommendation */}
      {rrsp.recommendedAmount > 0 && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-xs">1</span>
              RRSP - Registered Retirement Savings Plan
            </h4>
            <button
              onClick={onToggleScenarios}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              {showScenarios ? 'Hide Comparison' : 'View Contribution Scenarios'}
            </button>
          </div>
          
          <p className="text-sm text-slate-300 mb-4">{rrsp.tierRecommendation}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricBox label="Recommended" value={formatCurrency(rrsp.recommendedAmount)} />
            <MetricBox label="Max Deductible" value={formatCurrency(rrsp.maxDeductible)} />
            <MetricBox label="Tax Savings" value={formatCurrency(rrsp.taxSavings)} accent />
            <MetricBox label="Net Cost" value={formatCurrency(rrsp.effectiveCost)} />
          </div>

          {showScenarios && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left py-2">Contribution</th>
                    <th className="text-right py-2">Tax Refund</th>
                    <th className="text-right py-2">Net Cost</th>
                    <th className="text-right py-2">Refund Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rrspScenarios.map((scenario, idx) => (
                    <tr 
                      key={idx} 
                      className={`border-b border-slate-800 ${scenario.amount === rrsp.recommendedAmount ? 'bg-red-900/20' : ''}`}
                    >
                      <td className="py-2 text-slate-300">
                        {formatCurrency(scenario.amount)}
                        {scenario.amount === rrsp.recommendedAmount && (
                          <span className="ml-2 text-xs text-red-400">Recommended</span>
                        )}
                      </td>
                      <td className="py-2 text-right text-green-400">{formatCurrency(scenario.taxSavings)}</td>
                      <td className="py-2 text-right text-slate-400">{formatCurrency(scenario.effectiveCost)}</td>
                      <td className="py-2 text-right text-slate-500">{scenario.refundRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TFSA & FHSA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-md font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs">2</span>
            TFSA - Tax-Free Savings Account
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">2025 Contribution Room</span>
              <span className="text-white font-semibold">{formatCurrency(tfsa.contributionRoom2025)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recommended Contribution</span>
              <span className="text-blue-400 font-semibold">{formatCurrency(tfsa.recommendedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lifetime Room Available</span>
              <span className="text-slate-300">{formatCurrency(tfsa.lifetimeRoom)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            TFSA earnings are tax-free. Great for emergency funds or short-term savings.
          </p>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-md font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-xs">3</span>
            FHSA - First Home Savings Account
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Annual Limit</span>
              <span className="text-white font-semibold">{formatCurrency(fhsa.annualLimit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recommended Contribution</span>
              <span className="text-green-400 font-semibold">{formatCurrency(fhsa.recommendedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lifetime Limit</span>
              <span className="text-slate-300">{formatCurrency(fhsa.lifetimeLimit)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            FHSA offers tax deduction on contributions AND tax-free withdrawals for home purchase.
          </p>
        </div>
      </div>

      {/* Other Tax Strategies */}
      {highPriorityStrategies.length > 0 && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-md font-bold text-white mb-4">High Priority Tax Strategies</h4>
          <div className="space-y-4">
            {highPriorityStrategies.map((strategy, idx) => (
              <StrategyItem key={idx} strategy={strategy} />
            ))}
          </div>
        </div>
      )}

      {mediumPriorityStrategies.length > 0 && (
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/30">
          <h4 className="text-md font-bold text-slate-300 mb-4">Additional Strategies to Consider</h4>
          <div className="space-y-3">
            {mediumPriorityStrategies.slice(0, 3).map((strategy, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-slate-500 mt-0.5">•</span>
                <div>
                  <span className="text-slate-300 font-medium">{strategy.name}</span>
                  <span className="text-slate-500 ml-2">(Est. savings: {formatCurrency(strategy.estimatedSavings)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-red-900/40 to-slate-900/60 p-5 rounded-xl border border-red-500/30">
        <h4 className="text-md font-bold text-white mb-3">Executive Summary</h4>
        <p className="text-sm text-slate-300 mb-4">{summary.priority}</p>
        <div className="space-y-2">
          {summary.actionPlan.slice(0, 3).map((action, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-slate-200">{action}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Recommendations based on 2025 Canadian tax laws. Actual amounts may vary based on your specific situation. Consult a Registered Tax Preparer (RTP) or financial advisor for personalized advice.
      </p>
    </div>
  );
};

// Helper Components
const TaxCard: React.FC<{
  title: string;
  amount: number;
  subtitle: string;
  highlight?: boolean;
  isPercentage?: boolean;
  accent?: 'green' | 'red';
}> = ({ title, amount, subtitle, highlight, isPercentage, accent }) => (
  <div className={`p-4 rounded-xl ${highlight ? 'bg-red-600' : 'bg-slate-900/60 border border-slate-700/50'}`}>
    <p className={`text-xs mb-1 ${highlight ? 'text-red-100' : 'text-slate-400'}`}>{title}</p>
    <p className={`text-2xl font-bold ${accent === 'green' ? 'text-green-400' : highlight ? 'text-white' : 'text-slate-100'}`}>
      {isPercentage ? `${amount.toFixed(1)}%` : formatCurrency(amount)}
    </p>
    <p className={`text-xs mt-1 ${highlight ? 'text-red-200' : 'text-slate-500'}`}>{subtitle}</p>
  </div>
);

const MetricBox: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({ label, value, accent }) => (
  <div className="bg-slate-800 p-3 rounded-lg text-center">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className={`text-sm font-bold ${accent ? 'text-green-400' : 'text-slate-200'}`}>{value}</p>
  </div>
);

const StrategyItem: React.FC<{ strategy: import('../utils/taxOptimizer').TaxStrategy }> = ({ strategy }) => (
  <div className="border-l-2 border-red-500 pl-4">
    <div className="flex items-center justify-between mb-1">
      <h5 className="text-sm font-semibold text-slate-200">{strategy.name}</h5>
      <span className={`text-xs px-2 py-0.5 rounded ${
        strategy.effort === 'low' ? 'bg-green-900/50 text-green-400' :
        strategy.effort === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
        'bg-red-900/50 text-red-400'
      }`}>
        {strategy.effort === 'low' ? 'Easy' : strategy.effort === 'medium' ? 'Moderate' : 'Complex'}
      </span>
    </div>
    <p className="text-xs text-slate-400 mb-2">{strategy.description}</p>
    <div className="flex items-center gap-4 text-xs">
      <span className="text-green-400">Est. Savings: {formatCurrency(strategy.estimatedSavings)}</span>
      <span className="text-slate-500">Max: {formatCurrency(strategy.maxBenefit)}</span>
    </div>
    <ul className="mt-2 space-y-1">
      {strategy.actionItems.slice(0, 2).map((item, idx) => (
        <li key={idx} className="text-xs text-slate-500 flex items-start gap-2">
          <span className="text-slate-600">→</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

// Generate AI Prompt
const generateTaxPrompt = (
  optimization: TaxOptimizationResult,
  results: CalculationResult,
  inputs: SalaryInputs
): string => {
  const { rrsp, tfsa, fhsa, summary } = optimization;
  
  return `
You are a professional Canadian tax planner. Based on the following client's specific financial data, provide detailed, practical, and personalized tax optimization advice.

## Client Basic Information
- Province: ${inputs.province}
- Annual Income: $${results.grossPayAnnual.toLocaleString()}
- Marginal Tax Rate: ${(rrsp.marginalRate * 100).toFixed(1)}%

## System-Calculated Optimization Plan (Use this as basis for professional interpretation)

### RRSP Recommendations
- Recommended Contribution: $${rrsp.recommendedAmount.toLocaleString()}
- Maximum Deductible Amount: $${rrsp.maxDeductible.toLocaleString()}
- Estimated Tax Savings: $${rrsp.taxSavings.toLocaleString()}
- Effective Net Cost: $${rrsp.effectiveCost.toLocaleString()}
- Estimated Refund: $${rrsp.refundAmount.toLocaleString()}
- Strategy Description: ${rrsp.tierRecommendation}

### TFSA Recommendations
- 2025 Contribution Room: $${tfsa.contributionRoom2025.toLocaleString()}
- Recommended Contribution: $${tfsa.recommendedAmount.toLocaleString()}
- Lifetime Available Room: $${tfsa.lifetimeRoom.toLocaleString()}

### FHSA Recommendations (First-Time Home Buyers)
- Annual Limit: $${fhsa.annualLimit.toLocaleString()}
- Recommended Contribution: $${fhsa.recommendedAmount.toLocaleString()}
- Lifetime Limit: $${fhsa.lifetimeLimit.toLocaleString()}

### Other Tax Strategy Potential
- Total Tax Savings Potential: $${summary.totalPotentialSavings.toLocaleString()}
- Priority: ${summary.priority}

## Please provide the following:

1. **RRSP Deep Analysis** (3-4 sentences)
   - Explain why this contribution amount is recommended
   - How to maximize refund benefits
   - Tax implications when withdrawing from RRSP

2. **TFSA vs RRSP Priority Advice** (2-3 sentences)
   - Choice recommendations based on client's income level
   - Best use cases for each account type

3. **FHSA Usage Recommendations** (2-3 sentences)
   - If client plans to buy a home, explain FHSA advantages
   - How to combine with RRSP for maximum benefit

4. **Specific Action Steps** (bullet points)
   - Step 1: Which accounts to open
   - Step 2: How much to contribute
   - Step 3: When to contribute (now or year-end)
   - Step 4: How to file taxes

5. **Common Pitfall Warnings** (2-3 points)
   - RRSP over-contribution penalties
   - TFSA over-contribution penalties
   - Other important considerations

## Output Format Requirements:
- Use English
- Use **bold** for key numbers
- Professional but easy to understand tone
- Give specific actionable guidance, avoid vague "consult a professional" responses
`;
};

export default GeminiAdvisor;
