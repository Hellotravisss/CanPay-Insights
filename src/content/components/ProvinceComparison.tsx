import React, { useState, useMemo } from 'react';
import { PROVINCIAL_DATA } from '../../../constants';
import { calculateFromAnnualSalary } from '../../../utils/taxEngine';
import { PayFrequency } from '../../../types';
import SEO from '../../../components/SEO';

interface ProvinceComparisonProps {
  onBackToBlog: () => void;
}

const ProvinceComparison: React.FC<ProvinceComparisonProps> = ({ onBackToBlog }) => {
  const [annualSalary, setAnnualSalary] = useState<number>(75000);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const provinces = useMemo(() => {
    return Object.entries(PROVINCIAL_DATA).map(([code, data]) => ({
      code,
      name: data.name,
    }));
  }, []);

  const comparisonData = useMemo(() => {
    if (!isComparing || selectedProvinces.length < 2) {
      return [];
    }
    try {
      return selectedProvinces.map(provinceCode => {
        const result = calculateFromAnnualSalary({
          annualSalary,
          province: provinceCode,
          payFrequency: PayFrequency.BI_WEEKLY,
        });

        return {
          province: provinceCode,
          provinceName: PROVINCIAL_DATA[provinceCode]?.name || provinceCode,
          grossAnnual: annualSalary,
          netAnnual: result.netPayAnnual,
          netMonthly: result.netPayAnnual / 12,
          federalTax: result.federalTax * 26,
          provincialTax: result.provincialTax * 26,
          cpp: result.cppDeduction * 26,
          ei: result.eiDeduction * 26,
          totalDeductions: result.totalDeductionsAnnual,
          effectiveRate: ((result.totalDeductionsAnnual / annualSalary) * 100).toFixed(1),
        };
      }).sort((a, b) => b.netAnnual - a.netAnnual);
    } catch (error) {
      console.error('Error calculating comparison data:', error);
      return [];
    }
  }, [annualSalary, selectedProvinces, isComparing]);

  const toggleProvince = (provinceCode: string) => {
    if (selectedProvinces.includes(provinceCode)) {
      setSelectedProvinces(prev => prev.filter(p => p !== provinceCode));
      // 如果取消选择后省份少于2个，重置对比状态
      if (selectedProvinces.length <= 2) {
        setIsComparing(false);
      }
    } else if (selectedProvinces.length < 6) {
      setSelectedProvinces(prev => [...prev, provinceCode]);
    }
  };

  const handleStartComparison = () => {
    if (selectedProvinces.length >= 2) {
      setIsComparing(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const bestProvince = comparisonData[0];
  const worstProvince = comparisonData[comparisonData.length - 1];
  const difference = bestProvince && worstProvince ? bestProvince.netAnnual - worstProvince.netAnnual : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title="Compare Canadian Provincial Taxes 2025/2026 | CanPay Insights"
        description="Compare take-home pay across all Canadian provinces. See exactly how much more you'd earn with the same salary in Alberta, BC, Ontario, Quebec and more."
        keywords="province comparison, provincial tax Canada, Alberta vs Ontario tax, BC tax rate, Quebec tax, salary comparison"
        canonicalUrl="https://www.canpayinsights.ca/compare-provinces"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button 
            onClick={onBackToBlog}
            className="text-red-100 hover:text-white mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Articles
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Canadian Province Tax Comparison
          </h1>
          <p className="text-red-100 max-w-2xl">
            Compare take-home pay across all Canadian provinces. See exactly how much more (or less) 
            you'd earn in different provinces with the same salary.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Salary Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Annual Salary
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:outline-none font-bold"
                step="1000"
                min="0"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust to see how taxes change at different income levels
            </p>
          </div>

          {/* Province Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Select Provinces to Compare (select at least 2, max 6)
            </label>
            <div className="flex flex-wrap gap-2">
              {provinces.map(({ code, name }) => (
                <button
                  key={code}
                  onClick={() => toggleProvince(code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedProvinces.includes(code)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Selected: {selectedProvinces.length} province{selectedProvinces.length !== 1 ? 's' : ''}
              {selectedProvinces.length > 0 && (
                <span className="ml-2 text-slate-400">
                  ({selectedProvinces.map(code => provinces.find(p => p.code === code)?.name).join(', ')})
                </span>
              )}
            </p>
          </div>

          {/* Compare Button */}
          <div className="mt-6">
            <button
              onClick={handleStartComparison}
              disabled={selectedProvinces.length < 2}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                selectedProvinces.length >= 2
                  ? 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {selectedProvinces.length < 2 
                ? `Select at least ${2 - selectedProvinces.length} more province${selectedProvinces.length === 0 ? 's' : ''} to compare`
                : 'Start Comparison'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isComparing || comparisonData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-2">
              {selectedProvinces.length < 2 
                ? `Please select at least ${2 - selectedProvinces.length} more province${selectedProvinces.length === 0 ? 's' : ''} to compare.`
                : 'Click "Start Comparison" to see the results.'
              }
            </p>
            <p className="text-sm text-slate-400">
              Select 2-6 provinces to compare their tax differences
            </p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            {comparisonData.length > 1 && bestProvince && worstProvince && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Key Insight</h2>
                <p className="text-slate-600">
                  With a <b>{formatCurrency(annualSalary)}</b> salary, you'd take home{' '}
                  <b className="text-green-600">{formatCurrency(difference)} more</b> per year in{' '}
                  <b>{bestProvince.provinceName}</b> compared to {worstProvince.provinceName}.
                </p>
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Province</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Net Annual</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Net Monthly</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Federal Tax</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Provincial Tax</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">CPP</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">EI</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Effective Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((data, index) => (
                      <tr 
                        key={data.province} 
                        className={`border-b border-slate-100 ${index === 0 ? 'bg-green-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                Best
                              </span>
                            )}
                            <span className="font-semibold text-slate-800">{data.provinceName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatCurrency(data.netAnnual)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(data.netMonthly)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(data.federalTax)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(data.provincialTax)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(data.cpp)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(data.ei)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${parseFloat(data.effectiveRate) < 20 ? 'text-green-600' : parseFloat(data.effectiveRate) > 28 ? 'text-red-600' : 'text-slate-600'}`}>
                            {data.effectiveRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Provincial Guides Links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Related Provincial Guides</h2>
          <p className="text-slate-600 mb-4">
            Learn more about living and working in these provinces:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProvinces.map(code => {
              const slugMap: Record<string, string> = {
                'AB': 'alberta-salary-guide-2025',
                'BC': 'british-columbia-salary-guide-2025',
                'ON': 'ontario-toronto-ottawa-hamilton-salary-guide-2025',
                'QC': 'quebec-salary-guide-2025',
                'NS': 'atlantic-canada-salary-guide-2025',
                'NB': 'atlantic-canada-salary-guide-2025',
                'PE': 'atlantic-canada-salary-guide-2025',
                'NL': 'atlantic-canada-salary-guide-2025',
                'MB': 'prairies-salary-guide-2025',
                'SK': 'prairies-salary-guide-2025',
                'YT': 'northern-territories-salary-guide-2025',
                'NT': 'northern-territories-salary-guide-2025',
                'NU': 'northern-territories-salary-guide-2025',
              };
              const slug = slugMap[code];
              if (!slug) return null;
              return (
                <a
                  key={code}
                  href={`/blog/${slug}`}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  {PROVINCIAL_DATA[code]?.name} Guide →
                </a>
              );
            })}
          </div>
        </div>

        {/* Calculator CTA */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Get Your Personalized Calculation</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Use our detailed calculator to see your exact take-home pay, including overtime, 
            shift premiums, and deductions specific to your situation.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Try the Full Calculator
          </a>
        </div>

        {/* SEO Content */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Understanding Provincial Tax Differences in Canada
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="mb-4">
              Canada's federal tax system applies uniformly across all provinces, but each province 
              sets its own provincial income tax rates. This creates significant differences in 
              take-home pay for the same salary. For example, Alberta's flat 10% tax rate benefits 
              middle-to-high income earners, while British Columbia's progressive system with 7 tiers 
              offers advantages at lower income levels.
            </p>
            <p className="mb-4">
              When considering a move between provinces, it's important to look beyond just income taxes. 
              Cost of living, particularly housing prices, can have a much larger impact on your 
              disposable income than tax differences. Use our <a href="/" className="text-red-600 hover:underline">detailed calculator</a> to 
              factor in all aspects of your financial situation.
            </p>
            <p>
              For comprehensive guides on living in each province, including housing costs, job markets, 
              and lifestyle factors, explore our <a href="/blog" className="text-red-600 hover:underline">provincial guides</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinceComparison;
