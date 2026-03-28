
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import InputSection from './components/InputSection';
import AnnualSalaryInput from './components/AnnualSalaryInput';
import TimesheetInput from './components/TimesheetInput';
import ModeSelector from './components/ModeSelector';
import ResultsSection from './components/ResultsSection';
import GeminiAdvisor from './components/GeminiAdvisor';
import PrivacyPolicy from './components/PrivacyPolicy';
import SEO from './components/SEO';
import BlogList from './src/content/components/BlogList';
import ArticleView from './src/content/components/ArticleView';
import UserMenu from './components/UserMenu';
import AuthModal from './components/AuthModal';
import { SalaryInputs, Province, CalculationMode, AnnualSalaryInputs, PayFrequency, TimesheetInputs } from './types';
import { calculateSalary, calculateFromAnnualSalary, calculateFromTimesheet } from './utils/taxEngine';
import { useAuth, type OAuthProvider } from './hooks/useAuth';
import { useUserSettings } from './hooks/useUserSettings';

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
  vacationPayRate: 0
};

// Default State - Annual Salary (Fixed at Bi-Weekly)
const DEFAULT_ANNUAL_INPUTS: AnnualSalaryInputs = {
  province: Province.ON,
  annualSalary: 100000,
  payFrequency: PayFrequency.BI_WEEKLY // Fixed for annual salary mode
};

// Default State - Timesheet
const DEFAULT_TIMESHEET_INPUTS: TimesheetInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  payFrequency: PayFrequency.WEEKLY,
  entries: []
};

type AppPage = 'home' | 'calculator' | 'privacy' | 'blog';

