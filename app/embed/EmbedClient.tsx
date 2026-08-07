'use client';
import { useEffect, useState } from 'react';
import EmbedCalculator from '../../components/EmbedCalculator';

// Reads ?province=ON&lang=fr from the iframe URL after mount (keeps the page
// statically prerenderable — no dynamic rendering needed). The `key` remounts
// the calculator once params arrive so its initial state picks them up.
export default function EmbedClient() {
  const [params, setParams] = useState<{ province?: string; lang?: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setParams({
      province: q.get('province') ?? undefined,
      lang: q.get('lang') ?? undefined,
    });
  }, []);

  if (!params) return null;
  return (
    <EmbedCalculator
      key={`${params.province ?? ''}|${params.lang ?? ''}`}
      initialProvince={params.province}
      initialLang={params.lang}
    />
  );
}
