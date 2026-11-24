import type { JSX } from 'react';
import { allArticles, getArticleBySlug } from '../articles-data';
import type { Article } from '../types';
import ArticleShareButtons from './ArticleShareButtons';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import { Eyebrow, Card, Callout, ButtonLink } from '../../../components/site/ui';

interface ArticleViewProps {
  slug: string;
}

const categoryLabels: Record<string, string> = {
  tax: 'Tax Guides',
  salary: 'Salary Insights',
  province: 'Provincial Guides',
  tips: 'Money Tips',
  news: 'Latest News',
};

const provinceCalculatorLinks: Record<string, Array<{ href: string; label: string; description: string }>> = {
  Ontario: [
    { href: '/ontario-paycheck-calculator', label: 'Ontario paycheck calculator', description: 'Estimate Ontario take-home pay with tax, CPP, and EI.' },
    { href: '/salary-after-tax-canada', label: 'Salary after tax in Canada', description: 'See take-home pay for any salary, province by province.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'See whether the same salary goes further in another province.' },
  ],
  'British Columbia': [
    { href: '/bc-paycheck-calculator', label: 'BC paycheck calculator', description: 'Estimate BC take-home pay for Vancouver, Victoria, and across BC.' },
    { href: '/hourly-wage-calculator', label: 'Hourly wage calculator', description: 'Turn an hourly rate into BC take-home pay.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'Compare BC with Ontario, Alberta, Quebec, and more.' },
  ],
  Alberta: [
    { href: '/alberta-paycheck-calculator', label: 'Alberta paycheck calculator', description: 'Estimate Alberta net pay and deductions.' },
    { href: '/salary-after-tax-canada', label: 'Salary after tax in Canada', description: 'Check any salary against take-home pay across Canada.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'Compare Alberta take-home pay with other provinces.' },
  ],
  Quebec: [
    { href: '/quebec-paycheck-calculator', label: 'Quebec paycheck calculator', description: 'Estimate Quebec take-home pay with province-specific deductions.' },
    { href: '/fr/calculateur-salaire-net-quebec', label: 'Calculateur salaire net Québec', description: 'French Quebec salary and payroll estimate page.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'See how Quebec take-home compares with other provinces.' },
  ],
};

const formatDate = (dateString: string) => {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getCalculatorLinks = (article: Article) => {
  if (article.province && provinceCalculatorLinks[article.province]) {
    return provinceCalculatorLinks[article.province];
  }

  if (article.slug.includes('newcomer')) {
    return [
      { href: '/salary-after-tax-canada', label: 'Salary after tax Canada', description: 'Understand what a Canadian offer becomes after deductions.' },
      { href: '/compare-provinces', label: 'Compare provinces', description: 'Useful before choosing a city or province for your first job.' },
      { href: '/hourly-wage-calculator', label: 'Hourly wage calculator', description: 'Helpful for part-time, student, and shift-based work.' },
    ];
  }

  return [
    { href: '/salary-after-tax-canada', label: 'Salary after tax Canada', description: 'Estimate annual salary, monthly pay, and bi-weekly net pay.' },
    { href: '/cpp-ei-calculator', label: 'CPP & EI calculator', description: 'Understand the payroll deductions that show up on your pay stub.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'Use the same gross salary across provinces.' },
  ];
};

const getRelatedArticles = (article: Article): Article[] => {
  return allArticles
    .filter((candidate) => candidate.id !== article.id && (candidate.category === article.category || candidate.province === article.province))
    .slice(0, 3);
};

const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let tableRows: string[][] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const renderInlineHtml = (text: string) => {
    const withFormatting = text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="font-medium text-red-600 underline decoration-red-200 underline-offset-2 hover:text-red-700 hover:decoration-red-400">$1</a>');
    return { __html: withFormatting };
  };

  const flushTable = () => {
    if (tableRows.length === 0) {
      return;
    }

    const header = tableRows[0];
    const body = tableRows.slice(1);
    // A column whose every body cell starts with a figure ($72,000 · 76.5% · #6 · −$1,200) is right-aligned.
    const isFigure = (cell: string | undefined) => /^[\s*]*[-−+~≈#]?\s*\$?\d/.test(cell ?? '');
    const numericCol = header.map((_, col) => col > 0 && body.length > 0 && body.every((row) => isFigure(row[col])));
    elements.push(
      <div key={`table-${elements.length}`} className="my-8 overflow-hidden rounded-xl border border-line bg-white">
        {/* Keyboard-reachable scroll region (axe scrollable-region-focusable). */}
        <div className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-pearl-soft">
                {header.map((cell, index) => (
                  <th key={index} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute ${numericCol[index] ? 'text-right' : 'text-left'}`}>
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 text-[15px] leading-6 tabular-nums ${numericCol[cellIndex] ? 'whitespace-nowrap text-right' : ''} ${cellIndex === 0 ? 'font-medium text-ink' : 'text-ink-2'}`}
                      dangerouslySetInnerHTML={renderInlineHtml(cell.trim())}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
    );
    tableRows = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    const ListTag = listType === 'ul' ? 'ul' : 'ol';
    elements.push(
      <ListTag key={`list-${elements.length}`} className={`my-6 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} space-y-2.5 pl-6 text-[18px] leading-[1.75] text-ink-2 marker:text-ink-4 ${listType === 'ol' ? 'marker:tabular-nums' : ''}`}>
        {listItems.map((item, index) => (
          <li key={index} className="pl-1" dangerouslySetInnerHTML={renderInlineHtml(item)} />
        ))}
      </ListTag>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      flushList();
      if (!trimmed.includes('---')) {
        tableRows.push(trimmed.split('|').filter((cell) => cell.trim() !== ''));
      }
      return;
    }

    flushTable();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
      }
      listType = 'ul';
      listItems.push(trimmed.substring(2));
      return;
    }

    if (/^\d+\./.test(trimmed)) {
      if (listType !== 'ol') {
        flushList();
      }
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+\.\s*/, ''));
      return;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={index} className="mb-5 mt-12 font-display text-[1.75rem] font-semibold leading-tight text-ink md:text-[2rem]">{trimmed.substring(2)}</h1>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={index} className="mb-4 mt-12 font-display text-[1.5rem] font-semibold leading-snug text-ink md:text-[1.75rem]">{trimmed.substring(3)}</h2>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={index} className="mb-3 mt-8 text-lg font-semibold leading-snug text-ink">{trimmed.substring(4)}</h3>);
    } else if (trimmed === '---') {
      elements.push(<hr key={index} className="my-10 border-line" />);
    } else if (trimmed !== '') {
      elements.push(<p key={index} className="my-5 text-[18px] leading-[1.75] text-ink-2" dangerouslySetInnerHTML={renderInlineHtml(trimmed)} />);
    }
  });

  flushList();
  flushTable();

  return elements;
};

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600';

const CalculatorCTA = () => {
  return (
    <Card className="my-10 p-6 md:p-8">
      <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Calculate Your Take-Home Pay</h2>
      <p className="mb-5 text-base leading-7 text-ink-3">
        Enter your salary and province to see detailed tax breakdowns instantly.
      </p>
      <ButtonLink href="/">
        Use Free Calculator
      </ButtonLink>
    </Card>
  );
};

// Wealthsimple referral, shown ONLY on the two investment-account articles.
// Uses the personal invite link for now; swap WEALTHSIMPLE_REFERRAL_URL for a
// formal affiliate link if/when the Wealthsimple affiliate program is approved.
const WEALTHSIMPLE_REFERRAL_URL = 'https://www.wealthsimple.com/invite/KGAAWL';
const WEALTHSIMPLE_ARTICLE_SLUGS = ['tfsa-vs-rrsp-2026', 'rrsp-tax-savings-canada-2025'];

const WealthsimpleCTA = () => {
  return (
    <div className="my-10 rounded-2xl border border-line bg-pearl-soft p-6">
      <h2 className="mb-2 font-display text-xl font-semibold text-ink">Where Canadians actually hold TFSAs and RRSPs</h2>
      <p className="mb-4 text-sm leading-6 text-ink-2">
        If you&apos;re opening one of these accounts, Wealthsimple is a low-fee option many Canadians use for
        self-directed and automated investing.
      </p>
      <ButtonLink
        href={WEALTHSIMPLE_REFERRAL_URL}
        variant="secondary"
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        See Wealthsimple
      </ButtonLink>
      <p className="mt-3 text-xs text-mute">
        Paid referral link — we may earn a bonus if you sign up, at no extra cost to you.{' '}
        <a href="/affiliate-disclosure" className="underline hover:text-ink">Learn more</a>.
      </p>
    </div>
  );
};

const CalculatorLinksPanel = ({ article }: { article: Article }) => {
  const calculatorLinks = getCalculatorLinks(article);

  return (
    <div className="mb-8 rounded-2xl border border-line bg-pearl-soft p-5">
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">Useful calculators for this guide</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {calculatorLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`group block rounded-xl border border-line bg-white p-4 no-underline transition-colors duration-150 hover:border-ink-5 ${FOCUS}`}
          >
            <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-red-600">{link.label}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-3">{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default function ArticleView({ slug }: ArticleViewProps) {
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-pearl">
        <SiteHeader current="guides" />
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24" role="main">
          <div className="text-center">
            <h1 className="mb-2 font-display text-3xl font-semibold text-ink">Article Not Found</h1>
            <p className="mb-4 text-mute">This article may have been removed or does not exist.</p>
            <a href="/blog" className="font-medium text-red-600 hover:underline">
              Back to Articles
            </a>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const relatedArticles = getRelatedArticles(article);
  const categoryLabel = categoryLabels[article.category] || article.category;
  const siteLang = article.lang === 'fr' ? 'fr' : 'en';

  return (
    <div className="min-h-screen bg-pearl">
      <SiteHeader lang={siteLang} current="guides" />

      <main className="mx-auto max-w-3xl px-4" role="main">
        <header className="pb-8 pt-8 md:pb-10 md:pt-12">
          <nav className="mb-6 flex items-center gap-2 text-xs text-mute" aria-label="Breadcrumb">
            <a href="/blog" className="text-mute no-underline hover:text-red-600">
              Tax Guides
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-ink-2">{categoryLabel}</span>
          </nav>

          <Eyebrow className="mb-4">{categoryLabel}</Eyebrow>

          <h1 className="font-display text-[2.125rem] font-semibold leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.75rem]">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mt-4 text-lg leading-8 text-ink-3 md:text-xl">
              {article.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tabular-nums text-mute">
            <span>By <a href="/about" className="font-medium text-ink-2 underline-offset-2 hover:text-red-600 hover:underline">Travis Zhang</a></span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.updatedAt && (
              <span>
                {' · '}Updated{' '}
                <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
              </span>
            )}
            {article.province && <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink-2">{article.province}</span>}
            <span>{article.readTime} min read</span>
          </div>
        </header>

        {/* phone: the sheet runs edge to edge so the 18px reading column keeps its width */}
        <article className="-mx-4 border-y border-line bg-white px-4 py-6 sm:mx-0 sm:rounded-2xl sm:border sm:p-8 md:p-12">
          {article.imageUrl && (
            <div className="cover-frame mb-10 rounded-xl border border-line !bg-pearl-soft">
              <img src={article.imageUrl} alt={article.title} />
            </div>
          )}

          <div className="mx-auto max-w-[68ch]">
            {article.directAnswer && (
              <Callout title={<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">Quick Answer</span>} className="mb-10 !text-base !leading-7">
                <p className="text-ink">{article.directAnswer}</p>
              </Callout>
            )}

            <div className="max-w-none">
              {renderContent(article.content)}
            </div>

            <CalculatorCTA />

            {WEALTHSIMPLE_ARTICLE_SLUGS.includes(article.slug) && <WealthsimpleCTA />}

            {article.faq && article.faq.length > 0 && (
              <section className="mt-12 border-t border-line pt-10">
                <h2 className="mb-6 font-display text-[1.5rem] font-semibold text-ink md:text-[1.75rem]">Frequently Asked Questions</h2>
                <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                  {article.faq.map((item, index) => (
                    <details key={index} className="group bg-white">
                      <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold text-ink transition-colors hover:bg-pearl-soft ${FOCUS} focus-visible:outline-offset-[-2px]`}>
                        <span>{item.question}</span>
                        <span className="ml-3 flex-shrink-0 text-mute transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true">⌄</span>
                      </summary>
                      <div className="px-5 pb-5 text-base leading-7 text-ink-2">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12">
              <CalculatorLinksPanel article={article} />
            </div>

            <ArticleShareButtons slug={article.slug} title={article.title} excerpt={article.excerpt} />

            <Callout className="mt-8">
              <p>
                <strong className="text-ink">Disclaimer:</strong> This content is based on publicly available information and general tax knowledge for reference only. Individual tax situations may vary. Please consult a qualified tax professional or accountant for personalized advice.
              </p>
            </Callout>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-14 pb-16">
            <h2 className="mb-6 font-display text-2xl font-semibold text-ink md:text-[2rem]">Related Articles</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <a
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className={`group flex flex-col rounded-2xl border border-line bg-white p-5 text-left no-underline transition-colors duration-150 hover:border-ink-5 ${FOCUS}`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                    {categoryLabels[related.category]}
                  </span>
                  <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-red-600">
                    {related.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-3">
                    {related.excerpt}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
        {relatedArticles.length === 0 && <div className="pb-16" />}
      </main>

      <SiteFooter lang={siteLang} />
    </div>
  );
}
