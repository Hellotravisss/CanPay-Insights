import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { LOGO_PNG_BASE64 } from './logoBase64';
import { SALES_TAX, type RelocationReport } from './relocationReport';
import type { OfferReport } from './offerReport';

/**
 * The Province Move Report as a PDF, drawn with pdf-lib so it can be
 * generated inside a Cloudflare Worker (no headless browser there).
 *
 * The logo is the REAL one — public/logo.png inlined via lib/logoBase64.ts —
 * embedded as a PNG. It is never redrawn by hand.
 *
 * Typography uses the PDF standard Helvetica family: no font files to ship,
 * and every number uses the same glyphs the web page does. Characters outside
 * WinAnsi (arrows, true minus) are avoided on purpose; "to" and "-" are used.
 */

const RED = rgb(0.86, 0.15, 0.15);      // #dc2626
const INK = rgb(0.06, 0.09, 0.16);      // slate-900
const MUTED = rgb(0.39, 0.45, 0.55);    // slate-500
const LINE = rgb(0.89, 0.91, 0.94);     // slate-200
const TINT = rgb(0.996, 0.95, 0.95);    // red-50
const GREEN = rgb(0.02, 0.47, 0.34);    // emerald-700
const PAPER_W = 612;                     // US Letter
const PAPER_H = 792;
const M = 54;                            // margin

const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;
const signed = (n: number) => (n >= 0 ? '+' : '-') + money(n);

type Ctx = { page: PDFPage; y: number; font: PDFFont; bold: PDFFont; doc: PDFDocument; logo: Awaited<ReturnType<PDFDocument['embedPng']>> };

function text(c: Ctx, s: string, x: number, size: number, opts: { bold?: boolean; color?: ReturnType<typeof rgb>; right?: number } = {}) {
  const f = opts.bold ? c.bold : c.font;
  let xx = x;
  if (opts.right !== undefined) xx = opts.right - f.widthOfTextAtSize(s, size);
  c.page.drawText(s, { x: xx, y: c.y, size, font: f, color: opts.color ?? INK });
}

function rule(c: Ctx, color = LINE, thick = 1) {
  c.page.drawLine({ start: { x: M, y: c.y }, end: { x: PAPER_W - M, y: c.y }, thickness: thick, color });
}

function newPage(c: Ctx, title: string) {
  c.page = c.doc.addPage([PAPER_W, PAPER_H]);
  header(c, title);
}

function header(c: Ctx, title: string) {
  c.page.drawImage(c.logo, { x: M, y: PAPER_H - M - 28, width: 28, height: 28 });
  c.y = PAPER_H - M - 20;
  text(c, 'CanPay', M + 36, 14, { bold: true });
  text(c, 'Insights', M + 36 + c.bold.widthOfTextAtSize('CanPay ', 14), 14, { color: RED });
  text(c, title.toUpperCase(), 0, 8, { color: MUTED, right: PAPER_W - M });
  c.y -= 22;
  rule(c, RED, 2);
  c.y -= 26;
}

function ensure(c: Ctx, needed: number, title: string) {
  if (c.y - needed < M + 30) newPage(c, title);
}

function section(c: Ctx, title: string, kicker: string) {
  ensure(c, 70, kicker);
  text(c, title, M, 15, { bold: true });
  c.y -= 16;
}

function para(c: Ctx, s: string, size = 10, color = INK, width = PAPER_W - 2 * M) {
  // naive word wrap
  const words = s.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.font.widthOfTextAtSize(test, size) > width) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  for (const l of lines) {
    ensure(c, size + 6, 'Province move report');
    text(c, l, M, size, { color });
    c.y -= size + 5;
  }
}

function footer(c: Ctx, permalink: string) {
  const pages = c.doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: M - 6 }, end: { x: PAPER_W - M, y: M - 6 }, thickness: 0.5, color: LINE });
    p.drawText(`Every figure computed by the CanPay Insights tax engine for ${new Date().getUTCFullYear()}. Not tax advice. Your report: ${permalink}`, {
      x: M, y: M - 18, size: 7, font: c.font, color: MUTED, maxWidth: PAPER_W - 2 * M - 40,
    });
    p.drawText(`${i + 1} / ${pages.length}`, { x: PAPER_W - M - 20, y: M - 18, size: 7, font: c.font, color: MUTED });
  });
}

