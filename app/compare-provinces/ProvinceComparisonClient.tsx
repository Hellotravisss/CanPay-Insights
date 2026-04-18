'use client';
import { useRouter } from 'next/navigation';
import ProvinceComparison from '../../src/content/components/ProvinceComparison';

export default function ProvinceComparisonClient() {
  const router = useRouter();
  return <ProvinceComparison onBackToBlog={() => router.push('/blog')} />;
}
