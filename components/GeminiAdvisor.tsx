'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import type { CalculationResult } from '../types';
import type { SalaryInputs } from '../types';
import { useT } from '../lib/i18n';
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
  sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<b class="text-red-400 font-bold">$1</b>');
  
  // List items
  sanitized = sanitized.replace(/^\* (.*)$/gm, '<li class="ml-4 mb-2">$1</li>');
  sanitized = sanitized.replace(/^- (.*)$/gm, '<li class="ml-4 mb-2">$1</li>');
  
  // Headers (allow h3, h4 and h5)
  sanitized = sanitized.replace(/^# (.*)$/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-700/50 pb-2">$1</h3>');
  sanitized = sanitized.replace(/^## (.*)$/gm, '<h4 class="text-lg font-bold text-red-400 mt-5 mb-2">$1</h4>');
  sanitized = sanitized.replace(/^### (.*)$/gm, '<h5 class="text-base md:text-lg font-bold text-red-400 mt-6 mb-3">$1</h5>');
  
  // Paragraphs - wrap lines that don't start with special characters
  sanitized = sanitized.replace(/^(?!<[lh]|<b)(.+)$/gm, '<p class="mb-4 text-justify leading-relaxed">$1</p>');
  
  return sanitized;
};

/**
 * 🚀 High-end inline Markdown parser for PDF/Image Export and Web Rendering
 * Dynamically colors bold text based on financial accounts:
 * - RRSP / Salaries -> Warm Coral Red (text-red-400)
 * - TFSA / Room -> Emerald Green (text-emerald-400)
 * - FHSA / Housing -> Sky Blue (text-sky-400)
 */
const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const cleanPart = part.toLowerCase();
      let colorClass = 'text-white font-bold'; // Default bold is bright white

      // Check if it contains digits, percentages, or dollar signs to apply custom accounts coloring
      if (/[\d$%]/.test(part)) {
        if (cleanPart.includes('tfsa') || cleanPart.includes('$7,000') || cleanPart.includes('$102,000')) {
          colorClass = 'text-emerald-400 font-extrabold'; // Green for TFSA
        } else if (cleanPart.includes('fhsa') || cleanPart.includes('$8,000') || cleanPart.includes('$40,000')) {
          colorClass = 'text-sky-400 font-extrabold'; // Blue for FHSA
        } else {
          colorClass = 'text-red-400 font-extrabold'; // Coral-Red for RRSP & General Income
        }
      } else {
        // Highlighting account names even if they don't have numbers
        if (cleanPart.includes('tfsa') || cleanPart.includes('tax-free savings')) {
          colorClass = 'text-emerald-400 font-bold';
        } else if (cleanPart.includes('fhsa') || cleanPart.includes('first home savings')) {
          colorClass = 'text-sky-400 font-bold';
        } else if (cleanPart.includes('rrsp') || cleanPart.includes('retirement savings')) {
          colorClass = 'text-red-400 font-bold';
        }
      }

      return (
        <strong key={index} className={colorClass}>
          {part}
        </strong>
      );
    }
    // Handle single asterisk * for italics
    const subParts = part.split('*');
    return subParts.map((subPart, subIndex) => {
      if (subIndex % 2 === 1) {
        return <em key={subIndex} className="italic text-slate-300 font-medium">{subPart}</em>;
      }
      return subPart;
    }) as any;
  }) as any;
};

/**
 * 🛠️ Complete line-by-line Markdown renderer for BOTH web and image exports.
 * Guarantees 100% exact rendering match between webpage and downloaded image!
 */
