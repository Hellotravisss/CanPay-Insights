'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import InputSection from './components/InputSection';
import AnnualSalaryInput from './components/AnnualSalaryInput';
import TimesheetInput from './components/TimesheetInput';
import ModeSelector from './components/ModeSelector';
import { LanguageSwitcher, useT } from './lib/i18n';
import {
  recordCalcEvent,
  bucketRrspPct,
  bucketPremiumRate,
  bucketOtHours,
  bucketTipsPct,
  bucketShare,
  bucketPensionPct,
  buildPayChange,
  deriveEmploymentShape,
  noteInputEdit,
  type BehaviourSignals,
  type PayChange,
} from './lib/telemetry';
import IndustryComparison from './components/IndustryComparison';
import ExpectationPrompt from './components/ExpectationPrompt';
import NeighbourhoodPrompt from './components/NeighbourhoodPrompt';
import FakeDoors from './components/FakeDoors';
import PartnerSlot from './components/PartnerSlot';
import AppSlot from './components/AppSlot';
import ShareReward from './components/ShareReward';
import CapTimeline from './components/CapTimeline';
import PayCurve from './components/PayCurve';
import ResultsSection from './components/ResultsSection';
import GeminiAdvisor from './components/GeminiAdvisor';
import UserMenu from './components/UserMenu';
import AuthModal from './components/AuthModal';
import LoadingOverlay from './components/LoadingOverlay';
import SisterSiteCard from './components/SisterSiteCard';
import { TAX_YEAR } from './constants';
import SiteHeader from './components/site/SiteHeader';
import { buildWorkPattern } from './lib/workPattern';
import { SalaryInputs, Province, CalculationMode, AnnualSalaryInputs, PayFrequency, TimesheetInputs, CalculationResult } from './types';
import { calculateSalary, calculateFromAnnualSalary, calculateFromTimesheet } from './utils/taxEngine';
import { useAuth, type OAuthProvider } from './hooks/useAuth';
import { useUserSettings } from './hooks/useUserSettings';
import { useCalculationHistory, type CalculationRecord } from './hooks/useCalculationHistory';

// Default State - 简易估算（时薪）
// Savings / premium-pay / tips signals, all derived from values the user
// already entered and stored as buckets — the dataset gains the RRSP, overtime
// and tipping dimensions without asking anyone an extra question.
function buildBehaviour(
  mode: CalculationMode,
  simple: SalaryInputs,
  annual: AnnualSalaryInputs,
  timesheet: TimesheetInputs,
  results: CalculationResult
): BehaviourSignals {
  const inputs: any = mode === CalculationMode.SIMPLE ? simple : mode === CalculationMode.ANNUAL ? annual : timesheet;
  const gross = results.grossPayPerPeriod || results.grossPayBiWeekly || 0;
  const rrspPerPeriod = results.rrspDeduction || 0;
  const rrspPct =
    inputs.rrspType === 'percent'
      ? (inputs.rrspPercentage || 0)
      : gross > 0 ? (rrspPerPeriod / gross) * 100 : 0;
  const otHours = (results.overtimeHours15 || 0) + (results.overtimeHours20 || 0);
  const tipsThisPeriod =
    mode === CalculationMode.TIMESHEET
      ? (timesheet.entries || []).reduce((a, en) => a + (en.tips || 0), 0)
      : 0;

  return {
    hasRrsp: rrspPerPeriod > 0 || (inputs.rrspPercentage || 0) > 0,
    rrspPctBucket: bucketRrspPct(rrspPct),
    employerMatch: (inputs.rrspEmployerMatch || 0) > 0,
    shiftPremium: mode === CalculationMode.SIMPLE ? !!simple.premium?.enabled : false,
    premiumRateBucket:
      mode === CalculationMode.SIMPLE && simple.premium?.enabled
        ? bucketPremiumRate(simple.premium.ratePerHour || 0)
        : null,
    otHoursBucket: bucketOtHours(otHours),
    tipsPctBucket:
      mode === CalculationMode.TIMESHEET && gross > 0
        ? bucketTipsPct((tipsThisPeriod / gross) * 100)
        : null,
    payFrequency: inputs.payFrequency ?? null,
    ...stubExtras(mode, inputs, timesheet, gross, results),
  };
}

/**
 * Pay-stub extras the visitor typed, as ranges. Amounts are per pay period in
 * the inputs, so each is taken as a share of the period's gross; RSUs are
 * annual, so they are a share of annual gross. Fields a mode does not have
 * stay null rather than 0, so "not asked" never reads as "answered none".
 */
