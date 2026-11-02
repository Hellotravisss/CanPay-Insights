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
| `is_registered` | Whether the visitor was signed in. A boolean — the account is never identified |
| `from_history` | This calculation started from a saved record |
| `change_direction`, `change_pct_bucket`, `days_since_saved_bucket`, `province_changed` | The observed pay change versus the reopened record, in buckets |
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

**Pay change** (versus the reopened saved calculation, computed in the browser):
direction `up` / `down` / `same`; size `0`, `under-3`, `3-5`, `5-10`, `10-20`, `20-plus` (percent);
elapsed `same-day` … `over-year`.

> A change is only treated as a **pay change** when the province did not also
> change. If the province changed it is a relocation, and mixing the two would
> read a cost-of-living move as a raise.
>
> Direction alone does not distinguish a raise from a job change — that is what
> the optional `intent` field is for. `raise` + up is an in-place increase;
> `new-job` + up is a job-change premium.

### Known limitations

- **Visit counts are a floor.** A returning person counts as a new visit, by design.
- **Events before 2026-08-07 18:03 UTC have no geography**; the endpoint did not exist yet.
- **Events before 2026-08-07 20:00 UTC have no session id.**
- **Corporate VPNs relocate users.** An office network can egress in another country;
  the *selected province* is the reliable signal, physical geography is contextual.
- **Territories** (Yukon, NWT, Nunavut) are not published separately in the Statistics
  Canada wage table used for benchmarks, so wage comparisons fall back to national figures.
- **`works_weekend` from the iOS app before 1.3.0 is unreliable** (rows with
  `source = 'app'`, `mode = 'simple'`, `schema_version = 1`). See *App schema version 2*.

---

## Retention and archival

- Raw event rows are retained indefinitely.
- A **monthly aggregate snapshot** is written to `monthly_snapshots` and exported to
  `data-archive/monthly/YYYY-MM.json` in this repository. Git is the durable copy:
  it survives any change of database vendor, plan, or account.
- Each year's **tax engine constants and wage benchmarks** are archived to
  `data-archive/vintages/YYYY.json`, so any historical take-home figure can be
  recomputed under the rules that applied at the time.

### 2026-08-11 — where the visit started

Added `entry_path` and `referrer_path`: the path on **this site** the visitor was
on before a calculation, so "which article sends people to the calculator" can be
answered separately from "which article gets read".

- Same-origin paths only. External referrers are dropped entirely rather than
  trimmed, because a referring URL can carry the user's search terms or a token
  in its query string.
- Query strings and fragments are never stored; the path is capped at 200 chars.
- `entry_path` lives in sessionStorage, so it survives moving from an article to
  the calculator within a tab and disappears when the tab closes — the same
  lifetime as the visit id, never a cross-visit identifier.
- Not backfillable. Rows written before this date have both fields null, and any
  "articles that convert" figure starts from this date, not from launch.

### 2026-09-15 — neighbourhood, time zone, returning device

Six fields added. None changes the meaning of an existing field, so the schema
version stays at 1; rows written before this date have all six null.

| Field | Meaning |
| --- | --- |
| `fsa` | First three characters of a Canadian postal code (a Forward Sortation Area, a few thousand households). Never a full postal code — six characters name about fifteen households |
| `fsa_source` | `typed` — the visitor entered it under the result; `device` — the visitor pressed "use my location" and the browser position was mapped to the nearest FSA centroid **on the device**; `remembered` — an FSA this device gave earlier, carried on later calculations from localStorage |
| `lat2` / `lon2` | Device position, present only when `fsa_source = device`. Rounded **before sending**: two decimals (~1 km) in urban FSAs, one decimal (~11 km) in rural FSAs (second character `0`) and where no FSA matched. The server re-applies the same rounding; the precise reading never exists outside the browser |
| `tz` | The IANA zone name the browser reports (`America/Toronto`). A cross-check on the edge geography — a Toronto zone on a Vancouver connection is a VPN or a corporate egress — not a position |
| `is_returning` | Whether this device had recorded a calculation before, from a single `1` flag in localStorage. A boolean, not an identifier; two returning devices are indistinguishable |

- **Consent.** Both location paths are off until the visitor acts (typing, or
  pressing the button and then accepting the browser prompt), and the consent
  text beside them names the purpose: aggregated neighbourhood statistics that
  are published and may be licensed to third parties, including real-estate and
  financial companies. Quebec's s. 8.1 (functions that locate a person must be
  deactivated by default) is met by construction.
- **What the visitor gets.** Their income placed among the tax filers of that
  FSA, from CRA's *Individual Tax Statistics by FSA* (Table 1b, 2021 tax year —
  the newest published), shipped as `public/data/fsa-income.json`; percentile
  interpolated inside the income class. Total income of all filers, not wages;
  filers, not residents; 2021 dollars. The payoff says so.
- **FSA centroids** for the device path come from Statistics Canada's 2021 FSA
  boundary file (92-179-X), `public/data/fsa-centroids.json`, two decimals.
  Nearest centroid within 30 km; farther than that, nothing is recorded.
- **Suppression on the way out.** Any published or licensed figure by FSA needs
  twenty calculations behind it (the threshold the federal government applied
  to its own mobility data); a bare count needs five; smaller cells are folded
  into one withheld total. The data-room panel prints these rules on itself.
- The iOS app collects none of the six: no location permission is requested,
  and the App Store's data-sharing rules (5.1.2) make licensed aggregates from
  app data a review risk not worth 4% of the rows.
- Not backfillable, and never inferred: an FSA is stored only when the visitor
  supplied it or chose to be located. Rows without one stay at city level.

---

