import type { Metadata } from 'next';
import CopyEmbedCode from './CopyEmbedCode';

export const metadata: Metadata = {
  title: 'Free Embeddable Take-Home Pay Calculator Widget for Your Website',
  description:
    'Add a free Canadian take-home pay calculator to your job board, blog, or website with one line of HTML. All provinces, 2026 tax rates, English/French/Chinese. No signup required.',
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
      'Yes. The embeddable calculator is completely free for any website — job boards, immigration services, finance blogs, HR resources. We only ask that you keep the small attribution link under the widget.',
  },
  {
    question: 'Are the numbers accurate?',
    answer:
      'The widget runs the exact same open calculation engine as canpayinsights.ca: 2026 federal and provincial income tax, CPP/CPP2 (QPP/QPIP in Quebec), and EI for all 13 provinces and territories.',
  },
  {
    question: 'Can I set a default province or language?',
    answer:
      'Yes — add URL parameters to the iframe src: ?province=BC (two-letter code) and &lang=en, fr, or zh for English, French, or Chinese.',
  },
  {
    question: 'Does the widget track my visitors?',
    answer:
      'No personal data is collected — no cookies, no fingerprints, no IP storage. The widget records only anonymous, aggregated usage statistics (province and a broad income range) as described in our privacy policy.',
  },
];

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
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">
          ← CanPay Insights
        </a>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Add a free take-home pay calculator to your website
        </h1>
        <p className="mb-10 max-w-2xl leading-7 text-slate-600">
          One line of HTML gives your visitors an accurate Canadian salary-after-tax calculator —
          2026 rates for every province, in English, French, and Chinese. Perfect for job boards,
          immigration and newcomer resources, HR pages, and personal-finance blogs.
        </p>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-900">Live preview</h2>
            <iframe
              src="/embed?province=ON"
              width="100%"
              height={560}
              loading="lazy"
              style={{ border: '1px solid #e2e8f0', borderRadius: 12, maxWidth: 420 }}
              title="Canadian Take-Home Pay Calculator"
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-900">Embed code</h2>
            <CopyEmbedCode code={EMBED_CODE} />

            <h3 className="mb-2 mt-6 text-sm font-bold text-slate-900">Options</h3>
            <ul className="space-y-1.5 text-sm leading-6 text-slate-600">
              <li><code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">?province=BC</code> — default province (ON, BC, AB, QC, MB, SK, NS, NB, PE, NL, YT, NT, NU)</li>
              <li><code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">&amp;lang=fr</code> — interface language: <code className="text-xs">en</code>, <code className="text-xs">fr</code>, or <code className="text-xs">zh</code></li>
            </ul>

            <h3 className="mb-2 mt-6 text-sm font-bold text-slate-900">Need something custom?</h3>
            <p className="text-sm leading-6 text-slate-600">
              White-label or custom-branded versions for your platform:{' '}
              <a href="mailto:info@canpayinsights.ca" className="font-semibold text-red-600 hover:underline">
                info@canpayinsights.ca
              </a>
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="space-y-6">
            {widgetFaq.map((item) => (
              <div key={item.question}>
                <h3 className="mb-1.5 text-base font-bold text-slate-900">{item.question}</h3>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
