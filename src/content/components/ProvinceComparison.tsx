'use client';
import React, { useState, useMemo } from 'react';
import { PROVINCIAL_DATA } from '../../../constants';
import { calculateFromAnnualSalary } from '../../../utils/taxEngine';
import { PayFrequency } from '../../../types';
import SEO from '../../../components/SEO';
import CompareMoveOffer from '../../../components/CompareMoveOffer';
import MoveIntentPrompt from '../../../components/MoveIntentPrompt';
import { recordCalcEvent } from '../../../lib/telemetry';
import { PageHero, Card, ButtonLink } from '@/components/site/ui';

// The page frame (SiteHeader, pearl background, SiteFooter) lives in app/compare-provinces/page.tsx.
const ProvinceComparison: React.FC = () => {
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
    // No salary, no table: 0 divided every effective rate into "NaN%" and the
    // summary claimed one province paid zero dollars more than another (2026-10-26).
    if (!isComparing || selectedProvinces.length < 2 || !(annualSalary > 0)) {
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
      // Relocation intent, measured directly: which provinces, at what income range.
      recordCalcEvent({ mode: 'annual', province: selectedProvinces[0], annualIncome: annualSalary, lang: 'en', comparedProvinces: selectedProvinces });
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
    <div>
      <SEO
        title="Compare Canadian Provincial Taxes 2025/2026 | CanPay Insights"
        description="Compare take-home pay across all Canadian provinces. See exactly how much more you'd earn with the same salary in Alberta, BC, Ontario, Quebec and more."
        keywords="province comparison, provincial tax Canada, Alberta vs Ontario tax, BC tax rate, Quebec tax, salary comparison"
        canonicalUrl="https://canpayinsights.ca/compare-provinces"
      />
      <PageHero
        title="Canadian Province Tax Comparison"
        lead={<>Compare take-home pay across all Canadian provinces. See exactly how much more (or less)
            you'd earn in different provinces with the same salary.</>}
      />

      {/* Controls */}
      <Card className="p-5 md:p-8">
          {/* Salary Input */}
          <div className="mb-7">
            <label htmlFor="compare-salary" className="mb-2 block text-sm font-semibold text-ink">
              Annual Salary
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-mute">$</span>
              <input
                id="compare-salary"
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-8 pr-4 text-lg font-semibold tabular-nums text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
                step="1000"
                min="0"
              />
            </div>
            <p className="mt-1.5 text-xs text-mute">
              Adjust to see how taxes change at different income levels
            </p>
          </div>

          {/* Province Selector */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-ink">
              Select Provinces to Compare (select at least 2, max 6)
            </label>
            <div className="flex flex-wrap gap-2">
              {provinces.map(({ code, name }) => {
                const on = selectedProvinces.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleProvince(code)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${
                      on
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-2 hover:border-ink-5 hover:text-ink'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-mute">
              Selected: {selectedProvinces.length} province{selectedProvinces.length !== 1 ? 's' : ''}
              {selectedProvinces.length > 0 && (
                <span className="ml-2">
                  ({selectedProvinces.map(code => provinces.find(p => p.code === code)?.name).join(', ')})
                </span>
              )}
            </p>
          </div>

          <div className="mt-7 flex flex-col items-start gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={handleStartComparison}
              disabled={selectedProvinces.length < 2}
              className={`rounded-xl px-6 py-3 text-base font-semibold transition-colors duration-150 ${
                selectedProvinces.length >= 2
                  ? 'btn-brand-3d text-white'
                  : 'cursor-not-allowed border border-line bg-pearl-soft text-mute'
              }`}
            >
              {selectedProvinces.length < 2
                ? `Select ${2 - selectedProvinces.length} More`
                : 'Start Comparison'
              }
            </button>
            {selectedProvinces.length >= 2 && (
              <span className="text-sm font-medium text-ink-3">
                Click to compare!
              </span>
            )}
          </div>
      </Card>

      {/* Results */}
      <div className="py-8">
        {!isComparing || comparisonData.length === 0 ? (
          <Card className="mb-8 px-6 py-10 md:px-10">
            <h3 className="font-display text-xl font-semibold text-ink">
              {selectedProvinces.length === 0
                ? 'Select Provinces Above'
                : selectedProvinces.length === 1
                ? 'Select 1 More Province'
                : 'Click Start Comparison Button Above'
              }
            </h3>
            <p className="mt-2 max-w-xl text-ink-3">
              {selectedProvinces.length < 2
                ? `You need to select at least ${2 - selectedProvinces.length} more province${selectedProvinces.length === 0 ? 's' : ''} to start comparing.`
                : 'Everything is ready! Click the red button above to see the comparison results.'
              }
            </p>
            <p className="mt-4 text-sm text-mute">
              Tip: Select 2-6 provinces to compare their tax differences
            </p>
            {selectedProvinces.length > 0 && (
              <p className="mt-4 text-sm text-ink-3">
                <span>Selected:</span>{' '}
                {selectedProvinces.map(code => (
                  <span key={code} className="font-semibold text-ink">
                    {provinces.find(p => p.code === code)?.name}
                  </span>
                )).reduce((prev, curr) => <>{prev}, {curr}</> as any)}
              </p>
            )}
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            {comparisonData.length > 1 && bestProvince && worstProvince && (
              <Card className="mb-6 p-6 md:p-8">
                <h2 className="mb-3 font-display text-2xl font-semibold text-ink">Key Insight</h2>
                <p className="max-w-3xl text-lg leading-8 text-ink-2">
                  With a <b className="tabular-nums text-ink">{formatCurrency(annualSalary)}</b> salary, you'd take home{' '}
                  <b className="tabular-nums text-red-600">{formatCurrency(difference)} more</b> per year in{' '}
                  <b className="text-ink">{bestProvince.provinceName}</b> compared to {worstProvince.provinceName}.
                </p>
              </Card>
            )}

            {/* Comparison Table */}
            <Card className="mb-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-line bg-pearl-soft text-[11px] uppercase tracking-[0.1em] text-mute">
                      <th scope="col" className="sticky left-0 z-10 bg-pearl-soft px-4 py-3 text-left font-semibold shadow-[1px_0_0_#E3E3EA]">Province</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Net Annual</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Net Monthly</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Federal Tax</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Provincial Tax</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">CPP</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">EI</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Effective Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {comparisonData.map((data, index) => (
                      <tr key={data.province}>
                        <td className="sticky left-0 z-10 bg-white px-4 py-3.5 shadow-[1px_0_0_#E3E3EA]">
                          <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap font-semibold text-ink">{data.provinceName}</span>
                            {index === 0 && (
                              <span className="rounded-full border border-red-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700">
                                Best
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-display text-base font-semibold text-red-600">
                          {formatCurrency(data.netAnnual)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-ink">
                          {formatCurrency(data.netMonthly)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-ink-2">
                          {formatCurrency(data.federalTax)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-ink-2">
                          {formatCurrency(data.provincialTax)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-ink-2">
                          {formatCurrency(data.cpp)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-ink-2">
                          {formatCurrency(data.ei)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-ink">
                          {data.effectiveRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {isComparing && selectedProvinces.length >= 2 && (
          <MoveIntentPrompt key={'m' + selectedProvinces.join('|')} provinces={selectedProvinces} annualSalary={annualSalary} />
        )}
        {isComparing && selectedProvinces.length >= 2 && (
          <CompareMoveOffer key={selectedProvinces.join('|')} provinces={selectedProvinces} annualSalary={annualSalary} />
        )}

        {/* Provincial Guides Links */}
        <Card className="mb-8 p-6 md:p-8">
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Related Provincial Guides</h2>
          <p className="mb-4 text-ink-3">
            Learn more about living and working in these provinces:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProvinces.map(code => {
              // One 2026 take-home guide per province (the 2025 salary guides were deleted).
              const slugMap: Record<string, string> = {
                'AB': 'alberta-take-home-pay-guide-2026',
                'BC': 'bc-take-home-pay-guide-2026',
                'ON': 'ontario-take-home-pay-guide-2026',
                'QC': 'quebec-take-home-pay-guide-2026',
                'NS': 'nova-scotia-take-home-pay-guide-2026',
                'NB': 'new-brunswick-take-home-pay-guide-2026',
                'PE': 'pei-take-home-pay-guide-2026',
                'NL': 'newfoundland-take-home-pay-guide-2026',
                'MB': 'manitoba-take-home-pay-guide-2026',
                'SK': 'saskatchewan-take-home-pay-guide-2026',
                'YT': 'yukon-take-home-pay-guide-2026',
                'NT': 'northwest-territories-take-home-pay-guide-2026',
                'NU': 'nunavut-take-home-pay-guide-2026',
              };
              // `code` is the full name (PROVINCIAL_DATA's key); the map is by 2-letter id.
              // Keying it by `code` left this section empty for every province.
              const slug = slugMap[PROVINCIAL_DATA[code]?.id ?? ''];
              if (!slug) return null;
              return (
                <a
                  key={code}
                  href={`/blog/${slug}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-red-700 no-underline transition-colors hover:border-red-300"
                >
                  {PROVINCIAL_DATA[code]?.name} Guide →
                </a>
              );
            })}
          </div>
        </Card>

        {/* Calculator CTA */}
        <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Get Your Personalized Calculation</h2>
            <p className="leading-7 text-ink-3">
              Use our detailed calculator to see your exact take-home pay, including overtime,
              shift premiums, and deductions specific to your situation.
            </p>
          </div>
          <ButtonLink href="/" className="shrink-0">
            Try the Full Calculator
          </ButtonLink>
        </Card>

        {/* SEO Content */}
        <Card className="mt-8 p-6 md:p-8">
          <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
            Understanding Provincial Tax Differences in Canada
          </h2>
          <div className="max-w-3xl leading-7 text-ink-2">
            <p className="mb-4">
              Canada's federal tax system applies uniformly across all provinces, but each province
              sets its own provincial income tax rates. This creates significant differences in
              take-home pay for the same salary. For example, Alberta taxes the first $61,200 at 8% and
              the next band at 10%, with fewer brackets than most provinces, while British Columbia's
              seven-bracket system starts lower at 5.60% but climbs faster.
            </p>
            <p className="mb-4">
              When considering a move between provinces, it's important to look beyond just income taxes.
              Cost of living, particularly housing prices, can have a much larger impact on your
              disposable income than tax differences. Use our <a href="/" className="font-medium text-red-700 underline decoration-red-200 underline-offset-4 hover:decoration-red-700">detailed calculator</a> to
              factor in all aspects of your financial situation.
            </p>
            <p>
              For comprehensive guides on living in each province, including housing costs, job markets,
              and lifestyle factors, explore our <a href="/blog" className="font-medium text-red-700 underline decoration-red-200 underline-offset-4 hover:decoration-red-700">provincial guides</a>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProvinceComparison;
