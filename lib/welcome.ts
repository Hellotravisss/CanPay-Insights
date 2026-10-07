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
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const text = [
    'Your pay, kept in one place.',
    '',
    `Your CanPay Insights account is open, signed in as ${opts.email}.`,
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
  const today = new Date().toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Vancouver' });
  // Pay-stub layout: the product is about pay, so the account reads like the
  // top of a stub. Email-safe only: tables, inline styles, Georgia/Courier as
  // the only "fonts" (web fonts are stripped by Gmail), light scheme pinned.
  const row = (label: string, value: string, last = false) => `<tr>
        <td style="padding:13px 0;border-bottom:${last ? '0' : '1px dotted #d6cfc3'};font:15px/1.4 Georgia,'Times New Roman',serif;color:#1c1917">${label}</td>
        <td align="right" style="padding:13px 0;border-bottom:${last ? '0' : '1px dotted #d6cfc3'};font:12px/1.4 'Courier New',Courier,monospace;color:#78716c;letter-spacing:.04em;text-transform:uppercase">${value}</td>
      </tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f3efe8">
<div style="display:none;max-height:0;overflow:hidden">Saved calculations, timesheets and reports — on the web and in the iOS app.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe8"><tr><td align="center" style="padding:32px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border:1px solid #e4ddd1">
    <tr><td style="height:6px;background:#dc2626;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:26px 32px 0">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="background:#ffffff;border-radius:9px"><img src="${SITE}/logo.png" width="38" height="38" alt="CanPay Insights" style="display:block;border-radius:9px"></td>
        <td style="padding-left:11px;font:800 17px/1 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1917">CanPay <span style="color:#dc2626">Insights</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 32px 0;font:11px/1 'Courier New',Courier,monospace;letter-spacing:.16em;text-transform:uppercase;color:#a8a29e">Account opened &middot; ${esc(today)}</td></tr>
    <tr><td style="padding:12px 32px 0;font:400 32px/1.15 Georgia,'Times New Roman',serif;color:#1c1917">Your pay, kept in one&nbsp;place.</td></tr>
    <tr><td style="padding:12px 32px 0;font:14px/1.5 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#57534e">Signed in as <span style="color:#1c1917">${esc(opts.email)}</span></td></tr>
    <tr><td style="padding:28px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px dashed #d6cfc3">
        <tr><td colspan="2" style="padding:16px 0 4px;font:11px/1 'Courier New',Courier,monospace;letter-spacing:.16em;text-transform:uppercase;color:#a8a29e">What your account keeps</td></tr>
        ${row('Calculations you save', 'Reopen anytime')}
        ${row('Timesheets', 'Every device')}
        ${row('Reports you buy', 'Always in My Reports', true)}
      </table>
    </td></tr>
    <tr><td style="padding:18px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border-left:3px solid #dc2626"><tr>
        <td style="padding:14px 16px;font:14px/1.55 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#44403c">When the CRA or Revenu Qu&eacute;bec publishes new rates, a saved calculation reopens with the new numbers.</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:26px 32px 0">
      <a href="${SITE}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font:700 15px/1 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;padding:15px 22px;border-radius:8px">Open CanPay Insights &rarr;</a>
    </td></tr>
    <tr><td style="padding:22px 32px 30px;font:13px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#78716c">Delete the account and everything in it from the account menu, any time. Questions? Just reply.</td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px"><tr>
    <td style="padding:18px 32px;font:12px/1.7 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#a8a29e">
      CanPay Insights &middot; ${esc(opts.address)}<br>
      <a href="mailto:info@canpayinsights.ca" style="color:#a8a29e">info@canpayinsights.ca</a> &middot; <a href="${SITE}" style="color:#a8a29e">canpayinsights.ca</a> &middot; <a href="${opts.unsub}" style="color:#a8a29e">Stop emails from us</a>
    </td>
  </tr></table>
</td></tr></table>
</body></html>`;
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
