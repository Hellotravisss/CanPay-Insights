import type { SalaryBreakdown } from '../lib/salaryFigures';

interface SalaryBreakdownPanelProps {
  breakdown: SalaryBreakdown;
  locale?: 'en' | 'fr' | 'zh';
}

const formatMoney = (amount: number, locale: 'en' | 'fr' | 'zh') =>
  locale === 'fr'
    ? `${Math.round(amount).toLocaleString('fr-CA')} $`
    : `$${Math.round(amount).toLocaleString('en-CA')}`;

const formatPercent = (rate: number, locale: 'en' | 'fr' | 'zh') =>
  locale === 'fr'
    ? `${(rate * 100).toFixed(1).replace('.', ',')} %`
    : `${(rate * 100).toFixed(1)}%`;

const COPY = {
  en: {
    kicker: 'Estimated take-home pay',
    perYear: 'per year',
    monthly: 'Monthly',
    biWeekly: 'Bi-weekly',
    weekly: 'Weekly',
    summary: (gross: string, province: string, net: string, rate: string) =>
      `On a ${gross} salary in ${province}, you keep about ${net} after federal tax, provincial tax, CPP, and EI — an effective deduction rate of ${rate}.`,
    whereItGoes: 'Where the money goes',
    deduction: 'Deduction',
    amountCol: 'Amount per year',
    shareCol: '% of gross',
    grossSalary: 'Gross salary',
    federalTax: 'Federal income tax',
    provincialTax: (province: string) => `${province} provincial tax`,
    territorialTax: (province: string) => `${province} territorial tax`,
    pension: 'CPP contribution',
    pensionQc: 'QPP + QPIP contributions',
    ei: 'EI premium',
    eiQc: 'EI premium (Quebec rate)',
    totalDeductions: 'Total deductions',
    takeHome: 'Take-home pay',
    rates: (avg: string, marginal: string) =>
      `Average tax rate: ${avg} · Of your next $1,000 raise, about ${marginal} goes to taxes and deductions.`,
    paySchedule: 'What lands in your account',
    frequency: 'Pay frequency',
    netPay: 'Estimated net pay',
    annual: 'Annual',
    semiMonthly: 'Semi-monthly',
    hourlyNote: 'Hourly (40 hrs/week)',
    compareTitle: (gross: string) => `${gross} after tax across Canada`,
    compareIntro: (province: string) =>
      `The same salary keeps a different amount in each province. See how ${province} compares:`,
    provinceCol: 'Province',
    netAnnualCol: 'Net per year',
    netMonthlyCol: 'Net per month',
    current: 'This page',
    nearbyTitle: (province: string) => `Other salaries in ${province}`,
    salaryCol: 'Gross salary',
    netBiWeeklyCol: 'Net bi-weekly',
    assumptions:
      'Estimates use 2026 federal and provincial rates with the basic personal amount only. Benefits, RRSP contributions, union dues, and other credits will change your actual paycheque — run your own numbers in the free calculator.',
  },
  fr: {
    kicker: 'Paie nette estimée',
    perYear: 'par année',
    monthly: 'Par mois',
    biWeekly: 'Aux deux semaines',
    weekly: 'Par semaine',
    summary: (gross: string, province: string, net: string, rate: string) =>
      `Avec un salaire de ${gross} au ${province}, il vous reste environ ${net} après l'impôt fédéral, l'impôt provincial, la RRQ, le RQAP et l'assurance emploi — un taux de retenue effectif de ${rate}.`,
    whereItGoes: "Où va l'argent",
    deduction: 'Retenue',
    amountCol: 'Montant par année',
    shareCol: '% du brut',
    grossSalary: 'Salaire brut',
    federalTax: 'Impôt fédéral',
    provincialTax: () => 'Impôt du Québec',
    territorialTax: () => 'Impôt territorial',
    pension: 'Cotisation RPC',
    pensionQc: 'Cotisations RRQ + RQAP',
    ei: 'Assurance emploi',
    eiQc: 'Assurance emploi (taux Québec)',
    totalDeductions: 'Total des retenues',
    takeHome: 'Paie nette',
    rates: (avg: string, marginal: string) =>
      `Taux d'imposition moyen : ${avg} · Sur votre prochaine augmentation de 1 000 $, environ ${marginal} part en impôts et retenues.`,
    paySchedule: 'Ce qui arrive dans votre compte',
    frequency: 'Fréquence de paie',
    netPay: 'Paie nette estimée',
    annual: 'Annuelle',
    semiMonthly: 'Semi-mensuelle',
    hourlyNote: 'Horaire (40 h/semaine)',
    compareTitle: (gross: string) => `${gross} après impôt au Canada`,
    compareIntro: () =>
      'Le même salaire laisse un montant différent dans chaque province. Voici la comparaison :',
    provinceCol: 'Province',
    netAnnualCol: 'Net par année',
    netMonthlyCol: 'Net par mois',
    current: 'Cette page',
    nearbyTitle: () => 'Autres salaires au Québec',
    salaryCol: 'Salaire brut',
    netBiWeeklyCol: 'Net aux deux semaines',
    assumptions:
      "Les estimations utilisent les taux 2026 avec le montant personnel de base seulement. Les avantages sociaux, cotisations REER, frais syndicaux et autres crédits changeront votre paie réelle — vérifiez vos chiffres dans le calculateur gratuit.",
  },
  zh: {
    kicker: '预计到手工资',
    perYear: '每年',
    monthly: '每月',
    biWeekly: '每两周',
    weekly: '每周',
    summary: (gross: string, province: string, net: string, rate: string) =>
      `年薪 ${gross}（${province}），扣除联邦税、省税、CPP 和 EI 后，到手约 ${net} —— 实际扣除率约 ${rate}。`,
    whereItGoes: '钱都去哪了',
    deduction: '扣款项',
    amountCol: '每年金额',
    shareCol: '占税前 %',
    grossSalary: '税前年薪',
    federalTax: '联邦所得税',
    provincialTax: (province: string) => `${province} 省税`,
    territorialTax: (province: string) => `${province} 地区税`,
    pension: 'CPP 供款',
    pensionQc: 'QPP + QPIP 供款',
    ei: 'EI 保费',
    eiQc: 'EI 保费（魁省费率）',
    totalDeductions: '扣款合计',
    takeHome: '到手工资',
    rates: (avg: string, marginal: string) =>
      `平均税率：${avg} · 你下一笔 $1,000 加薪里，约 ${marginal} 进了税和扣款。`,
    paySchedule: '到账明细',
    frequency: '发薪频率',
    netPay: '预计净工资',
    annual: '每年',
    semiMonthly: '半月一次',
    hourlyNote: '时薪（每周 40 小时）',
    compareTitle: (gross: string) => `${gross} 在加拿大各省的税后对比`,
    compareIntro: (province: string) => `同样的薪水在各省到手不同。看看 ${province} 与其他省的对比：`,
    provinceCol: '省份',
    netAnnualCol: '每年净收入',
    netMonthlyCol: '每月净收入',
    current: '本页',
    nearbyTitle: (province: string) => `${province} 的其他薪资水平`,
    salaryCol: '税前年薪',
    netBiWeeklyCol: '每两周净收入',
    assumptions:
      '估算采用 2026 年联邦与各省税率，仅计基本个人免税额。福利、RRSP 供款、工会会费等会改变你的实际工资——用上方免费计算器算你的具体数字。',
  },
};

