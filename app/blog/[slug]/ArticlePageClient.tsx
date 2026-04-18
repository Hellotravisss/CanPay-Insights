'use client';
import { useRouter } from 'next/navigation';
import ArticleView from '../../../src/content/components/ArticleView';

export default function ArticlePageClient({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <ArticleView
      slug={slug}
      onBack={() => router.push('/blog')}
      onSelectArticle={(s: string) => router.push(`/blog/${s}`)}
    />
  );
}
