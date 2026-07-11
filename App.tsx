'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import InputSection from './components/InputSection';
import AnnualSalaryInput from './components/AnnualSalaryInput';
import TimesheetInput from './components/TimesheetInput';
import ModeSelector from './components/ModeSelector';
import { LanguageSwitcher, useT } from './lib/i18n';
import ResultsSection from './components/ResultsSection';
import GeminiAdvisor from './components/GeminiAdvisor';
import UserMenu from './components/UserMenu';
import AuthModal from './components/AuthModal';
import LoadingOverlay from './components/LoadingOverlay';
import { SalaryInputs, Province, CalculationMode, AnnualSalaryInputs, PayFrequency, TimesheetInputs, CalculationResult } from './types';
import { calculateSalary, calculateFromAnnualSalary, calculateFromTimesheet } from './utils/taxEngine';
import { useAuth, type OAuthProvider } from './hooks/useAuth';
import { useUserSettings } from './hooks/useUserSettings';
import { useCalculationHistory, type CalculationRecord } from './hooks/useCalculationHistory';

// Default State - 简易估算（时薪）
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
  },
};

// Default State - Annual Salary (Fixed at Bi-Weekly)
const DEFAULT_ANNUAL_INPUTS: AnnualSalaryInputs = {
  province: Province.ON,
  annualSalary: 100000,
  payFrequency: PayFrequency.BI_WEEKLY,
  additionalIncome: { statHolidayPay: 0, sickPay: 0, bonus: 0, otherIncome: 0, taxableBenefits: 0 },
  deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0 },
};

// Default State - Timesheet
const DEFAULT_TIMESHEET_INPUTS: TimesheetInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  payFrequency: PayFrequency.WEEKLY,
  entries: [],
  deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0 },
};

type AppPage = 'home' | 'calculator';

