import { db } from '../../../../lib/d1/db';
import { checkUnsubToken } from '../../../../lib/welcome';

export const dynamic = 'force-dynamic';

/**
 * Unsubscribe from every email we send an account (CASL s.11).
 *
 * GET only shows a confirm button: mail scanners open every link in a message,
 * and a GET that unsubscribed would unsubscribe people who never clicked.
 * POST does it — from that button, or straight from the mail client through
 * RFC 8058 one-click (List-Unsubscribe-Post). Sign-in links and receipts are
 * not affected: they are sent because the person asked for them.
 */
const page = (body: string, status = 200) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email preferences – CanPay Insights</title>
<main style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:460px;margin:12vh auto;padding:0 16px;color:#0f172a">${body}</main>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

async function params(request: Request) {
  const url = new URL(request.url);
  let u = url.searchParams.get('u') ?? '', t = url.searchParams.get('t') ?? '';
  if (request.method === 'POST' && (!u || !t)) {
    try { const f = await request.formData(); u = String(f.get('u') ?? u); t = String(f.get('t') ?? t); } catch { /* one-click posts carry no fields we need */ }
  }
  return { u, t, ok: !!u && !!t && (await checkUnsubToken(u, t)) };
}

export async function GET(request: Request) {
  const { u, t, ok } = await params(request);
  if (!ok) return page('<h1 style="font-size:20px">This link is not valid</h1><p>Write to info@canpayinsights.ca and we will take you off by hand.</p>', 400);
  const esc = (s: string) => s.replace(/[^A-Za-z0-9-]/g, '');
  return page(`<h1 style="font-size:20px">Stop emails from CanPay Insights?</h1>
<p style="color:#475569">Sign-in links and receipts you ask for will still arrive.</p>
<form method="post"><input type="hidden" name="u" value="${esc(u)}"><input type="hidden" name="t" value="${esc(t)}">
<button style="background:#dc2626;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:700;font-size:15px">Stop emails</button></form>`);
}

export async function POST(request: Request) {
  const { u, ok } = await params(request);
  if (!ok) return page('<h1 style="font-size:20px">This link is not valid</h1>', 400);
  await (await db()).prepare('update users set email_opt_out = 1, rate_alerts = 0 where id = ?').bind(u).run();
  return page('<h1 style="font-size:20px">Done</h1><p style="color:#475569">You will not get emails from us again. Sign-in links and receipts you ask for still arrive.</p>');
}
