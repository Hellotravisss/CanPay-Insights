# CanPay Insights — rules for any agent working in this repository

Accuracy is the product. These rules exist because each one was broken once.

## Before touching the tax engine, or reporting it correct

1. Run `npm run audit:engine`. It compares the engine's OUTPUT row by row with the CRA T4032
   payroll deduction tables (claim code 1, bi-weekly, 13 jurisdictions), the CRA CPP/EI tables and
   Revenu Québec TP-1015.TI — about 10,260 rows in `tests/golden/t4032-2026.json`.
2. Comparing rates with official pages only proves the INPUTS. On 2026-09-15 every rate was right
   and the engine was still wrong in four formula steps (K4, F5, K2Q, the Quebec worker deduction).
   Only the golden test sees that kind of error. A failing golden test means the engine is wrong,
   whatever the rate comparison says — put the failing rows at the top of your report.
3. Never edit the fixture. Never widen the tolerance.
4. New tax year, or a mid-year CRA edition: build the new fixture FIRST (GitHub workflow
   `fetch-t4032.yml`, then `python3 scripts/buildT4032Fixture.py`), then change the engine until it passes.
5. `CanPayApp/src/utils/taxEngine.ts` (separate repo) must stay logic-identical to `utils/taxEngine.ts`.

## Gates, in order (all run in `prebuild`)

`audit:engine` → `audit:numbers:selftest` → `audit:numbers` → `audit:logo`

No gate covers INPUT rates that are not tax rates. The 13 minimum wages in
`scripts/minwage-takehome.ts` went stale once (2026-09-01, NU and NWT): check them against each
government's own page whenever you audit.

## After an engine change

Follow `REPUBLISH` in the insights-kit repo: regenerate generated surfaces, never hand-edit them;
replace old→new figures line by line with context, never as a blind value sweep.

## This repository is PUBLIC

Anything committed here is world-readable, including everything under `drafts/`.
Outreach lists, email templates, third-party contacts and any postal address live in the
vault instead: `~/Obsidian/TravisVault/03 领域/经营/CanPay 外联/` (local git, no remote).
They were published here by mistake for three days in September 2026 — do not put them back.
`scripts/genMediaStory.ts` still writes its drafts to `drafts/media/`; that path is gitignored.

## Never

- Draw the logo. `public/logo.png` is the only source.
- Present the calculator's self-selected sample as national statistics.
- Store IP addresses, full user agents, exact income, or a full postal code.
- Publish or link the private data room.
- Push to main from a scheduled routine — open a pull request.
