import ArticleView from '../../../src/content/components/ArticleView';

export default function ArticlePageClient({ slug }: { slug: string }) {
  return <ArticleView slug={slug} />;
}
