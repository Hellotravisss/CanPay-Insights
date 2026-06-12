'use client';

import { useState } from 'react';

interface ArticleShareButtonsProps {
  slug: string;
  title: string;
  excerpt: string;
}

export default function ArticleShareButtons({ slug, title, excerpt }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://canpayinsights.ca/blog/${slug}`;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const description = encodeURIComponent(excerpt);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}&via=CanPayInsights`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${description}%0A%0A${url}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const shareOptions = [
    { name: 'X', platform: 'twitter' },
    { name: 'Facebook', platform: 'facebook' },
    { name: 'LinkedIn', platform: 'linkedin' },
    { name: 'WhatsApp', platform: 'whatsapp' },
    { name: 'Reddit', platform: 'reddit' },
    { name: 'Email', platform: 'email' },
  ];

  return (
    <div className="my-8 border-y border-slate-200 py-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h4 className="font-semibold text-slate-800">Share this article</h4>
          <p className="text-sm text-slate-500">Help others learn about Canadian taxes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {shareOptions.map((option) => (
            <button
              key={option.platform}
              type="button"
              onClick={() => handleShare(option.platform)}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label={`Share on ${option.name}`}
            >
              {option.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleShare('copy')}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
