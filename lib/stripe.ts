import Stripe from 'stripe';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Stripe on Cloudflare Workers. Two things differ from the Node default:
 * the HTTP client must be fetch-based, and webhook signatures must be
 * verified with WebCrypto (no Node `crypto`). Both are set here once so no
 * route has to remember.
 *
 * Secrets come from the Worker's bindings (`wrangler secret put` / the
 * dashboard), never from this file or the repo.
 */
async function env(): Promise<Record<string, string | undefined>> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as Record<string, string | undefined>;
  } catch {
    return process.env as Record<string, string | undefined>; // local next dev
  }
}

export async function stripeClient(): Promise<Stripe> {
  const e = await env();
  const key = e.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    // Pinned so a Stripe default-version change cannot alter payload shapes
    // under us. Bump deliberately, with the webhook endpoint's version.
    apiVersion: '2026-07-29.dahlia' as Stripe.LatestApiVersion,
  });
}

export async function webhookSecret(): Promise<string> {
  const e = await env();
  const s = e.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return s;
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();

export async function siteOrigin(): Promise<string> {
  const e = await env();
  return e.SITE_ORIGIN || 'https://canpayinsights.ca';
}
