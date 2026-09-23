export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  directAnswer?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: 'salary' | 'province' | 'tips';
  tags: string[];
  province: string;
  publishedAt: string;
  readTime: number;
  imageUrl: string;
  content: string;
  faq?: { question: string; answer: string }[];
}

export const tipsArticles: Article[] = [
];