const renderMarkdownLine = (line: string, isImage: boolean): React.ReactNode => {
  const cleanLine = line.trim();
  if (cleanLine === '') return null;

  // Font sizes: larger on downloaded image for legibility, standard on web screen
  const pSize = isImage ? 'text-[21px] leading-[1.7]' : 'text-sm md:text-base leading-relaxed';
  const h2Size = isImage ? 'text-3.5xl' : 'text-lg md:text-xl';
  const h3Size = isImage ? 'text-3xl' : 'text-base md:text-lg';

  if (cleanLine.startsWith('###')) {
    const text = cleanLine.replace('###', '').trim();
    const cleanText = text.toLowerCase();
    
    // Colorful, themed headings
    let colorClass = 'text-red-400'; // Default Coral-Red
    if (cleanText.includes('tfsa')) {
      colorClass = 'text-emerald-400'; // Green for TFSA
    } else if (cleanText.includes('fhsa')) {
      colorClass = 'text-sky-400'; // Blue for FHSA
    } else if (cleanText.includes('action') || cleanText.includes('step')) {
      colorClass = 'text-white border-b border-slate-700/50 pb-2 w-full';
    } else if (cleanText.includes('pitfall') || cleanText.includes('warning')) {
      colorClass = 'text-amber-500'; // Warning Orange
    }

    return (
      <h4 key={text} className={`${h3Size} font-bold ${colorClass} mt-8 mb-3`}>
        {renderInlineMarkdown(text)}
      </h4>
    );
  }

  if (cleanLine.startsWith('##')) {
    const text = cleanLine.replace('##', '').trim();
    return (
      <h3 key={text} className={`${h2Size} font-extrabold text-red-500 mt-10 mb-4 border-b border-slate-800 pb-2`}>
        {renderInlineMarkdown(text)}
      </h3>
    );
  }

  if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
    const text = cleanLine.replace(/^[-*]\s*/, '').trim();
    const cleanText = text.toLowerCase();

    // Color-coded bullet points for high-end look
    let bulletColor = 'text-red-500';
    if (cleanText.includes('tfsa')) {
      bulletColor = 'text-emerald-500';
    } else if (cleanText.includes('fhsa')) {
      bulletColor = 'text-sky-500';
    } else if (cleanText.includes('step 1') || cleanText.includes('open')) {
      bulletColor = 'text-amber-400';
    } else if (cleanText.includes('step 2') || cleanText.includes('contribute')) {
      bulletColor = 'text-emerald-400';
    } else if (cleanText.includes('step 3')) {
      bulletColor = 'text-sky-400';
    } else if (cleanText.includes('step 4')) {
      bulletColor = 'text-violet-400';
    }

    return (
      <li key={text} className={`ml-4 list-none flex items-start gap-2 ${pSize} text-slate-300 mb-2`}>
        <span className={`${bulletColor} font-bold text-lg mt-0.5 flex-shrink-0 select-none`}>•</span>
        <span className="flex-1">{renderInlineMarkdown(text)}</span>
      </li>
    );
  }

  return (
    <p className={`${pSize} text-slate-300 text-justify font-sans mb-4`}>
      {renderInlineMarkdown(cleanLine)}
    </p>
  );
};