const TERRITORY_SLUGS = new Set(['yukon', 'northwest-territories', 'nunavut']);

export default function SalaryBreakdownPanel({ breakdown, locale = 'en' }: SalaryBreakdownPanelProps) {
  const t = COPY[locale];
  const { figures } = breakdown;
  const isQuebec = breakdown.provinceSlug === 'quebec';
  const money = (amount: number) => formatMoney(amount, locale);
  const percent = (rate: number) => formatPercent(rate, locale);

  const provincialTaxLabel = TERRITORY_SLUGS.has(breakdown.provinceSlug)
    ? t.territorialTax(breakdown.provinceShortName)
    : t.provincialTax(breakdown.provinceShortName);

  const deductionRows = [
    { label: t.federalTax, value: figures.federalTax },
    { label: provincialTaxLabel, value: figures.provincialTax },
    { label: isQuebec ? t.pensionQc : t.pension, value: figures.pensionContribution },
    { label: isQuebec ? t.eiQc : t.ei, value: figures.eiPremium },
  ];

  const scheduleRows = [
    { label: t.annual, value: figures.netAnnual },
    { label: t.monthly, value: figures.netMonthly },
    { label: t.semiMonthly, value: figures.netSemiMonthly },
    { label: t.biWeekly, value: figures.netBiWeekly },
    { label: t.weekly, value: figures.netWeekly },
    { label: t.hourlyNote, value: figures.netHourly },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-red-600">{t.kicker}</p>
        <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          {money(figures.netAnnual)}
          <span className="ml-2 text-base font-semibold text-slate-500">{t.perYear}</span>
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.monthly}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{money(figures.netMonthly)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.biWeekly}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{money(figures.netBiWeekly)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.weekly}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{money(figures.netWeekly)}</p>
          </div>
        </div>
        <p className="mt-5 leading-7 text-slate-600">
          {t.summary(
            money(figures.gross),
            locale === 'fr' ? 'Québec' : breakdown.provinceName,
            money(figures.netAnnual),
            percent(figures.totalDeductionRate)
          )}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{t.whereItGoes}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2.5 pr-4">{t.deduction}</th>
                <th className="py-2.5 pr-4 text-right">{t.amountCol}</th>
                <th className="py-2.5 text-right">{t.shareCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-slate-900">{t.grossSalary}</td>
                <td className="py-2.5 pr-4 text-right font-semibold text-slate-900">{money(figures.gross)}</td>
                <td className="py-2.5 text-right text-slate-500">{percent(1)}</td>
              </tr>
              {deductionRows.map((row) => (
                <tr key={row.label}>
                  <td className="py-2.5 pr-4 text-slate-600">{row.label}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-700">−{money(row.value)}</td>
                  <td className="py-2.5 text-right text-slate-500">{percent(row.value / figures.gross)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-slate-700">{t.totalDeductions}</td>
                <td className="py-2.5 pr-4 text-right font-semibold text-slate-700">−{money(figures.totalDeductions)}</td>
                <td className="py-2.5 text-right font-semibold text-slate-500">{percent(figures.totalDeductionRate)}</td>
              </tr>
              <tr className="bg-red-50/60">
                <td className="rounded-l-lg py-3 pl-2 pr-4 font-bold text-red-700">{t.takeHome}</td>
                <td className="py-3 pr-4 text-right font-bold text-red-700">{money(figures.netAnnual)}</td>
                <td className="rounded-r-lg py-3 pr-2 text-right font-bold text-red-700">
                  {percent(1 - figures.totalDeductionRate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          {t.rates(percent(figures.averageTaxRate), percent(figures.marginalRate))}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{t.paySchedule}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2.5 pr-4">{t.frequency}</th>
                <th className="py-2.5 text-right">{t.netPay}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduleRows.map((row) => (
                <tr key={row.label}>
                  <td className="py-2.5 pr-4 text-slate-600">{row.label}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-900">{money(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">{t.compareTitle(money(figures.gross))}</h2>
        <p className="mb-4 leading-7 text-slate-600">{t.compareIntro(breakdown.provinceShortName)}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2.5 pr-4">{t.provinceCol}</th>
                <th className="py-2.5 pr-4 text-right">{t.netAnnualCol}</th>
                <th className="py-2.5 text-right">{t.netMonthlyCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.provinceComparison.map((row) => {
                const isCurrent = row.slug === breakdown.provinceSlug;
                return (
                  <tr key={row.slug} className={isCurrent ? 'bg-red-50/60 font-semibold' : undefined}>
                    <td className="py-2.5 pr-4">
                      {isCurrent ? (
                        <span className="text-red-700">
                          {row.shortName}
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold">{t.current}</span>
                        </span>
                      ) : (
                        <a href={row.href} className="text-slate-700 no-underline hover:text-red-600 hover:underline">
                          {row.shortName}
                        </a>
                      )}
                    </td>
                    <td className={`py-2.5 pr-4 text-right ${isCurrent ? 'text-red-700' : 'text-slate-900'}`}>
                      {money(row.netAnnual)}
                    </td>
                    <td className={`py-2.5 text-right ${isCurrent ? 'text-red-700' : 'text-slate-600'}`}>
                      {money(row.netMonthly)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{t.nearbyTitle(breakdown.provinceShortName)}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2.5 pr-4">{t.salaryCol}</th>
                <th className="py-2.5 pr-4 text-right">{t.netAnnualCol}</th>
                <th className="py-2.5 pr-4 text-right">{t.netMonthlyCol}</th>
                <th className="py-2.5 text-right">{t.netBiWeeklyCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.nearbySalaries.map((row) => (
                <tr key={row.amount}>
                  <td className="py-2.5 pr-4">
                    <a href={row.href} className="font-semibold text-slate-800 no-underline hover:text-red-600 hover:underline">
                      {money(row.amount)}
                    </a>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-900">{money(row.netAnnual)}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-600">{money(row.netMonthly)}</td>
                  <td className="py-2.5 text-right text-slate-600">{money(row.netBiWeekly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">{t.assumptions}</p>
      </section>
    </div>
  );
}
