'use client';
import React from 'react';
import LegalChrome, { Section } from './LegalChrome';

/**
 * Refund policy for the two $9 reports. The stance is deliberately generous:
 * a refund costs nine dollars and a dispute costs far more in time, and a
 * policy a buyer can read in one minute is itself a reason to buy.
 */
const RefundPolicyPage: React.FC = () => {
  return (
    <LegalChrome
      title="Refund Policy"
      effective="Effective date: September 15, 2026"
      links={[
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
      ]}
      intro={
        <p>
          Everything on CanPay Insights is free except two digital reports — the Province Move Report and
          the Offer Comparison — sold for a one-time price in Canadian dollars through Stripe. This page says
          when we refund them, and how.
        </p>
      }
    >
      <Section n={1} id="when" title="When we refund">
        <p>We refund in full, no questions asked, if:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>the report failed to generate, or the link you were sent does not open;</li>
          <li>you were charged more than once for the same report;</li>
          <li>the report contains a calculation error that we confirm (we will also correct it).</li>
        </ul>
        <p>
          If you are unhappy for any other reason, write to us within <strong className="text-slate-800">14 days of purchase</strong>{' '}
          and tell us what went wrong. A report is generated from your own numbers and delivered instantly,
          so it cannot be “returned”, but in practice we refund these requests too — we would rather learn
          why the report fell short than keep nine dollars.
        </p>
      </Section>

      <Section n={2} id="how" title="How to ask">
        <p>
          Email <a href="mailto:info@canpayinsights.ca" className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700">info@canpayinsights.ca</a>{' '}
          from the address you used at checkout, or forward the Stripe receipt, and say which report and
          what happened. We answer within two business days.
        </p>
      </Section>

      <Section n={3} id="timing" title="How the money comes back">
        <p>
          Refunds are issued through Stripe to the original payment method. Stripe sends them immediately;
          card issuers usually show the credit within 5–10 business days. We cannot refund to a different
          card or by e-transfer.
        </p>
      </Section>

      <Section n={4} id="donations" title="Donations">
        <p>
          Voluntary donations made through Buy Me a Coffee are processed by that platform under its own
          terms and are not refundable through us. If you donated by mistake, contact us and we will help
          you reach the platform.
        </p>
      </Section>

      <Section n={5} id="rights" title="Your consumer rights">
        <p>
          Nothing here reduces the rights you have under the consumer protection law of your province,
          including the Business Practices and Consumer Protection Act (British Columbia) and the Consumer
          Protection Act (Quebec).
        </p>
      </Section>
    </LegalChrome>
  );
};

export default RefundPolicyPage;
