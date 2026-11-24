import React from 'react';
import Icon from '@/components/Icon';
import SiteHeader from './site/SiteHeader';
import SiteFooter from './site/SiteFooter';
import { PageHero, Card } from './site/ui';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-pearl font-sans">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-3xl px-4" role="main">
        <PageHero
          title="Contact Us"
          lead={<>Questions, corrections, data requests, or press — we&apos;d love to hear from you.</>}
        />

        <article className="rounded-2xl border border-line bg-white p-6 md:p-12">
          <p className="mb-8 text-lg leading-8 text-ink-2">
            CanPay Insights is built and maintained by an independent developer in Vancouver, British Columbia.
            We read every message and aim to reply within a few business days.
          </p>

          <Card className="mb-12 bg-pearl-soft p-5 md:p-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Email</p>
            <a
              href="mailto:info@canpayinsights.ca"
              className="break-words font-display text-xl font-semibold text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:decoration-red-600 md:text-3xl"
            >
              info@canpayinsights.ca
            </a>
            <p className="mt-3 text-sm text-mute">Vancouver, British Columbia, Canada <Icon name="maple" size={14} /></p>
          </Card>

          <h2 className="mb-4 font-display text-2xl font-semibold leading-snug text-ink">What you can reach us about</h2>
          <ul className="mb-10 divide-y divide-line border-y border-line">
            <li className="py-3 leading-7 text-ink-2"><strong className="text-ink">Spotted an error?</strong> If a number looks off for your province or year, tell us — we&apos;ll check the engine and fix it.</li>
            <li className="py-3 leading-7 text-ink-2"><strong className="text-ink">Data &amp; media requests.</strong> Journalists and bloggers are welcome to cite our take-home pay, CPP/EI, and minimum-wage data; we&apos;re happy to pull a custom figure for any province.</li>
            <li className="py-3 leading-7 text-ink-2"><strong className="text-ink">Feature ideas.</strong> Want a new year, a new breakdown, or another language? Let us know.</li>
            <li className="py-3 leading-7 text-ink-2"><strong className="text-ink">General feedback.</strong> Good or bad, it helps make the tool better for everyone.</li>
          </ul>

          <p className="text-sm leading-6 text-mute">
            Please note that CanPay Insights provides general information only and cannot give personalized tax,
            legal, or financial advice. For decisions that matter, please consult a qualified accountant or the
            Canada Revenue Agency.
          </p>
        </article>
      </main>
      <SiteFooter lang="en" note="Calculations are estimates based on 2026 tax brackets and provincial employment standards." />
    </div>
  );
};

export default ContactPage;
