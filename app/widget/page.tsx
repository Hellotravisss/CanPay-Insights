import type { Metadata } from 'next';
import CopyEmbedCode from './CopyEmbedCode';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { PageHero, Card } from '../../components/site/ui';

export const metadata: Metadata = {
  title: 'Free Embeddable Take-Home Pay Calculator Widget for Your Website',
  description:
    'Add a free Canadian take-home pay calculator to your job board, blog, or website with one line of HTML. All provinces, 2026 tax rates, ten languages, checked against the CRA payroll deduction tables. No signup required.',
  alternates: { canonical: 'https://canpayinsights.ca/widget' },
};

const EMBED_CODE = `<iframe src="https://canpayinsights.ca/embed?province=ON&lang=en"
  width="100%" height="560" loading="lazy"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:420px"
  title="Canadian Take-Home Pay Calculator"></iframe>
<p style="font-size:12px;margin-top:4px">
  <a href="https://canpayinsights.ca/">Canadian take-home pay calculator</a>
  by CanPay Insights
</p>`;

const widgetFaq = [
  {
    question: 'Is the widget really free?',
    answer:
      'Yes. The embeddable calculator is completely free for any website — job boards, immigration services, finance blogs, HR resources. The only requirement is the small "Powered by CanPay Insights" line inside the widget. The one-line text link under it in the embed code is appreciated but optional. You can remove the widget at any time, with no commitment.',
  },
  {
    question: 'Are the numbers accurate?',
    answer:
      'The widget runs the exact same calculation engine as canpayinsights.ca: 2026 federal and provincial income tax, CPP/CPP2 (QPP/QPIP in Quebec), and EI for all 13 provinces and territories. Before every release the engine is compared with the CRA payroll deduction tables (T4032) and the Revenu Québec source deduction table — more than 10,000 rows — and a release that disagrees with them does not ship.',
  },
  {
    question: 'Can I set a default province or language?',
    answer:
      'Yes — add URL parameters to the iframe src: ?province=BC (two-letter code) and &lang= with one of ten languages: en, fr, zh, pa (Punjabi), hi (Hindi), tl (Tagalog), es (Spanish), uk (Ukrainian), ko (Korean), or vi (Vietnamese). Readers can then switch between that language, English and French from the widget itself.',
  },
  {
    question: 'Does the widget track my visitors?',
    answer:
      'It sets no cookies, stores nothing in your visitors\' browsers and loads nothing from any domain but canpayinsights.ca. For each completed calculation it records one anonymous line: the province, the income as one of seven ranges (never the figure), annual or hourly, the interface language, device class, browser and operating-system family, the hour and weekday on the reader\'s clock, the time-zone name, a random ID that lasts one page load, and your site\'s domain. No name, account, IP address or fingerprint. To record nothing at all, add &notelemetry=1 to the iframe src. Details: canpayinsights.ca/privacy.',
  },
];

/** Sites that embed the widget. Checked daily by scripts/livePromises.mjs; remove an entry the day it fails. */
export const USED_BY = { name: 'FindJobs Canada', href: 'https://findjobscanada.ca/2025/05/05/highest-paying-jobs-canada/' };

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: widgetFaq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function WidgetPage() {
  return (
    <div className="min-h-screen bg-pearl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-5xl px-4" role="main">
        <PageHero
          title="Add a free take-home pay calculator to your website"
          lead={<>
          One line of HTML gives your visitors an accurate Canadian salary-after-tax calculator —
          2026 rates for every province and territory, in ten languages, checked line by line against the
          payroll deduction tables the CRA publishes for employers. Perfect for job boards,
          immigration and newcomer resources, HR pages, and personal-finance blogs.
          </>}
        />
        {/* Kept true by audit:live (8): the partner page must still carry /embed. */}
        <p className="-mt-2 mb-10 max-w-3xl text-sm text-mute md:-mt-6">
          Used by{' '}
          <a href={USED_BY.href} className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600">FindJobs Canada</a>{' '}
          in its guides to the highest-paying jobs and to salary negotiation.
        </p>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <Card className="min-w-0 p-5 md:p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Live preview</h2>
            <iframe
              src="/embed?province=ON"
              width="100%"
              height={560}
              loading="lazy"
              style={{ border: '1px solid #E3E3EA', borderRadius: 12, maxWidth: 420 }}
              title="Canadian Take-Home Pay Calculator"
            />
          </Card>

          <Card className="min-w-0 p-5 md:p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Embed code</h2>
            <CopyEmbedCode code={EMBED_CODE} />

            <h3 className="mb-2 mt-7 text-sm font-semibold text-ink">Options</h3>
            <ul className="space-y-1.5 text-sm leading-6 text-ink-2">
              <li><code className="rounded-md border border-line bg-pearl-soft px-1.5 py-0.5 text-xs text-ink">?province=BC</code> — default province (ON, BC, AB, QC, MB, SK, NS, NB, PE, NL, YT, NT, NU)</li>
              <li><code className="rounded-md border border-line bg-pearl-soft px-1.5 py-0.5 text-xs text-ink">&amp;lang=fr</code> — interface language: <code className="text-xs text-ink">en</code>, <code className="text-xs text-ink">fr</code>, <code className="text-xs text-ink">zh</code>, <code className="text-xs text-ink">pa</code>, <code className="text-xs text-ink">hi</code>, <code className="text-xs text-ink">tl</code>, <code className="text-xs text-ink">es</code>, <code className="text-xs text-ink">uk</code>, <code className="text-xs text-ink">ko</code>, <code className="text-xs text-ink">vi</code></li>
            </ul>

            <h3 className="mb-2 mt-7 border-t border-line pt-6 text-sm font-semibold text-ink">Need something custom?</h3>
            <p className="text-sm leading-6 text-ink-2">
              White-label or custom-branded versions for your platform:{' '}
              <a href="mailto:info@canpayinsights.ca" className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600">
                info@canpayinsights.ca
              </a>
            </p>
          </Card>
        </div>

        <section className="py-14 md:py-20">
          <h2 className="mb-6 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">Frequently asked questions</h2>
          <div className="max-w-3xl divide-y divide-line border-y border-line">
            {widgetFaq.map((item) => (
              <div key={item.question} className="py-6">
                <h3 className="mb-2 text-base font-semibold text-ink">{item.question}</h3>
                <p className="text-sm leading-6 text-ink-2">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
