import type { Metadata } from 'next';
import SalaryContext from '../../components/SalaryContext';
import { isIndexable } from '../../lib/indexableSalaryPages';
import { notFound } from 'next/navigation';
import ShareLinks from '../../components/ShareLinks';
import SalaryBreakdownPanel from '../../components/SalaryBreakdownPanel';
import JobsAtThisSalary from '../../components/JobsAtThisSalary';
import PartnerSlot from '../../components/PartnerSlot';
import { getProvinceSeoConfig } from '../../lib/salaryFigures';
import { CalculationMode } from '../../types';
import SisterSiteCard from '../../components/SisterSiteCard';
import { getLandingPage, landingPages } from '../landing-page-data';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { ButtonLink, Card, Eyebrow, Stat } from '../../components/site/ui';
import EmbedCalculator from '../../components/EmbedCalculator';

// Pages named "… calculator" carry a working calculator above the fold. Until
// 2026-10-26 they had an $80,000 example and a button to the home page, so
// Google ranked the home page for "paycheck calculator ontario" instead, and
// "salary calculator canada" (1,680 impressions in four weeks) won no clicks.
const PROVINCE_PAGES: Record<string, string> = {
  ontario: 'ON', bc: 'BC', alberta: 'AB', quebec: 'QC', manitoba: 'MB', saskatchewan: 'SK',
  'nova-scotia': 'NS', 'new-brunswick': 'NB', newfoundland: 'NL', pei: 'PE', yukon: 'YT',
  'northwest-territories': 'NT', nunavut: 'NU',
};
function calculatorFor(slug: string): { province?: string; amount: string; unit: 'year' | 'hour' } | null {
  const prov = slug.match(/^(.+)-paycheck-calculator$/)?.[1];
  if (prov && PROVINCE_PAGES[prov]) return { province: PROVINCE_PAGES[prov], amount: '80000', unit: 'year' };
  if (slug === 'hourly-wage-calculator') return { amount: '25', unit: 'hour' };
  if (/-calculator$/.test(slug) || slug === 'salary-after-tax-canada') return { amount: '60000', unit: 'year' };
  return null;
}

const BASE_URL = 'https://canpayinsights.ca';

interface Props {
  params: Promise<{ slug: string }>;
}

