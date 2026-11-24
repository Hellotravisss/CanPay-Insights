import type { Metadata } from 'next';
import Link from 'next/link';
import { stripeClient } from '../../../lib/stripe';
import { buildOfferReport, parseOffer } from '../../../lib/offerReport';
import OfferReport from './OfferReport';
import { ReportFrame, ReportGate } from '../ReportFrame';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Offer Comparison | CanPay Insights', robots: { index: false, follow: false } };

/** Rebuilt from the Stripe session on every open; the session id is the ticket. */
export default async function Page({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  if (!session_id || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(session_id)) return <Gate />;
  let a = null, b = null, email: string | null = null;
  try {
    const s = await (await stripeClient()).checkout.sessions.retrieve(session_id);
    if (s.payment_status !== 'paid' || s.metadata?.product !== 'offer-compare') return <Gate />;
    a = parseOffer(JSON.parse(s.metadata.a ?? 'null'), 'Offer A');
    b = parseOffer(JSON.parse(s.metadata.b ?? 'null'), 'Offer B');
    email = s.customer_details?.email ?? null;
  } catch { return <Gate />; }
  if (!a || !b) return <Gate />;
  return (
    <ReportFrame>
      <OfferReport report={buildOfferReport(a, b)} email={email} sessionId={session_id} permalink={`https://canpayinsights.ca/report/offer?session_id=${session_id}`} />
    </ReportFrame>
  );
}

function Gate() {
  return (
    <ReportGate title="This report link is not valid.">
      <p className="mt-3 text-sm leading-6 text-mute">Open the link from your receipt email, or buy the comparison from the calculator.</p>
      <Link href="/" className="btn-brand-3d mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white no-underline">← Back to the calculator</Link>
    </ReportGate>
  );
}
