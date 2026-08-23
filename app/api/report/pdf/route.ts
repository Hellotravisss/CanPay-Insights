import { stripeClient } from '../../../../lib/stripe';
import { buildRelocationReport, isProvince } from '../../../../lib/relocationReport';
import { renderRelocationPdf } from '../../../../lib/reportPdf';

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
  if (m.product !== 'relocation' || !isProvince(m.from) || !isProvince(m.to) || !Number.isFinite(income)) {
    return new Response('unknown product', { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const report = buildRelocationReport(m.from, m.to, income);
  const pdf = await renderRelocationPdf(report, `${origin}/report/relocation?session_id=${s.id}`);
  const name = `CanPay-Province-Move-${m.from.replace(/\s+/g, '')}-to-${m.to.replace(/\s+/g, '')}.pdf`;
  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${name}"`,
      'cache-control': 'private, no-store',
    },
  });
}
