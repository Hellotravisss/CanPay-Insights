import { NextResponse } from 'next/server';

// Returns the caller's coarse location from Vercel's edge geo headers.
// Country code + region only — the IP address is read by Vercel's edge to
// resolve these headers but is never stored by us anywhere.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const h = request.headers;
  const country = h.get('x-vercel-ip-country') || null;
  const region = h.get('x-vercel-ip-country-region') || null;
  // Vercel URI-encodes the city header (e.g. "S%C3%A3o%20Paulo").
  const rawCity = h.get('x-vercel-ip-city');
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  // City-centroid coordinates (same geo DB as the city name — the city's
  // center point, not the user's position). Powers heat-map visualizations.
  const lat = parseFloat(h.get('x-vercel-ip-latitude') || '') || null;
  const lon = parseFloat(h.get('x-vercel-ip-longitude') || '') || null;
  return NextResponse.json(
    { country, region, city, lat, lon },
    { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
  );
}
