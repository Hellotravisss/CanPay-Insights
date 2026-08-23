import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Transactional email through Cloudflare Email Sending (the `EMAIL` binding
 * in wrangler.jsonc). From-address is info@canpayinsights.ca; the domain's
 * SPF/DKIM for Cloudflare were provisioned by `wrangler email sending enable`
 * and live on the cf-bounce subdomain, so Google Workspace mail is untouched.
 *
 * The MIME message is assembled by hand — a multipart/mixed with a text
 * part, an HTML part, and the PDF as a base64 attachment — because the
 * binding takes raw RFC 5322 and there is no need for a library to do that.
 */
export const FROM = 'CanPay Insights <info@canpayinsights.ca>';

type SendEmailBinding = { send(message: unknown): Promise<void> };

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
  const binding = (env as unknown as { EMAIL?: SendEmailBinding }).EMAIL;
  if (!binding) throw new Error('EMAIL binding missing');

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

  // `cloudflare:email` is a runtime module; resolved dynamically so the Next
  // build never tries to bundle it.
  const mod = (await import(/* webpackIgnore: true */ 'cloudflare:email' as string)) as {
    EmailMessage: new (from: string, to: string, raw: string) => unknown;
  };
  const message = new mod.EmailMessage('info@canpayinsights.ca', opts.to, raw);
  await binding.send(message);
}