const App: React.FC = () => {
  // Auth
  const { user, isAuthenticated, signInWithOAuth } = useAuth();
  const userId = user?.id || null;

  // User settings persistence
  const { 
    settings, 
    isLoading: isSettingsLoading, 
    saveSettings, 
    saveLastMode 
  } = useUserSettings(userId);

  // Page states: 'home' = mode selection, 'calculator' = calculator, 'privacy' = privacy policy, 'blog' = blog
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Calculation mode state - restore from settings
  const [mode, setMode] = useState<CalculationMode>('simple');
  
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
      
      // Restore simple inputs
      if (settings.simple) {
        setSimpleInputs(settings.simple);
      }
      
      // Restore annual inputs
      if (settings.annual) {
        setAnnualInputs(settings.annual);
      }
      
      // Restore timesheet inputs
      if (settings.timesheet) {
        setTimesheetInputs(settings.timesheet);
      }
    }
  }, [isSettingsLoading, settings]);

  // Detect URL path for initial page (supports /privacy and /blog routes)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy' || path === '/privacy/') {
      setCurrentPage('privacy');
    } else if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      setCurrentPage('blog');
      setCurrentArticleSlug(slug);
    } else if (path === '/blog') {
      setCurrentPage('blog');
      setCurrentArticleSlug(null);
    }
  }, []);

  // Update browser URL when page state changes (no page refresh)
  useEffect(() => {
    if (currentPage === 'privacy') {
      if (window.location.pathname !== '/privacy') {
        window.history.pushState({}, '', '/privacy');
      }
    } else if (currentPage === 'blog') {
      if (currentArticleSlug) {
        window.history.pushState({}, '', `/blog/${currentArticleSlug}`);
      } else {
        window.history.pushState({}, '', '/blog');
      }
    } else if (currentPage === 'home') {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    }
    // calculator 页面保持当前路径或设为根路径
  }, [currentPage, currentArticleSlug]);
  
  // Save inputs when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'simple') {
        saveSettings('simple', simpleInputs);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [simpleInputs, mode, saveSettings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'annual') {
        saveSettings('annual', annualInputs);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [annualInputs, mode, saveSettings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'timesheet') {
        saveSettings('timesheet', timesheetInputs);
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
    setCurrentPage('home');
    setCurrentArticleSlug(null);
  }, []);

  // Go to privacy page
  const handleGoToPrivacy = useCallback(() => {
    setCurrentPage('privacy');
  }, []);

  // Go to blog
  const handleGoToBlog = useCallback(() => {
    setCurrentPage('blog');
    setCurrentArticleSlug(null);
  }, []);

  // Select article
  const handleSelectArticle = useCallback((slug: string) => {
    setCurrentArticleSlug(slug);
    window.scrollTo(0, 0);
  }, []);

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

  // Donation URL
  const DONATION_URL = "https://www.buymeacoffee.com/canpay"; 
 
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* SEO Component */}
      <SEO />
      
      {/* Header */}
      {(currentPage === 'calculator' || currentPage === 'blog') && (
        <header className="bg-white border-b border-red-100 sticky top-0 z-30 shadow-sm" role="banner">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
              onClick={handleBackToHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-red-600 shadow-red-200 shadow-lg">
                <img src="/logo.png" alt="CanPay" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">CanPay <span className="text-red-600 font-light">Insights</span></h1>
            </button>
            
            <div className="flex items-center gap-2">
              {/* User Menu / Sign In */}
              <UserMenu />

              {currentPage === 'calculator' && (
                <button 
                  onClick={handleGoToBlog}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium mr-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                  </svg>
                  Tax Guides
                </button>
              )}
              <button 
                onClick={handleBackToHome}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      {currentPage === 'blog' ? (
        currentArticleSlug ? (
          <ArticleView 
            slug={currentArticleSlug} 
            onBack={() => setCurrentArticleSlug(null)} 
          />
        ) : (
          <BlogList onSelectArticle={handleSelectArticle} />
        )
      ) : currentPage !== 'privacy' && (
        <main className="max-w-6xl mx-auto px-4 py-8" role="main" aria-label="Payroll Calculator">
          {/* Home Page - Mode Selection */}
          {currentPage === 'home' && (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
              {/* Logo Section */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-red-600 shadow-red-200 shadow-xl flex items-center justify-center">
                  <img src="/logo.png" alt="CanPay Insights" className="w-20 h-20 object-contain" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                  CanPay <span className="text-red-600 font-light">Insights</span>
                </h1>
                <p className="text-slate-500 text-lg">Canadian Payroll Calculator & Tax Guides</p>
              </div>

              <div className="w-full max-w-4xl">
                <ModeSelector onModeSelect={handleModeSelect} />
              </div>

              {/* Sign In Prompt (if not authenticated) */}
              {!isAuthenticated && (
                <div className="mt-8">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-slate-500">Want to save your data?</p>
                      <p className="font-bold text-slate-800">Sign in for free →</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Blog CTA */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Learn More</p>
                    <button 
                      onClick={handleGoToBlog}
                      className="font-bold text-slate-800 hover:text-red-600 transition-colors"
                    >
                      Browse Tax Guides →
                    </button>
                  </div>
                </div>
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
                  <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">Save your calculation</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          Sign in to save your inputs and access them from any device.
                        </p>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Sign in for free →
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
              <div className="w-full lg:w-7/12 xl:w-2/3">
                <ResultsSection results={results} provinceName={currentProvince} />
                <GeminiAdvisor results={results} inputs={currentInputs as SalaryInputs} />
              </div>
              
            </div>
          )}
        </main>
      )}

      {/* Privacy Policy Page */}
      {currentPage === 'privacy' && (
        <PrivacyPolicy onBackToHome={handleBackToHome} />
      )}

      {/* Footer - Only show on home and calculator pages */}
      {currentPage !== 'privacy' && currentPage !== 'blog' && (
        <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
          <p>Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards.</p>
          
          <div className="flex justify-center items-center gap-4">
            <a 
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FFDD00] text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#FFEA00] hover:shadow-lg transition-all transform hover:-translate-y-1 group decoration-none"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform duration-300">☕</span>
              <span>Buy me a double-double</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center items-center gap-6 mt-4">
            <button 
              onClick={handleGoToBlog}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              财务指南
            </button>
            <button 
              onClick={handleGoToPrivacy}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              Privacy Policy
            </button>
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
        message="Sign in to save your calculation data and access it from any device. Your inputs will be automatically restored when you return."
      />
      
      {/* Vercel Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
