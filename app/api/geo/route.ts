import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Returns the caller's coarse location — country code, region, and the
// CENTRE POINT of the city — so the calculator's telemetry can place a dot on
// a map. The IP address is read by the edge to resolve these and is never
// stored by us anywhere.
//
// Moved from Vercel's x-vercel-ip-* headers to Cloudflare's request.cf
// (2026-08-22). Same fields, same coarseness. Falls back to the cf-ipcountry
// header so a country still resolves if the richer object is unavailable.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let cf: Record<string, unknown> = {};
  try {
    cf = ((await getCloudflareContext({ async: true })).cf ?? {}) as Record<string, unknown>;
  } catch {
    // Local `next dev` without the Cloudflare runtime: no geo, not an error.
  }
  const h = request.headers;
  // During the DNS cutover both hosts serve this code for up to a day, so
  // the Vercel headers stay as a fallback until the old deployment is gone.
  let vercelCity: string | null = null;
  const rawCity = h.get('x-vercel-ip-city');
  if (rawCity) { try { vercelCity = decodeURIComponent(rawCity); } catch { vercelCity = rawCity; } }
  const country = (cf.country as string) || h.get('cf-ipcountry') || h.get('x-vercel-ip-country') || null;
  const region = (cf.regionCode as string) || (cf.region as string) || h.get('x-vercel-ip-country-region') || null;
  const city = (cf.city as string) || vercelCity || null;
  const lat = (cf.latitude ? parseFloat(String(cf.latitude)) : parseFloat(h.get('x-vercel-ip-latitude') || '')) || null;
  const lon = (cf.longitude ? parseFloat(String(cf.longitude)) : parseFloat(h.get('x-vercel-ip-longitude') || '')) || null;
  return NextResponse.json(
    { country, region, city, lat, lon },
    { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } },
  );
}