const App: React.FC = () => {
  const router = useRouter();

  // Auth
  const { user, isAuthenticated, signInWithOAuth, signInWithEmail, signInWithPassword, signUpWithPassword } = useAuth();
  const { t } = useT();
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

  // Calculation History
  const { saveCalculation } = useCalculationHistory(userId);
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      {currentPage === 'calculator' && (
        <header className="bg-white border-b border-red-100 sticky top-0 z-30 shadow-sm" role="banner">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
              onClick={handleBackToHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="CanPay" className="w-10 h-10 rounded-lg object-contain shadow-lg" />
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">CanPay <span className="text-red-600 font-light">Insights</span></h1>
            </button>
            
            <div className="flex items-center gap-2">
              {/* User Menu / Sign In */}
              <UserMenu 
                onSwitchToTimesheet={handleSwitchToTimesheet}
                onLoadCalculation={handleLoadCalculation}
              />

              {currentPage === 'calculator' && (
                <button 
                  onClick={handleGoToBlog}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium mr-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                  </svg>
                  {t('nav.taxGuides')}
                </button>
              )}
              <button 
                onClick={handleBackToHome}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('nav.back')}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-5 md:py-8" role="main" aria-label="Payroll Calculator">
          {/* Home Page - Mode Selection */}
          {currentPage === 'home' && (
            <div className="mx-auto flex min-h-[82vh] w-full max-w-6xl flex-col">
              <div className="flex items-center justify-between gap-2 py-4">
                <LanguageSwitcher />
                <nav className="flex flex-wrap items-center gap-2" aria-label="Home navigation">
                  <a
                    href="/blog"
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 no-underline shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
                  >
                    {t('nav.taxGuides')}
                  </a>
                  <a
                    href="/compare-provinces"
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 no-underline shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
                  >
                    {t('nav.compare')}
                  </a>
                </nav>
              </div>

              <section className="flex flex-1 items-center justify-center py-4 md:py-8">
                <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-5 text-center shadow-xl shadow-slate-200/80 sm:p-7 md:max-w-5xl md:p-8 lg:p-10">
                  <div className="grid gap-7 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-10">
                    <div className="flex flex-col items-center md:items-start md:text-left">
                      <img src="/logo.png" alt="" aria-hidden="true" className="h-16 w-16 rounded-2xl object-contain shadow-lg shadow-red-100 sm:h-20 sm:w-20 md:h-24 md:w-24" />
                      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                        CanPay <span className="text-red-600">Insights</span>
                      </h1>
                      <p className="mt-2 text-base font-semibold text-slate-500 md:text-lg">
                        {t('brand.tagline')}
                      </p>
                      <p className="mt-5 hidden max-w-sm text-base font-medium leading-7 text-slate-500 md:block">
                        {t('home.subtitle')}
                      </p>
                    </div>

                    <div className="md:rounded-3xl md:border md:border-slate-100 md:bg-slate-50 md:p-4">
                      <ModeSelector onModeSelect={handleModeSelect} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2 md:ml-auto md:max-w-[34rem]">
                    <a
                      href={DONATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#FFDD00] px-4 py-2.5 text-sm font-bold text-slate-900 no-underline shadow-sm transition-all hover:bg-[#FFEA00] hover:shadow-md"
                    >
                      <span className="text-lg" aria-hidden="true">☕</span>
                      <span>Buy me a double-double</span>
                    </a>
                    <a
                      href="https://apps.apple.com/app/canpayinsights/id6759822038"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white no-underline shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s1.79-.75 3.16-.64c1.35.1 2.47.69 3.18 1.8-2.88 1.45-2.38 5.13.58 6.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span>App Store</span>
                    </a>
                  </div>
                </div>
              </section>
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
                  <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">{t('auth.cardTitle')}</h3>
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
                    <span>Auto-saving to cloud</span>
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
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Calculation
                      </>
                    )}
                  </button>
                </div>
                
                <ResultsSection results={results} provinceName={currentProvince} />
                <GeminiAdvisor results={results} inputs={currentInputs as SalaryInputs} />
              </div>
              
            </div>
          )}
      </main>

      {/* Footer */}
      {currentPage === 'home' && (
        <footer className="pb-8 text-center text-xs text-slate-400" role="contentinfo">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>© CanPay Insights</span>
            <a href="/about" className="text-slate-400 no-underline transition-colors hover:text-red-600">
              About
            </a>
            <a href="/contact" className="text-slate-400 no-underline transition-colors hover:text-red-600">
              Contact
            </a>
            <a href="/privacy" className="text-slate-400 no-underline transition-colors hover:text-red-600">
              Privacy
            </a>
            <a href="/affiliate-disclosure" className="text-slate-400 no-underline transition-colors hover:text-red-600">
              Disclosure
            </a>
            <a href="/link-to-canpay" className="text-slate-400 no-underline transition-colors hover:text-red-600">
              Link to Us
            </a>
          </div>
        </footer>
      )}

      {currentPage === 'calculator' && (
        <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
          <p>Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards.</p>
          
          {/* Buy Me a Coffee + App Store */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <a 
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FFDD00] text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#FFEA00] hover:shadow-lg transition-all transform hover:-translate-y-1 group decoration-none"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform duration-300">☕</span>
              <span>Buy me a double-double</span>
            </a>
            <a
              href="https://apps.apple.com/app/canpayinsights/id6759822038"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:bg-slate-800 hover:shadow-lg transition-all transform hover:-translate-y-1 decoration-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s1.79-.75 3.16-.64c1.35.1 2.47.69 3.18 1.8-2.88 1.45-2.38 5.13.58 6.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Download on App Store</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-4">
            <a
              href="/blog"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Insights Hub
            </a>
            <a
              href="/compare-provinces"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Compare Provinces
            </a>
            <a
              href="/about"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Contact
            </a>
            <a
              href="/privacy"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/affiliate-disclosure"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Affiliate Disclosure
            </a>
            <a
              href="/link-to-canpay"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Link to Us
            </a>
          </div>
          
          <div className="mt-2 flex justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
            <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
            <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
          </div>
          
          <p className="mt-4 opacity-75">Proudly Canadian 🇨🇦 Built for Workers.</p>
        </footer>
      )}

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
