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
  readTime: number;
  imageUrl?: string;
  directAnswer?: string;
  faq?: FAQ[];
}

export interface ArticleTopic {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  priority: number;
}
