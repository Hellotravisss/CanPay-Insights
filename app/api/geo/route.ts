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
  const country = (cf.country as string) || request.headers.get('cf-ipcountry') || null;
  const region = (cf.regionCode as string) || (cf.region as string) || null;
  const city = (cf.city as string) || null;
  const lat = cf.latitude ? parseFloat(String(cf.latitude)) || null : null;
  const lon = cf.longitude ? parseFloat(String(cf.longitude)) || null : null;
  return NextResponse.json(
    { country, region, city, lat, lon },
    { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } },
  );
}
