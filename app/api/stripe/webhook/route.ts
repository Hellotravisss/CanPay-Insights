import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripeClient, webhookSecret, cryptoProvider } from '../../../../lib/stripe';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { bracketIncome } from '../../../../lib/brackets';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csvauvgygdjgljgllter.supabase.co';
const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0.cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk';

/**
 * Stripe → purchase ledger.
 *
 * Access to a report is NOT granted here: the report page re-verifies the
 * session with Stripe on every open, so a delayed or dropped webhook can
 * never lock a paying customer out. This handler only writes the ledger row
 * used for support, refunds, and the sales panel in the data room.
 *
 * Signature verification uses WebCrypto — the Node-only default would throw
 * on Workers. An unverifiable body is rejected with 400 so Stripe retries.
 */
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing signature' }, { status: 400 });

  const raw = await request.text();
  const stripe = await stripeClient();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, await webhookSecret(), undefined, cryptoProvider);
  } catch (e) {
    return NextResponse.json({ error: `bad signature: ${(e as Error).message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') return NextResponse.json({ ignored: event.type });

  const s = event.data.object as Stripe.Checkout.Session;
  if (s.payment_status !== 'paid') return NextResponse.json({ ignored: 'unpaid' });

  const m = s.metadata ?? {};
  const income = Number(m.income);
  const token = await ingestToken();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_purchase`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    body: JSON.stringify({
      p_token: token,
      p_session: s.id,
      p_intent: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null,
      p_product: m.product ?? 'unknown',
      p_amount: s.amount_total ?? 0,
      p_currency: s.currency ?? 'cad',
      p_email: s.customer_details?.email ?? s.customer_email ?? null,
      p_lang: m.lang ?? null,
      p_from: m.from || null,
      p_to: m.to || null,
      p_bracket: Number.isFinite(income) ? bracketIncome(income) : null,
    }),
  });

  if (!res.ok) {
    // 500 makes Stripe retry; the RPC is idempotent on session id.
    return NextResponse.json({ error: `ledger write failed: ${res.status}` }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function ingestToken(): Promise<string> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const t = (env as unknown as Record<string, string | undefined>).STRIPE_INGEST_TOKEN;
    if (t) return t;
  } catch {
    /* local dev */
  }
  const t = process.env.STRIPE_INGEST_TOKEN;
  if (!t) throw new Error('STRIPE_INGEST_TOKEN is not configured');
  return t;
}