function stubExtras(mode: CalculationMode, inputs: any, timesheet: TimesheetInputs, gross: number, results: CalculationResult) {
  const pct = (v: number | undefined) => (gross > 0 ? ((v || 0) / gross) * 100 : null);
  const ded = inputs.deductions;
  const add = mode === CalculationMode.TIMESHEET ? null : inputs.additionalIncome;
  const income = ['0', 'under-10', '10-25', '25-plus'] as const;
  return {
    unionDuesBucket: ded ? bucketShare(pct(ded.unionDues), [1, 2], ['0', 'under-1', '1-2', '2-plus'] as const) : null,
    pensionPctBucket: ded ? bucketPensionPct(pct(ded.pension)) : null,
    ltd: ded ? (ded.ltdPremium || 0) > 0 : null,
    otherDeductionsBucket: ded ? bucketShare(pct(ded.otherDeductions), [2, 5], ['0', 'under-2', '2-5', '5-plus'] as const) : null,
    bonusBucket: add ? bucketShare(pct(add.bonus), [10, 25], [...income]) : null,
    otherIncomeBucket: add ? bucketShare(pct(add.otherIncome), [10, 25], [...income]) : null,
    statOrSickPay: add ? (add.statHolidayPay || 0) + (add.sickPay || 0) > 0 : null,
    taxableBenefits: add ? (add.taxableBenefits || 0) > 0 : null,
    rsuBucket: mode === CalculationMode.ANNUAL && results.grossPayAnnual > 0
      ? bucketShare(((inputs.equityVestingAnnual || 0) / results.grossPayAnnual) * 100, [10, 25], [...income]) : null,
    matchPolicy: (inputs.rrspEmployerMatch || 0) > 0 || inputs.rrspMatchPolicy
      ? (['equal', 'half', 'custom', 'none'].includes(inputs.rrspMatchPolicy) ? inputs.rrspMatchPolicy : null) : null,
    tipsPaid: mode === CalculationMode.TIMESHEET ? (timesheet.tipsPaid ?? null) : null,
  };
}

const DEFAULT_SIMPLE_INPUTS: SalaryInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  shift: {
    startTime: "09:00",
    endTime: "17:00",
    unpaidBreakMinutes: 30,
    daysActive: [false, true, true, true, true, true, false] // Mon-Fri
  },
  premium: {
    enabled: false,
    ratePerHour: 2.00,
    startTime: "00:00",
    endTime: "06:00"
  },
  rrspContributionPerPeriod: 0,
  additionalIncome: {
    statHolidayPay: 0,
    sickPay: 0,
    bonus: 0,
    otherIncome: 0,
    taxableBenefits: 0,
  },
  deductions: {
    ltdPremium: 0,
    unionDues: 0,
    otherDeductions: 0,
    pension: 0,
  },
};

// Default State - Annual Salary (Fixed at Bi-Weekly)
const DEFAULT_ANNUAL_INPUTS: AnnualSalaryInputs = {
  province: Province.ON,
  annualSalary: 100000,
  payFrequency: PayFrequency.BI_WEEKLY,
  additionalIncome: { statHolidayPay: 0, sickPay: 0, bonus: 0, otherIncome: 0, taxableBenefits: 0 },
  deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0, pension: 0 },
};

// Default State - Timesheet
const DEFAULT_TIMESHEET_INPUTS: TimesheetInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  payFrequency: PayFrequency.WEEKLY,
  entries: [],
  deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0, pension: 0 },
};

type AppPage = 'home' | 'calculator';

