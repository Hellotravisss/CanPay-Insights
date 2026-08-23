import { NextResponse } from 'next/server';
import { stripeClient, siteOrigin } from '../../../lib/stripe';
import { PRODUCTS, isProductKey } from '../../../lib/products';
import { parseOffer } from '../../../lib/offerReport';
import { isProvince } from '../../../lib/relocationReport';

export const dynamic = 'force-dynamic';

/**
 * Creates a Stripe Checkout Session and returns its URL.
 *
 * The report's inputs ride along as session metadata, so the report page can
 * rebuild the report from the session alone — no database lookup, no login,
 * and a link that keeps working for as long as Stripe keeps the session.
 * Income is stored to the dollar here because the buyer asked for a report
 * about their own number; it never enters the anonymous dataset.
 *
 * Stripe collects the email on its own page; we never see a card.
 */
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (e) {
    // A thrown error (missing secret, Stripe outage) must still come back as
    // JSON the button can show, never an empty 500.
    console.error('checkout failed', (e as Error).message);
    return NextResponse.json({ error: 'Payments are unavailable right now. Please try again in a few minutes.' }, { status: 503 });
  }
}

async function handle(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const { product, from, to, income, lang } = body;
  if (!isProductKey(product)) return NextResponse.json({ error: 'unknown product' }, { status: 400 });

  let annual = Number(income);
  let offerMeta: Record<string, string> = {};
  let description = PRODUCTS[product].description;
  if (product === 'relocation') {
    if (!Number.isFinite(annual) || annual < 1000 || annual > 5_000_000) return NextResponse.json({ error: 'income out of range' }, { status: 400 });
    if (!isProvince(from) || !isProvince(to)) return NextResponse.json({ error: 'bad province' }, { status: 400 });
    if (from === to) return NextResponse.json({ error: 'same province' }, { status: 400 });
    description = `${from} → ${to}`;
  } else if (product === 'offer-compare') {
    const a = parseOffer(body.a, 'Offer A'); const b = parseOffer(body.b, 'Offer B');
    if (!a || !b) return NextResponse.json({ error: 'both offers need a salary and a province' }, { status: 400 });
    annual = a.salary;
    // Stripe metadata values are capped at 500 chars; each offer is ~120.
    offerMeta = { a: JSON.stringify(a), b: JSON.stringify(b) };
    description = `${a.province} $${Math.round(a.salary).toLocaleString('en-CA')} vs ${b.province} $${Math.round(b.salary).toLocaleString('en-CA')}`;
  }

  const p = PRODUCTS[product];
  const origin = await siteOrigin();
  const stripe = await stripeClient();
  const locale = lang === 'fr' ? 'fr-CA' : lang === 'zh' ? 'zh' : 'en';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: p.currency,
          unit_amount: p.amountCents,
          product_data: {
            name: p.name,
            description,
          },
        },
      },
    ],
    metadata: {
      product,
      from: String(from ?? ''),
      to: String(to ?? ''),
      income: String(Math.round(annual)),
      lang: String(lang ?? 'en'),
      ...offerMeta,
    },
    // Card statements show the account descriptor (CANPAY INSIGHTS) with a
    // product suffix, so the charge is recognisable a month later.
    payment_intent_data: { statement_descriptor_suffix: product === 'relocation' ? 'MOVE REPORT' : 'OFFER REPORT' },
    success_url: `${origin}/report/${product === 'relocation' ? 'relocation' : 'offer'}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) return NextResponse.json({ error: 'no checkout url' }, { status: 502 });
  return NextResponse.json({ url: session.url });
}
