import { NextResponse } from 'next/server';
import { stripeClient } from '../../../../lib/stripe';
import { db } from '../../../../lib/d1/db';

export const dynamic = 'force-dynamic';

/**
 * Share reward: a single-use $3 promotion code, minted the moment someone
 * actually shares the calculator.
 *
 * Deliberately NOT one public code. A static "SHARE3" leaks within a week and
 * quietly turns $9 into $6 for everybody — that is a pricing decision, not a
 * reward. Each code here has max_redemptions: 1 and a 30-day expiry, so the
 * discount stays attached to the person who did the thing.
 *
 * One code per session per day: a repeat tap returns the SAME code rather
 * than minting another, so nobody can farm codes by clicking share ten times.
 * A global daily cap backs that up — this endpoint needs no login, and without
 * a ceiling a script could fill the Stripe account with promotion codes.
 * We cannot verify that a share actually landed — no platform tells you that —
 * so the honest design is a cheap, capped, single-use reward, not a promise
 * we would need surveillance to police.
 */

const COUPON_ID = 'share-3-cad';
const DAILY_CAP = 200;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1

function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'SHARE' + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function POST(request: Request) {
  let body: { session_id?: string; channel?: string; lang?: string } = {};
  try { body = await request.json(); } catch { /* empty body is fine */ }
  const session = typeof body.session_id === 'string' ? body.session_id.slice(0, 64) : null;
  const d = await db();

  // Already rewarded this session today? Hand back the same code.
  if (session) {
    const existing = await d
      .prepare("select code from share_rewards where session_id = ? and created_at >= datetime('now','-1 day') order by id desc limit 1")
      .bind(session)
      .first<{ code: string }>();
    if (existing) return NextResponse.json({ code: existing.code, amount_off: 3, reused: true }, { headers: { 'cache-control': 'no-store' } });
  }

  // Backstop against a scripted mint-storm on an unauthenticated endpoint.
  const today = (await d
    .prepare("select count(*) n from share_rewards where created_at >= datetime('now','-1 day')")
    .first<{ n: number }>())!.n;
  if (today >= DAILY_CAP) {
    return NextResponse.json({ error: 'Share rewards are paused for today.' }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }

  const stripe = await stripeClient();
  // One shared coupon, many single-use codes. Fixed id, so this is a
  // create-once/retrieve-forever without a settings table.
  let coupon = await stripe.coupons.retrieve(COUPON_ID).catch(() => null);
  if (!coupon) {
    coupon = await stripe.coupons.create({
      id: COUPON_ID, amount_off: 300, currency: 'cad', duration: 'once', name: 'Share reward',
    });
  }

  const code = newCode();
  await stripe.promotionCodes.create({
    // This Stripe version nests the coupon under `promotion`.
    promotion: { type: 'coupon', coupon: COUPON_ID },
    code,
    max_redemptions: 1,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 86400,
  });
  await d
    .prepare('insert into share_rewards (code, session_id, channel, lang) values (?,?,?,?)')
    .bind(code, session, typeof body.channel === 'string' ? body.channel.slice(0, 24) : null, typeof body.lang === 'string' ? body.lang.slice(0, 8) : null)
    .run();

  return NextResponse.json({ code, amount_off: 3, reused: false }, { headers: { 'cache-control': 'no-store' } });
}
