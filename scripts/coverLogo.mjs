/**
 * RETIRED 2026-11-24. Covers are no longer hand-written SVGs.
 *
 * The site moved to the 2026-11 identity (pearly beaver logo, Bricolage wordmark, banknote patterns), and
 * every article cover is now a PNG rendered by scripts/brandCovers.mjs. This file is kept only so that an
 * old routine or an old note that still calls it gets told the new way instead of shipping an old-style card.
 */
const NEW_WAY = [
  'Covers are no longer hand-written SVGs (retired 2026-11-24). To give an article its cover:',
  '  1. write src/content/covers/<slug>.json  — the news-card spec; copy any file in that folder',
  '     (head: one array per line, odd items highlighted; sub; pill; label; 2 or 4 tiles [title, sub])',
  '  2. run  node scripts/brandCovers.mjs news <slug>   → public/blog/covers/<slug>.png',
  '  3. set the article\'s imageUrl to "/blog/covers/<slug>.png"',
  '  4. npm run audit:logo  must pass.',
  'Province guides and title covers: npx tsx scripts/genAllCovers.ts. Rules: public/README-LOGO.md.',
].join('\n');

export async function brandGroup() { throw new Error(NEW_WAY); }
export const SVG_OPEN = null;

if (process.argv[1] && process.argv[1].endsWith('coverLogo.mjs')) {
  console.error(NEW_WAY);
  process.exit(1);
}
