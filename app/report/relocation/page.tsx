import type { Metadata } from 'next';
import Link from 'next/link';
import { stripeClient } from '../../../lib/stripe';
import { buildRelocationReport, isProvince, SALES_TAX } from '../../../lib/relocationReport';
import RelocationReport from './RelocationReport';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Province Move Report | CanPay Insights',
  robots: { index: false, follow: false },
};

/**
 * The report is rebuilt from the Stripe session on every open. Access is
 * the session itself: the id is 66 unguessable characters and only the
 * buyer (and Stripe's receipt email) ever has it. No account, no cookie,
 * no database row needs to exist for a paid customer to see what they paid
 * for — which also means a dropped webhook cannot lock anyone out.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(session_id)) return <Gate reason="missing" />;

  let paid = false;
  let from = '';
  let to = '';
  let income = 0;
  let email: string | null = null;
  try {
    const stripe = await stripeClient();
    const s = await stripe.checkout.sessions.retrieve(session_id);
    paid = s.payment_status === 'paid' && s.metadata?.product === 'relocation';
    from = s.metadata?.from ?? '';
    to = s.metadata?.to ?? '';
    income = Number(s.metadata?.income);
    email = s.customer_details?.email ?? null;
  } catch {
    return <Gate reason="lookup" />;
  }

  if (!paid) return <Gate reason="unpaid" />;
  if (!isProvince(from) || !isProvince(to) || !Number.isFinite(income) || income <= 0) return <Gate reason="inputs" />;

  const report = buildRelocationReport(from, to, income);
  return (
    <RelocationReport
      report={report}
      salesTax={{ from: SALES_TAX[from], to: SALES_TAX[to] }}
      email={email}
      permalink={`https://canpayinsights.ca/report/relocation?session_id=${session_id}`}
    />
  );
}

function Gate({ reason }: { reason: 'missing' | 'unpaid' | 'lookup' | 'inputs' }) {
  const copy: Record<typeof reason, string> = {
    missing: 'This link is missing its purchase reference.',
    unpaid: 'This purchase has not completed. If you were charged, reply to your Stripe receipt and we will sort it out.',
    lookup: 'We could not reach Stripe to verify this purchase. Please try again in a minute.',
    inputs: 'This report’s inputs could not be read. Reply to your receipt and we will regenerate it.',
  };
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Province Move Report</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Report unavailable</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy[reason]}</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
        Back to the calculator
      </Link>
    </main>
  );
}
