import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShareLinks from '../../../components/ShareLinks';
import SalaryBreakdownPanel from '../../../components/SalaryBreakdownPanel';
import { frenchLandingPages, getFrenchLandingPage } from '../../landing-page-data';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import { ButtonLink, Card, Eyebrow, Stat } from '../../../components/site/ui';

const BASE_URL = 'https://canpayinsights.ca';

interface Props {
  params: Promise<{ slug: string }>;
}

const relatedLinks = [
  { href: '/fr/calculateur-salaire-net-quebec', label: 'Calculateur salaire net Québec' },
  { href: '/fr/60000-apres-impot-quebec', label: '60 000 $ après impôt Québec' },
  { href: '/fr/70000-apres-impot-quebec', label: '70 000 $ après impôt Québec' },
  { href: '/fr/80000-apres-impot-quebec', label: '80 000 $ après impôt Québec' },
  { href: '/fr/100000-apres-impot-quebec', label: '100 000 $ après impôt Québec' },
  { href: '/quebec-paycheck-calculator', label: 'Quebec Paycheck Calculator' },
];

export function generateStaticParams() {
  return frenchLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getFrenchLandingPage(slug);

  if (!page) {
    return { title: 'Page introuvable' };
  }

  const url = `${BASE_URL}/fr/${page.slug}`;
  // Salary x province permutation pages (slug starts with a dollar amount) are
  // near-identical templates — noindex them, keep the Québec hub indexed.
  // French pages have no measured demand yet, so the original blanket block
  // stands here; revisit once the French archive shows impressions.
  const isThinPermutation = /^\d/.test(page.slug);
  const defaultAlternate = page.alternateLanguages?.find((link) => link.hrefLang === 'en-CA')?.href;
  const languageAlternates = page.alternateLanguages?.reduce<Record<string, string>>(
    (languages, link) => ({
      ...languages,
      [link.hrefLang]: `${BASE_URL}${link.href}`,
    }),
    { 'fr-CA': url, 'x-default': `${BASE_URL}${defaultAlternate ?? '/quebec-paycheck-calculator'}` }
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
      locale: 'fr_CA',
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

export default async function FrenchLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getFrenchLandingPage(slug);

  if (!page) {
    notFound();
  }

  const pageUrl = `${BASE_URL}/fr/${page.slug}`;
  const filteredRelatedLinks = relatedLinks.filter((link) => link.href !== `/fr/${page.slug}`);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.h1,
      description: page.description,
      url: pageUrl,
      inLanguage: 'fr-CA',
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
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: page.h1, item: pageUrl },
      ],
    },
  ];

  return (
    <div lang="fr-CA" className="min-h-screen bg-pearl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader lang="fr" current="calculator" />

      <main className="mx-auto max-w-6xl px-4" role="main">
        <div className="max-w-4xl pb-10 pt-10 md:pb-14 md:pt-16">
          <Eyebrow className="mb-4">{page.kicker}</Eyebrow>
          <h1 className="mb-6 font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.01em] text-ink md:text-[3.25rem]">
            {page.h1}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-ink-3">
            {page.intro}
          </p>
        </div>
        {page.highlights && page.highlights.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {page.highlights.map((item) => (
              <Stat key={item.label} label={item.label} value={item.value} sub={item.detail} />
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3 pb-10 md:pb-14">
          <ButtonLink href="/">Ouvrir le calculateur</ButtonLink>
          <ButtonLink href="/compare-provinces" variant="secondary">Comparer les provinces</ButtonLink>
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-line pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 space-y-6">
            {page.salaryBreakdown && (
              <SalaryBreakdownPanel breakdown={page.salaryBreakdown} locale="fr" />
            )}

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
              <Card as="nav" className="p-5" aria-label="Recherches de salaire net liées">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Recherches liées au Québec
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
              <Card as="nav" className="p-5" aria-label="Autres langues">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                  Autres versions
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
                  Prochaines étapes
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
              <h2 className="mb-4 font-display text-2xl font-semibold leading-tight text-ink">Recherches populaires</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {page.examples.map((example) => (
                  <div key={example} className="rounded-xl border border-line bg-pearl-soft p-4 text-sm font-medium text-ink-2">
                    {example}
                  </div>
                ))}
              </div>
            </Card>

            <section>
              <h2 className="mb-5 font-display text-2xl font-semibold leading-tight text-ink">Questions fréquentes</h2>
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
              heading="Partager ce calculateur gratuit"
              helperText="Aidez une autre personne au Québec à comparer sa paie nette avant une offre d'emploi ou un déménagement."
              emailLabel="Courriel"
            />
          </article>

          <aside className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-ink">Calculez votre paie</h2>
              <p className="mb-5 text-sm leading-6 text-ink-3">
                Entrez votre salaire et votre province pour estimer la paie nette, les impôts, la RRQ, le RQAP et les retenues.
              </p>
              <ButtonLink href="/" className="w-full">Ouvrir le calculateur</ButtonLink>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 font-display text-lg font-semibold text-ink">Pages liées</h2>
              <div className="divide-y divide-line">
                {filteredRelatedLinks.slice(0, 6).map((link) => (
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
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Guides fiscaux</h2>
              <p className="mb-4 text-sm leading-6 text-ink-3">
                Consultez les guides sur les impôts, le salaire, la RRQ, le RPC et les provinces canadiennes.
              </p>
              <a href="/blog" className="text-sm font-semibold text-red-600 no-underline hover:text-red-700">
                Voir le hub
              </a>
            </Card>
          </aside>
        </div>
      </main>

      <SiteFooter lang="fr" />
    </div>
  );
}
