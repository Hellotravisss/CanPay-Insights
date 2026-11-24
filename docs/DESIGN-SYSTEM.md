# CanPay Insights — site design system (2026-11)

Source of the identity: the PayFamily-brand repo (logo 12-final, tokens 14-web, icons 15, patterns 16, charts 18).
This file is how that identity is applied to the website. Every page outside the calculator is built from
`components/site/`; nothing on a page should need its own header, footer, hero or colour.

## Principles

1. **One product, one frame.** Every page: `SiteHeader` → pearl page → `SiteFooter`. No per-page back buttons,
   no per-page footers.
2. **Red means the money you keep** (or the one subject of a chart). Deductions, taxes and totals of deductions
   are ink. Never a red "Total deductions", never a green "take-home".
3. **Type does the hierarchy, not boxes.** Fraunces (`font-display`) for titles and hero numbers, Instrument Sans
   for everything else, Bricolage only in the wordmark. One eyebrow (11px, caps, 0.14em, red) above a title.
4. **Few surfaces.** Page = pearl `#F4F4F8`. Card = white with a 1px `line` border, `rounded-2xl`, no shadow.
   The red banknote card (`card-brand-3d`) appears at most once per screen, for the key kept figure.
   No yellow, blue, green or purple panels; no dark navy blocks. Sister brands (USAPay) keep their own colours.
5. **Numbers are tabular** (`tabular-nums`) and right-aligned in tables.
6. **Calm motion**: 150/320/600 ms, `cubic-bezier(0.2,0,0,1)`, once, respects reduced motion.

## Tokens (Tailwind)

| token | value | use |
|---|---|---|
| `ink` / `ink-2..5` | #15171C #2B2E36 #535866 #7C818D #A2A6B0 | text; the deductions ramp in charts |
| `mute` | #5E6270 | secondary text (5.6:1 on pearl) — never `slate-500` on pearl (4.4:1, fails AA) |
| `pearl` / `pearl-soft` / `pearl-shade` | #F4F4F8 #F7F7FA #D9DBE7 | page, inset panels, rules on dark |
| `line` | #E3E3EA | borders and hairlines |
| `red-600` | #C8161A | brand, kept money, links, primary buttons (`btn-brand-3d`) |

## Components (`components/site/`)

| component | what |
|---|---|
| `SiteHeader lang current` | logo + wordmark, nav (Calculator, Guides, Compare, Wages, Open data); phone: Calculator button + menu |
| `SiteFooter lang note` | brand column + Calculators / CanPay Insights / Legal link columns + Avowd credit. Keep every link (SEO) |
| `PageHero eyebrow title lead` | the one top title of a page; children = buttons |
| `SectionTitle eyebrow title lead` | h2 inside a page |
| `Card` | white surface |
| `Stat label value sub tone` | a figure; `tone="kept"` = red banknote card |
| `Callout title tone` | the only "box" for notes: white, 3px left rule (ink = note, red = caution) |
| `ButtonLink variant` | primary (red) / secondary (white outline) |
| `LegalChrome`, `Section` | long-form documents (privacy, terms, refunds) |

## Copy

Restyling never changes a sentence. The site's self-descriptions are checked against `scripts/claims.json`
after every deploy; a changed sentence fails the deploy until it is classified
(`node scripts/liveClaims.mjs http://localhost:3000 --unregistered`).
