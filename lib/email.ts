import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Transactional email through Cloudflare Email Sending (REST API, with a
 * token scoped to Email Sending only). From-address is info@canpayinsights.ca; the domain's
 * SPF/DKIM for Cloudflare were provisioned by `wrangler email sending enable`
 * and live on the cf-bounce subdomain, so Google Workspace mail is untouched.
 *
 * The MIME message is assembled by hand — a multipart/mixed with a text
 * part, an HTML part, and the PDF as a base64 attachment — because the
 * binding takes raw RFC 5322 and there is no need for a library to do that.
 */
export const FROM = 'CanPay Insights <info@canpayinsights.ca>';

function b64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function wrap76(s: string): string {
  return s.replace(/(.{76})/g, '$1\r\n');
}

export async function sendReportEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  pdf: Uint8Array;
  pdfName: string;
}): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const e = env as unknown as Record<string, string | undefined>;
  const token = e.CF_EMAIL_TOKEN;
  const accountId = e.CF_ACCOUNT_ID;
  if (!token || !accountId) throw new Error('CF_EMAIL_TOKEN / CF_ACCOUNT_ID missing');

  const boundary = `cp-${crypto.randomUUID()}`;
  const alt = `cpalt-${crypto.randomUUID()}`;
  const raw = [
    `From: ${FROM}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@canpayinsights.ca>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    '',
    `--${alt}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    opts.text,
    '',
    `--${alt}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    opts.html,
    '',
    `--${alt}--`,
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${opts.pdfName}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${opts.pdfName}"`,
    '',
    wrap76(b64(opts.pdf)),
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');

  // Cloudflare's Email Sending REST API (the same call `wrangler email
  // sending send-raw` makes). The Worker binding would be nicer, but its
  // `cloudflare:email` runtime module cannot be bundled by OpenNext today.
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send_raw`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ from: 'info@canpayinsights.ca', recipients: [opts.to], mime_message: raw }),
  });
  if (!res.ok) throw new Error(`email send failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
}
