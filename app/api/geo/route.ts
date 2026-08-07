import { NextResponse } from 'next/server';

// Returns the caller's coarse location from Vercel's edge geo headers.
// Country code + region only — the IP address is read by Vercel's edge to
// resolve these headers but is never stored by us anywhere.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const h = request.headers;
  const country = h.get('x-vercel-ip-country') || null;
  const region = h.get('x-vercel-ip-country-region') || null;
  return NextResponse.json(
    { country, region },
    { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
  );
}
