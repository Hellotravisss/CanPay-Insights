import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { createMagicToken } from '../../../../lib/auth/core';
import { sendPlainEmail } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

/** Send a one-time sign-in link. Always answers ok — never reveals whether an email exists. */
export async function POST(request: Request) {
  let body: { email?: string; redirect?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  const origin = new URL(request.url).origin;
  const token = await createMagicToken(await db(), email, typeof body.redirect === 'string' ? body.redirect.slice(0, 500) : null);
  const link = `${origin}/api/auth/callback?token=${token}`;
  try {
    await sendPlainEmail({
      to: email,
      subject: 'Your CanPay Insights sign-in link',
      text: `Tap to sign in to CanPay Insights:\n\n${link}\n\nThe link works once and expires in 15 minutes. If you did not request it, ignore this email.`,
      html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
  <p style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#dc2626;font-weight:700;margin:24px 0 10px">CanPay Insights</p>
  <h1 style="font-size:20px;margin:0 0 14px">Your sign-in link</h1>
  <p><a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Sign in to CanPay Insights</a></p>
  <p style="color:#64748b;font-size:13px">The link works once and expires in 15 minutes. If you did not request it, you can ignore this email.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:28px">canpayinsights.ca</p>
</div>`,
    });
  } catch (e) {
    console.error('magic link email failed', (e as Error).message);
    return NextResponse.json({ error: 'Could not send the email right now. Please try again.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
