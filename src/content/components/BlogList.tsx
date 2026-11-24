'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../../lib/i18n';
import PreferredSource from '../../../components/PreferredSource';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import { PageHero, Card, ButtonLink } from '../../../components/site/ui';

/**
 * Client component so the chrome follows the language switcher — but it is
 * handed a TRIMMED list by the server. The article modules are 232 KB and
 * carry full markdown bodies this page never renders; importing them here
 * would ship every word of every article to every visitor in order to
 * translate five headings. The server picks the eight fields the cards use.
 */
export type BlogCard = {
  id: string; slug: string; title: string; excerpt: string;
  category: string; publishedAt: string; readTime: number; imageUrl?: string;
};

// 2026-11: categories are plain labels (no colour per category); the chips are white pills, the active one ink.
const CATEGORY_KEYS = [
  { id: 'all', key: 'blog.catAll' },
  { id: 'salary', key: 'blog.catSalary' },
  { id: 'province', key: 'blog.catProvince' },
  { id: 'tips', key: 'blog.catTips' },
  { id: 'tax', key: 'blog.catTax' },
];

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600';
const COVER_IMG =
  'transition-transform duration-[320ms] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100';

const formatDate = (dateString: string) => {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getCategoryLabel = (categoryId: string, t: (k: string) => string) => {
  const c = CATEGORY_KEYS.find((x) => x.id === categoryId);
  return c ? t(c.key) : categoryId;
};

const getCategoryCount = (articles: BlogCard[], categoryId: string) => {
  return categoryId === 'all'
    ? articles.length
    : articles.filter((article) => article.category === categoryId).length;
};

/** date · read time, in mute tabular figures */
const Meta = ({ article, className = '' }: { article: BlogCard; className?: string }) => (
  <div className={`flex items-center justify-between gap-3 font-medium tabular-nums text-mute ${className}`}>
    <span>{formatDate(article.publishedAt)}</span>
    <span>{article.readTime} min read</span>
  </div>
);

const ArticleCard = ({ article, t }: { article: BlogCard; t: (k: string) => string }) => {
  return (
    <a
      href={`/blog/${article.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-left no-underline transition-colors duration-150 hover:border-ink-5 ${FOCUS}`}
    >
      {article.imageUrl && (
        <div className="cover-frame border-b border-line !bg-pearl-soft">
          <img src={article.imageUrl} alt={article.title} className={COVER_IMG} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
          {getCategoryLabel(article.category, t)}
        </span>
        <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-red-600">
          {article.title}
        </h3>
        <p className="mb-5 line-clamp-2 text-sm leading-6 text-ink-3">
          {article.excerpt}
        </p>
        <Meta article={article} className="mt-auto border-t border-line pt-4 text-xs" />
      </div>
    </a>
  );
};

export default function BlogList({ articles }: { articles: BlogCard[] }) {
  const { t, lang } = useT();
  const siteLang = lang === 'zh' ? 'zh' : lang === 'fr' ? 'fr' : 'en';
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  // Which chip is "on": the category named in the URL hash, otherwise "all".
  const [active, setActive] = useState('all');
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace('#', '');
      setActive(CATEGORY_KEYS.some((c) => c.id === h) ? h : 'all');
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  return (
    <div className="min-h-screen bg-pearl">
      <SiteHeader lang={siteLang} current="guides" />

      <main className="mx-auto max-w-6xl px-4" role="main">
        <div className="grid md:grid-cols-[1fr_22rem] md:items-end md:gap-10">
          <PageHero
            eyebrow={t('blog.kicker')}
            title={t('blog.h1')}
            lead={
              <>
                Practical articles for comparing job offers, provinces, deductions, and salary decisions in
                Canada — plus what changes to tax and benefit rules mean for your paycheque, twice a week.
              </>
            }
          />

          {/* tool card */}
          <a
            href="/compare-provinces"
            className={`group mb-8 block rounded-2xl border border-line bg-white p-5 text-left no-underline transition-colors duration-150 hover:border-ink-5 md:mb-12 ${FOCUS}`}
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-pearl-soft text-ink">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <h2 className="font-display text-xl font-semibold text-ink">{t('blog.compareTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-3">
              {t('blog.compareBody')}
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-red-600 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none">
              Open tool →
            </span>
          </a>
        </div>

        <nav className="border-y border-line py-4" aria-label="Blog categories">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORY_KEYS.map((category) => {
              const on = active === category.id;
              return (
                <a
                  key={category.id}
                  href={category.id === 'all' ? '/blog' : `/blog#${category.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium no-underline transition-colors duration-150 ${FOCUS} ${
                    on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2 hover:border-ink-5'
                  }`}
                >
                  {t(category.key)}
                  <span className={`ml-2 tabular-nums ${on ? 'text-pearl-shade' : 'text-mute'}`}>{getCategoryCount(articles, category.id)}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="py-10">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">{t('blog.latest')}</h2>
            <p className="mt-1 text-sm font-medium tabular-nums text-mute">{t('blog.count').replace('{n}', String(articles.length))}</p>
          </div>

          {featuredArticle && (
            <a
              href={`/blog/${featuredArticle.slug}`}
              className={`group mb-6 grid overflow-hidden rounded-2xl border border-line bg-white text-left no-underline transition-colors duration-150 hover:border-ink-5 md:grid-cols-[1.15fr_0.85fr] ${FOCUS}`}
            >
              {featuredArticle.imageUrl && (
                <div className="cover-frame cover-frame-featured border-b border-line !bg-pearl-soft md:border-b-0 md:border-r">
                  <img src={featuredArticle.imageUrl} alt={featuredArticle.title} className={COVER_IMG} />
                </div>
              )}
              <div className="flex flex-col justify-center p-6 md:p-10">
                <span className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">
                  Featured · {getCategoryLabel(featuredArticle.category, t)}
                </span>
                <h2 className="font-display text-2xl font-semibold leading-[1.15] text-ink transition-colors group-hover:text-red-600 md:text-[2rem]">
                  {featuredArticle.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-base leading-7 text-ink-3">
                  {featuredArticle.excerpt}
                </p>
                <Meta article={featuredArticle} className="mt-6 border-t border-line pt-4 text-sm" />
              </div>
            </a>
          )}

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="All articles">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} t={t} />
            ))}
          </section>

          {CATEGORY_KEYS.filter((category) => category.id !== 'all').map((category) => {
            const inCategory = articles.filter((article) => article.category === category.id);
            if (inCategory.length === 0) {
              return null;
            }

            return (
              <section key={category.id} id={category.id} className="mt-14 scroll-mt-24 border-t border-line pt-10">
                <h2 className="mb-6 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">{t(category.key)}</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {inCategory.map((article) => (
                    <ArticleCard key={`${category.id}-${article.id}`} article={article} t={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Card className="mb-10 px-6 py-10 text-center md:py-12">
          <h2 className="mb-3 font-display text-2xl font-semibold text-ink md:text-[2rem]">{t('blog.ctaTitle')}</h2>
          <p className="mx-auto mb-6 max-w-xl text-ink-3">
            {t('blog.ctaBody')}
          </p>
          <ButtonLink href="/">{t('blog.ctaBtn')}</ButtonLink>
        </Card>
      </main>

      <PreferredSource />

      <SiteFooter lang={siteLang} />
    </div>
  );
}
