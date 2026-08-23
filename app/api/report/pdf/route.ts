import { stripeClient } from '../../../../lib/stripe';
import { buildRelocationReport, isProvince } from '../../../../lib/relocationReport';
import { renderRelocationPdf, renderOfferPdf } from '../../../../lib/reportPdf';
import { buildOfferReport, parseOffer } from '../../../../lib/offerReport';

export const dynamic = 'force-dynamic';

/**
 * On-demand PDF for a paid session. Same proof of purchase as the report
 * page: the session is fetched from Stripe and must be paid. No database,
 * no login — the unguessable session id is the ticket.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('session_id') ?? '';
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return new Response('bad session', { status: 400 });

  const stripe = await stripeClient();
  const s = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  if (!s || s.payment_status !== 'paid') return new Response('not paid', { status: 402 });

  const m = s.metadata ?? {};
  const income = Number(m.income);
  const origin = new URL(request.url).origin;
  let pdf: Uint8Array; let name: string;
  if (m.product === 'offer-compare') {
    const a = parseOffer(JSON.parse(m.a ?? 'null'), 'Offer A'); const b = parseOffer(JSON.parse(m.b ?? 'null'), 'Offer B');
    if (!a || !b) return new Response('bad offers', { status: 404 });
    pdf = await renderOfferPdf(buildOfferReport(a, b), `${origin}/report/offer?session_id=${s.id}`);
    name = `CanPay-Offer-Comparison.pdf`;
  } else {
    if (m.product !== 'relocation' || !isProvince(m.from) || !isProvince(m.to) || !Number.isFinite(income)) return new Response('unknown product', { status: 404 });
    pdf = await renderRelocationPdf(buildRelocationReport(m.from, m.to, income), `${origin}/report/relocation?session_id=${s.id}`);
    name = `CanPay-Province-Move-${m.from.replace(/\s+/g, '')}-to-${m.to.replace(/\s+/g, '')}.pdf`;
  }
  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${name}"`,
      'cache-control': 'private, no-store',
    },
  });
}
