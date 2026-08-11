export interface FAQ {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: 'tax' | 'salary' | 'province' | 'tips' | 'news';
  tags: string[];
  province?: string;
  publishedAt: string;
  /**
   * Set when an article's facts are refreshed. Kept separate from publishedAt so
   * a refresh does not quietly rewrite history — the original date stays true,
   * and dateModified in the schema tells search engines what actually changed.
   */
  updatedAt?: string;
  readTime: number;
  imageUrl?: string;
  directAnswer?: string;
  faq?: FAQ[];
  lang?: 'en' | 'fr';
}

export interface ArticleTopic {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  priority: number;
}
