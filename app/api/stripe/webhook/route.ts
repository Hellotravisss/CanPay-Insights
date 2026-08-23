import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripeClient, webhookSecret, cryptoProvider } from '../../../../lib/stripe';
import { db } from '../../../../lib/d1/db';
import { bracketIncome } from '../../../../lib/brackets';
import { buildRelocationReport, isProvince } from '../../../../lib/relocationReport';
import { renderRelocationPdf, renderOfferPdf } from '../../../../lib/reportPdf';
import { buildOfferReport, parseOffer } from '../../../../lib/offerReport';
import { sendReportEmail } from '../../../../lib/email';
import { siteOrigin } from '../../../../lib/stripe';

export const dynamic = 'force-dynamic';

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

  // Refunds flip the ledger row so the sales panel never counts money that
  // went back. Matched on payment intent, which both events carry.
  if (event.type === 'charge.refunded') {
    const ch = event.data.object as Stripe.Charge;
    const pi = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
    if (pi) await (await db()).prepare('update purchases set refunded = 1 where stripe_payment_intent = ?').bind(pi).run();
    return NextResponse.json({ received: true, refunded: !!pi });
  }
  if (event.type !== 'checkout.session.completed') return NextResponse.json({ ignored: event.type });

  const s = event.data.object as Stripe.Checkout.Session;
  if (s.payment_status !== 'paid') return NextResponse.json({ ignored: 'unpaid' });

  const m = s.metadata ?? {};
  const income = Number(m.income);

  // Ledger row in D1. Idempotent on session id, so a Stripe retry (or a
  // manual resend) never double-counts a sale.
  try {
    await (await db()).prepare(
      'insert into purchases (stripe_session_id, stripe_payment_intent, product, amount_cents, currency, email, lang, from_province, to_province, income_bracket) values (?,?,?,?,?,?,?,?,?,?) on conflict(stripe_session_id) do nothing',
    ).bind(
      s.id,
      typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null,
      m.product ?? 'unknown', s.amount_total ?? 0, s.currency ?? 'cad',
      s.customer_details?.email ?? s.customer_email ?? null, m.lang ?? null,
      m.from || null, m.to || null, Number.isFinite(income) ? bracketIncome(income) : null,
    ).run();
  } catch (e) {
    // 500 makes Stripe retry.
    return NextResponse.json({ error: `ledger write failed: ${(e as Error).message}` }, { status: 500 });
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

  if (email && m.product === 'offer-compare') {
    try {
      const a = parseOffer(JSON.parse(m.a ?? 'null'), 'Offer A'); const b = parseOffer(JSON.parse(m.b ?? 'null'), 'Offer B');
      if (a && b) {
        const report = buildOfferReport(a, b);
        const link = `${await siteOrigin()}/report/offer?session_id=${s.id}`;
        const pdf = await renderOfferPdf(report, link);
        const gap = report.gap.total;
        const headline = report.winner === 'tie' ? 'Effectively a tie' : `${gap >= 0 ? '+' : '-'}$${Math.abs(gap).toLocaleString('en-CA')} a year for ${report.winner === 'b' ? 'Offer B' : 'Offer A'}`;
        await sendReportEmail({
          to: email, pdf, pdfName: 'CanPay-Offer-Comparison.pdf',
          subject: `Your Offer Comparison: ${a.province} vs ${b.province}`,
          text: `Your Offer Comparison is attached as a PDF.\n\nTotal package after tax: ${headline}.\n\nIt is also online, permanently, at:\n${link}\n\nEvery figure is computed by the same tax engine as the free calculator. This is a calculation, not advice.\n\nCanPay Insights · canpayinsights.ca`,
          html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <p style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#dc2626;font-weight:700;margin:24px 0 6px">Offer comparison</p>
  <h1 style="font-size:22px;margin:0 0 6px">$${a.salary.toLocaleString('en-CA')} in ${a.province} vs $${b.salary.toLocaleString('en-CA')} in ${b.province}</h1>
  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:16px 18px;margin:18px 0">
    <div style="font-size:12px;font-weight:700;letter-spacing:.12em;color:#64748b">TOTAL PACKAGE, AFTER TAX</div>
    <div style="font-size:26px;font-weight:800;color:#047857;margin-top:4px">${headline}</div>
  </div>
  <p>Your full comparison is attached as a PDF and lives permanently at<br><a href="${link}" style="color:#dc2626">${link}</a></p>
  <p style="color:#64748b;font-size:13px">Every figure is computed by the same tax engine as the free calculator. This is a calculation, not advice.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:28px">CanPay Insights · <a href="https://canpayinsights.ca" style="color:#94a3b8">canpayinsights.ca</a></p>
</div>`,
        });
      }
    } catch (e) { console.error('offer email failed', (e as Error).message); }
  }

  return NextResponse.json({ received: true });
}
