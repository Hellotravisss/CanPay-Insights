# Data durability

Last reviewed: 2026-08-11

The private data room is only as valuable as the data behind it, and most of
that data cannot be re-fetched. Google Search Console discards performance data
after 16 months; once a day falls out of that window it is gone from every
source, at any price. This document records where the data lives and what
protects it.

## Where every row lives

| Data | Primary | Durable copy |
|---|---|---|
| Search Console daily / queries / pages | Supabase | `days/*.json` in the archive repo |
| Anonymous calculator events | Supabase | same |
| Monthly aggregates | Supabase | `manifest.json` + app repo `data-archive/monthly/` |
| Earliest www-property history (2026-04-17 → 05-21) | nowhere else | `data/gsc-archive/` in this repo |

Archive repo: **github.com/Hellotravisss/canpay-data-archive** (private), cloned
at `~/canpay-data-archive`.

## What was wrong, and when

**The daily archiver had never run.** It was scheduled through launchd pointing
at `~/Documents/Vibe_Coding/CanPay-Insights/scripts/archiveGsc.py`, and macOS
blocks launchd-spawned processes from reading `~/Documents` without Full Disk
Access. Every run since installation logged the same line and stopped:

    can't open file '.../scripts/archiveGsc.py': Operation not permitted

`launchctl list` showed exit status 2 the whole time. The 14,000 rows that did
exist had been backfilled by hand; nothing was accumulating. Two days of Search
Console data (2026-08-07, 08-08) had already been missed and were recovered.

Fixed by `scripts/installArchiveJob.sh`, which copies the scripts to
`~/Library/Application Support/CanPayArchive/` and writes to a repo outside
`~/Documents`. No Full Disk Access grant needed — which also means no future
python script inherits one.

## How the backup refuses to lie

- One immutable file per day. Old days are never rewritten; only the last five
  are re-pulled, because Search Console revises recent numbers.
- `backupData.py` **refuses to overwrite a day file with fewer rows** than it
  already holds, and prints the shortfall. A partial read cannot quietly delete
  history — the usual way backups fail.
- `manifest.json` carries per-table row counts and a SHA-256 over every day file.
- `python3 scripts/backupData.py --verify` re-reads every file and compares the
  totals against the database, table by table. It exits non-zero on any gap.

## Checking it is still working

    python3 scripts/backupData.py --verify        # should end with VERIFIED
    launchctl list | grep canpay                  # second column must be 0
    tail -20 ~/.canpay-secrets/gsc-archive.log    # both steps, with timestamps

Exit status 2 in that second command is the exact symptom described above.

## After editing either script

    ./scripts/installArchiveJob.sh

The runtime copies are what actually execute. Editing the repo alone changes
nothing.