## App schema version 2 — iOS app 1.3.0 onward (2026-11)

The hourly calculator in the iOS app defaulted to a Sunday-to-Thursday week from
2026-06-07 until 1.3.0; the website has always defaulted to Monday to Friday.
Anyone who did not change the day buttons was recorded with `works_weekend = 1`
because Sunday was ticked for them. In app rows for a five-day week, 369 of 530
(70%) carry the flag, against 19% of all website hourly rows.

Only `days_per_week` and `works_weekend` are stored, not which days, so a
default Sunday cannot be told apart from a real one. Nothing is rewritten.
From 1.3.0 the app sends `schema_version = 2`; earlier builds send nothing and
are stored as 1, including people who never update.

**Rule:** treat `works_weekend` as unknown where `source = 'app'` and
`schema_version = 1`. Every other field in those rows is unaffected, and
website rows are unaffected.

---

## App schema version 3 — iOS 1.3.1 and later

The app computes its schedule pattern with its own copy of the website code
(`CanPayApp/src/lib/telemetry.ts`) and had the same errors as web schema 1
below: timesheet weeks counted from 1 January (item 1), paid hours without
the minutes (item 2) and a dedupe key without `works_weekend` (item 3). From
1.3.1 the app sends `schema_version = 3` with all three fixed, and sends
`median_ratio_bucket` / `median_wage_ref`, which app rows never carried.

**Rules for rows with `source = 'app'` and `schema_version` 1 or 2:**
- treat `days_per_week` as unknown where `mode = 'timesheet'`;
- `avg_daily_hours` is approximate (±1 h a day);
- `median_ratio_bucket` is absent; it can only be approximated from
  `income_bracket`;
- the `works_weekend` rule above still applies to schema 1.
App rows carry no `employment_shape`.


---

## Web schema version 2 — website and widget, from 2026-11-01

A review of the pipeline found three collection errors in the browser code
(`lib/workPattern.ts`, `lib/telemetry.ts`). None of them can be repaired in
old rows, so nothing is rewritten; from this build the website and the widget
send `schema_version = 2`. (The iOS app has its own version 2 above; versions
are read per `source`.)

1. **`days_per_week` in the timesheet calculator.** Weeks were counted from
   1 January instead of from Monday. In a year that starts on a Thursday (2026),
   every Monday-to-Friday week was split in two, so a one- or two-week Mon–Fri
   timesheet was recorded as **3 days a week**, and `employment_shape` turned a
   full-time worker into `part-time-hourly` (3 × 7.5 h < 30 h). Weeks now start on Monday.
2. **`avg_daily_hours` in the hourly and timesheet calculators** dropped the
   minutes of the start and end times (10:30–16:00 counted as 6 h). The error
   is under one hour a day in either direction, enough to move a week across
   the 30-hour part-time line. Hours are now computed from minutes;
   `shift_start_hour` / `shift_end_hour` are unchanged (hour of day).
3. **Weekend-only schedule changes were deduplicated away.** The once-per-page
   dedupe key did not include `works_weekend`, so moving Mon–Fri to Tue–Sat
   (same hours, same number of days) in the same visit was dropped as a
   repeat. Such changes are now recorded, which adds a few rows per affected visit.
4. **`employment_shape = 'tipped-service'` for every timesheet.** The
   timesheet calculator always sends a tips bucket, `'0'` when no tips were
   entered, and the shape treated any bucket as tips. In production 408 of the
   409 rows marked `tipped-service` had `tips_pct_bucket = '0'`. A zero bucket
   no longer counts. Because this also hid item 1, no stored timesheet row
   reached the hours-based full-/part-time split; the weighting scope
   (`salaried`, `full-time-hourly`) never contained timesheet rows either way.

**Rules for rows with `source IN ('web','widget')` and `schema_version = 1`:**
- treat `days_per_week` as unknown where `mode = 'timesheet'`;
- treat `employment_shape` as unknown where `mode = 'timesheet'`, and as
  approximate for `mode = 'simple'` (hours within ±1 h a day of the line);
- `avg_daily_hours` is approximate (±1 h a day);
- treat `employment_shape` as unknown where it is `'tipped-service'` and
  `tips_pct_bucket = '0'` (`shapeOf()` in `lib/d1/events.ts` applies this to
  the published breakdowns);
- every other field is unaffected.

### Analysis-method corrections, 2026-11-01

These change how stored rows are read, not what is stored, so they apply to
every row at once.

- **Weekend share** (`calcStats`, `monthlySnapshot`, the research note's
  finding 5) now applies the app rule above: rows with `source = 'app'` and
  `schema_version = 1` are left out of both numerator and denominator
  (`weekend_n` is the base). Until this date the published share included
  them and so was inflated by the app's default Sunday. The research note's
  sentence that a weekend day "is only ever present because somebody switched
  it on" was untrue for those rows; it now describes the exclusion.
  `data-archive/monthly/2026-08.json` was written by the old method and is kept
  as written.
- **Visits pricing two or more provinces** (research note finding 3, and the
  `move_share` column of `research_daily`) is now counted on the same rows as
  its denominator. It had been a separate SQL query that kept fake-door and
  offer-comparison taps (`product_interest` rows); an offer comparison records
  offer A's province, so a visit that calculated only in one province could be
  counted as comparing two. `research_daily` rows before this date were
  computed the old way and, as that table promises, are never updated.
- **"Below the median wage"** on the research note is the share of
  calculations below the *national* median full-time wage
  (`median_ratio_bucket`), over every calculation the page counts. The page
  said "the median wage for the province chosen", which the field has never
  measured, and took the share from the latest calendar year only, which from
  1 January would have described a different set of rows from the page's total.
