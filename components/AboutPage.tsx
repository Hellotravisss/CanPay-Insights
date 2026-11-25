import React from 'react';
import SiteHeader from './site/SiteHeader';
import SiteFooter from './site/SiteFooter';
import { PageHero } from './site/ui';
import { Section } from './LegalChrome';
import AboutTopics from './AboutTopics';

const LINK = 'font-medium text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:decoration-red-600';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-pearl font-sans">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-3xl px-4" role="main">
        <PageHero title="About CanPay Insights" lead="A free, independent Canadian take-home pay calculator." />
        <article className="rounded-2xl border border-line bg-white p-6 md:p-12">
            <p className="mb-10 text-lg leading-8 text-ink-2">
              CanPay Insights is a free payroll and take-home pay calculator built for people who work in Canada.
              Enter an hourly wage, annual salary, or timesheet and instantly see what you actually keep after
              federal tax, provincial tax, CPP/CPP2, and EI — for any province or territory, in ten languages. No signup is needed. The calculation runs on
              your device and the exact amounts you type are never sent to us (unless you buy a report, which is built from them); we record anonymous
              statistics about each calculation (income as a range, never the figure), which you can switch
              off. What is recorded, and how to stop it, is set out in our{" "}
              <a href="/privacy" className={LINK}>privacy policy</a>.
            </p>

            <Section n={1} title="Why we built it">
                <p>
                  Most Canadians find out their real take-home pay only after their first paycheque — when a chunk
                  of their gross salary has already disappeared into deductions. Comparing two job offers, two
                  provinces, or the impact of a raise should not require a spreadsheet or a meeting with an
                  accountant. We built CanPay Insights so anyone can get an accurate, transparent answer in seconds,
                  for free.
                </p>
              </Section>

            <Section n={2} title="How our numbers are calculated">
                <p>
                  Every result comes from a transparent calculation engine that applies the current rules, not a
                  rough estimate. For the 2026 tax year, our engine accounts for:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Federal income tax</strong> — including the 2026 cut to the lowest bracket (15% → 14%) and the basic personal amount.</li>
                  <li><strong>Provincial &amp; territorial income tax</strong> — each province&apos;s own brackets and basic personal amount, plus Quebec&apos;s separate system.</li>
                  <li><strong>CPP and CPP2</strong> — 5.95% up to the YMPE (~$74,600), plus the second additional CPP2 (4%) up to the YAMPE (~$85,000).</li>
                  <li><strong>QPP, QPIP and the Quebec EI rate</strong> for workers in Quebec.</li>
                  <li><strong>Employment Insurance (EI)</strong> premiums and the annual maximum.</li>
                </ul>
                <p>
                  Our figures are based on published rates from the Canada Revenue Agency (CRA), Revenu Québec, and
                  each provincial government. We update the engine when new rates are announced.
                </p>
              </Section>

            <Section n={3} title="Who builds it">
                <p>
                  CanPay Insights is built and maintained by <strong>Travis Zhang</strong> (Qi Zhang), an
                  independent developer based in Vancouver, British Columbia, who wrote the open rules engine
                  behind the calculator. It is a small, self-funded project — not a bank, payroll company, or
                  financial institution. That independence is the point: the tool exists to give workers a
                  straight answer. The calculator stays free. We sell one optional paid report (a province-move report, $9); the job-offer
                  comparison is free. Both use the same engine as the calculator. We
                  sometimes include a clearly labelled referral link (such as Wealthsimple) and may earn a
                  sign-up bonus, but it never affects our numbers or what we recommend — see our{" "}
                  <a href="/affiliate-disclosure" className={LINK}>affiliate disclosure</a>. Connect on{" "}
                  <a href="https://www.linkedin.com/in/travis-z" target="_blank" rel="noopener noreferrer me" className={LINK}>LinkedIn</a>.
                </p>
              </Section>

            <Section n={4} title="Featured in">
                <p>
                  <strong>Financial Independence Hub</strong>, November 16, 2026:{" "}
                  <a href="https://findependencehub.com/what-8000-paycheque-checks-reveal-about-how-canadians-think-about-money/" target="_blank" rel="noopener noreferrer" className={LINK}>What 8,000 paycheque checks reveal about how Canadians think about money</a>, a guest article by Travis Zhang.
                </p>
              </Section>

            <Section n={5} title="Open data — free to cite">
                <p>
                  Our 2026 take-home pay figures — net pay, federal and provincial tax, CPP/CPP2, EI and Quebec
                  QPP/QPIP for every province and territory across $30k–$200k — are published as an open dataset
                  under a{" "}
                  <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY 4.0</a>{" "}
                  licence. Free to use, republish, or cite — please attribute and link to canpayinsights.ca.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/data/canpay-take-home-2026.csv" download className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink no-underline transition-colors hover:border-ink-5">Download CSV</a>
                  <a href="/data/canpay-take-home-2026.json" download className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink no-underline transition-colors hover:border-ink-5">Download JSON</a>
                </div>
              </Section>

            <Section n={6} title="A note on accuracy">
                <p>
                  CanPay Insights provides estimates for general information only and is not tax, legal, or financial
                  advice. Real paycheques can differ because of benefits, additional credits, union dues, pension
                  adjustments, or employer-specific deductions. For decisions that matter, confirm with a qualified
                  accountant or the CRA. Questions, corrections, or data requests are always welcome — see our{" "}
                  <a href="/contact" className={LINK}>Contact page</a>.
                </p>
              </Section>
        </article>
        <div className="pb-12"><AboutTopics /></div>
      </main>
      <SiteFooter lang="en" note="Calculations are estimates based on 2026 tax brackets and provincial employment standards." />
    </div>
  );
};

export default AboutPage;
