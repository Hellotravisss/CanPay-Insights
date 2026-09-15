'use client';
import React from 'react';
import LegalChrome, { Section } from './LegalChrome';

/**
 * Terms of service. Short on purpose: a free calculator with two $9 reports
 * needs the reader to understand four things — it is an estimate, accounts
 * are optional, what the paid reports are, and what they may not do with the
 * site — not forty screens of boilerplate they will not read.
 */
const TermsPage: React.FC = () => {
  return (
    <LegalChrome
      title="Terms of Service"
      effective="Effective date: September 15, 2026"
      links={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/refunds', label: 'Refund Policy' },
        { href: '/affiliate-disclosure', label: 'Affiliate Disclosure' },
      ]}
      intro={
        <p>
          These terms govern your use of canpayinsights.ca, the CanPay Insights iPhone app, the embeddable
          calculator widget and the paid reports (together, the “Service”), operated by Qi (Travis) Zhang,
          doing business as Avowd, Vancouver, British Columbia (“we”). By using the Service you agree to them.
          If you do not, please do not use the Service.
        </p>
      }
    >
      <Section n={1} id="estimates" title="Estimates, not advice">
        <p>
          The calculators apply the Canada Revenue Agency’s payroll deduction formulas and published
          provincial rules to the numbers you enter. The results are{' '}
          <strong className="text-slate-800">estimates for information only</strong>. They are not tax, legal, accounting or
          financial advice, they do not account for every credit, deduction or employer practice, and your
          actual pay is determined by your employer and the CRA. Check important decisions against your pay
          statement, your employer’s payroll department or a licensed professional.
        </p>
        <p>
          Articles on this site describe rules as of the date shown on each article. Tax rules change; an
          article can be out of date even when the calculator is current.
        </p>
      </Section>

      <Section n={2} id="accounts" title="Accounts">
        <p>
          An account is optional. If you create one, keep your sign-in credentials with the provider you
          chose (Google or Apple) secure, and tell us if you believe your account has been used without
          permission. You may delete your account at any time from the account menu; deletion is immediate
          and permanent. We may suspend an account that is used to abuse the Service.
        </p>
      </Section>

      <Section n={3} id="reports" title="Paid reports">
        <p>
          We sell two digital reports (currently the Province Move Report and the Offer Comparison), each
          priced in Canadian dollars at the price shown at checkout, plus any applicable tax. Payment is
          processed by Stripe. The report is generated from the numbers you provide and delivered
          immediately on a page whose link is emailed to you; it is for your personal use. Our{' '}
          <a href="/refunds">Refund Policy</a> sets out when and how we refund a purchase. Prices and product
          contents may change; a change does not affect a purchase already made.
        </p>
      </Section>

      <Section n={4} id="use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>scrape, crawl or bulk-download the Service other than through the open datasets we publish for that purpose, or use automated traffic in a way that burdens it;</li>
          <li>attempt to identify any person from the anonymous statistics we publish or license;</li>
          <li>interfere with the Service’s security, availability or other users’ use of it;</li>
          <li>present the Service or its results as your own product, or as official government information;</li>
          <li>embed the widget in a way that misrepresents the results or removes the attribution it carries.</li>
        </ul>
        <p>
          The embeddable widget may be used on any website under the conditions on the{' '}
          <a href="/link-to-canpay">link-to-CanPay page</a>; we may withdraw it from a site that breaches these terms.
        </p>
      </Section>

      <Section n={5} id="content" title="Content and intellectual property">
        <p>
          The Service, its articles, design and code are ours or licensed to us. You may read, link to and
          quote short excerpts of our content with attribution. The datasets we publish under an open
          licence (marked CC BY 4.0 on the <a href="/data">data page</a>) may be reused under that licence.
          The CanPay Insights name and logo may not be used to suggest endorsement. The tax engine’s
          methodology is described openly so that its results can be checked; that description is not a
          licence to copy the Service.
        </p>
      </Section>

      <Section n={6} id="privacy" title="Privacy and data">
        <p>
          How we handle information — including the anonymous usage statistics, the optional neighbourhood
          data and the aggregated statistics we publish and license — is set out in the{' '}
          <a href="/privacy">Privacy Policy</a>, which forms part of these terms.
        </p>
      </Section>

      <Section n={7} id="third" title="Third-party links and referrals">
        <p>
          The Service links to other websites and, in places, to partners who may pay us a referral fee if
          you sign up with them. Those links are marked, and the <a href="/affiliate-disclosure">Affiliate Disclosure</a>{' '}
          explains the arrangement. We are not responsible for other sites’ content or terms.
        </p>
      </Section>

      <Section n={8} id="liability" title="Warranties and liability">
        <p>
          The Service is provided “as is”. To the fullest extent permitted by law, we make no warranty that
          it is error-free or uninterrupted, and we are not liable for any loss arising from reliance on a
          calculation, article or report, or from the unavailability of the Service. Where liability cannot
          be excluded, it is limited to the amount you paid us in the twelve months before the claim.
        </p>
        <p>
          Nothing in these terms limits rights you have as a consumer under the law of your province,
          including the Business Practices and Consumer Protection Act (British Columbia) and the Consumer
          Protection Act (Quebec).
        </p>
      </Section>

      <Section n={9} id="law" title="Governing law and changes">
        <p>
          These terms are governed by the laws of British Columbia and the federal laws of Canada that apply
          there. Disputes go to the courts of British Columbia, except that a consumer may bring a claim in
          the courts of their own province where the law gives them that right.
        </p>
        <p>
          We may update these terms; the effective date at the top changes when we do, and material changes
          are noted on the <a href="/changelog">changelog</a>. Continued use after a change is acceptance of it.
        </p>
      </Section>

      <Section n={10} id="contact" title="Contact">
        <p>
          <a href="mailto:info@canpayinsights.ca" className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700">
            info@canpayinsights.ca
          </a>{' '}
          · CanPay Insights, operated by Qi Zhang (Avowd), Vancouver, British Columbia, Canada.
        </p>
      </Section>
    </LegalChrome>
  );
};

export default TermsPage;
