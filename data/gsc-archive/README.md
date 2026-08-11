# Search Console archive

Google Search Console deletes all performance data after 16 months. Everything
in this folder is a durable copy of something that would otherwise disappear.

## Files

### `www-property-full-history.json`

The complete history of the **`https://www.canpayinsights.ca/`** property,
exported 2026-08-11.

Why it exists separately from the daily archiver: this site has two verified
URL-prefix properties, and Search Console treats them as different websites.

| Property | Data starts | Role |
|---|---|---|
| `https://canpayinsights.ca/` | 2026-05-22 | The live site — all real traffic |
| `https://www.canpayinsights.ca/` | 2026-04-17 | Redirects (308) to the above |

The www property therefore holds **35 days of the site's earliest search history
(2026-04-17 → 2026-05-21) that exists nowhere else** — 1,210 impressions from
the period when Google still treated www as the canonical hostname. The daily
archiver only reads the non-www property, so without this export that period
would vanish when the property is removed or the 16-month window rolls past it.

Contains daily totals, per-query totals, per-page totals, and date × query rows.

## The ongoing archive

Everything from 2026-05-22 onward is archived daily by `scripts/archiveGsc.py`
into the `gsc_daily` / `gsc_queries` / `gsc_pages` tables, reading the **non-www**
property. Do not point it at www — see the comment in that script.
