import React from 'react';
import SiteHeader from './site/SiteHeader';
import SiteFooter from './site/SiteFooter';
import { PageHero } from './site/ui';

const H2 = 'mb-4 mt-12 border-t border-line pt-8 font-display text-2xl font-semibold leading-snug text-ink';

const AffiliateDisclosurePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-pearl font-sans">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-3xl px-4" role="main">
        <PageHero title={<>Affiliate &amp; Referral Disclosure</>} lead="How CanPay Insights stays free, and what we earn." />

        <article className="rounded-2xl border border-line bg-white p-6 leading-7 text-ink-2 md:p-12">
          <p className="mb-6 text-lg leading-8">
            CanPay Insights is free to use. To help cover its costs, we sometimes include referral links to
            services we think are genuinely useful for Canadians — currently Wealthsimple&apos;s invite program.
          </p>

          <p>
            When you click one of these clearly labelled links and then open an account, CanPay Insights may
            receive a sign-up bonus or referral fee, <strong className="text-ink">at no additional cost to you</strong>. We mark these
            links as a &quot;paid referral link&quot; right where they appear, so you always know.
          </p>

          <h2 className={H2}>It never affects our numbers</h2>
          <p>
            Referral compensation never influences our calculator, our tax figures, our rankings, or what we
            recommend. The numbers come from a transparent calculation engine built on published Canada Revenue
            Agency, Revenu Québec, and provincial rates — not from anyone who pays us. If we mention a tool, it is
            because we believe it is a reasonable option, not because of a referral.
          </p>

          <h2 className={H2}>Disclosure standards</h2>
          <p className="mb-6">
            We disclose these material connections in line with the U.S. FTC Endorsement Guides (16 CFR Part 255)
            and Canada&apos;s Competition Act and Ad Standards influencer-disclosure guidelines. The calculator is,
            and remains, free.
          </p>

          <p>
            Questions about this disclosure? Email us at{" "}
            <a href="mailto:info@canpayinsights.ca" className="font-medium text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:decoration-red-600">info@canpayinsights.ca</a>.
          </p>
        </article>
      </main>
      <SiteFooter lang="en" note="Calculations are estimates based on 2026 tax brackets and provincial employment standards." />
    </div>
  );
};

export default AffiliateDisclosurePage;
