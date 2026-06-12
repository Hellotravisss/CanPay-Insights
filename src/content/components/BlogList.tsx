import { allArticles } from '../articles-data';
import type { Article } from '../types';

const categories = [
  { id: 'all', label: 'All Articles', color: 'bg-slate-600' },
  { id: 'salary', label: 'Salary Insights', color: 'bg-blue-600' },
  { id: 'province', label: 'Provincial Guides', color: 'bg-green-600' },
  { id: 'tips', label: 'Money Tips', color: 'bg-amber-600' },
  { id: 'tax', label: 'Tax Guides', color: 'bg-red-600' },
];

const formatDate = (dateString: string) => {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getCategoryLabel = (categoryId: string) => {
  return categories.find((category) => category.id === categoryId)?.label || categoryId;
};

const getCategoryColor = (categoryId: string) => {
  return categories.find((category) => category.id === categoryId)?.color || 'bg-slate-600';
};

const getCategoryCount = (categoryId: string) => {
  return categoryId === 'all'
    ? allArticles.length
    : allArticles.filter((article) => article.category === categoryId).length;
};

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <a
      href={`/blog/${article.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white text-left no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {article.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-5">
        <span className={`mb-3 inline-flex rounded-md px-2.5 py-1 ${getCategoryColor(article.category)} text-xs font-bold text-white`}>
          {getCategoryLabel(article.category)}
        </span>
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-600">
          {article.title}
        </h3>
        <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-600">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span>{article.readTime} min read</span>
        </div>
      </div>
    </a>
  );
};

export default function BlogList() {
  const featuredArticle = allArticles[0];
  const remainingArticles = allArticles.slice(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="/blog" className="inline-flex items-center gap-3 no-underline">
              <img src="/logo.png" alt="CanPay Insights" className="h-10 w-10 rounded-xl object-contain shadow-sm shadow-red-100" />
              <span className="text-lg font-bold text-slate-950">CanPay Insights</span>
            </a>
            <a
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 no-underline shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
            >
              Back to Calculator
            </a>
          </div>

          <div className="grid gap-6 py-8 md:grid-cols-[1fr_24rem] md:items-end md:py-10">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-red-600">Insights Hub</p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
                Canadian payroll, tax, and take-home pay guides.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
                Practical articles for comparing job offers, provinces, deductions, and salary decisions in Canada.
              </p>
            </div>

            <a
              href="/compare-provinces"
              className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <h2 className="text-xl font-bold text-slate-950">Compare provinces</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                See take-home pay differences before moving or accepting an offer.
              </p>
              <span className="mt-4 inline-flex text-sm font-bold text-blue-700 transition-transform group-hover:translate-x-1">
                Open tool →
              </span>
            </a>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white" aria-label="Blog categories">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={category.id === 'all' ? '/blog' : `/blog#${category.id}`}
                className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 no-underline hover:bg-slate-200"
              >
                {category.label}
                <span className="ml-2 opacity-70">{getCategoryCount(category.id)}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Latest guides</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{allArticles.length} articles available</p>
          </div>
        </div>

        {featuredArticle && (
          <a
            href={`/blog/${featuredArticle.slug}`}
            className="group mb-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white text-left no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[1.05fr_0.95fr]"
          >
            {featuredArticle.imageUrl && (
              <div className="h-56 overflow-hidden md:h-full">
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col justify-center p-6 md:p-8">
              <span className={`mb-4 inline-flex w-fit rounded-lg px-3 py-1.5 ${getCategoryColor(featuredArticle.category)} text-xs font-bold uppercase tracking-[0.08em] text-white`}>
                Featured · {getCategoryLabel(featuredArticle.category)}
              </span>
              <h2 className="text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-600 md:text-3xl">
                {featuredArticle.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">
                {featuredArticle.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm font-medium text-slate-400">
                <span>{formatDate(featuredArticle.publishedAt)}</span>
                <span>{featuredArticle.readTime} min read</span>
              </div>
            </div>
          </a>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="All articles">
          {remainingArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>

        {categories.filter((category) => category.id !== 'all').map((category) => {
          const articles = allArticles.filter((article) => article.category === category.id);
          if (articles.length === 0) {
            return null;
          }

          return (
            <section key={category.id} id={category.id} className="mt-12 scroll-mt-20">
              <h2 className="mb-5 text-2xl font-bold text-slate-950">{category.label}</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={`${category.id}-${article.id}`} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-8 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-950">Want More Precise Calculations?</h2>
          <p className="mb-6 text-slate-600">
            Use the CanPay Insights calculator to get personalized tax analysis and salary projections based on your specific situation.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white no-underline shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
          >
            Calculate My Salary
          </a>
        </div>
      </section>
    </main>
  );
}
