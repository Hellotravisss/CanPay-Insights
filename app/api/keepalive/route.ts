import { NextResponse } from 'next/server';

// Keeps the Supabase free-tier project from auto-pausing after 7 days of no
// requests. Anonymous page views do NOT touch Supabase (the client reads the
// session from localStorage without a network call), so with few active users
// the project could otherwise go idle. A Vercel cron hits this once a day.
export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csvauvgygdjgljgllter.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0.cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk';

async function ping(path: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}${path}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cache: 'no-store',
    });
    return res.status;
  } catch {
    return 0;
  }
}

export async function GET(request: Request) {
  // If CRON_SECRET is configured in Vercel, require it (Vercel cron sends it
  // automatically). Without it configured, the endpoint stays open but harmless.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  // Touch both services so the project registers real activity:
  // GoTrue (auth) and PostgREST (database).
  const [auth, db] = await Promise.all([
    ping('/auth/v1/health'),
    ping('/rest/v1/user_settings?select=user_id&limit=1'),
  ]);

  const ok = auth === 200 && db > 0;
  return NextResponse.json(
    { ok, auth, db, at: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