export async function renderRelocationPdf(r: RelocationReport, permalink: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Province Move Report — ${r.from.province} to ${r.to.province}`);
  doc.setAuthor('CanPay Insights');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Uint8Array.from(atob(LOGO_PNG_BASE64), (ch) => ch.charCodeAt(0)));
  const c: Ctx = { doc, page: doc.addPage([PAPER_W, PAPER_H]), y: 0, font, bold, logo };
  const kicker = `Province move report · ${r.taxYear}`;
  header(c, kicker);

  // Title
  text(c, `${r.from.province} to ${r.to.province}`, M, 24, { bold: true });
  c.y -= 18;
  text(c, `On a ${money(r.income)} salary · ${r.taxYear} federal and provincial rates · single filer, standard credits`, M, 9.5, { color: MUTED });
  c.y -= 28;

  // Hero block
  const heroH = 92;
  c.page.drawRectangle({ x: M, y: c.y - heroH + 14, width: PAPER_W - 2 * M, height: heroH, color: TINT, borderColor: LINE, borderWidth: 1 });
  c.y -= 4;
  text(c, 'TAKE-HOME PAY AFTER THE MOVE', M + 18, 8, { bold: true, color: MUTED });
  c.y -= 34;
  const gapColor = r.netGapAnnual >= 0 ? GREEN : RED;
  text(c, signed(r.netGapAnnual), M + 18, 30, { bold: true, color: gapColor });
  const w = bold.widthOfTextAtSize(signed(r.netGapAnnual), 30);
  text(c, `a year  ·  ${signed(r.netGapMonthly)} a month`, M + 18 + w + 10, 11, { color: MUTED });
  c.y -= 22;
  const verdict =
    Math.abs(r.netGapAnnual) < r.income * 0.01
      ? `Same salary, ${money(r.netGapAnnual)} ${r.netGapAnnual >= 0 ? 'more' : 'less'} a year in ${r.to.province}. At this income the two are close enough that taxes should not decide the move.`
      : `Same salary, ${money(r.netGapAnnual)} ${r.netGapAnnual >= 0 ? 'more' : 'less'} in your account each year in ${r.to.province} — ${money(r.analysis.fiveYearGap)} over five years.`;
  para(c, verdict, 9.5, INK, PAPER_W - 2 * M - 36);
  c.y -= 22;

  // Table
  section(c, 'Where each dollar goes', kicker);
  const col = { label: M, a: PAPER_W - M - 300, b: PAPER_W - M - 150, d: PAPER_W - M };
  text(c, 'ANNUAL', col.label, 8, { bold: true, color: MUTED });
  text(c, r.from.province.toUpperCase(), 0, 8, { bold: true, color: MUTED, right: col.a + 80 });
  text(c, r.to.province.toUpperCase(), 0, 8, { bold: true, color: MUTED, right: col.b + 80 });
  text(c, 'DIFFERENCE', 0, 8, { bold: true, color: MUTED, right: col.d });
  c.y -= 8; rule(c); c.y -= 16;
  const rows: [string, number, number, boolean?][] = [
    ['Gross salary', r.from.gross, r.to.gross],
    ['Federal tax', r.from.federalTax, r.to.federalTax],
    ['Provincial tax', r.from.provincialTax, r.to.provincialTax],
    ['CPP / QPP', r.from.cpp, r.to.cpp],
    ['EI (+ QPIP in Quebec)', r.from.ei, r.to.ei],
    ['Total deductions', r.from.totalDeductions, r.to.totalDeductions],
    ['Take-home', r.from.net, r.to.net, true],
    ['Monthly take-home', r.from.netMonthly, r.to.netMonthly],
    ['Bi-weekly take-home', r.from.netBiweekly, r.to.netBiweekly],
  ];
  for (const [label, a, b, strong] of rows) {
    ensure(c, 20, kicker);
    text(c, label, col.label, 10, { bold: !!strong });
    text(c, money(a), 0, 10, { right: col.a + 80, bold: !!strong });
    text(c, money(b), 0, 10, { right: col.b + 80, bold: !!strong });
    const diff = b - a;
    const isCost = label !== 'Gross salary' && !label.includes('take-home') && label !== 'Take-home';
    text(c, diff === 0 ? '—' : signed(diff), 0, 10, {
      right: col.d, bold: !!strong,
      color: diff === 0 ? MUTED : (isCost ? (diff > 0 ? RED : GREEN) : (diff > 0 ? GREEN : RED)),
    });
    c.y -= 6; rule(c, LINE, 0.5); c.y -= 14;
  }
  text(c, 'Effective deduction rate', col.label, 10);
  text(c, `${r.from.effectiveRate}%`, 0, 10, { right: col.a + 80 });
  text(c, `${r.to.effectiveRate}%`, 0, 10, { right: col.b + 80 });
  text(c, `${(r.to.effectiveRate - r.from.effectiveRate).toFixed(1)} pts`, 0, 10, { right: col.d, color: MUTED });
  c.y -= 30;

  // Analysis
  section(c, 'What the numbers mean', kicker);
  const bullets = [
    `To keep the take-home you have in ${r.from.province}, you would need about ${money(r.analysis.matchingSalaryInTo)} in ${r.to.province} (${signed(r.analysis.matchingSalaryInTo - r.income)} on your current salary).`,
    `Of your next $1,000 raise, ${r.from.province} lets you keep ${money(r.analysis.keepPer1000From)}; ${r.to.province} lets you keep ${money(r.analysis.keepPer1000To)}.`,
    `At ${money(r.income)}, ${r.from.province} ranks #${r.analysis.rankFrom} of 13 for take-home pay; ${r.to.province} ranks #${r.analysis.rankTo}.`,
  ];
  for (const b of bullets) { para(c, `•  ${b}`, 10); c.y -= 3; }
  c.y -= 14;

  // Dec 31 rule
  section(c, 'The December 31 rule', kicker);
  para(c, `The CRA taxes your whole year's income at the rates of the province you live in on December 31. Move in November and the entire year is re-rated by ${r.to.province}; move in January and last year stays with ${r.from.province}.`, 10);
  c.y -= 6;
  const boxH = 54;
  c.page.drawRectangle({ x: M, y: c.y - boxH + 10, width: PAPER_W - 2 * M, height: boxH, color: TINT, borderColor: LINE, borderWidth: 1 });
  c.y -= 6;
  text(c, `Resident in ${r.to.province} on Dec 31`, M + 14, 9, { color: MUTED });
  text(c, `${money(r.dec31.ifResidentInToOnDec31)} provincial tax for the year`, 0, 9, { right: PAPER_W - M - 14, bold: true });
  c.y -= 16;
  text(c, `Resident in ${r.from.province} on Dec 31`, M + 14, 9, { color: MUTED });
  text(c, `${money(r.dec31.ifResidentInFromOnDec31)} provincial tax for the year`, 0, 9, { right: PAPER_W - M - 14, bold: true });
  c.y -= 16;
  text(c, 'The swing a December 31 address makes', M + 14, 9, { bold: true });
  text(c, signed(r.dec31.swing), 0, 10, { right: PAPER_W - M - 14, bold: true, color: r.dec31.swing > 0 ? RED : GREEN });
  c.y -= 26;
  para(c, 'Your employer withholds at the rates of the province where you work, so a late-year move usually shows up as a balance owing or a refund when you file, not on the paycheque.', 9, MUTED);
  c.y -= 12;

  // Moving expenses
  section(c, 'Moving-expense deduction', kicker);
  para(c, 'If your new home is at least 40 km closer to your new work or study location, the CRA lets you deduct eligible moving costs against income earned at the new location: movers, storage, travel and meals en route, up to 15 days of temporary lodging, lease-breaking costs, and selling costs on your old home. Keep every receipt; unused amounts carry forward to the next year.', 10);
  c.y -= 12;

  // Sales tax
  section(c, 'Sales tax at the till', kicker);
  const sf = SALES_TAX[r.from.province]; const st = SALES_TAX[r.to.province];
  para(c, `${r.from.province}: ${sf?.label ?? ''} — ${r.from.salesTaxTotal}% on most purchases.  ${r.to.province}: ${st?.label ?? ''} — ${r.to.salesTaxTotal}%.`, 10);
  para(c, r.salesTaxGapPoints === 0
    ? 'No difference at the till.'
    : `That is ${Math.abs(r.salesTaxGapPoints)} percentage points ${r.salesTaxGapPoints > 0 ? 'more' : 'less'} on taxable spending after the move — on $20,000 of taxable purchases a year, about ${money(20000 * Math.abs(r.salesTaxGapPoints) / 100)}.`, 10);
  c.y -= 12;

  // Ladder
  section(c, `All 13 provinces at ${money(r.income)}`, kicker);
  const maxNet = r.analysis.ladder[0].net;
  const barW = PAPER_W - 2 * M - 190;
  for (const row of r.analysis.ladder) {
    ensure(c, 14, kicker);
    const isMine = row.province === r.from.province || row.province === r.to.province;
    text(c, row.province, M, 8.5, { bold: isMine, color: isMine ? INK : MUTED });
    c.page.drawRectangle({ x: M + 130, y: c.y - 1, width: barW * (row.net / maxNet), height: 7, color: isMine ? RED : LINE });
    text(c, money(row.net), 0, 8.5, { right: PAPER_W - M, bold: isMine, color: isMine ? INK : MUTED });
    c.y -= 13;
  }

  footer(c, permalink);
  return doc.save();
}


