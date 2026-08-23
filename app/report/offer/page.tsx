import type { Metadata } from 'next';
import Link from 'next/link';
import { stripeClient } from '../../../lib/stripe';
import { buildOfferReport, parseOffer } from '../../../lib/offerReport';
import OfferReport from './OfferReport';

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
  return <OfferReport report={buildOfferReport(a, b)} email={email} sessionId={session_id} permalink={`https://canpayinsights.ca/report/offer?session_id=${session_id}`} />;
}

function Gate() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center font-sans">
      <h1 className="text-xl font-bold text-slate-900">This report link is not valid.</h1>
      <p className="mt-3 text-sm text-slate-500">Open the link from your receipt email, or buy the comparison from the calculator.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-red-600">← Back to the calculator</Link>
    </main>
  );
}
