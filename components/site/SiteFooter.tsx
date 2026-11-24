import AvowdCredit from '../AvowdCredit';
import { Wordmark } from './SiteHeader';

/**
 * The one footer (2026-11). Keeps every link the calculator footer had: the calculator links are there because
 * Google only found /bc-paycheck-calculator, /cpp-ei-calculator and /timesheet-tracker once the most-crawled page
 * linked them (URL Inspection, 2026-09-15). Do not trim them for looks.
 */
const SITE = [
  ['/about', 'About'], ['/contact', 'Contact'], ['/blog', 'Guides & news'], ['/data', 'Open data'],
  ['/research/pay-calculator-behaviour', 'Research'], ['/wages', 'Wages by industry'], ['/widget', 'Embed this calculator'],
  ['/link-to-canpay', 'Link to us'], ['/changelog', 'Changelog'],
];
const LEGAL = [
  ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/refunds', 'Refunds'], ['/affiliate-disclosure', 'Disclosure'],
];
const CALCS = [
  ['/ontario-paycheck-calculator', 'Ontario'], ['/bc-paycheck-calculator', 'BC'], ['/alberta-paycheck-calculator', 'Alberta'],
  ['/quebec-paycheck-calculator', 'Quebec'], ['/compare-provinces', 'All provinces'],
  ['/hourly-wage-calculator', 'Hourly wage'], ['/salary-calculator', 'Salary'], ['/cpp-ei-calculator', 'CPP & EI'],
  ['/timesheet-tracker', 'Timesheet'], ['/salary-after-tax-canada', 'Salary after tax'],
  ['/payroll-calculator', 'For employers'], ['/salary-to-hourly-calculator', 'Salary to hourly'],
];

function Col({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{title}</p>
      <ul className="space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <a href={href} className="text-sm text-ink-2 no-underline transition-colors hover:text-red-600">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({ lang = 'en', note }: { lang?: 'en' | 'fr' | 'zh'; note?: string }) {
  return (
    <footer className="mt-16 border-t border-line bg-white" role="contentinfo">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <a href={lang === 'en' ? '/' : `/${lang}`} className="inline-flex items-center gap-2.5 no-underline">
            <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-[9px]" />
            <Wordmark size="sm" />
          </a>
          <p className="mt-4 max-w-xs text-sm leading-6 text-mute">
            {note ?? 'Free Canadian take-home pay calculator. 2026 rates, checked line by line against the CRA payroll tables.'}
          </p>
          <p className="mt-4 text-sm text-mute">© CanPay Insights · <AvowdCredit lang={lang} /></p>
        </div>
        <Col title="Calculators" links={CALCS} />
        <Col title="CanPay Insights" links={SITE} />
        <Col title="Legal" links={LEGAL} />
      </div>
    </footer>
  );
}