export async function renderOfferPdf(r: OfferReport, permalink: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Offer Comparison — ${r.a.province} vs ${r.b.province}`);
  doc.setAuthor('CanPay Insights');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Uint8Array.from(atob(LOGO_PNG_BASE64), (ch) => ch.charCodeAt(0)));
  const c: Ctx = { doc, page: doc.addPage([PAPER_W, PAPER_H]), y: 0, font, bold, logo };
  const kicker = `Offer comparison · ${r.taxYear}`;
  header(c, kicker);

  text(c, `${money(r.a.salary)} in ${r.a.province}  vs  ${money(r.b.salary)} in ${r.b.province}`, M, 20, { bold: true });
  c.y -= 18;
  text(c, `${r.taxYear} federal and provincial rates · single filer, standard credits · bonus, RRSP match and vacation priced in`, M, 9, { color: MUTED });
  c.y -= 28;

  // Verdict block
  const heroH = 84;
  c.page.drawRectangle({ x: M, y: c.y - heroH + 14, width: PAPER_W - 2 * M, height: heroH, color: TINT, borderColor: LINE, borderWidth: 1 });
  c.y -= 4;
  text(c, 'TOTAL PACKAGE, AFTER TAX', M + 18, 8, { bold: true, color: MUTED });
  c.y -= 32;
  const W = r.winner === 'b' ? r.b : r.a;
  if (r.winner === 'tie') text(c, 'Effectively a tie', M + 18, 24, { bold: true });
  else {
    text(c, signed(Math.abs(r.gap.total)), M + 18, 28, { bold: true, color: GREEN });
    const w = bold.widthOfTextAtSize(signed(Math.abs(r.gap.total)), 28);
    text(c, `a year for ${W.label}  ·  ${money(Math.abs(r.gap.monthly))} a month`, M + 18 + w + 10, 11, { color: MUTED });
  }
  c.y -= 20;
  para(c, `Cash after tax ${signed(r.gap.netCash)} for Offer B; with the employer match counted, ${signed(r.gap.total)}. Per hour actually worked: ${money(r.b.perWorkingHour)} vs ${money(r.a.perWorkingHour)}.`, 9.5, INK, PAPER_W - 2 * M - 36);
  c.y -= 20;

  section(c, 'Line by line', kicker);
  const col = { a: PAPER_W - M - 220, b: PAPER_W - M - 110, d: PAPER_W - M };
  text(c, 'ANNUAL', M, 8, { bold: true, color: MUTED });
  text(c, `A · ${r.a.province.toUpperCase()}`, 0, 8, { bold: true, color: MUTED, right: col.a });
  text(c, `B · ${r.b.province.toUpperCase()}`, 0, 8, { bold: true, color: MUTED, right: col.b });
  text(c, 'B - A', 0, 8, { bold: true, color: MUTED, right: col.d });
  c.y -= 8; rule(c); c.y -= 16;
  const lines: [string, number, number, boolean?][] = [
    ['Salary', r.a.salary, r.b.salary], ['Cash bonus', r.a.bonus, r.b.bonus],
    ['Federal tax', -r.a.federalTax, -r.b.federalTax], ['Provincial tax', -r.a.provincialTax, -r.b.provincialTax],
    ['CPP / QPP', -r.a.cpp, -r.b.cpp], ['EI', -r.a.ei, -r.b.ei],
    ['Cash after tax', r.a.netCash, r.b.netCash, true],
    ['  of which bonus, after tax', r.a.bonusAfterTax, r.b.bonusAfterTax],
    [`Employer RRSP match (${r.a.matchPct}% / ${r.b.matchPct}%)`, r.a.employerMatch, r.b.employerMatch],
    ['Total package', r.a.total, r.b.total, true],
    [`Paid vacation value (${r.a.vacationDays} / ${r.b.vacationDays} days)`, r.a.vacationValue, r.b.vacationValue],
    ['Monthly cash', r.a.netMonthly, r.b.netMonthly],
  ];
  for (const [label, a, b, strong] of lines) {
    ensure(c, 20, kicker);
    const fmt = (n: number) => (n < 0 ? `-${money(n)}` : money(n));
    text(c, label, M, 10, { bold: !!strong });
    text(c, fmt(a), 0, 10, { right: col.a, bold: !!strong });
    text(c, fmt(b), 0, 10, { right: col.b, bold: !!strong });
    const d = b - a;
    text(c, d === 0 ? '—' : signed(d), 0, 10, { right: col.d, bold: !!strong, color: d === 0 ? MUTED : d > 0 ? GREEN : RED });
    c.y -= 6; rule(c, LINE, 0.5); c.y -= 14;
  }
  c.y -= 10;

  section(c, 'What the numbers mean', kicker);
  for (const b of [
    `Offer B would need about ${money(r.breakEvenSalaryForB)} in salary to match Offer A's total package (${signed(r.breakEvenSalaryForB - r.b.salary)} against the offer as written).`,
    `Per hour actually worked (after vacation), Offer A pays ${money(r.a.perWorkingHour)} and Offer B ${money(r.b.perWorkingHour)}.`,
    `Of your next $1,000 raise you keep ${money(r.a.keepPer1000)} in ${r.a.province} and ${money(r.b.keepPer1000)} in ${r.b.province}.`,
    'Vacation is shown as the pay attached to the days off, not added to the package; the RRSP match is counted at face value because it goes in pre-tax.',
  ]) { para(c, `•  ${b}`, 10); c.y -= 3; }
  c.y -= 14;

  section(c, 'Eight questions to ask before you sign', kicker);
  for (const q of [
    'Is the bonus guaranteed, targeted, or discretionary, and when is it paid?',
    'Does the RRSP match vest immediately, or after a cliff?',
    'Is vacation accrued or front-loaded, and does unused time pay out?',
    'What does the health and dental plan cost per pay, and who is covered?',
    'Is there a pension (DB or DC) beyond the RRSP match?',
    'When is the first salary review, and on what scale?',
    'Remote or hybrid, and is there a home-office or commuting allowance?',
    'Probation length, notice period, and non-compete terms.',
  ]) { para(c, `?  ${q}`, 10); c.y -= 2; }

  footer(c, permalink);
  return doc.save();
}
