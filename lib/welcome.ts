import { getCloudflareContext } from '@opennextjs/cloudflare';
import { db, secret } from './d1/db';
import { sendPlainEmail } from './email';

/**
 * The one email a new account gets (2026-10-07).
 *
 * CASL: a message that only gives factual information about an account the
 * person just opened is exempt from the CONSENT rule (s.6(6)(d)) but not from
 * the FORM rules (s.6(2), SOR/2012-36 s.2): it must name the sender, carry a
 * postal address and one other contact, and offer an unsubscribe that works
 * for 60 days. So:
 *   - the content stays strictly about the account — no offers, and no
 *     "turn on rate alerts" either: asking for consent by email is itself a
 *     commercial message, and would end the "solely" in s.6(6);
 *   - the postal address comes from the SENDER_ADDRESS secret, never from
 *     this public repository. Without it, nothing is sent;
 *   - unsubscribe is one click (RFC 8058) plus a link to a confirm page.
 *
 * Existing accounts never get it: they were not told about it when they
 * signed up.
 */

const SITE = 'https://canpayinsights.ca';
const te = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function key(): Promise<CryptoKey> {
  const s = await secret('AUTH_SECRET');
  if (!s) throw new Error('AUTH_SECRET missing');
  return crypto.subtle.importKey('raw', te.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

/** Stateless unsubscribe token: HMAC over a fixed purpose and the user id. */
export async function unsubToken(userId: string): Promise<string> {
  return hex(await crypto.subtle.sign('HMAC', await key(), te.encode(`unsub:${userId}`))).slice(0, 32);
}

export async function checkUnsubToken(userId: string, token: string): Promise<boolean> {
  const want = await unsubToken(userId);
  if (token.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export async function unsubUrl(userId: string): Promise<string> {
  return `${SITE}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${await unsubToken(userId)}`;
}

export function welcomeMessage(opts: { email: string; unsub: string; address: string }) {
  const subject = 'Your CanPay Insights account is ready';
  const text = [
    `Your CanPay Insights account is set up for ${opts.email}.`,
    '',
    'What it keeps for you, on the web and in the iOS app:',
    '- calculations you save, so you can reopen them later',
    '- timesheets',
    '- any report you buy',
    '',
    'Figures are recomputed whenever the CRA or Revenu Québec publishes new rates, so a saved calculation reopens with the current year\'s numbers.',
    '',
    'You can delete the account, and everything saved in it, from the account menu at any time.',
    '',
    `Questions: reply to this email.`,
    '',
    '--',
    'CanPay Insights',
    opts.address,
    'info@canpayinsights.ca · canpayinsights.ca',
    `Stop emails from us: ${opts.unsub}`,
  ].join('\n');
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
  <table role="presentation" style="margin:28px 0 6px"><tr>
    <td><img src="${SITE}/logo.png" width="36" height="36" alt="CanPay Insights" style="border-radius:8px;display:block"></td>
    <td style="padding-left:10px;font-size:17px;font-weight:800">CanPay <span style="color:#dc2626">Insights</span></td>
  </tr></table>
  <h1 style="font-size:20px;margin:14px 0 6px">Your account is ready</h1>
  <p style="color:#475569;font-size:14px;margin:0 0 14px">Set up for ${esc(opts.email)}. It keeps, on the web and in the iOS app:</p>
  <ul style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 14px;padding-left:20px">
    <li>calculations you save, so you can reopen them later</li>
    <li>timesheets</li>
    <li>any report you buy</li>
  </ul>
  <p style="color:#475569;font-size:14px;margin:0 0 14px">Figures are recomputed whenever the CRA or Revenu Québec publishes new rates, so a saved calculation reopens with the current year's numbers.</p>
  <p style="color:#475569;font-size:14px;margin:0 0 14px">You can delete the account, and everything saved in it, from the account menu at any time. Questions: just reply.</p>
  <div style="border-top:1px solid #e2e8f0;margin-top:22px;padding-top:12px;color:#94a3b8;font-size:12px;line-height:1.6">
    CanPay Insights · ${esc(opts.address)}<br>
    <a href="mailto:info@canpayinsights.ca" style="color:#94a3b8">info@canpayinsights.ca</a> · <a href="${SITE}" style="color:#94a3b8">canpayinsights.ca</a><br>
    <a href="${opts.unsub}" style="color:#94a3b8">Stop emails from us</a>
  </div>
</div>`;
  return { subject, text, html };
}

export async function sendWelcome(user: { id: string; email: string }): Promise<void> {
  const address = await secret('SENDER_ADDRESS');
  if (!address) { console.error('welcome: SENDER_ADDRESS missing, not sent'); return; }
  const unsub = await unsubUrl(user.id);
  const m = welcomeMessage({ email: user.email, unsub, address });
  await sendPlainEmail({
    to: user.email, subject: m.subject, text: m.text, html: m.html,
    headers: [`List-Unsubscribe: <${unsub}>, <mailto:info@canpayinsights.ca?subject=unsubscribe>`, 'List-Unsubscribe-Post: List-Unsubscribe=One-Click'],
  });
  await (await db()).prepare('update users set welcome_sent_at = ? where id = ?').bind(new Date().toISOString(), user.id).run();
}

/** Fire after the response; a failed email never fails a sign-up. */
export async function queueWelcome(user: { id: string; email: string }): Promise<void> {
  const job = sendWelcome(user).catch((e) => console.error('welcome email failed', (e as Error).message));
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(job);
  } catch {
    await job;
  }
}
