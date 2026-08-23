import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripeClient, webhookSecret, cryptoProvider } from '../../../../lib/stripe';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { bracketIncome } from '../../../../lib/brackets';
import { buildRelocationReport, isProvince } from '../../../../lib/relocationReport';
import { renderRelocationPdf } from '../../../../lib/reportPdf';
import { sendReportEmail } from '../../../../lib/email';
import { siteOrigin } from '../../../../lib/stripe';

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

  // The PDF goes out from info@canpayinsights.ca with the permanent link.
  // Done inline, before responding: Cloudflare cancels work left running after
  // the response, and Stripe waits long enough for a 17 KB PDF and one send.
  // A failed send is logged, not retried — Stripe retrying the webhook would
  // only re-send the same email, and the customer already has the page.
  const email = s.customer_details?.email ?? s.customer_email ?? null;
  if (email && m.product === 'relocation' && isProvince(m.from) && isProvince(m.to) && Number.isFinite(income)) {
    try {
      const report = buildRelocationReport(m.from, m.to, income);
      const link = `${await siteOrigin()}/report/relocation?session_id=${s.id}`;
      const pdf = await renderRelocationPdf(report, link);
      const gap = report.netGapAnnual;
      const gapText = `${gap >= 0 ? '+' : '-'}$${Math.abs(gap).toLocaleString('en-CA')} a year`;
      await sendReportEmail({
        to: email,
        pdf,
        subject: `Your Province Move Report: ${m.from} to ${m.to}`,
        pdfName: `CanPay-Province-Move-${m.from.replace(/\s+/g, '')}-to-${m.to.replace(/\s+/g, '')}.pdf`,
        text: [
          `Your Province Move Report is attached as a PDF.`,
          ``,
          `${m.from} to ${m.to} on a $${income.toLocaleString('en-CA')} salary: ${gapText} in take-home pay.`,
          ``,
          `It is also online, permanently, at:`,
          link,
          ``,
          `Every figure is computed by the same tax engine as the free calculator. This is a calculation, not tax advice.`,
          ``,
          `CanPay Insights · canpayinsights.ca`,
        ].join('\n'),
        html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <p style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#dc2626;font-weight:700;margin:24px 0 6px">Province move report</p>
  <h1 style="font-size:22px;margin:0 0 6px">${m.from} &rarr; ${m.to}</h1>
  <p style="color:#64748b;margin:0 0 18px">On a $${income.toLocaleString('en-CA')} salary</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 18px;margin-bottom:18px">
    <div style="font-size:12px;font-weight:700;letter-spacing:.12em;color:#64748b">TAKE-HOME PAY AFTER THE MOVE</div>
    <div style="font-size:30px;font-weight:800;color:${gap >= 0 ? '#047857' : '#dc2626'};margin-top:4px">${gapText}</div>
  </div>
  <p>Your full report is attached as a PDF and lives permanently at<br><a href="${link}" style="color:#dc2626">${link}</a></p>
  <p style="color:#64748b;font-size:13px">Every figure is computed by the same tax engine as the free calculator. This is a calculation, not tax advice.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:28px">CanPay Insights · <a href="https://canpayinsights.ca" style="color:#94a3b8">canpayinsights.ca</a></p>
</div>`,
      });
    } catch (e) {
      console.error('report email failed', (e as Error).message);
    }
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