const App: React.FC = () => {
  const router = useRouter();

  // Auth
  const { user, isAuthenticated, loading: authLoading, signInWithOAuth, signInWithEmail, signInWithPassword, signUpWithPassword } = useAuth();
  const { t, lang } = useT();
  const userId = user?.id || null;

  // User settings persistence
  const { 
    settings, 
    isLoading: isSettingsLoading, 
    saveSettings, 
    saveLastMode 
  } = useUserSettings(userId);

  // Page states: 'home' = mode selection, 'calculator' = calculator
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Global loading state for page transitions
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Calculation mode state - restore from settings
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.SIMPLE);
  
  // Simple estimate inputs - restore from settings
  const [simpleInputs, setSimpleInputs] = useState<SalaryInputs>(DEFAULT_SIMPLE_INPUTS);
  
  // Annual salary inputs - restore from settings
  const [annualInputs, setAnnualInputs] = useState<AnnualSalaryInputs>(DEFAULT_ANNUAL_INPUTS);
  
  // Timesheet inputs - restore from settings
  const [timesheetInputs, setTimesheetInputs] = useState<TimesheetInputs>(DEFAULT_TIMESHEET_INPUTS);

  // Load saved settings when they become available
  useEffect(() => {
    if (!isSettingsLoading && settings) {
      // Restore last used mode
      if (settings.lastMode) {
        setMode(settings.lastMode);
      }
      
      // Restore simple inputs (merge with defaults for forward-compat)
      if (settings.simple) {
        setSimpleInputs({ ...DEFAULT_SIMPLE_INPUTS, ...settings.simple });
      }
      
      // Restore annual inputs
      if (settings.annual) {
        setAnnualInputs({ ...DEFAULT_ANNUAL_INPUTS, ...settings.annual });
      }
      
      // Restore timesheet inputs
      if (settings.timesheet) {
        setTimesheetInputs({ ...DEFAULT_TIMESHEET_INPUTS, ...settings.timesheet });
      }
    }
  }, [isSettingsLoading, settings]);

  // Routing for blog/privacy/compare is now handled by Next.js pages
  
  // Save inputs when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === CalculationMode.SIMPLE) {
        saveSettings(CalculationMode.SIMPLE, simpleInputs);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [simpleInputs, mode, saveSettings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === CalculationMode.ANNUAL) {
        saveSettings(CalculationMode.ANNUAL, annualInputs);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [annualInputs, mode, saveSettings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === CalculationMode.TIMESHEET) {
        saveSettings(CalculationMode.TIMESHEET, timesheetInputs);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [timesheetInputs, mode, saveSettings]);

  // Save last mode when it changes
  useEffect(() => {
    saveLastMode(mode);
  }, [mode, saveLastMode]);
  
  // Select mode and enter calculator
  const handleModeSelect = useCallback((selectedMode: CalculationMode) => {
    setMode(selectedMode);
    setCurrentPage('calculator');
  }, []);
  
  // What the user reopened from history, kept so the next recalculation can be
  // compared against it. Only the gross, province and date are needed — no
  // record id, no account id, nothing that identifies the person.
  //
  // A ref, not state, and cleared as soon as one changed comparison is
  // recorded: as state it lived for the whole session, so after loading one
  // record EVERY later calculation — a friend's salary, idle fiddling — was
  // compared against the stale baseline and logged as a "raise". One reopened
  // record earns exactly one change event; the raise data is only worth
  // collecting if that gesture is what it actually measures.
  const loadedFromRef = useRef<{ gross: number; province: string; savedAt: string } | null>(null);
  const loadedModeRef = useRef<CalculationMode | null>(null);

  // Return to home
  const handleBackToHome = useCallback(() => {
    setIsPageLoading(true);
    setCurrentPage('home');
    setTimeout(() => setIsPageLoading(false), 300);
  }, []);

  // Navigation — delegate to Next.js router
  const handleGoToPrivacy = useCallback(() => router.push('/privacy'), [router]);
  const handleGoToBlog = useCallback(() => router.push('/blog'), [router]);
  const handleSelectArticle = useCallback((slug: string) => router.push(`/blog/${slug}`), [router]);

  // Handle sign in
  const handleSignIn = useCallback(async (provider: OAuthProvider) => {
    try {
      await signInWithOAuth(provider);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [signInWithOAuth]);

  // Calculate results based on mode
  const results = useMemo(() => {
    try {
      switch (mode) {
        case CalculationMode.SIMPLE:
          return calculateSalary(simpleInputs);
        case CalculationMode.ANNUAL:
          return calculateFromAnnualSalary(annualInputs);
        case CalculationMode.TIMESHEET:
          return calculateFromTimesheet(timesheetInputs);
        default:
          return calculateSalary(simpleInputs);
      }
    } catch (err) {
      console.error('Calculation error:', err);
      return calculateSalary(simpleInputs);
    }
  }, [mode, simpleInputs, annualInputs, timesheetInputs]);

  // Get current province (for GeminiAdvisor)
  const currentProvince = mode === CalculationMode.ANNUAL 
    ? annualInputs.province 
    : mode === CalculationMode.TIMESHEET
    ? timesheetInputs.province
    : simpleInputs.province;

  // Get current inputs (for GeminiAdvisor)
  const currentInputs = mode === CalculationMode.ANNUAL
    ? { province: annualInputs.province, hourlyWage: annualInputs.annualSalary / 2080 }
    : mode === CalculationMode.TIMESHEET
    ? { province: timesheetInputs.province, hourlyWage: timesheetInputs.hourlyWage }
    : simpleInputs;

  // Engagement signal: did the visitor open the deep tax report.
  const [reportOpened, setReportOpened] = useState(false);

  // Anonymous aggregate telemetry (debounced + deduped inside recordCalcEvent).
  // Only bucketed values leave the browser — never exact amounts or identity.
  // Skip untouched default states (object identity vs DEFAULT_* constants) so
  // merely opening the calculator doesn't skew the data toward the defaults.
  useEffect(() => {
    if (currentPage !== 'calculator') return;
    // Wait for auth to resolve before recording anything. Sessions restore
    // asynchronously, so the first render always has userId === null; the
    // event went out marked anonymous, and when auth landed and this effect
    // re-ran, the corrected event hit an identical dedupe key and was thrown
    // away. Every registered user was therefore recorded as signed out —
    // 0 of 448, while eleven accounts were actively saving calculations.
    if (authLoading) return;
    const untouched =
      (mode === CalculationMode.SIMPLE && simpleInputs === DEFAULT_SIMPLE_INPUTS) ||
      (mode === CalculationMode.ANNUAL && annualInputs === DEFAULT_ANNUAL_INPUTS) ||
      (mode === CalculationMode.TIMESHEET && timesheetInputs === DEFAULT_TIMESHEET_INPUTS);
    if (untouched) return;
    // Switching modes abandons the reopened record — a timesheet started after
    // loading an annual calculation is new work, not an edit of the old one.
    if (loadedFromRef.current && loadedModeRef.current !== null && mode !== loadedModeRef.current) {
      loadedFromRef.current = null;
    }
    const loaded = loadedFromRef.current;
    const payChange = loaded
      ? buildPayChange(loaded.gross, loaded.province, loaded.savedAt, results.grossPayAnnual, currentProvince)
      : null;
    // The reopened-unchanged event ("same") keeps the baseline armed so the
    // edit that follows is still captured; the first real change consumes it.
    if (payChange && payChange.direction !== 'same') {
      loadedFromRef.current = null;
    }
    recordCalcEvent({
      mode,
      province: currentProvince,
      annualIncome: results.grossPayAnnual,
      lang,
      work: buildWorkPattern(mode, simpleInputs, timesheetInputs),
      isRegistered: !!userId,
      payChange,
      behaviour: buildBehaviour(mode, simpleInputs, annualInputs, timesheetInputs, results),
      employmentShape: deriveEmploymentShape(
        mode,
        buildWorkPattern(mode, simpleInputs, timesheetInputs),
        buildBehaviour(mode, simpleInputs, annualInputs, timesheetInputs, results)
      ),
      viewedReport: reportOpened,
      spouseClaim: (mode === CalculationMode.SIMPLE ? simpleInputs : mode === CalculationMode.ANNUAL ? annualInputs : timesheetInputs).spouseNetIncome != null,
      under18: (mode === CalculationMode.SIMPLE ? simpleInputs : mode === CalculationMode.ANNUAL ? annualInputs : timesheetInputs).under18 === true,
      // A calculation can leave the opening $20/h or $100,000 in place while other fields
      // change; its income bracket is then the default's, not the visitor's (2.4, 2026-11-01).
      wageEdited:
        mode === CalculationMode.SIMPLE ? simpleInputs.hourlyWage !== DEFAULT_SIMPLE_INPUTS.hourlyWage
        : mode === CalculationMode.ANNUAL ? annualInputs.annualSalary !== DEFAULT_ANNUAL_INPUTS.annualSalary
        : timesheetInputs.hourlyWage !== DEFAULT_TIMESHEET_INPUTS.hourlyWage,
    });
  }, [currentPage, mode, simpleInputs, annualInputs, timesheetInputs, currentProvince, results, lang, reportOpened, userId, authLoading]);

  // Count form changes on this page load (only the bucket is ever sent).
  useEffect(() => {
    if (simpleInputs === DEFAULT_SIMPLE_INPUTS && annualInputs === DEFAULT_ANNUAL_INPUTS && timesheetInputs === DEFAULT_TIMESHEET_INPUTS) return;
    noteInputEdit();
  }, [simpleInputs, annualInputs, timesheetInputs]);

  // Calculation History
  const { records, saveCalculation } = useCalculationHistory(userId);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle save calculation
  const handleSaveCalculation = useCallback(async () => {
    // Not signed in: prompt sign-up/sign-in instead of silently "saving"
    if (!userId) {
      setShowAuthModal(true);
      return;
    }
    let inputs: Record<string, any>;
    switch (mode) {
      case CalculationMode.SIMPLE:
        inputs = simpleInputs;
        break;
      case CalculationMode.ANNUAL:
        inputs = annualInputs;
        break;
      case CalculationMode.TIMESHEET:
        inputs = timesheetInputs;
        break;
      default:
        inputs = simpleInputs;
    }

    const record = await saveCalculation(mode, currentProvince, inputs, results);
    if (record) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }, [userId, mode, currentProvince, simpleInputs, annualInputs, timesheetInputs, results, saveCalculation]);

  // Handle switch to timesheet from UserMenu
  const handleSwitchToTimesheet = useCallback(() => {
    setMode(CalculationMode.TIMESHEET);
    setCurrentPage('calculator');
  }, []);

  // Handle load calculation from history
  const handleLoadCalculation = useCallback((record: CalculationRecord) => {
    loadedFromRef.current = {
      gross: record.results?.grossPayAnnual ?? 0,
      province: record.province,
      savedAt: record.createdAt,
    };
    loadedModeRef.current = record.mode;
    setMode(record.mode);
    
    switch (record.mode) {
      case CalculationMode.SIMPLE:
        setSimpleInputs(record.inputs as SalaryInputs);
        break;
      case CalculationMode.ANNUAL:
        setAnnualInputs(record.inputs as AnnualSalaryInputs);
        break;
      case CalculationMode.TIMESHEET:
        setTimesheetInputs(record.inputs as TimesheetInputs);
        break;
    }
    
    setCurrentPage('calculator');
  }, []);

  // Donation URL
  const DONATION_URL = "https://www.buymeacoffee.com/canpay"; 

  return (
    <div className="min-h-screen bg-pearl font-sans">
      {/* Header */}
      <SiteHeader
        lang={lang === 'fr' || lang === 'zh' ? lang : 'en'}
        current="calculator"
        onHome={handleBackToHome}
        extra={
          <>
            {/* The switcher lived only on the home screen, so anyone who started calculating was stuck in
                whatever language the browser had guessed for them. It belongs wherever the reader is. */}
            <LanguageSwitcher />
            <UserMenu onSwitchToTimesheet={handleSwitchToTimesheet} onLoadCalculation={handleLoadCalculation} />
          </>
        }
      />
      {currentPage === 'calculator' && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mute transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> {t('nav.back')}
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-5 md:py-8" role="main" aria-label="Payroll Calculator">
          {/* Home Page - Mode Selection */}
          {currentPage === 'home' && (
            <div className="mx-auto w-full max-w-6xl">
              <section className="mx-auto max-w-xl pb-12 pt-6 md:pb-20 md:pt-14">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">{TAX_YEAR} · CRA T4032</p>
                  <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.015em] text-ink md:text-[3.75rem]">
                    {t('brand.tagline')}
                  </h1>
                  <p className="mt-5 max-w-md text-lg leading-8 text-ink-3">{t('home.subtitle')}</p>

                  <div className="mt-8 max-w-lg">
                    <ModeSelector onModeSelect={handleModeSelect} />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="https://apps.apple.com/app/canpayinsights/id6759822038"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-ink-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s1.79-.75 3.16-.64c1.35.1 2.47.69 3.18 1.8-2.88 1.45-2.38 5.13.58 6.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span>App Store</span>
                    </a>
                    <a
                      href={DONATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink no-underline transition-colors hover:border-ink-5"
                    >
                      <span aria-hidden="true">☕</span>
                      <span>Buy me a double-double</span>
                    </a>
                  </div>
                </div>

              </section>

              {/* Sister site — U.S. edition, honest same-team recommendation. It keeps its own brand colours. */}
              <div className="mb-4">
                <SisterSiteCard />
              </div>
            </div>
          )}

          {/* Calculator Page */}
          {currentPage === 'calculator' && (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Inputs */}
              <div className="w-full lg:w-5/12 xl:w-1/3">
                {mode === CalculationMode.SIMPLE && (
                  <InputSection inputs={simpleInputs} setInputs={setSimpleInputs} />
                )}
                
                {mode === CalculationMode.ANNUAL && (
                  <AnnualSalaryInput inputs={annualInputs} setInputs={setAnnualInputs} />
                )}
                
                {mode === CalculationMode.TIMESHEET && (
                  <TimesheetInput inputs={timesheetInputs} setInputs={setTimesheetInputs} />
                )}

                {/* Sign In Prompt in Calculator */}
                {!isAuthenticated && (
                  <div className="mt-6 rounded-2xl border border-line bg-white p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-pearl rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-ink mb-1">{t('auth.cardTitle')}</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {t('auth.cardDesc')}
                        </p>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          {t('auth.cardCta')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Status (if authenticated) */}
                {isAuthenticated && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('app.autoSaving')}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Results */}
              <div className="w-full lg:w-7/12 xl:w-2/3 space-y-6">
                {/* Save Calculation Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveCalculation}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      saveSuccess
                        ? 'border border-line bg-white text-ink'
                        : 'border border-line bg-white text-ink hover:border-ink-5'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('app.saved')}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {t('app.saveCalc')}
                      </>
                    )}
                  </button>
                </div>
                
                <ResultsSection results={results} provinceName={currentProvince} />
                
                {/* The RRSP referral, directly under the line that just said what an RRSP saves. */}
                
                <PartnerSlot
                
                  id="wealthsimple-invest"
                
                  track={{ mode, province: currentProvince, annualIncome: results.grossPayAnnual, lang }}
                
                />
                {/* Immediately under the figure: the reaction is the data, and
                    it evaporates the moment the reader scrolls on. */}
                {/* Above the ceilings, real paycheques jump mid-year when
                    CPP/EI max out — named month + exact size, engine-derived. */}
                <CapTimeline
                  annualIncome={results.grossPayAnnual}
                  province={currentProvince}
                  lang={lang}
                />
                <ExpectationPrompt
                  mode={mode}
                  province={currentProvince}
                  annualIncome={results.grossPayAnnual}
                  lang={lang}
                />
                {/* The neighbourhood: typed postal prefix or an on-device
                    rounded location, paid for with the CRA tax-roll placement
                    of this exact income in that exact area. */}
                <NeighbourhoodPrompt
                  mode={mode}
                  province={currentProvince}
                  annualIncome={results.grossPayAnnual}
                  lang={lang}
                />
                {/* iPhone only: the app, offered to the visitors who could
                    install it, at the moment they have a number worth keeping. */}
                <AppSlot
                  mode={mode}
                  province={currentProvince}
                  annualIncome={results.grossPayAnnual}
                  lang={lang}
                />
                <IndustryComparison
                  mode={mode}
                  province={currentProvince}
                  annualIncome={results.grossPayAnnual}
                  lang={lang}
                  employmentShape={deriveEmploymentShape(
                    mode,
                    buildWorkPattern(mode, simpleInputs, timesheetInputs),
                    buildBehaviour(mode, simpleInputs, annualInputs, timesheetInputs, results)
                  )}
                  hourlyWage={
                    mode === CalculationMode.SIMPLE
                      ? simpleInputs.hourlyWage
                      : mode === CalculationMode.TIMESHEET
                        ? timesheetInputs.hourlyWage
                        : null
                  }
                  hours={{
                    regular: results.regularHours,
                    ot15: results.overtimeHours15,
                    ot20: results.overtimeHours20,
                  }}
                />
                {/* Two REAL paid products, priced by the same engine as the
                    free result above. */}
                <FakeDoors
                  mode={mode}
                  province={currentProvince}
                  annualIncome={results.grossPayAnnual}
                  lang={lang}
                />
                {/* Share the calculator, get $3 off any report. Sits right
                    after the paid cards so the reward has something to buy. */}
                <ShareReward lang={lang} />
                {isAuthenticated && records.length > 0 && <PayCurve records={records} />}
                <GeminiAdvisor onReportOpen={() => setReportOpened(true)} results={results} inputs={currentInputs as SalaryInputs} />
              </div>
              
            </div>
          )}
      </main>

      {/* The shared footer is rendered by app/page.tsx, after the home page's reference sections. */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignInWithEmail={signInWithEmail}
        onSignInWithPassword={signInWithPassword}
        onSignUpWithPassword={signUpWithPassword}
        message="Sign in to save your calculation data and access it from any device. Your inputs will be automatically restored when you return."
      />
      
      {/* Global Loading Overlay */}
      <LoadingOverlay isLoading={isPageLoading} message="Loading..." />

    </div>
  );
};

export default App;
