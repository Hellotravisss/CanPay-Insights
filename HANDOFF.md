# Handoff — 2026 tax-year update + GEO improvements

**Date:** 2026-06-21 · **Status:** committed to `main`, **NOT pushed** (review with `git show HEAD`, then push to deploy via Vercel) · **Build:** `npm run build` → 421/421 pages, 0 errors.

> If you're picking this up in another Claude Code conversation: these files were changed by a separate session. **Run `git status` / `git diff HEAD~1` and re-read any file before editing it** — don't write from stale context or you'll clobber this work.

This work came out of a GEO audit of canpayinsights.ca. Two workstreams: (1) a full **2026 tax-year update** of the calculator engine, and (2) the **GEO fixes** the audit flagged.

---

## 1. Tax engine → verified CRA 2026 figures

`constants.ts` (near-full rewrite) + `utils/taxEngine.ts`. Every figure verified against CRA / Revenu Québec / TaxTips on 2026-06-21.

- **Federal:** lowest rate **15% → 14%**; 2026 brackets ($58,523 / $117,045 / $181,440 / $258,482); BPA **$16,452**.
- **`taxEngine.ts`:** the federal non-refundable credit rate was hardcoded at `0.15` → changed to **`0.14`** (BPA + CPP + EI credits). Without this the calculator would under-tax everyone in 2026.
- **CPP:** YMPE **$74,600**, max **$4,230.45**. **CPP2:** YAMPE **$85,000**, max **$416**.
- **EI:** **1.63%**, MIE **$68,900**, max **$1,123.07**. Quebec EI **1.30%**, max **$895.70**.
- **QPP:** 6.3%, max **$4,479.30**. **QPP2:** 4%, max **$416**. **QPIP:** 0.43%, MIE **$103,000**, max **$442.90**.
- **All 13 provincial/territorial brackets + BPAs → 2026.** Several were previously incomplete (AB was missing its 8% bracket + high brackets; SK/PE/NT/NU/NL were missing brackets) — now complete.

**Propagation:** `lib/salaryFigures.ts` → `utils/taxEngine.ts`, so the engine fix flows automatically to the homepage calculator, all ~414 money pages, and `/compare-provinces`. No per-page edits needed.

**Verification:** outputs cross-checked vs external 2026 calculators (e.g. $60k ON → ~$47,670 net); CPP/EI/QPP/QPIP all hit their exact 2026 maximums; `tsc` 0 errors; full build 421 pages.

---

## 2. GEO fixes (from the audit)

- **`/zh` — new crawlable Chinese hub.** `app/zh/page.tsx` + `app/zh/layout.tsx`, with a live 2026 sample breakdown. `SalaryBreakdownPanel.tsx` gained a `zh` locale. Added to `app/sitemap.ts` with `hreflang` (en/fr/zh). Fixes the audit's "Chinese query is unwinnable — no crawlable Chinese page" finding.
- **Open dataset.** `scripts/generate-dataset.ts` generates `public/data/canpay-take-home-2026.{csv,json}` (455 rows: 13 jurisdictions × $30k–$200k) from the live engine. Wired into the homepage `Dataset` schema as `distribution` (was a "hollow" dataset with no download), plus visible **Download CSV/JSON** links on `/about` (CC BY 4.0). Regenerate with `npx tsx scripts/generate-dataset.ts`.
- **Author / entity.** `/about` now names **Travis Zhang (Qi Zhang)** + bio + LinkedIn; `app/layout.tsx` Organization `founder` got `alternateName` + `sameAs` (`linkedin.com/in/qharbert`). ⚠️ *Swap that LinkedIn if you'd rather link a CanPay-specific profile.*
- **Freshness/copy.** Homepage body + FAQ JSON-LD, all "2025/2026" year labels (11 files), `/compare-provinces`, and the main CPP/EI tables → **2026**.
- **Both blog articles fully recomputed to 2026** (`src/content/articles-data.ts`, `articles-studies.ts`), including all persona worked examples. **Note:** the Alberta-vs-Ontario article's conclusion was *corrected* — with true 2026 numbers, Ontario nets more in the ~$50k–$100k range and Alberta only wins above ~$120k (the old "Alberta wins above $50k" claim was wrong). Rachel's Toronto-vs-Calgary verdict flipped accordingly.

---

## 3. Not done / next

- **Off-site citation building** (Reddit, listicles, journalist/data outreach, Wikidata) — the ~80% GEO lever; an ongoing program, not a code change. (You're already logging outreach in the tracker.)
- **Deploy:** push `main` → Vercel when you've reviewed.
- **Optional:** regenerate the dataset whenever the engine changes; consider a `/zh` money-page set (mirror `/fr/[slug]`) as a follow-up.

## Changed files
`constants.ts`, `utils/taxEngine.ts`, `app/{page,layout,sitemap,compare-provinces/page,link-to-canpay/page}.tsx`, `app/zh/{layout,page}.tsx` (new), `components/{SalaryBreakdownPanel,AboutPage,SEO,ContactPage,PrivacyPolicy,ShareLinks,GeminiAdvisor}.tsx`, `app/landing-page-data.ts`, `src/content/{articles-data,articles-studies}.ts`, `scripts/generate-dataset.ts` (new), `public/data/*` (new).