const GeminiAdvisor: React.FC<Props> = ({ results, inputs }) => {
  const { t } = useT();
  const APP_URL = 'https://canpayinsights.ca/';

  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showRRSPScenarios, setShowRRSPScenarios] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);

  // Local helper to calculate pay periods per year
  const getPeriodsPerYear = (frequency?: string): number => {
    if (frequency === 'monthly') return 12;
    if (frequency === 'semi-monthly') return 24;
    if (frequency === 'weekly') return 52;
    return 26; // bi-weekly
  };

  const periodsPerYear = useMemo(() => {
    return getPeriodsPerYear((inputs as any).payFrequency);
  }, [(inputs as any).payFrequency]);

  const annualRRSPActual = useMemo(() => {
    return (results.rrspDeduction || 0) * periodsPerYear;
  }, [results.rrspDeduction, periodsPerYear]);

  const annualEmployerMatchActual = useMemo(() => {
    const inp = inputs as any;
    if (inp.rrspType === 'percent' && inp.rrspEmployerMatch && inp.rrspEmployerMatch > 0) {
      const grossPay = results.grossPayPerPeriod || results.grossPayBiWeekly || 0;
      return (grossPay * (inp.rrspEmployerMatch / 100)) * periodsPerYear;
    }
    return 0;
  }, [inputs, results.grossPayPerPeriod, results.grossPayBiWeekly, periodsPerYear]);

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

  const renderSmartReport = (isSnapshot = false) => {
    const annualIncome = results.grossPayAnnual || 0;
    const netIncome = results.netPayAnnual || 0;
    const totalDeductions = results.totalDeductionsAnnual || 0;
    const annualCPP = (results.cppDeduction || 0) * periodsPerYear;
    const annualEI = (results.eiDeduction || 0) * periodsPerYear;
    const annualTax = (results.federalTax + results.provincialTax) * periodsPerYear;
    const effectiveRate = annualIncome > 0 ? ((annualTax / annualIncome) * 100).toFixed(1) : '0.0';

    const remainingRRSPOptimum = Math.max(0, taxOptimization.rrsp.recommendedAmount - annualRRSPActual);
    const biweeklyTopUp = Math.round(remainingRRSPOptimum / periodsPerYear);
    const extraRefund = Math.floor(remainingRRSPOptimum * marginalRate.combined);

    const getTaxBracketInfo = (income: number) => {
      if (income <= 57375) return { current: '15%', next: '20.5%', nextThreshold: 57375 };
      if (income <= 114750) return { current: '20.5%', next: '26%', nextThreshold: 114750 };
      if (income <= 177722) return { current: '26%', next: '29%', nextThreshold: 177722 };
      if (income <= 253865) return { current: '29%', next: '33%', nextThreshold: 253865 };
      return { current: '33%', next: 'Max', nextThreshold: Infinity };
    };
    const bracketInfo = getTaxBracketInfo(annualIncome);

    return (
      <div className={`space-y-6 text-left ${isSnapshot ? 'text-xl' : 'text-sm sm:text-base'}`}>
        
        {/* Executive Summary Card */}
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-amber-400 font-extrabold text-lg sm:text-xl mb-3">
            {t('rep.execSummary')}
          </h4>
          <p className="text-slate-200 leading-relaxed">
            {t('rep.execA')}<span className="text-red-400 font-bold">{formatCurrency(annualIncome)}</span>{t('rep.execB')}<span className="text-red-400 font-bold">{inputs.province}</span>{t('rep.execC')}<span className="text-red-400 font-bold">{formatCurrency(annualTax)}</span>{t('rep.execD')}<span className="text-red-400 font-bold">{effectiveRate}</span>{t('rep.execE')}<span className="text-green-400 font-bold">{formatCurrency(taxOptimization.summary.totalPotentialSavings + annualEmployerMatchActual)}</span>{t('rep.execF')}
          </p>
        </div>

        {/* Income & Tax Analysis + Monthly Breakdown */}
        <div className={`grid grid-cols-1 ${isSnapshot ? 'grid-cols-2 gap-6' : 'md:grid-cols-2 gap-4'}`}>
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
            <h4 className="text-sky-400 font-bold text-base sm:text-lg mb-3">
              {t('rep.incomeAnalysis')}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex justify-between">
                <span>{t('rep.grossAnnual')}:</span>
                <span className="text-white font-bold">{formatCurrency(annualIncome)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('rep.netTakeHome')}:</span>
                <span className="text-white font-bold">{formatCurrency(netIncome)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('rep.totalTaxFedProv')}:</span>
                <span className="text-white font-bold">{formatCurrency(annualTax)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('rep.cppContrib')}:</span>
                <span className="text-white font-bold">{formatCurrency(annualCPP)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('rep.eiPremiums')}:</span>
                <span className="text-white font-bold">{formatCurrency(annualEI)}</span>
              </li>
              <li className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                <span>{t('rep.marginalRate')}:</span>
                <span className="text-red-400 font-bold">{(marginalRate.combined * 100).toFixed(1)}%</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div>
              <h4 className="text-violet-400 font-bold text-base sm:text-lg mb-3">
                {t('rep.monthlyBreakdown')}
              </h4>
              <ul className="space-y-2 text-slate-300">
                <li className="flex justify-between">
                  <span>{t('rep.monthlyNet')}:</span>
                  <span className="text-white font-bold">{formatCurrency(netIncome / 12)}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('rep.monthlyTax')}:</span>
                  <span className="text-white font-bold">{formatCurrency(annualTax / 12)}</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-4">
              <p className="text-amber-400 text-xs sm:text-sm">
                {t('rep.everyDollarPre')}<span className="font-bold">{(marginalRate.combined * 100).toFixed(1)}%</span>{t('rep.everyDollarPost')}
              </p>
            </div>
          </div>
        </div>

        {/* Federal Tax Bracket warning */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-orange-400 font-bold text-base sm:text-lg mb-2">
            {t('rep.fedBracket')}
          </h4>
          <div className="flex justify-between items-center text-slate-300 text-sm">
            <span>{t('rep.currentBracket')}:</span>
            <span className="text-white font-bold">{bracketInfo.current}</span>
          </div>
          {bracketInfo.nextThreshold !== Infinity && (
            <p className="text-amber-400 text-xs sm:text-sm mt-2 border-t border-slate-800 pt-2">
              {t('rep.nextBracketPre')}{bracketInfo.next}{t('rep.nextBracketMid')}<span className="font-bold">{formatCurrency(bracketInfo.nextThreshold)}</span>{t('rep.nextBracketPost')}
            </p>
          )}
        </div>

        {/* RRSP Strategy Card */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-red-400 font-bold text-base sm:text-lg mb-3">
            🏦 {t('rep.rrspStrategy')}
          </h4>
          {annualRRSPActual > 0 ? (
            <div className="space-y-4">
              <p className="text-emerald-400 font-bold text-base">
                {t('opt.optimumRoom')}: {formatCurrency(remainingRRSPOptimum)}
              </p>
              <p className="text-slate-300">
                {t('rep.greatA')}<span className="text-white font-bold">{formatCurrency(annualRRSPActual)}</span>{t('rep.greatB')}
                {annualEmployerMatchActual > 0 ? <>{t('rep.greatC')}<span className="text-green-400 font-bold">+{formatCurrency(annualEmployerMatchActual)}{t('rep.greatD')}</span></> : ''}{t('rep.greatE')}
              </p>
              <div className="space-y-2 border-t border-slate-800 pt-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>{t('rep.yourContribution')}:</span>
                  <span>{formatCurrency(annualRRSPActual)}{t('opt.perYr')}</span>
                </div>
                {annualEmployerMatchActual > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>{t('rep.employerMatch')}:</span>
                    <span>+{formatCurrency(annualEmployerMatchActual)}{t('opt.perYr')} {t('rep.free')}</span>
                  </div>
                )}
                {remainingRRSPOptimum > 0 && (
                  <>
                    <div className="flex justify-between text-amber-400">
                      <span>{t('rep.topupNeeded')}:</span>
                      <span>{formatCurrency(remainingRRSPOptimum)}{t('opt.perYr')} (≈ {formatCurrency(biweeklyTopUp)}{t('rep.perBiweekly')})</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2">
                      <p className="text-green-400 text-xs sm:text-sm">
                        {t('rep.topupEarnPre')}<span className="font-bold">{formatCurrency(biweeklyTopUp)}{t('rep.perBiweekly')}</span>{t('rep.topupEarnMid')}<span className="font-bold">{formatCurrency(extraRefund)}</span>{t('rep.topupEarnPost')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-green-400 font-bold text-lg">
                {t('rep.contributePre')}{formatCurrency(taxOptimization.rrsp.recommendedAmount)}{t('rep.contributePost')}
              </p>
              <p className="text-slate-300">
                {t('rep.savesPre')}<span className="text-white font-bold">{(marginalRate.combined * 100).toFixed(0)}¢</span>{t('rep.savesPost')}
              </p>
              <div className="space-y-2 border-t border-slate-800 pt-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>{t('rep.estRefund')}:</span>
                  <span className="text-amber-400 font-bold">{formatCurrency(taxOptimization.rrsp.taxSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('rep.biweeklyDeposit')}:</span>
                  <span className="text-white font-bold">{formatCurrency(Math.round(taxOptimization.rrsp.recommendedAmount / periodsPerYear))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TFSA Strategy Card */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-blue-400 font-bold text-base sm:text-lg mb-3">
            💰 {t('rep.tfsaStrategy')}
          </h4>
          <p className="text-green-400 font-bold text-lg mb-2">
            {t('rep.maxOutPre')}{formatCurrency(taxOptimization.tfsa.recommendedAmount)}
          </p>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>{t('rep.tfsaRoom2026')}:</span>
              <span className="text-white font-bold">$7,000</span>
            </div>
            <div className="flex justify-between">
              <span>{t('rep.lifetimeRoom')}:</span>
              <span className="text-white">{formatCurrency(taxOptimization.tfsa.lifetimeRoom)}</span>
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
              {t('rep.tfsaNote')}
            </p>
          </div>
        </div>

        {/* Action Steps Checklist */}
        <div className="bg-emerald-950/60 p-5 rounded-xl border border-emerald-800/40 text-left">
          <h4 className="text-emerald-400 font-bold text-base sm:text-lg mb-3">
            ✅ {t('rep.checklist')}
          </h4>
          <ul className="space-y-2.5 text-slate-200 text-sm">
            {annualRRSPActual === 0 && (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">☐</span>
                  <span>{t('rep.openRRSP')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">☐</span>
                  <span>{t('rep.setupDepositPre')}<span className="font-semibold">{formatCurrency(Math.round(taxOptimization.rrsp.recommendedAmount / periodsPerYear))}</span></span>
                </li>
              </>
            )}
            {remainingRRSPOptimum > 0 && annualRRSPActual > 0 && (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">☐</span>
                  <span>{t('rep.topupBeforePre')}<span className="font-semibold">{formatCurrency(remainingRRSPOptimum)}</span>{t('rep.topupBeforePost')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">☐</span>
                  <span>{t('rep.autosavePre')}<span className="font-semibold">{formatCurrency(biweeklyTopUp)}{t('rep.perBiweekly')}</span>{t('rep.autosavePost')}</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5">☐</span>
              <span>{t('rep.investPre')}<span className="font-semibold">{formatCurrency(taxOptimization.tfsa.recommendedAmount)}</span>{t('rep.investPost')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5">☐</span>
              <span>{t('rep.fileTaxes')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5">☐</span>
              <span>{t('rep.claimReceipts')}</span>
            </li>
          </ul>
        </div>

        {/* Tax Filing Tips */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 text-left">
          <h4 className="text-cyan-400 font-bold text-base sm:text-lg mb-3">
            📋 {t('rep.filingTips')}
          </h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>{t('rep.tipFile')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>{t('rep.tipWFH')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>{t('rep.tipMedical')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>{t('rep.tipCharity')}</span>
            </li>
          </ul>
        </div>

        {/* Potential Savings Footer */}
        <div className="bg-red-600 p-5 rounded-xl text-white text-left">
          <p className="text-sm uppercase tracking-wider mb-1 font-bold">{t('rep.totalSavings')}</p>
          <p className="text-2xl sm:text-4xl font-black">{formatCurrency(taxOptimization.summary.totalPotentialSavings + annualEmployerMatchActual)}</p>
        </div>

      </div>
    );
  };

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
      // Simulate a premium offline instant calculation delay (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAdvice('local_strategy_active');
    } catch (err: unknown) {
      setError('Tax analysis temporarily unavailable.');
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
    <div className="bg-slate-800/80 rounded-xl shadow-lg p-4 sm:p-6 text-white mt-6 border border-slate-700/40 relative overflow-hidden transition-all backdrop-blur-sm">
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
            <h3 className="text-lg font-bold">{t('opt.title')}</h3>
            <p className="text-xs text-slate-400">{t('opt.subtitle')}</p>
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
        annualRRSPActual={annualRRSPActual}
        annualEmployerMatchActual={annualEmployerMatchActual}
      />

      <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {t('opt.strategy')}
        </h4>
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 animate-fadeIn">
          <div className="max-w-none">
            {renderSmartReport(false)}
          </div>
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
                  {t('opt.generating')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('opt.saveReport')}
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2">{t('opt.saveReportHint')}</p>
          </div>
        </div>
      </div>

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
                <img src="/logo_reverse.png" alt="" className="w-14 h-14 object-contain flex-shrink-0 rounded-xl shadow-lg border border-slate-800" />
                <h1 className="text-5xl font-bold tracking-tight">
                  CanPay <span className="text-red-500">Insights</span>
                </h1>
              </div>
              <p className="text-slate-400 text-2xl font-medium">2026 Tax Report</p>
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
                  <p className="text-3xl font-bold text-red-400">{formatCurrency(taxOptimization.summary.totalPotentialSavings + annualEmployerMatchActual)}</p>
                  <p className="text-slate-500 text-sm mt-1">Marginal Rate: {(taxOptimization.rrsp.marginalRate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="mb-12">
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

          {/* ✦ Smart Tax Strategy (Synchronized with App) */}
          <div className="mb-12 border-t border-slate-800 pt-12 text-left">
            <h3 className="text-3.5xl font-extrabold text-white mb-8 flex items-center gap-3 border-b-2 border-red-600 pb-3 w-fit">
              <span className="text-red-500 text-4xl">✦</span> Smart Tax Strategy
            </h3>
            <div className="max-w-[850px]">
              {renderSmartReport(true)}
            </div>
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
              <div className="w-32 h-32 p-1.5 bg-white rounded-2xl shadow-2xl border-4 border-slate-800 flex-shrink-0 flex items-center justify-center aspect-square">
                {qrBase64 ? (
                  <img src={qrBase64} alt="QR" className="w-full h-full block object-contain aspect-square" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl" />
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
  annualRRSPActual?: number;
  annualEmployerMatchActual?: number;
}

const TaxOptimizationPanel: React.FC<TaxOptimizationPanelProps> = ({
  optimization,
  rrspScenarios,
  marginalRate,
  showScenarios,
  onToggleScenarios,
  annualRRSPActual = 0,
  annualEmployerMatchActual = 0,
}) => {
  const { rrsp, tfsa, fhsa, otherStrategies, summary } = optimization;

  const highPriorityStrategies = otherStrategies.filter(
    s => s.suitability === 'highly-recommended'
  );
  const mediumPriorityStrategies = otherStrategies.filter(
    s => s.suitability === 'recommended'
  );

  const { t } = useT();
  const hasActualRRSP = annualRRSPActual > 0;
  const remainingRRSPOptimum = Math.max(0, rrsp.recommendedAmount - annualRRSPActual);
  const potentialExtraRefund = Math.floor(remainingRRSPOptimum * marginalRate.combined);

  return (
    <div className="space-y-6">
      {/* Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasActualRRSP ? (
          <TaxCard
            title={t('opt.optimumRoom')}
            amount={remainingRRSPOptimum}
            subtitle={`${t('opt.potentialRefund')} ${formatCurrency(potentialExtraRefund)}`}
            highlight
          />
        ) : (
          <TaxCard
            title={t('opt.recommendedRRSP')}
            amount={rrsp.recommendedAmount}
            subtitle={`${t('opt.estRefund')} ${formatCurrency(rrsp.refundAmount)}`}
            highlight
          />
        )}
        <TaxCard
          title={t('opt.marginalRate')}
          amount={marginalRate.combined * 100}
          subtitle={`${t('opt.federalShort')} ${(marginalRate.federal * 100).toFixed(0)}% + ${t('opt.provShort')} ${(marginalRate.provincial * 100).toFixed(0)}%`}
          isPercentage
        />
        <TaxCard
          title={t('opt.totalSavings')}
          amount={summary.totalPotentialSavings + annualEmployerMatchActual}
          subtitle={t('opt.annualInclMatch')}
          accent="green"
        />
      </div>

      {/* RRSP Detailed Recommendation */}
      {rrsp.recommendedAmount > 0 && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-xs">1</span>
              {t('opt.rrspTitle')}
            </h4>
            <button
              onClick={onToggleScenarios}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              {showScenarios ? t('opt.hideComparison') : t('opt.viewScenarios')}
            </button>
          </div>
          
          <p className="text-sm text-slate-300 mb-4">{rrsp.tierRecommendation}</p>

          {/* Visual Progress Bar and Matching stats if they have actual RRSP */}
          {hasActualRRSP && (
            <div className="mb-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('opt.rrspStatus')}</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">{t('opt.myPayroll')}</span>
                  <span className="font-semibold text-white">{formatCurrency(annualRRSPActual)}{t('opt.perYr')}</span>
                </div>
                {annualEmployerMatchActual > 0 && (
                  <div>
                    <span className="text-green-400 block text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      {t('opt.employerMatching')}
                    </span>
                    <span className="font-semibold text-green-400">+{formatCurrency(annualEmployerMatchActual)}{t('opt.perYr')}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-xs">{t('opt.optimumSpace')}</span>
                  <span className="font-semibold text-red-400">{formatCurrency(remainingRRSPOptimum)} {t('opt.left')}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${Math.min(100, (annualRRSPActual / rrsp.recommendedAmount) * 100)}%` }} 
                  title={`My Contribution: ${((annualRRSPActual / rrsp.recommendedAmount) * 100).toFixed(0)}%`}
                />
                {annualEmployerMatchActual > 0 && (
                  <div 
                    className="bg-green-500 h-full border-l border-slate-800" 
                    style={{ width: `${Math.min(100 - (annualRRSPActual / rrsp.recommendedAmount) * 100, (annualEmployerMatchActual / rrsp.recommendedAmount) * 100)}%` }} 
                    title={`Employer Match: ${((annualEmployerMatchActual / rrsp.recommendedAmount) * 100).toFixed(0)}%`}
                  />
                )}
              </div>
              
              <p className="text-[11px] text-slate-400 italic">
                {annualEmployerMatchActual > 0
                  ? t('opt.matchNote')
                  : t('opt.noMatchNote')
                }
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricBox label={t('opt.recommended')} value={formatCurrency(rrsp.recommendedAmount)} />
            <MetricBox label={t('opt.maxDeductible')} value={formatCurrency(rrsp.maxDeductible)} />
            <MetricBox label={t('opt.taxSavings')} value={formatCurrency(rrsp.taxSavings)} accent />
            <MetricBox label={t('opt.netCost')} value={formatCurrency(rrsp.effectiveCost)} />
          </div>

          {showScenarios && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left py-2">{t('opt.contribution')}</th>
                    <th className="text-right py-2">{t('opt.taxRefund')}</th>
                    <th className="text-right py-2">{t('opt.netCost')}</th>
                    <th className="text-right py-2">{t('opt.refundRate')}</th>
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
                          <span className="ml-2 text-xs text-red-400">{t('opt.recommended')}</span>
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
            {t('opt.tfsaTitle')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.tfsaRoom2025')}</span>
              <span className="text-white font-semibold">{formatCurrency(tfsa.contributionRoom2025)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.recommendedContribution')}</span>
              <span className="text-blue-400 font-semibold">{formatCurrency(tfsa.recommendedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.lifetimeRoom')}</span>
              <span className="text-slate-300">{formatCurrency(tfsa.lifetimeRoom)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {t('opt.tfsaNote')}
          </p>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
          <h4 className="text-md font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-xs">3</span>
            {t('opt.fhsaTitle')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.annualLimit')}</span>
              <span className="text-white font-semibold">{formatCurrency(fhsa.annualLimit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.recommendedContribution')}</span>
              <span className="text-green-400 font-semibold">{formatCurrency(fhsa.recommendedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('opt.lifetimeLimit')}</span>
              <span className="text-slate-300">{formatCurrency(fhsa.lifetimeLimit)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {t('opt.fhsaNote')}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        {t('opt.disclaimer')}
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
  
  // Calculate periods and actuals for precise prompt context
  const periods = (inputs as any).payFrequency ? (
    (inputs as any).payFrequency === 'monthly' ? 12 :
    (inputs as any).payFrequency === 'semi-monthly' ? 24 :
    (inputs as any).payFrequency === 'weekly' ? 52 : 26
  ) : 26;
  const annualRRSPActual = (results.rrspDeduction || 0) * periods;
  const isPercent = (inputs as any).rrspType === 'percent';
  const rrspPercentage = (inputs as any).rrspPercentage || 0;
  const rrspEmployerMatch = (inputs as any).rrspEmployerMatch || 0;
  const grossPay = results.grossPayPerPeriod || results.grossPayBiWeekly || 0;
  const annualEmployerMatchActual = isPercent && rrspEmployerMatch > 0 
    ? (grossPay * (rrspEmployerMatch / 100)) * periods 
    : 0;

  const remainingRRSPOptimum = Math.max(0, rrsp.recommendedAmount - annualRRSPActual);
  const biweeklyTopUp = Math.round(remainingRRSPOptimum / periods);

  return `
You are a professional Canadian tax planner. Based on the following client's specific financial data, provide detailed, practical, and personalized tax optimization advice.

## Client Basic Information
- Province: ${inputs.province}
- Annual Income: $${results.grossPayAnnual.toLocaleString()}
- Marginal Tax Rate: ${(rrsp.marginalRate * 100).toFixed(1)}%
- Client's Current RRSP Setup:
  - Calculation Type: ${isPercent ? 'Percentage-based' : 'Fixed-amount'}
  - Personal Contribution Rate: ${isPercent ? `${rrspPercentage}%` : `$${(inputs.rrspContributionPerPeriod || 0).toLocaleString()} per paycheque`}
  - Personal Annual RRSP Contribution (Already Saved): $${annualRRSPActual.toLocaleString()}
  - Employer Matching Contribution Rate: ${isPercent ? `${rrspEmployerMatch}%` : 'No matching'}
  - Employer Annual RRSP Matching Contribution (Already Received): $${annualEmployerMatchActual.toLocaleString()}
  - Total Current RRSP Annual Saving (Personal + Employer): $${(annualRRSPActual + annualEmployerMatchActual).toLocaleString()}

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
- Total Tax Savings Potential: $${(summary.totalPotentialSavings + annualEmployerMatchActual).toLocaleString()}
- Priority: ${summary.priority}

## CRITICAL INSTRUCTION FOR TAILORED ADVICE:
The client has already contributed $${annualRRSPActual.toLocaleString()} personally this year and has received $${annualEmployerMatchActual.toLocaleString()} from their employer, making a total of $${(annualRRSPActual + annualEmployerMatchActual).toLocaleString()} already saved.
Your advice MUST be tailored to their current situation:
1. Do NOT just tell them to contribute the raw recommended amount $${rrsp.recommendedAmount.toLocaleString()}. 
2. Instead, congratulate them on capturing $${annualEmployerMatchActual.toLocaleString()} in FREE matching funds from their employer! That is an incredible and highly smart financial decision.
3. Tell them exactly how much they still need to contribute as a voluntary personal top-up (which is exactly $${remainingRRSPOptimum.toLocaleString()} -- calculated as Recommended $${rrsp.recommendedAmount.toLocaleString()} minus their current personal contribution $${annualRRSPActual.toLocaleString()}).
4. Give them concrete, specific, and simple advice on how to do this: e.g., opening a personal RRSP/TFSA/FHSA account with a modern Canadian financial institution like Wealthsimple (highly recommended for beginners, extremely low fees and ad-free), Questrade, or one of Canada's Big Five Banks (TD, RBC, BMO, CIBC, Scotiabank), and setting up automated bi-weekly deposits of $${biweeklyTopUp.toLocaleString()} or making a lump-sum deposit before the March tax deadline.
5. Keep explanations extremadamente easy to understand. Most people do not understand finance. Use simple analogies and direct instructions.

## Please provide the following:

1. **RRSP Deep Analysis** (3-4 sentences)
   - Acknowledge and congratulate them on their existing $${annualRRSPActual.toLocaleString()} personal and $${annualEmployerMatchActual.toLocaleString()} employer matched contributions.
   - Explain that to capture the full tax savings, they have a remaining "optimal gap" of **$${remainingRRSPOptimum.toLocaleString()}** to fill.
   - Explain how filling this gap reduces their taxes and lowers net costs.
   - Explain tax implications when withdrawing from RRSP in retirement.

2. **TFSA vs RRSP Priority Advice** (2-3 sentences)
   - Choice recommendations based on client's income level ($${results.grossPayAnnual.toLocaleString()}) and tax bracket (${(rrsp.marginalRate * 100).toFixed(1)}%).
   - Best use cases for each account type.

3. **FHSA Usage Recommendations** (2-3 sentences)
   - Explain FHSA advantages if buying a first home.
   - How to combine with RRSP for maximum benefit.

4. **Specific Action Steps** (bullet points)
   - Step 1: Open Accounts. (Suggest where to open, e.g. Wealthsimple for simple zero-commission automated investing, or major banks).
   - Step 2: Contribute Amounts. (Specify contributing the voluntary top-up of **$${remainingRRSPOptimum.toLocaleString()}** to RRSP, $${tfsa.recommendedAmount.toLocaleString()} to TFSA, and $${fhsa.recommendedAmount.toLocaleString()} to FHSA).
   - Step 3: When to Contribute. (Either bi-weekly automated savings of **$${biweeklyTopUp.toLocaleString()}** or a lump sum before the March deadline).
   - Step 4: How to File Taxes. (Gather tax slips, use software like Wealthsimple Tax or TurboTax, and report RRSP deduction).

5. **Common Pitfall Warnings** (2-3 points)
   - RRSP over-contribution penalties
   - TFSA over-contribution penalties
   - Other important considerations

## Output Format Requirements:
- Use English
- Use **bold** for key numbers
- Professional but easy to understand tone (like a friendly, expert personal financial planner)
- Give specific actionable guidance, avoid vague "consult a professional" responses
`;
};

export default GeminiAdvisor;
