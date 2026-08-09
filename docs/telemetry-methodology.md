# Telemetry methodology

This document is the contract between the numbers we publish and the reader who
has to trust them. It exists so that someone reading a CanPay Insights figure in
2036 can tell exactly what was counted in 2026, and whether it is comparable to
what is being counted then.

**If you change what a field means, bump `schema_version` and add a section
here. Never silently reinterpret existing rows.**

---

## Schema version 1 — from 2026-08-07

### What is recorded

One row per *settled calculation*: the user changed an input and the values then
stayed stable for three seconds. Live typing produces one row, not a keystroke
stream. Repeat identical calculations within a single page load are deduplicated.

| Field | Meaning |
| --- | --- |
| `mode` | Which calculator: `simple` (hourly), `annual`, `timesheet` |
| `province` | The province the **user selected** — not where they are |
| `income_bracket` | Gross annual income, bucketed. Never an exact amount |
| `median_ratio_bucket` | Gross income ÷ national median full-time wage of the reference year, bucketed |
| `median_wage_ref` | The national median annual wage used for that ratio |
| `lang` | Interface language at the time (10 supported) |
| `source` | `web`, `app` (iOS), or `widget` (embedded on a third-party site) |
| `embed_host` | For widget events, the hostname of the embedding site |
| `country` / `region` / `city` | Derived from the connection at the edge. City granularity at most |
| `lat` / `lon` | The **centroid of that city**, not the user's position |
| `device` | `mobile`, `tablet` or `desktop`. Never the user-agent string |
| `industry` | Optional, self-declared by picking it in the wage-comparison chart |
| `intent` | Optional, self-declared reason for calculating |
| `shift_start_hour` … `avg_daily_hours` | Work-schedule *pattern*: hour-of-day, days per week, unpaid break length. Never specific calendar dates |
| `has_rrsp`, `rrsp_pct_bucket`, `employer_match` | Retirement-saving behaviour, bucketed |
| `shift_premium`, `premium_rate_bucket`, `ot_hours_bucket` | Premium and overtime pay, bucketed |
| `tips_pct_bucket` | Declared tips as a share of gross, bucketed |
| `pay_frequency` | Weekly, bi-weekly, semi-monthly, monthly |
| `local_hour` / `local_dow` | Hour and weekday in the **user's own** timezone |
| `session_id` / `seq` | A random identifier minted per page load and discarded when the visitor leaves, plus the order of the calculation within that visit |
| `viewed_report` | Whether the deep tax report was opened |
| `excluded` | Owner/testing traffic. Excluded from every published number |

### What is deliberately **not** recorded

- **Exact incomes.** Only brackets, in every case.
- **IP addresses.** Geography is resolved at the edge and the address is discarded.
- **Any account or user identifier.** Signed-in users are not linked to events.
- **Device fingerprints.** No canvas, fonts, screen dimensions, or raw user-agent.
- **Specific dates worked.** Timesheet entries contribute a *pattern* only.
- **Occupation or employer.** Sector granularity at most, to keep small-town rows non-identifying.

### Inclusion rules

1. Untouched default states are skipped, so merely opening the calculator records nothing.
2. Likely bots are skipped: automation flags, bot user-agent patterns, headless signatures.
3. Any browser that has visited a URL with `?notelemetry=1` is permanently silent.
4. Rows flagged `excluded = true` (owner testing, App Store review sessions) are removed
   from every aggregate but kept in the table as an audit trail.

### Bucket definitions (version 1)

**Income brackets** (nominal CAD, gross annual):
`under-30k`, `30-50k`, `50-70k`, `70-90k`, `90-120k`, `120-160k`, `160k-plus`

**Median ratio** (gross ÷ national median full-time wage that year):
`under-0.5`, `0.5-0.75`, `0.75-1`, `1-1.25`, `1.25-1.5`, `1.5-2`, `2-3`, `3-plus`

> Nominal brackets drift with inflation — a decade from now `under-30k` will be a
> nearly empty bucket. The median ratio is the field that stays comparable across
> decades, which is why both are recorded.

**Intent**: `new-job`, `raise`, `moving`, `budgeting`, `tax-filing`, `curious`

### Known limitations

- **Visit counts are a floor.** A returning person counts as a new visit, by design.
- **Events before 2026-08-07 18:03 UTC have no geography**; the endpoint did not exist yet.
- **Events before 2026-08-07 20:00 UTC have no session id.**
- **Corporate VPNs relocate users.** An office network can egress in another country;
  the *selected province* is the reliable signal, physical geography is contextual.
- **Territories** (Yukon, NWT, Nunavut) are not published separately in the Statistics
  Canada wage table used for benchmarks, so wage comparisons fall back to national figures.

---

## Retention and archival

- Raw event rows are retained indefinitely.
- A **monthly aggregate snapshot** is written to `monthly_snapshots` and exported to
  `data-archive/monthly/YYYY-MM.json` in this repository. Git is the durable copy:
  it survives any change of database vendor, plan, or account.
- Each year's **tax engine constants and wage benchmarks** are archived to
  `data-archive/vintages/YYYY.json`, so any historical take-home figure can be
  recomputed under the rules that applied at the time.
