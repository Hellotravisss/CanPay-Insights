# Search Console archive

Google Search Console keeps 16 months of data and then deletes it. This archive
copies it into our own database daily so the series survives — a decade of
"what Canadians searched about their pay" cannot be backfilled later at any
price.

## What runs

`scripts/archiveGsc.py`, daily at 14:10 local time via launchd
(`~/Library/LaunchAgents/ca.canpayinsights.gsc-archive.plist`). Each run
re-fetches the last 7 days and upserts, so a missed run (laptop asleep, offline)
heals itself and GSC's late revisions overwrite cleanly.

Log: `~/.canpay-secrets/gsc-archive.log`

## The property that matters

`https://canpayinsights.ca/` — **not** the www variant. Over the same 28 days the
www property showed 65 impressions against 25,782 on this one. Reading the wrong
property makes the site look dead.

## Credentials

- **Google**: Application Default Credentials, created once with
  `gcloud auth application-default login --scopes="https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform"`.
  The Search Console API must also be enabled on the quota project:
  `gcloud services enable searchconsole.googleapis.com --project=canpay-insights`.
  Both were done 2026-08-08. ADC lives at `~/.config/gcloud/`, never committed.
- **Supabase**: a token in `~/.canpay-secrets/gsc-ingest-token` (chmod 600) that
  authorises exactly one function, `gsc_ingest`. The service_role key is
  deliberately not used, so nothing with full database rights leaves the
  dashboard.

## Tables

| Table | Contents |
| --- | --- |
| `gsc_daily` | one row per day: clicks, impressions, CTR, average position |
| `gsc_queries` | one row per (day, query) |
| `gsc_pages` | one row per (day, page) |

All three are RLS-protected with no public access; the data room reads them
through `gsc_stats()`, which returns aggregates only.

## Manual use

```bash
python3 scripts/archiveGsc.py --dry-run       # look, write nothing
python3 scripts/archiveGsc.py --days 500      # backfill the whole window
```
