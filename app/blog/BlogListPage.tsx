'use client';
import { useRouter } from 'next/navigation';
import BlogList from '../../src/content/components/BlogList';

export default function BlogListPage() {
  const router = useRouter();
  return (
    <BlogList
      onSelectArticle={(slug: string) => router.push(`/blog/${slug}`)}
    />
  );
}
