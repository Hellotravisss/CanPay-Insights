'use client';
import React, { useState, useEffect } from 'react';
import { allArticles } from '../articles-data';
import type { Article } from '../types';

interface BlogListProps {
  onSelectArticle: (slug: string) => void;
}

const categories = [
  { id: 'all', label: 'All Articles', color: 'bg-slate-600' },
  { id: 'salary', label: 'Salary Insights', color: 'bg-blue-600' },
  { id: 'province', label: 'Provincial Guides', color: 'bg-green-600' },
  { id: 'tips', label: 'Money Tips', color: 'bg-amber-600' },
  { id: 'tax', label: 'Tax Guides', color: 'bg-red-600' },
];

const BlogList: React.FC<BlogListProps> = ({ onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(allArticles);
  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(allArticles);
    } else {
      setFilteredArticles(allArticles.filter(a => a.category === selectedCategory));
    }
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-slate-600';
  };

  const getCategoryCount = (categoryId: string) => {
    return categoryId === 'all'
      ? allArticles.length
      : allArticles.filter((article) => article.category === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header + Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="/blog" className="inline-flex items-center gap-3 no-underline">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-10 w-10 rounded-xl object-contain shadow-sm shadow-red-100" />
              <span className="text-lg font-bold text-slate-950">CanPay Insights</span>
            </a>
            <a
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 no-underline shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5M5 10v10h14V10" />
              </svg>
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

      {/* Category Filter */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white shadow-md`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
                <span className="ml-2 opacity-70">{getCategoryCount(cat.id)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              {selectedCategory === 'all' ? 'Latest guides' : getCategoryLabel(selectedCategory)}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'} available
            </p>
          </div>
        </div>

        {featuredArticle && (
          <a
            href={`/blog/${featuredArticle.slug}`}
            onClick={(event) => {
              event.preventDefault();
              onSelectArticle(featuredArticle.slug);
            }}
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
              <h3 className="text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-600 md:text-3xl">
                {featuredArticle.title}
              </h3>
              <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">
                {featuredArticle.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm font-medium text-slate-400">
                <span>{formatDate(featuredArticle.publishedAt)}</span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {featuredArticle.readTime} min read
                </span>
              </div>
            </div>
          </a>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {remainingArticles.map((article) => (
            <a
              key={article.id}
              href={`/blog/${article.slug}`}
              onClick={(event) => {
                event.preventDefault();
                onSelectArticle(article.slug);
              }}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white text-left no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Article Image */}
              {article.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-5">
                {/* Category Badge */}
                <span className={`mb-3 inline-flex rounded-md px-2.5 py-1 ${getCategoryColor(article.category)} text-xs font-bold text-white`}>
                  {getCategoryLabel(article.category)}
                </span>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-600">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-600">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {article.readTime} min read
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-8 border-t border-slate-200 bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-950">Want More Precise Calculations?</h2>
          <p className="mb-6 text-slate-600">
            Use the CanPay Insights calculator to get personalized tax analysis and salary projections based on your specific situation.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white no-underline shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate My Salary
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogList;
