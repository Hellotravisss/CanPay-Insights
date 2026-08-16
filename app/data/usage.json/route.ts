import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// A server route cannot borrow lib/supabase: that module is marked
// 'use client', so importing it here yields a stub whose .rpc is not a
// function — a 500 that only appears at runtime, never at build. The anon key
// is public by design (row-level security is what protects the data), so
// building a plain server-side client here is both correct and safe.
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csvauvgygdjgljgllter.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0.cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk',
  { auth: { persistSession: false } },
);

/**
 * The public, citable form of the usage dataset — what Canadians actually
 * check about their pay.
 *
 * The site already publishes computed take-home figures at /data. Those are
 * derived from published tax rates: useful, but anyone with the rates could
 * rebuild them. THIS is the part nobody else has, and until now it existed
 * only on a private dashboard, which a journalist cannot cite and a buyer
 * cannot evaluate.
 *
 * The response carries its own methodology in prose rather than a link. A
 * dataset travels away from the page that explains it — the internal monthly
 * snapshot names a repository file path, which means nothing once downloaded —
 * so the suppression rules, the self-selection warning, and what each field
 * actually measures all ride along inside the file.
 *
 * Cached for an hour: this is an aggregate that moves slowly, and a citable
 * URL should not depend on the database being reachable at the moment someone
 * fetches it.
 */
// Rendered on request, not at build time. Next tried to prerender this during
// the build, where the database is not reachable, and failed the whole build —
// a citable URL must not be able to take deployments down with it.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await db.rpc('public_usage_dataset');

  if (error || !data) {
    return NextResponse.json(
      { error: 'dataset temporarily unavailable', detail: error?.message ?? 'no data' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(data, {
    headers: {
      // CC BY 4.0 — reuse is the point, including by machines and other origins.
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Disposition': 'inline; filename="canpay-usage.json"',
      'X-License': 'CC-BY-4.0',
    },
  });
}
