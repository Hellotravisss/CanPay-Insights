/**
 * Pulls every sentence on our public pages that describes what CanPay does
 * or does not do (collects, stores, sends, costs, promises). Shared by
 * scripts/liveClaims.mjs (the gate) and its --bootstrap mode.
 */
export const CLAIM_PAGES = [
  '/', '/zh', '/privacy', '/fr/confidentialite', '/about', '/terms', '/refunds', '/widget',
  '/research/pay-calculator-behaviour', '/affiliate-disclosure', '/data', '/link-to-canpay',
  '/contact', '/llms.txt',
];

const KW = new RegExp(
  [
    String.raw`\bnever\b`, String.raw`\bno\b`, String.raw`\bnot\b`, String.raw`\bonly\b`, String.raw`\bfree\b`,
    String.raw`\bwe (collect|record|store|keep|use|send|delete|share|sell|update|answer|refund|change)`,
    String.raw`\bstored?\b`, 'cookie', String.raw`\bdelet`, String.raw`\bretain`, String.raw`\bdays?\b`, 'languages',
    'anonymous', String.raw`\bstays?\b`, String.raw`\bleaves?\b`, 'third', String.raw`\bIP\b`, 'fingerprint',
    String.raw`\bopt`, 'notelemetry', String.raw`\bverified\b`, String.raw`\bchecked\b`, String.raw`\bevery\b`,
    String.raw`\bwithin\b`, String.raw`\brefund`, 'licen[cs]e', 'attribut',
    // French
    String.raw`\bjamais\b`, String.raw`\baucun`, String.raw`\bne\b`, 'gratuit', 'conserv', 'témoin', 'transm',
    String.raw`\bseulement\b`, String.raw`\bjours?\b`, 'anonyme', 'licence',
    // Chinese
    '免费', '不会', '从不', '只', '存', '发送', '注册', '语言', '匿名', '隐私',
  ].join('|'),
  'i',
);

export const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();

export async function claimSentences(base, path) {
  const r = await fetch(base + path, { headers: { 'User-Agent': 'Mozilla/5.0 canpay-claims-audit', Accept: 'text/html' } });
  let raw = await r.text();
  let text = raw;
  if (!path.endsWith('.txt')) {
    raw = raw.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/g, '');
    const main = raw.match(/<main[\s\S]*?<\/main>/);
    text = (main ? main[0] : raw)
      .replace(/<(br|\/p|\/li|\/h\d|\/div|\/td|\/th|\/tr|\/dt|\/dd)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&#x2F;/g, '/');
  }
  const out = new Set();
  for (const line of text.split('\n')) {
    // llms.txt article links are titles added by the article routine, not
    // statements about CanPay; skipping them keeps that routine from failing the gate.
    if (path.endsWith('.txt') && /^\s*- \[/.test(line)) continue;
    for (const s of line.split(/(?<=[.!?。！？])\s+/)) {
      const t = norm(s);
      if (t.length >= 25 && t.length <= 600 && KW.test(t)) out.add(t);
    }
  }
  return [...out];
}
