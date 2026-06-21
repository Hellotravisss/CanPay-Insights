import type { MetadataRoute } from 'next';

// AI answer-engine crawlers we explicitly welcome (GEO). Being citable by
// ChatGPT, Perplexity, Gemini, Claude, Copilot, and Apple Intelligence requires
// that their bots are allowed to read the site. '*' already allows them, but
// listing them makes the intent explicit and future-proof.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI / ChatGPT search
  'Google-Extended', // Gemini & AI Overviews grounding
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'ClaudeBot', 'Claude-User', 'anthropic-ai', // Claude
  'Applebot-Extended', // Apple Intelligence
  'CCBot', // Common Crawl (feeds many open LLMs)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: '/api/' })),
    ],
    sitemap: 'https://canpayinsights.ca/sitemap.xml',
    host: 'https://canpayinsights.ca',
  };
}
