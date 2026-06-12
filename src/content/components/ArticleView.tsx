import type { JSX } from 'react';
import { allArticles, getArticleBySlug } from '../articles-data';
import type { Article } from '../types';
import ArticleShareButtons from './ArticleShareButtons';

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
    { href: '/65000-after-tax-ontario', label: '$65,000 after tax Ontario', description: 'A common job-offer salary check for Ontario workers.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'See whether the same salary goes further in another province.' },
  ],
  'British Columbia': [
    { href: '/bc-paycheck-calculator', label: 'BC paycheck calculator', description: 'Estimate BC take-home pay for Vancouver, Victoria, and across BC.' },
    { href: '/70000-after-tax-bc', label: '$70,000 after tax BC', description: 'A quick salary-after-tax page for BC job offers.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'Compare BC with Ontario, Alberta, Quebec, and more.' },
  ],
  Alberta: [
    { href: '/alberta-paycheck-calculator', label: 'Alberta paycheck calculator', description: 'Estimate Alberta net pay and deductions.' },
    { href: '/80000-after-tax-alberta', label: '$80,000 after tax Alberta', description: 'Check a common Alberta salary against take-home pay.' },
    { href: '/compare-provinces', label: 'Compare provinces', description: 'Compare Alberta take-home pay with other provinces.' },
  ],
  Quebec: [
    { href: '/quebec-paycheck-calculator', label: 'Quebec paycheck calculator', description: 'Estimate Quebec take-home pay with province-specific deductions.' },
    { href: '/fr/calculateur-salaire-net-quebec', label: 'Calculateur salaire net Québec', description: 'French Quebec salary and payroll estimate page.' },
    { href: '/100000-after-tax-quebec', label: '$100,000 after tax Quebec', description: 'A common high-intent Quebec salary search.' },
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
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-600 underline hover:text-red-700">$1</a>');
    return { __html: withFormatting };
  };

  const flushTable = () => {
    if (tableRows.length === 0) {
      return;
    }

    const header = tableRows[0];
    const body = tableRows.slice(1);
    elements.push(
      <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              {header.map((cell, index) => (
                <th key={index} className="border border-slate-300 px-4 py-2 text-left text-sm font-bold">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-slate-300 px-4 py-2 text-sm">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
      <ListTag key={`list-${elements.length}`} className={`my-4 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside space-y-2 text-slate-600`}>
        {listItems.map((item, index) => (
          <li key={index} className="ml-4" dangerouslySetInnerHTML={renderInlineHtml(item)} />
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
      elements.push(<h1 key={index} className="mb-4 mt-8 text-3xl font-bold text-slate-900">{trimmed.substring(2)}</h1>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={index} className="mb-4 mt-8 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-800">{trimmed.substring(3)}</h2>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={index} className="mb-3 mt-6 text-xl font-bold text-slate-700">{trimmed.substring(4)}</h3>);
    } else if (trimmed === '---') {
      elements.push(<hr key={index} className="my-6 border-slate-200" />);
    } else if (trimmed !== '') {
      elements.push(<p key={index} className="my-4 leading-relaxed text-slate-600" dangerouslySetInnerHTML={renderInlineHtml(trimmed)} />);
    }
  });

  flushList();
  flushTable();

  return elements;
};

const CalculatorCTA = () => {
  return (
    <div className="my-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-white">
      <h2 className="mb-2 text-xl font-bold">Calculate Your Take-Home Pay</h2>
      <p className="mb-4 text-sm text-red-100">
        Enter your salary and province to see detailed tax breakdowns instantly.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-red-600 no-underline transition-colors hover:bg-red-50"
      >
        Use Free Calculator
      </a>
    </div>
  );
};

const CalculatorLinksPanel = ({ article }: { article: Article }) => {
  const calculatorLinks = getCalculatorLinks(article);

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="mb-3 text-lg font-bold text-slate-900">Useful calculators for this guide</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {calculatorLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-lg border border-slate-200 bg-white p-4 no-underline transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <h3 className="text-sm font-bold text-slate-900">{link.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Article Not Found</h1>
          <p className="mb-4 text-slate-500">This article may have been removed or does not exist.</p>
          <a href="/blog" className="font-medium text-red-600 hover:underline">
            Back to Articles
          </a>
        </div>
      </main>
    );
  }

  const relatedArticles = getRelatedArticles(article);
  const categoryLabel = categoryLabels[article.category] || article.category;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
            <a href="/blog" className="no-underline hover:text-red-600">
              Tax Guides
            </a>
            <span>/</span>
            <span className="text-slate-800">{categoryLabel}</span>
          </nav>

          <span className="mb-4 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {categoryLabel}
          </span>

          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mb-6 text-xl text-slate-600">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.province && <span className="rounded bg-slate-100 px-2 py-1">{article.province}</span>}
            <span>{article.readTime} min read</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {article.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-64 w-full object-cover"
              />
            </div>
          )}

          {article.directAnswer && (
            <div className="mb-8 rounded-xl border border-red-100/70 bg-red-50/50 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">Quick Answer</p>
              <p className="text-base leading-relaxed text-slate-800">{article.directAnswer}</p>
            </div>
          )}

          <CalculatorLinksPanel article={article} />
          <CalculatorCTA />

          <div className="prose prose-slate max-w-none">
            {renderContent(article.content)}
          </div>

          {article.faq && article.faq.length > 0 && (
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {article.faq.map((item, index) => (
                  <details key={index} className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-slate-800 transition-colors hover:bg-slate-100">
                      <span>{item.question}</span>
                      <span className="ml-3 flex-shrink-0 text-slate-400 group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <ArticleShareButtons slug={article.slug} title={article.title} excerpt={article.excerpt} />
          <CalculatorCTA />

          <div className="mt-8 rounded-xl border border-yellow-100/60 bg-yellow-50/50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This content is based on publicly available information and general tax knowledge for reference only. Individual tax situations may vary. Please consult a qualified tax professional or accountant for personalized advice.
            </p>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">Related Articles</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <a
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 text-left no-underline transition-shadow hover:shadow-md"
                >
                  <span className="text-xs font-medium uppercase text-red-600">
                    {categoryLabels[related.category]}
                  </span>
                  <h3 className="mt-1 line-clamp-2 font-bold text-slate-800">
                    {related.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {related.excerpt}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <a href="/blog" className="inline-flex items-center gap-2 font-medium text-red-600 no-underline hover:text-red-700">
            ← View All Articles
          </a>
        </div>
      </div>
    </main>
  );
}