const relatedLinks = [
  { href: '/salary-after-tax-canada', label: 'Salary After Tax Canada' },
  { href: '/hourly-wage-calculator', label: 'Hourly Wage Calculator' },
  { href: '/salary-calculator', label: 'Canadian Salary Calculator' },
  { href: '/cpp-ei-calculator', label: 'CPP & EI Calculator' },
  { href: '/payroll-calculator', label: 'Payroll Calculator for Employers' },
  { href: '/salary-to-hourly-calculator', label: 'Salary to Hourly Calculator' },
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
  // Salary x province permutation pages were blanket-noindexed in June 2026.
  // That block is now lifted only for the 89 pages with MEASURED search demand
  // (see lib/indexableSalaryPages.ts); the rest stay out of the index so the
  // site never looks like bulk-generated permutations.
  const isThinPermutation = !isIndexable(page.slug);
  const languageAlternates = page.alternateLanguages?.reduce<Record<string, string>>(
    (languages, link) => ({
      ...languages,
      [link.hrefLang]: `${BASE_URL}${link.href}`,
    }),
    { 'en-CA': url, 'x-default': url }
  );

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.examples],
    alternates: {
      canonical: url,
      ...(languageAlternates ? { languages: languageAlternates } : {}),
    },
    ...(isThinPermutation ? { robots: { index: false, follow: true } } : {}),
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
  const calc = calculatorFor(page.slug);
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
    <div className="min-h-screen bg-pearl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader current="calculator" />

      <main className="mx-auto max-w-6xl px-4" role="main">
        <div className="pb-10 pt-10 md:pb-14 md:pt-16">
          <Eyebrow className="mb-4">{page.kicker}</Eyebrow>
          <h1 className="mb-6 max-w-4xl font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.01em] text-ink md:text-[3.25rem]">
            {page.h1}
          </h1>
          {/* On a phone the calculator comes straight after the heading — the long
              intro pushed its result below the fold. */}
          <div className={calc ? 'grid gap-6 md:grid-cols-[minmax(0,1fr)_380px] md:items-start md:gap-10' : ''}>
            {calc && (
              <div className="md:order-2">
                <EmbedCalculator inline initialProvince={calc.province} initialAmount={calc.amount} initialUnit={calc.unit} />
              </div>
            )}
            <div className="min-w-0 max-w-3xl md:order-1">
              <p className="text-lg leading-8 text-ink-3">
                {page.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/">Use Free Calculator</ButtonLink>
                <ButtonLink href="/compare-provinces" variant="secondary">Compare Provinces</ButtonLink>
              </div>
            </div>
          </div>
          {page.highlights && page.highlights.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
              {page.highlights.map((item) => (
                <Stat key={item.label} label={item.label} value={item.value} sub={item.detail} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-line pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 space-y-6">
            {page.salaryBreakdown && (
              <SalaryBreakdownPanel breakdown={page.salaryBreakdown} locale="en" />
            )}

            {/* Statistics Canada context for this exact salary and province —
                the thing that makes each permutation page its own page rather
                than the same template with two numbers swapped. */}
            {(() => {
              const m = page.slug.match(/^(\d+)-after-tax-(.+)$/);
              if (!m) return null;
              const amount = Number(m[1]);
              const provinceSlug = m[2];
              const provinceName = provinceSlug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              return (
                <>
                  <SalaryContext amount={amount} provinceSlug={provinceSlug} />
                  <JobsAtThisSalary amount={amount} provinceName={provinceName} />
                  {/* The RRSP referral sits under the figures that just showed
                      what an RRSP contribution saves. The tax-filing slot
                      appears by itself in February and hides after April 30. */}
                  <PartnerSlot
                    id="wealthsimple-invest"
                    track={{ mode: CalculationMode.ANNUAL, province: getProvinceSeoConfig(provinceSlug).province, annualIncome: amount, lang: 'en' }}
                  />
                  <PartnerSlot id="wealthsimple-tax" />
                </>
              );
            })()}

            {/* Engine-computed tables (lib/landingTables.ts). Answer engines cite
                pages that answer "how much" with a table; one prose example lost
                to them on every question it covered (Avowd, November 2026). */}
            {page.tables?.map((table) => (
              <Card as="section" key={table.heading} className="p-6">
                <h2 className="mb-3 font-display text-2xl font-semibold leading-tight text-ink">{table.heading}</h2>
                {table.intro && <p className="mb-4 leading-7 text-ink-3">{table.intro}</p>}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={table.heading}>
                  <table className="w-full border-collapse text-left text-sm tabular-nums">
                    <thead>
                      <tr className="border-b border-ink-5">
                        {table.columns.map((c, i) => (
                          <th key={c} scope="col" className={`whitespace-nowrap py-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute ${i > 0 ? 'text-right' : ''}`}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => i === 0
                            ? <th key={i} scope="row" className="whitespace-nowrap py-2.5 pr-4 font-semibold text-ink">{cell}</th>
                            : <td key={i} className="whitespace-nowrap py-2.5 pr-4 text-right text-ink-2">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {table.note && <p className="mt-3 text-sm leading-6 text-mute">{table.note}</p>}
              </Card>
            ))}

            {page.sections.map((section) => (
              <Card as="section" key={section.heading} className="p-6">
                <h2 className="mb-3 font-display text-2xl font-semibold leading-tight text-ink">
                  {section.heading}
                </h2>
                <p className="leading-8 text-ink-3">
                  {section.body}
                </p>
              </Card>
            ))}

            {page.relatedSalaryLinks && page.relatedSalaryLinks.length > 0 && (
              <Card as="nav" className="p-5" aria-label="Related salary after tax searches">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Related Salary After Tax Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {page.relatedSalaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-lg border border-line bg-pearl-soft px-3 py-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:border-ink-5 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {page.alternateLanguages && page.alternateLanguages.length > 0 && (
              <Card as="nav" className="p-5" aria-label="Language alternatives">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Other Language Versions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {page.alternateLanguages.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      hrefLang={link.hrefLang}
                      className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-red-700 no-underline transition-colors hover:border-red-200"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {page.nextSteps && page.nextSteps.length > 0 && (
              <Card as="section" className="p-6">
                <h2 className="mb-4 font-display text-2xl font-semibold leading-tight text-ink">
                  Recommended Next Steps
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {page.nextSteps.map((step) => (
                    <a
                      key={`${step.href}-${step.title}`}
                      href={step.href}
                      className="flex flex-col rounded-xl border border-line bg-pearl-soft p-4 no-underline transition-colors hover:border-ink-5 hover:bg-white"
                    >
                      <h3 className="font-display text-base font-semibold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ink-3">
                        {step.body}
                      </p>
                      <span className="mt-auto inline-flex pt-3 text-sm font-semibold text-red-600">
                        {step.label} →
                      </span>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="mb-4 font-display text-2xl font-semibold leading-tight text-ink">Common Searches</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {page.examples.map((example) => (
                  <div key={example} className="rounded-xl border border-line bg-pearl-soft p-4 text-sm font-medium text-ink-2">
                    {example}
                  </div>
                ))}
              </div>
            </Card>

            <section>
              <h2 className="mb-5 font-display text-2xl font-semibold leading-tight text-ink">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {page.faq.map((item) => (
                  <details key={item.question} className="rounded-2xl border border-line bg-white p-5">
                    <summary className="cursor-pointer font-display text-lg font-semibold leading-snug text-ink marker:text-red-600">
                      {item.question}
                    </summary>
                    <p className="mt-3 leading-7 text-ink-3">
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

            {/* Sister site — U.S. edition, honest same-team recommendation */}
            <SisterSiteCard className="mt-6" />
          </article>

          <aside className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-ink">Calculate Your Pay</h2>
              <p className="mb-5 text-sm leading-6 text-ink-3">
                Enter your wage or salary and province to estimate net pay, taxes, CPP, and EI.
              </p>
              <ButtonLink href="/" className="w-full">Open Calculator</ButtonLink>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 font-display text-lg font-semibold text-ink">Related Calculators</h2>
              <div className="divide-y divide-line">
                {filteredRelatedLinks.slice(0, 7).map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-2.5 text-sm font-medium text-ink-2 no-underline hover:text-red-600"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Tax Guides</h2>
              <p className="mb-4 text-sm leading-6 text-ink-3">
                Read Canadian tax, RRSP, CPP, EI, and provincial pay guides.
              </p>
              <a href="/blog" className="text-sm font-semibold text-red-600 no-underline hover:text-red-700">
                Browse Insights Hub
              </a>
            </Card>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
