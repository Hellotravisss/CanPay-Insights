import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShareLinks from '../../components/ShareLinks';
import { getLandingPage, landingPages } from '../landing-page-data';

const BASE_URL = 'https://canpayinsights.ca';

interface Props {
  params: Promise<{ slug: string }>;
}

const relatedLinks = [
  { href: '/salary-after-tax-canada', label: 'Salary After Tax Canada' },
  { href: '/hourly-wage-calculator', label: 'Hourly Wage Calculator' },
  { href: '/salary-calculator', label: 'Canadian Salary Calculator' },
  { href: '/cpp-ei-calculator', label: 'CPP & EI Calculator' },
  { href: '/ontario-paycheck-calculator', label: 'Ontario Paycheck Calculator' },
  { href: '/bc-paycheck-calculator', label: 'BC Paycheck Calculator' },
  { href: '/alberta-paycheck-calculator', label: 'Alberta Paycheck Calculator' },
  { href: '/quebec-paycheck-calculator', label: 'Quebec Paycheck Calculator' },
];

export function generateStaticParams() {
  return landingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  const url = `${BASE_URL}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.examples],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPage(slug);

  if (!page) {
    notFound();
  }

  const pageUrl = `${BASE_URL}/${page.slug}`;
  const filteredRelatedLinks = relatedLinks.filter((link) => link.href !== `/${page.slug}`);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.h1,
      description: page.description,
      url: pageUrl,
      inLanguage: 'en-CA',
      isPartOf: {
        '@type': 'WebSite',
        name: 'CanPay Insights',
        url: BASE_URL,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-image.png`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: page.h1,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      url: pageUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: page.h1, item: pageUrl },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 no-underline mb-8">
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            CanPay Insights
          </a>
          <p className="text-sm font-bold uppercase tracking-wide text-red-600 mb-3">
            {page.kicker}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950 mb-5">
            {page.h1}
          </h1>
          <p className="text-lg leading-8 text-slate-600 max-w-3xl">
            {page.intro}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 no-underline"
            >
              Use Free Calculator
            </a>
            <a
              href="/compare-provinces"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:border-red-200 hover:text-red-600 no-underline"
            >
              Compare Provinces
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <article className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Common Searches</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {page.examples.map((example) => (
                  <div key={example} className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                    {example}
                  </div>
                ))}
              </div>
            </div>

            {page.relatedSalaryLinks && page.relatedSalaryLinks.length > 0 && (
              <nav
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                aria-label="Related salary after tax searches"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Related Salary After Tax Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {page.relatedSalaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 no-underline transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            {page.sections.map((section) => (
              <section key={section.heading} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  {section.heading}
                </h2>
                <p className="leading-8 text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}

            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {page.faq.map((item) => (
                  <details key={item.question} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-bold text-slate-800">
                      {item.question}
                    </summary>
                    <p className="mt-3 leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <ShareLinks
              url={pageUrl}
              title={page.title}
              description={page.description}
            />
          </article>

          <aside className="space-y-4">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Calculate Your Pay</h2>
              <p className="text-sm leading-6 text-slate-300 mb-5">
                Enter your wage or salary and province to estimate net pay, taxes, CPP, and EI.
              </p>
              <a
                href="/"
                className="block rounded-lg bg-red-600 px-4 py-3 text-center font-bold text-white hover:bg-red-700 no-underline"
              >
                Open Calculator
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Related Calculators</h2>
              <div className="space-y-2">
                {filteredRelatedLinks.slice(0, 7).map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 no-underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Tax Guides</h2>
              <p className="text-sm leading-6 text-slate-600 mb-4">
                Read Canadian tax, RRSP, CPP, EI, and provincial pay guides.
              </p>
              <a href="/blog" className="text-sm font-bold text-red-600 hover:text-red-700 no-underline">
                Browse Insights Hub
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
