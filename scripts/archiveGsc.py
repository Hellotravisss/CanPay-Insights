#!/usr/bin/env python3
"""
Archive Google Search Console into Supabase, one day at a time.

WHY THIS EXISTS
    Search Console keeps 16 months and then discards. "What Canadians searched
    about their pay, day by day, for a decade" cannot be bought or backfilled
    later — it only exists if it is copied out before the window closes.

CREDENTIALS
    Google:   Application Default Credentials from `gcloud auth application-default
              login --scopes=...webmasters.readonly,...cloud-platform`. Local file,
              never committed, never leaves this machine.
    Supabase: a shared token in ~/.canpay-secrets/gsc-ingest-token (chmod 600) that
              authorises one narrow SECURITY DEFINER function. The service_role key
              is deliberately not used anywhere.

USAGE
    python3 scripts/archiveGsc.py                # yesterday and the 2 days before
    python3 scripts/archiveGsc.py --days 480     # backfill the full GSC window
    python3 scripts/archiveGsc.py --dry-run      # fetch and report, write nothing

GSC finalises a day's numbers a few days late, so recent days are re-fetched on
every run and upserted; that is why re-running is always safe.
"""
import argparse
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ADC = os.path.expanduser("~/.config/gcloud/application_default_credentials.json")
TOKEN_FILE = os.path.expanduser("~/.canpay-secrets/gsc-ingest-token")
QUOTA_PROJECT = "canpay-insights"

# The property that actually holds the data. The www variant exists but is
# nearly empty — 65 impressions against 25,782 on this one over the same 28
# days — so anything reading the wrong property concludes the site is dead.
SITE = "https://canpayinsights.ca/"

SUPABASE_URL = "https://csvauvgygdjgljgllter.supabase.co"
SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0."
    "cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk"
)


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def access_token():
    if not os.path.exists(ADC):
        die(
            "no Application Default Credentials. Run:\n"
            "  gcloud auth application-default login "
            '--scopes="https://www.googleapis.com/auth/webmasters.readonly,'
            'https://www.googleapis.com/auth/cloud-platform"'
        )
    c = json.load(open(ADC))
    body = urllib.parse.urlencode(
        {
            "client_id": c["client_id"],
            "client_secret": c["client_secret"],
            "refresh_token": c["refresh_token"],
            "grant_type": "refresh_token",
        }
    ).encode()
    return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", body))[
        "access_token"
    ]


def gsc_query(token, day, dimensions, row_limit=1000):
    url = (
        "https://searchconsole.googleapis.com/webmasters/v3/sites/"
        f"{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query"
    )
    payload = {
        "startDate": day,
        "endDate": day,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        # Fresh, un-finalised data would otherwise be silently mixed with settled
        # data; asking for FINAL keeps the series internally consistent.
        "dataState": "final",
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "x-goog-user-project": QUOTA_PROJECT,
            "Content-Type": "application/json",
        },
    )
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt)
                continue
            die(f"GSC {e.code} on {day} {dimensions}: {e.read().decode()[:300]}")


def rows(result):
    out = []
    for r in result.get("rows", []):
        out.append(
            {
                "key": r["keys"][0],
                "clicks": r.get("clicks", 0),
                "impressions": r.get("impressions", 0),
                "ctr": r.get("ctr", 0),
                "position": r.get("position", 0),
            }
        )
    return out


def archived_days(since):
    """Days already in the archive, so a run can fetch only what is absent.

    Without this the job fetched a fixed window back from today. Three days
    absorbs Google's late revisions and survives a weekend, but a laptop off
    for a week loses everything beyond it — permanently, because Search
    Console discards history after 16 months. macOS runs a missed calendar job
    ONCE on wake, not once per day missed, so the catch-up never happened
    either."""
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/gsc_archived_days",
        data=json.dumps({"p_token": open(TOKEN_FILE).read().strip(),
                         "p_since": str(since)}).encode(),
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {SUPABASE_ANON}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return {d[:10] for d in json.load(r)}


def ingest(payload):
    token = open(TOKEN_FILE).read().strip()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/gsc_ingest",
        data=json.dumps({"p_token": token, "p_payload": payload}).encode(),
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {SUPABASE_ANON}",
            "Content-Type": "application/json",
        },
    )
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        die(f"ingest failed: {e.code} {e.read().decode()[:200]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=3,
                    help="always re-fetch this many recent days (Google revises them)")
    ap.add_argument("--window", type=int, default=480,
                    help="how far back to look for gaps; GSC keeps ~16 months")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    token = access_token()
    # GSC lags ~2 days; starting at today-2 avoids archiving empty days forever.
    end = datetime.date.today() - datetime.timedelta(days=2)

    # Recent days are always re-fetched because Google keeps revising them.
    # Everything older is fetched only if it is missing, which closes a gap of
    # any length left by a machine that was off.
    recent = {str(end - datetime.timedelta(days=i)) for i in range(args.days)}
    try:
        have = archived_days(end - datetime.timedelta(days=args.window))
    except Exception as e:
        # A failed gap check must not stop the day's archiving; fall back to
        # the old fixed window and say so.
        print(f"gap check failed ({e}); archiving recent days only")
        have = None

    if have is None:
        targets = sorted(recent, reverse=True)
    else:
        # Only look for holes INSIDE the archived span. Scanning the whole
        # 16-month window meant asking Google about hundreds of days from
        # before the site existed, every single run — each one a request that
        # can only ever answer "no data".
        floor = min(have) if have else str(end)
        gaps = {
            str(end - datetime.timedelta(days=i))
            for i in range(args.window)
        } - have
        gaps = {d for d in gaps if d >= floor}
        targets = sorted(recent | gaps, reverse=True)
        if gaps - recent:
            print(f"filling {len(gaps - recent)} missing day(s) inside the archived span")

    total_clicks = 0
    written = 0
    for day in targets:
        totals = gsc_query(token, day, [])
        trow = (totals.get("rows") or [{}])[0]
        if not trow:
            print(f"{day}  (no data)")
            continue
        payload = {
            "date": day,
            "totals": {
                "clicks": int(trow.get("clicks", 0)),
                "impressions": int(trow.get("impressions", 0)),
                "ctr": trow.get("ctr", 0),
                "position": trow.get("position", 0),
            },
            "queries": rows(gsc_query(token, day, ["query"])),
            "pages": rows(gsc_query(token, day, ["page"])),
        }
        total_clicks += payload["totals"]["clicks"]
        if args.dry_run:
            print(
                f"{day}  clicks={payload['totals']['clicks']:>4} "
                f"impr={payload['totals']['impressions']:>6} "
                f"queries={len(payload['queries']):>4} pages={len(payload['pages']):>4}  (dry run)"
            )
            continue
        res = ingest(payload)
        written += 1
        print(
            f"{day}  clicks={payload['totals']['clicks']:>4} "
            f"impr={payload['totals']['impressions']:>6} "
            f"queries={res['queries']:>4} pages={res['pages']:>4}"
        )

    print(f"\ndone: {written} days written, {total_clicks} clicks in range")
    if have is not None and have:
        floor = min(have)
        still = {
            str(end - datetime.timedelta(days=i)) for i in range(args.window)
        } - have - set(targets)
        still = {d for d in still if d >= floor}
        if still:
            print(f"note: {len(still)} day(s) inside the span still absent after this run")


if __name__ == "__main__":
    main()
